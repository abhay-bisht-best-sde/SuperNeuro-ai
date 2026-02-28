import "dotenv/config";
import express from "express";
import {
  handleImageBatch,
  handlePdfMessage,
} from "./asset-processing/handlers.js";
import {
  isImageQueueConfigured,
  isPdfQueueConfigured,
} from "./libs/aws/client.js";
import { runImagesPoller, runPdfPoller } from "./libs/aws/pollers.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

let pdfPollerAbort: AbortController | null = null;
let imagesPollerAbort: AbortController | null = null;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.info(`SuperNeuro Worker listening on port ${PORT}`);

  pdfPollerAbort = new AbortController();
  imagesPollerAbort = new AbortController();

  if (isPdfQueueConfigured()) {
    runPdfPoller(handlePdfMessage as (body: Record<string, unknown>) => void).catch(
      (e) => console.error("PDF poller exited:", e)
    );
  } else {
    console.warn(
      "PDF poller disabled: set AWS_SQS_PDF_INDEXING_QUEUE_URL and AWS_REGION (or derive from queue URL)"
    );
  }

  if (isImageQueueConfigured()) {
    runImagesPoller(handleImageBatch as (bodies: Record<string, unknown>[]) => void).catch(
      (e) => console.error("Image poller exited:", e)
    );
  } else {
    console.warn(
      "Image poller disabled: set AWS_SQS_IMAGE_PROCESSING_QUEUE_URL and AWS_REGION (or derive from queue URL)"
    );
  }
});

process.on("SIGTERM", () => {
  pdfPollerAbort?.abort();
  imagesPollerAbort?.abort();
  process.exit(0);
});
