import { S3Client } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server";
import { env } from "@/core/env";
import { R2_BUCKET_ERROR } from "../core/constants";

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

export function getR2FilesBucket(): string | NextResponse {
  const bucket = env.CLOUDFLARE_R2_FILES_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json({ error: R2_BUCKET_ERROR }, { status: 500 });
  }
  return bucket;
}

export function getR2ImagesBucket(): string | NextResponse {
  const bucket = env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json({ error: R2_BUCKET_ERROR }, { status: 500 });
  }
  return bucket;
}

export const r2Client = createR2Client()