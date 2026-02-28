import {
  SQSClient,
  SQSClientConfig,
} from "@aws-sdk/client-sqs";
import { getSettings } from "../../core/config.js";

function parseQueueUrl(queueUrl: string): { region: string; endpoint?: string } {
  try {
    const url = new URL(queueUrl);
    const parts = url.hostname.split(".");
    const region = parts.length >= 2 ? parts[1] : "";
    const endpoint = `${url.protocol}//${url.hostname}`;
    return { region, endpoint };
  } catch {
    return { region: "" };
  }
}

let sqsClient: SQSClient | null = null;

export function isPdfQueueConfigured(): boolean {
  const s = getSettings();
  return !!(
    s.AWS_SQS_PDF_INDEXING_QUEUE_URL ||
    process.env.AWS_SQS_PDF_INDEXING_QUEUE_URL
  );
}

export function isImageQueueConfigured(): boolean {
  const s = getSettings();
  return !!(
    s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ||
    process.env.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL
  );
}

export function isSqsConfigured(): boolean {
  const s = getSettings();
  const queueUrl =
    s.AWS_SQS_PDF_INDEXING_QUEUE_URL ||
    s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ||
    process.env.AWS_SQS_PDF_INDEXING_QUEUE_URL ||
    process.env.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ||
    "";
  const region = s.AWS_REGION || process.env.AWS_REGION || "";
  if (queueUrl) {
    const parsed = parseQueueUrl(queueUrl);
    return !!parsed.region || !!region;
  }
  return !!region;
}

export function getSqsClient(): SQSClient {
  if (sqsClient) return sqsClient;

  const s = getSettings();
  const queueUrl =
    s.AWS_SQS_PDF_INDEXING_QUEUE_URL ||
    s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ||
    process.env.AWS_SQS_PDF_INDEXING_QUEUE_URL ||
    process.env.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ||
    "";

  let region = s.AWS_REGION || process.env.AWS_REGION || "";
  let endpoint: string | undefined;

  if (queueUrl) {
    const parsed = parseQueueUrl(queueUrl);
    region = parsed.region || region;
    endpoint = parsed.endpoint;
  }

  if (!region) {
    throw new Error(
      "SQS requires AWS_REGION or a queue URL to derive the region"
    );
  }

  const config: SQSClientConfig = {
    region,
    credentials: {
      accessKeyId: s.AWS_ACCESS_KEY_ID,
      secretAccessKey: s.AWS_SECRET_ACCESS_KEY,
    },
    ...(endpoint && { endpoint }),
  };

  sqsClient = new SQSClient(config);
  return sqsClient;
}
