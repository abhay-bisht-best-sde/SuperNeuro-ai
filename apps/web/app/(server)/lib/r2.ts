import { S3Client } from "@aws-sdk/client-s3"
import { env } from "@/core/env"

function getR2Endpoint() {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  if (!accountId) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID is required for R2")
  }
  return `https://${accountId}.r2.cloudflarestorage.com`
}

export function createR2Client(): S3Client {
  const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID and CLOUDFLARE_R2_SECRET_ACCESS_KEY are required")
  }

  return new S3Client({
    region: "auto",
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export const r2Client = createR2Client()
