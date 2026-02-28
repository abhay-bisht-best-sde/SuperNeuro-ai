import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSettings } from "../core/config.js";

function getR2Endpoint(): string {
  const s = getSettings();
  return `https://${s.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (r2Client) return r2Client;

  const s = getSettings();
  r2Client = new S3Client({
    region: "auto",
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId: s.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: s.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
  return r2Client;
}

function getR2FilesBucketName(): string {
  return getSettings().CLOUDFLARE_R2_FILES_BUCKET_NAME;
}

function getR2ImagesBucketName(): string {
  return getSettings().CLOUDFLARE_R2_IMAGES_BUCKET_NAME;
}

export async function downloadPdfFromR2(r2Key: string): Promise<Buffer> {
  const client = getR2Client();
  const bucket = getR2FilesBucketName();
  const resp = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: r2Key })
  );
  const stream = resp.Body;
  if (!stream) throw new Error("Empty response body");
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function downloadImageFromR2(r2Key: string): Promise<Buffer> {
  const client = getR2Client();
  const bucket = getR2ImagesBucketName();
  const resp = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: r2Key })
  );
  const stream = resp.Body;
  if (!stream) throw new Error("Empty response body");
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function uploadImageToR2(
  imageBuffer: Buffer,
  r2Key: string
): Promise<void> {
  const client = getR2Client();
  const bucket = getR2ImagesBucketName();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: r2Key,
      Body: imageBuffer,
      ContentType: "image/png",
    })
  );
}
