import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSettings } from "../../core/config.js";
import { getSqsClient } from "./client.js";
import {
  PDF_INDEX_MESSAGE_TYPE,
  PdfIndexPayload,
} from "../../models/message-models.js";

export async function publishPdfIndexMessage(
  payload: PdfIndexPayload
): Promise<{ MessageId?: string }> {
  const body = JSON.stringify({
    type: PDF_INDEX_MESSAGE_TYPE,
    payload: { ...payload },
  });
  const s = getSettings();
  const client = getSqsClient();
  const result = await client.send(
    new SendMessageCommand({
      QueueUrl: s.AWS_SQS_PDF_INDEXING_QUEUE_URL,
      MessageBody: body,
      MessageGroupId: payload.fileId,
      MessageDeduplicationId: `${payload.fileId}-${payload.key}`,
    })
  );
  return result;
}
