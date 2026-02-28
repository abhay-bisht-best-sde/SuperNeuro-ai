import {
  runImagePipeline,
  runImagePipelineBatch,
  type ImagePayload,
} from "./image-pipeline.js";
import { runPdfPipeline } from "./pdf-pipeline.js";
import {
  IMAGE_PROCESSING_MESSAGE_TYPE,
  PDF_INDEX_MESSAGE_TYPE,
} from "../models/message-models.js";

export async function handlePdfMessage(body: Record<string, unknown>): Promise<void> {
  if (body.type !== PDF_INDEX_MESSAGE_TYPE) {
    console.warn("Ignoring non-PDF message type:", body.type);
    return;
  }

  const payload = body.payload as Record<string, unknown> | undefined;
  if (!payload) {
    throw new Error("Missing payload in PDF message");
  }

  await runPdfPipeline({
    fileId: String(payload.fileId),
    key: String(payload.key),
    userId: String(payload.userId),
    fileName: String(payload.fileName),
    fileSize: Number(payload.fileSize),
  });
}

function parseImagePayload(body: Record<string, unknown>): ImagePayload | null {
  if (body.type !== IMAGE_PROCESSING_MESSAGE_TYPE) {
    return null;
  }
  const payload = body.payload as Record<string, unknown> | undefined;
  if (!payload) return null;
  return {
    imageId: String(payload.imageId),
    knowledgeBaseId: String(payload.knowledgeBaseId),
    r2Key: String(payload.r2Key),
    pageNumber: Number(payload.pageNumber ?? 0),
  };
}

export async function handleImageMessage(
  body: Record<string, unknown>
): Promise<void> {
  const payload = parseImagePayload(body);
  if (!payload) {
    if (body.type !== IMAGE_PROCESSING_MESSAGE_TYPE) {
      console.warn("Ignoring non-image message type:", body.type);
      return;
    }
    throw new Error("Missing payload in image message");
  }

  await runImagePipeline(payload);
}

export async function handleImageBatch(
  bodies: Record<string, unknown>[]
): Promise<void> {
  const payloads = bodies
    .map((b) => parseImagePayload(b))
    .filter((p): p is ImagePayload => p !== null);

  const skipped = bodies.length - payloads.length;
  if (skipped > 0) {
    console.warn(
      `[trace_id=${crypto.randomUUID().slice(0, 8)}] Skipped ${skipped} non-image message(s)`
    );
  }

  if (payloads.length === 0) return;

  await runImagePipelineBatch(payloads);
}
