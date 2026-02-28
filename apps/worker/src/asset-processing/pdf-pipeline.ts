import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import { PrismaClient } from "@repo/database";
import { definePDFJSModule, extractText, getDocumentProxy, renderPageAsImage } from "unpdf";
import { downloadPdfFromR2, uploadImageToR2 } from "../libs/cloudflare.js";
import { embedTexts } from "../libs/openai/embeddings.js";
import { publishImageProcessingMessage } from "../libs/aws/publishers.js";
import {
  createChunkSplitter,
  chunkPageTextWithMetadata,
} from "../libs/llamaindex/chunking.js";
import { getOrCreateIndex, getPdfIndexName } from "../libs/pinecone.js";
import { getSettings } from "../core/config.js";
import { extractVisualElements } from "./extraction.js";

const prisma = new PrismaClient();

function traceId(): string {
  return randomUUID().slice(0, 8);
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
  imagesPublished: number;
}> {
  const trace = traceId();
  const { fileId, key } = payload;
  const baseR2Prefix = key.replace(/\.[^.]+$/, "");

  console.info(`[trace_id=${trace}] PDF pipeline started: fileId=${fileId} key=${key}`);

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

    let pageImages: Buffer[] = [];
    try {
      for (let p = 1; p <= totalPages; p++) {
        const imgBuffer = await renderPageAsImage(pdf, p, {
          canvasImport: () => import("@napi-rs/canvas"),
          scale: 2,
        });
        pageImages.push(Buffer.from(imgBuffer));
      }
    } catch (imgErr) {
      console.warn(
        `[trace_id=${trace}] PDF visual extraction skipped:`,
        imgErr
      );
    }

    const splitter = createChunkSplitter();
    const allChunkResults = [];
    for (let pageIdx = 0; pageIdx < pageTexts.length; pageIdx++) {
      const chunks = chunkPageTextWithMetadata(
        pageTexts[pageIdx],
        pageIdx,
        key,
        fileId,
        splitter
      );
      allChunkResults.push(...chunks);
    }

    const embeddingIds: string[] = [];
    if (allChunkResults.length > 0) {
      const texts = allChunkResults.map((c) => c.node.text ?? "");
      const embeddings = await embedTexts(texts);

      const index = await getOrCreateIndex(getPdfIndexName());
      const s = getSettings();
      const batchSize = s.PINECONE_UPSERT_BATCH_SIZE;

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

      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }
      embeddingIds.push(...vectors.map((v) => v.id));
      console.info(
        `[trace_id=${trace}] PDF text embeddings upserted to Pinecone: ${embeddingIds.length} vectors`
      );
    } else {
      console.warn(
        `[trace_id=${trace}] PDF has no extractable text chunks; skipping text embeddings (image-only PDF or empty pages)`
      );
    }

    const allToPublish: Array<{
      imageId: string;
      knowledgeBaseId: string;
      r2Key: string;
      pageNumber: number;
    }> = [];

    for (let pageIdx = 0; pageIdx < pageImages.length; pageIdx++) {
      const pageBuffer = pageImages[pageIdx];
      if (!pageBuffer) continue;

      const visuals = await extractVisualElements(pageBuffer, pageIdx);

      for (const { label, imageBuffer } of visuals) {
        const r2Key = `${baseR2Prefix}/${label}.png`;
        await uploadImageToR2(imageBuffer, r2Key);

        const imgRecord = await prisma.knowledgeBaseImages.create({
          data: {
            knowledgeBaseId: fileId,
            r2Key,
            pageNumber: pageIdx,
            indexingStatus: "PENDING",
          },
        });

        allToPublish.push({
          imageId: imgRecord.id,
          knowledgeBaseId: fileId,
          r2Key,
          pageNumber: pageIdx,
        });
      }
    }

    for (const item of allToPublish) {
      await publishImageProcessingMessage(item);
    }

    await prisma.knowledgeBase.update({
      where: { id: fileId },
      data: {
        indexingStatus: "INDEXED",
        embeddingIds,
      },
    });

    console.info(
      `[trace_id=${trace}] PDF pipeline done: ${embeddingIds.length} text vectors, ${allToPublish.length} images published`
    );

    return {
      fileId,
      pages: totalPages,
      textVectors: embeddingIds.length,
      imagesPublished: allToPublish.length,
    };
  } catch (err) {
    console.error(`[trace_id=${trace}] PDF pipeline failed:`, err);
    await prisma.knowledgeBase.update({
      where: { id: fileId },
      data: {
        indexingStatus: "ERROR",
        errorMessage: (err as Error).message,
      },
    });
    throw err;
  } finally {
    await unlink(tmpPath).catch(() => {});
    console.info(`[trace_id=${trace}] Temp PDF deleted`);
  }
}
