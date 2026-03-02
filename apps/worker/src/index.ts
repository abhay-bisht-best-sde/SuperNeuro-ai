import "dotenv/config";
import express from "express";
import { handlePdfMessage } from "./asset-processing/handlers.js";
import { isPdfQueueConfigured } from "./libs/aws/client.js";
import { runPdfPoller } from "./libs/aws/pollers.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.info(`SuperNeuro Worker listening on port ${PORT}`);

  if (isPdfQueueConfigured()) {
    runPdfPoller(
      handlePdfMessage as (body: Record<string, unknown>) => void
    ).catch((e) => console.error("PDF poller exited:", e));
  } else {
    console.warn(
      "PDF poller disabled: set AWS_SQS_PDF_INDEXING_QUEUE_URL and AWS_REGION"
    );
  }
});

process.on("SIGTERM", () => {
  process.exit(0);
});
