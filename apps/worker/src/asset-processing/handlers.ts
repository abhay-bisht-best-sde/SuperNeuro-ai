import { runPdfPipeline } from "./pdf-pipeline.js";
import { PDF_INDEX_MESSAGE_TYPE } from "../models/message-models.js";

export async function handlePdfMessage(
  body: Record<string, unknown>
): Promise<void> {
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
