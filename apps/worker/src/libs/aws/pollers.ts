import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { getSettings } from "../../core/config.js";
import { getSqsClient } from "./client.js";
import { processBatchWithRetry, processWithRetry } from "./base.js";

const VISIBILITY_TIMEOUT = 300;
const MAX_MESSAGES = 5;
const WAIT_TIME = 20;

function traceId(): string {
  return crypto.randomUUID().slice(0, 8);
}

type MessageHandler = (body: Record<string, unknown>) => void | Promise<void>;
type BatchHandler = (bodies: Record<string, unknown>[]) => void | Promise<void>;

async function receivePdfMessages(): Promise<
  Array<{
    MessageId?: string;
    ReceiptHandle?: string;
    Body?: string;
    Attributes?: Record<string, string>;
  }>
> {
  const s = getSettings();
  const client = getSqsClient();
  const resp = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: s.AWS_SQS_PDF_INDEXING_QUEUE_URL,
      MaxNumberOfMessages: MAX_MESSAGES,
      WaitTimeSeconds: WAIT_TIME,
      VisibilityTimeout: VISIBILITY_TIMEOUT,
      MessageAttributeNames: ["All"],
      AttributeNames: ["All"],
    })
  );
  return resp.Messages ?? [];
}

export async function pollPdfQueue(handler: MessageHandler): Promise<number> {
  const trace = traceId();
  const messages = await receivePdfMessages();

  for (const msg of messages) {
    const s = getSettings();
    await processWithRetry(
      s.AWS_SQS_PDF_INDEXING_QUEUE_URL,
      msg,
      handler as (body: Record<string, unknown>) => Promise<void>,
      trace
    );
  }
  return messages.length;
}

export async function runPdfPoller(
  handler: MessageHandler,
  pollIntervalMs = 1000
): Promise<void> {
  while (true) {
    try {
      const n = await pollPdfQueue(handler);
      if (n > 0) {
        console.info(`[trace_id=${traceId()}] Processed ${n} PDF message(s)`);
      }
    } catch (e) {
      if ((e as Error).name === "CancelledError") throw e;
      console.error(`[trace_id=${traceId()}] PDF poller error:`, e);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}

async function receiveImageMessages(): Promise<
  Array<{
    MessageId?: string;
    ReceiptHandle?: string;
    Body?: string;
    Attributes?: Record<string, string>;
  }>
> {
  const s = getSettings();
  const client = getSqsClient();
  const resp = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL,
      MaxNumberOfMessages: MAX_MESSAGES,
      WaitTimeSeconds: WAIT_TIME,
      VisibilityTimeout: VISIBILITY_TIMEOUT,
      MessageAttributeNames: ["All"],
      AttributeNames: ["All"],
    })
  );
  return resp.Messages ?? [];
}

export async function pollImagesQueue(
  batchHandler: BatchHandler
): Promise<number> {
  const trace = traceId();
  const messages = await receiveImageMessages();

  if (messages.length === 0) return 0;

  const s = getSettings();
  await processBatchWithRetry(
    s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL,
    messages,
    batchHandler,
    trace
  );
  return messages.length;
}

export async function runImagesPoller(
  batchHandler: BatchHandler,
  pollIntervalMs = 1000
): Promise<void> {
  while (true) {
    try {
      const n = await pollImagesQueue(batchHandler);
      if (n > 0) {
        console.info(`[trace_id=${traceId()}] Processed ${n} image message(s)`);
      }
    } catch (e) {
      if ((e as Error).name === "CancelledError") throw e;
      console.error(`[trace_id=${traceId()}] Image poller error:`, e);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}