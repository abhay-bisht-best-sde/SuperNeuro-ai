import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import { PrismaClient } from "@repo/database";
import {
  definePDFJSModule,
  extractText,
  getDocumentProxy,
  renderPageAsImage,
} from "unpdf";
import { downloadPdfFromR2, uploadImageToR2 } from "../libs/cloudflare.js";
import { embedTexts } from "../libs/openai/embeddings.js";
import {
  createChunkSplitter,
  chunkPageTextWithMetadata,
} from "../libs/llamaindex/chunking.js";
import { getOrCreateIndex, getPdfIndexName } from "../libs/pinecone.js";
import { getSettings } from "../core/config.js";
import { extractVisualElements } from "./extraction.js";
import { runImagePipelineBatch } from "./image-pipeline.js";

const prisma = new PrismaClient();

function traceId(): string {
  return randomUUID().slice(0, 8);
}

/**
 * Run up to `concurrency` async tasks in parallel across `items`.
 * Guarantees order of results matches order of items.
 */
async function withConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const pool = Array.from(
    { length: Math.min(concurrency, items.length) },
    worker
  );
  await Promise.all(pool);
  return results;
}

async function extractTextPerPage(
  pdfBuffer: Buffer,
  pdf?: Awaited<ReturnType<typeof getDocumentProxy>>
): Promise<string[]> {
  const doc = pdf ?? (await getDocumentProxy(new Uint8Array(pdfBuffer)));
  const { text } = await extractText(doc, { mergePages: false });
  return text;
}

export async function runPdfPipeline(payload: {
  fileId: string;
  key: string;
  userId: string;
  fileName: string;
  fileSize: number;
}): Promise<{
  fileId: string;
  pages: number;
  textVectors: number;
  imagesIndexed: number;
}> {
  const trace = traceId();
  const { fileId, key } = payload;
  const baseR2Prefix = key.replace(/\.[^.]+$/, "");

  console.info(
    `[trace_id=${trace}] PDF pipeline started: fileId=${fileId} key=${key}`
  );

  await prisma.knowledgeBase.update({
    where: { id: fileId },
    data: { indexingStatus: "INDEXING" },
  });

  const pdfBytes = await downloadPdfFromR2(key);
  const tmpPath = join(tmpdir(), `pdf-${trace}.pdf`);
  await writeFile(tmpPath, pdfBytes);

  try {
    await definePDFJSModule(() => import("pdfjs-dist"));
    const pdf = await getDocumentProxy(new Uint8Array(pdfBytes));
    const pageTexts = await extractTextPerPage(pdfBytes, pdf);
    const totalPages = pageTexts.length;

    // ─── STEP 1: Render all pages in parallel (max 4 concurrent to cap memory) ───
    const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
    const pageImages = await withConcurrency<number, Buffer | null>(
      pageNums,
      4,
      async (pageNum) => {
        try {
          const buf = await renderPageAsImage(pdf, pageNum, {
            canvasImport: () => import("@napi-rs/canvas"),
            scale: 2,
          });
          return Buffer.from(buf);
        } catch (err) {
          console.warn(
            `[trace_id=${trace}] Could not render page ${pageNum}:`,
            err
          );
          return null;
        }
      }
    );

    // ─── STEP 2: Extract visual regions from each page in parallel ───
    const allPageVisuals = await withConcurrency(
      pageImages,
      4,
      async (pageBuffer, pageIdx) => {
        if (!pageBuffer) return [];
        return extractVisualElements(pageBuffer, pageIdx);
      }
    );

    // Flatten visuals into a single list with page context
    const allVisualItems: Array<{
      imageBuffer: Buffer;
      r2Key: string;
      pageIdx: number;
    }> = [];
    for (let pageIdx = 0; pageIdx < allPageVisuals.length; pageIdx++) {
      for (const { label, imageBuffer } of allPageVisuals[pageIdx]) {
        allVisualItems.push({
          imageBuffer,
          r2Key: `${baseR2Prefix}/${label}.png`,
          pageIdx,
        });
      }
    }

    // ─── STEP 3: Upload images to R2 and create DB records in parallel ───
    const imageRecords = await withConcurrency(
      allVisualItems,
      8,
      async ({ imageBuffer, r2Key, pageIdx }) => {
        await uploadImageToR2(imageBuffer, r2Key);
        return prisma.knowledgeBaseImages.create({
          data: {
            knowledgeBaseId: fileId,
            r2Key,
            pageNumber: pageIdx,
            indexingStatus: "PENDING",
          },
        });
      }
    );

    // ─── STEP 4: Process all images INLINE — no SQS queue ───
    // Vision describe → embed → upsert to Pinecone → store embeddingId + textSummary
    // imageEmbeddingIds are written back to KnowledgeBase inside runImagePipelineBatch
    if (imageRecords.length > 0) {
      console.info(
        `[trace_id=${trace}] Processing ${imageRecords.length} image(s) inline`
      );
      await runImagePipelineBatch(
        imageRecords.map((rec) => ({
          imageId: rec.id,
          knowledgeBaseId: fileId,
          r2Key: rec.r2Key,
          pageNumber: rec.pageNumber,
        }))
      );
    }

    // ─── STEP 5: Chunk text from all pages and embed ───
    const splitter = createChunkSplitter();
    const allChunkResults = pageTexts.flatMap((text, pageIdx) =>
      chunkPageTextWithMetadata(text, pageIdx, key, fileId, splitter)
    );

    const embeddingIds: string[] = [];
    if (allChunkResults.length > 0) {
      const texts = allChunkResults.map((c) => c.node.text ?? "");
      const embeddings = await embedTexts(texts);

      const index = await getOrCreateIndex(getPdfIndexName());
      const { PINECONE_UPSERT_BATCH_SIZE: batchSize } = getSettings();

      const vectors = allChunkResults.map((c, i) => ({
        id: c.id,
        values: embeddings[i],
        metadata: {
          kb_id: fileId,
          page: c.node.metadata?.page ?? 0,
          text: (c.node.text ?? "").slice(0, 1000),
          source: c.node.metadata?.source ?? key,
        },
      }));

      // Upsert all Pinecone batches in parallel
      const batches: typeof vectors[] = [];
      for (let i = 0; i < vectors.length; i += batchSize) {
        batches.push(vectors.slice(i, i + batchSize));
      }
      await Promise.all(batches.map((batch) => index.upsert(batch)));

      embeddingIds.push(...vectors.map((v) => v.id));
      console.info(
        `[trace_id=${trace}] Text embeddings upserted to Pinecone: ${embeddingIds.length} vectors`
      );
    } else {
      console.warn(
        `[trace_id=${trace}] No extractable text chunks; skipping text embeddings`
      );
    }

    // ─── STEP 6: Mark KB as INDEXED, store text embeddingIds ───
    // imageEmbeddingIds are already stored inside runImagePipelineBatch above
    await prisma.knowledgeBase.update({
      where: { id: fileId },
      data: {
        indexingStatus: "INDEXED",
        embeddingIds,
      },
    });

    console.info(
      `[trace_id=${trace}] PDF pipeline done: ${embeddingIds.length} text vectors, ${imageRecords.length} image(s) indexed`
    );

    return {
      fileId,
      pages: totalPages,
      textVectors: embeddingIds.length,
      imagesIndexed: imageRecords.length,
    };
  } catch (err) {
    console.error(`[trace_id=${trace}] PDF pipeline failed:`, err);
    await prisma.knowledgeBase.update({
      where: { id: fileId },
      data: {
        indexingStatus: "ERROR",
        errorMessage: (err as Error).message,
        processingAttempts: { increment: 1 },
      },
    });
    throw err;
  } finally {
    await unlink(tmpPath).catch(() => {});
    console.info(`[trace_id=${trace}] Temp PDF deleted`);
  }
}
