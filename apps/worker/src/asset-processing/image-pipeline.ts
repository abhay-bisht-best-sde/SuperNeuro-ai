import { randomUUID } from "crypto";
import { PrismaClient } from "@repo/database";
import { downloadImageFromR2 } from "../libs/cloudflare.js";
import { embedTexts } from "../libs/openai/embeddings.js";
import { describeImageWithVision } from "../libs/openai/vision.js";
import { getImageIndex } from "../libs/pinecone.js";
import { getSettings } from "../core/config.js";

const prisma = new PrismaClient();

function traceId(): string {
  return randomUUID().slice(0, 8);
}

export interface ImagePayload {
  imageId: string;
  knowledgeBaseId: string;
  r2Key: string;
  pageNumber: number;
}

export async function runImagePipeline(payload: ImagePayload): Promise<{
  imageId: string;
  status: string;
}> {
  const results = await runImagePipelineBatch([payload]);
  return results[0];
}

export async function runImagePipelineBatch(
  payloads: ImagePayload[]
): Promise<Array<{ imageId: string; status: string }>> {
  if (payloads.length === 0) return [];

  const trace = traceId();
  const s = getSettings();
  const batchSize = s.PINECONE_UPSERT_BATCH_SIZE;

  console.info(
    `[trace_id=${trace}] Processing image batch: ${payloads.length} image(s)`
  );

  const imageIds = payloads.map((p) => p.imageId);
  await prisma.knowledgeBaseImages.updateMany({
    where: { id: { in: imageIds } },
    data: { indexingStatus: "INDEXING" },
  });

  let imgBuffers: Buffer[];
  try {
    imgBuffers = await Promise.all(
      payloads.map((p) => downloadImageFromR2(p.r2Key))
    );
  } catch (err) {
    console.error(`[trace_id=${trace}] Failed to download images from R2:`, err);
    await prisma.knowledgeBaseImages.updateMany({
      where: { id: { in: imageIds } },
      data: {
        indexingStatus: "ERROR",
        errorMessage: (err as Error).message,
      },
    });
    throw err;
  }

  const descriptions = await Promise.all(
    imgBuffers.map((buf) => describeImageWithVision(buf))
  );

  let embeddings: number[][];
  try {
    embeddings = await embedTexts(descriptions);
  } catch (err) {
    console.error(`[trace_id=${trace}] Failed to generate embeddings:`, err);
    await prisma.knowledgeBaseImages.updateMany({
      where: { id: { in: imageIds } },
      data: {
        indexingStatus: "ERROR",
        errorMessage: (err as Error).message,
      },
    });
    throw err;
  }

  const index = await getImageIndex();
  const vectors = payloads.map((p, i) => ({
    id: `${p.knowledgeBaseId}::img::${p.imageId}`,
    values: embeddings[i],
    metadata: {
      kb_id: p.knowledgeBaseId,
      page: p.pageNumber,
      text: descriptions[i].slice(0, 1000),
      image_id: p.imageId,
    },
  }));

  try {
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
  } catch (err) {
    console.error(
      `[trace_id=${trace}] Failed to upsert image embeddings to Pinecone:`,
      err
    );
    await prisma.knowledgeBaseImages.updateMany({
      where: { id: { in: imageIds } },
      data: {
        indexingStatus: "ERROR",
        errorMessage: (err as Error).message,
      },
    });
    throw err;
  }

  console.info(
    `[trace_id=${trace}] Image embeddings upserted to Pinecone: ${vectors.length} vectors`
  );

  const vecIds = vectors.map((v) => v.id);
  const kbIdToVecIds = new Map<string, string[]>();
  for (let i = 0; i < payloads.length; i++) {
    const kbId = payloads[i].knowledgeBaseId;
    const vecId = vecIds[i];
    const list = kbIdToVecIds.get(kbId) ?? [];
    list.push(vecId);
    kbIdToVecIds.set(kbId, list);
  }

  await Promise.all(
    payloads.map((p, i) =>
      prisma.knowledgeBaseImages.update({
        where: { id: p.imageId },
        data: {
          textSummary: descriptions[i],
          embeddingId: vecIds[i],
          indexingStatus: "INDEXED",
        },
      })
    )
  );

  for (const [kbId, ids] of kbIdToVecIds) {
    if (ids.length === 1) {
      const kb = await prisma.knowledgeBase.findUnique({
        where: { id: kbId },
        select: { imageEmbeddingIds: true },
      });
      const current = kb?.imageEmbeddingIds ?? [];
      await prisma.knowledgeBase.update({
        where: { id: kbId },
        data: { imageEmbeddingIds: [...current, ids[0]] },
      });
    } else {
      const kb = await prisma.knowledgeBase.findUnique({
        where: { id: kbId },
        select: { imageEmbeddingIds: true },
      });
      const current = kb?.imageEmbeddingIds ?? [];
      await prisma.knowledgeBase.update({
        where: { id: kbId },
        data: { imageEmbeddingIds: [...current, ...ids] },
      });
    }
  }

  console.info(
    `[trace_id=${trace}] Image batch indexed: ${payloads.length} image(s)`
  );

  return payloads.map((p) => ({ imageId: p.imageId, status: "INDEXED" }));
}
