import { NextResponse } from "next/server";
import { env } from "@/core/env";
import { R2_BUCKET_ERROR } from "./constants";

export function getR2Bucket(): string | NextResponse {
  const bucket = env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json({ error: R2_BUCKET_ERROR }, { status: 500 });
  }
  return bucket;
}
