import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  type SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

export interface SqsPublisherOptions {
  queueUrl: string;
  region?: string;
  fifo?: boolean;
}

export interface SqsPublishOptions {
  deduplicationId?: string;
  groupId?: string;
}

type Serializable = string | object;

const serialize = (msg: Serializable): string =>
  typeof msg === "string" ? msg : JSON.stringify(msg);

export interface SqsPublisher {
  publish<T extends Serializable>(
    message: T,
    options?: SqsPublishOptions
  ): Promise<string | undefined>;
  publishBatch<T extends Serializable>(messages: T[]): Promise<void>;
}

export function createSqsPublisher(options: SqsPublisherOptions): SqsPublisher {
  const { queueUrl, region = process.env.AWS_REGION, fifo = false } = options;
  const client = new SQSClient({ region });

  return {
    async publish<T extends Serializable>(
      message: T,
      opts?: SqsPublishOptions
    ): Promise<string | undefined> {
      const input: SendMessageCommandInput = {
        QueueUrl: queueUrl,
        MessageBody: serialize(message),
      };
      if (fifo) {
        if (opts?.deduplicationId) {
          input.MessageDeduplicationId = opts.deduplicationId;
        }
        input.MessageGroupId = opts?.groupId ?? "default";
      }
      const result = await client.send(new SendMessageCommand(input));
      return result.MessageId;
    },

    async publishBatch<T extends Serializable>(messages: T[]): Promise<void> {
      const entries = messages.map((msg, i) => ({
        Id: `msg-${i}`,
        MessageBody: serialize(msg),
      }));
      await client.send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        })
      );
    },
  };
}

const queueUrl = process.env.AWS_SQS_QUEUE_URL;
const isFifo = queueUrl?.endsWith(".fifo") ?? false;

export const sqsPublisher =
  queueUrl && queueUrl.length > 0
    ? createSqsPublisher({ queueUrl, fifo: isFifo })
    : null;
