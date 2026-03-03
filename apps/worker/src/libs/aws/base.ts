import { DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { getSqsClient } from "./client.js";

const MAX_RECEIVE_COUNT = 3;

export function getApproximateReceiveCount(msg: {
  Attributes?: Record<string, string>;
}): number {
  const attrs = msg.Attributes ?? {};
  return parseInt(attrs.ApproximateReceiveCount ?? "0", 10);
}

export function shouldDeleteOnFailure(msg: {
  Attributes?: Record<string, string>;
}): boolean {
  return getApproximateReceiveCount(msg) >= MAX_RECEIVE_COUNT;
}

export async function deleteMessage(
  queueUrl: string,
  receiptHandle: string
): Promise<void> {
  const client = getSqsClient();
  await client.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })
  );
}

export function parseMessageBody(msg: { Body?: string }): Record<string, unknown> {
  const body = msg.Body ?? "{}";
  if (typeof body === "string") {
    return JSON.parse(body) as Record<string, unknown>;
  }
  return body as Record<string, unknown>;
}

export async function processWithRetry(
  queueUrl: string,
  msg: { ReceiptHandle?: string; Attributes?: Record<string, string>; Body?: string },
  handler: (body: Record<string, unknown>) => void | Promise<void>,
  traceIdParam: string
): Promise<void> {
  const traceIdVal = traceIdParam;
  const receipt = msg.ReceiptHandle;

  try {
    const body = parseMessageBody(msg);
    await handler(body);
    if (receipt) {
      await deleteMessage(queueUrl, receipt);
    }
  } catch (e) {
    const receiveCount = getApproximateReceiveCount(msg);
    console.warn(
      `[trace_id=${traceIdVal}] Processing failed (receive_count=${receiveCount}):`,
      e
    );
    if (shouldDeleteOnFailure(msg) && receipt) {
      await deleteMessage(queueUrl, receipt);
      console.warn(
        `[trace_id=${traceIdVal}] Max retries reached, message deleted to avoid poison pill`
      );
    } else {
      throw e;
    }
  }
}

export async function processBatchWithRetry(
  queueUrl: string,
  messages: Array<{
    ReceiptHandle?: string;
    Attributes?: Record<string, string>;
    Body?: string;
  }>,
  batchHandler: (bodies: Record<string, unknown>[]) => void | Promise<void>,
  traceIdParam: string
): Promise<void> {
  const traceIdVal = traceIdParam;
  const bodies = messages.map((msg) => parseMessageBody(msg));

  try {
    await batchHandler(bodies);
    for (const msg of messages) {
      if (msg.ReceiptHandle) {
        await deleteMessage(queueUrl, msg.ReceiptHandle);
      }
    }
  } catch (e) {
    const receiveCounts = messages.map((m) => getApproximateReceiveCount(m));
    console.warn(
      `[trace_id=${traceIdVal}] Batch processing failed:`,
      e
    );
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (shouldDeleteOnFailure(msg) && msg.ReceiptHandle) {
        await deleteMessage(queueUrl, msg.ReceiptHandle);
        console.warn(
          `[trace_id=${traceIdVal}] Max retries reached, message deleted to avoid poison pill`
        );
      }
    }
    throw e;
  }
}
