/**
 * AWS SQS Queue Setup Script
 *
 * Creates the required queues for the document processing pipeline:
 * - pdf-indexing-queue (standard)
 * - image-processing-queue.fifo (FIFO)
 *
 * Run: npx tsx scripts/setup-queues.ts
 * Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
 */

import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";

const region = process.env.AWS_REGION ?? "us-east-1";
const client = new SQSClient({ region });

async function createQueue(name: string, fifo = false) {
  const params: Parameters<typeof client.send>[0]["input"] = {
    QueueName: name,
    ...(fifo && {
      FifoQueue: true,
      ContentBasedDeduplication: true,
    }),
  };
  const result = await client.send(new CreateQueueCommand(params));
  console.log(`Created ${name}: ${result.QueueUrl}`);
  return result.QueueUrl;
}

async function main() {
  await createQueue("pdf-indexing-queue");
  await createQueue("image-processing-queue.fifo", true);
}

main().catch(console.error);
