import { NextResponse } from "next/server";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  getR2FilesBucket,
  MAX_BODY_SIZE_KB,
} from "@/(server)/helpers";

const log = logger.withTag("api/abort-multipart-upload");

export async function POST(request: Request) {
  try {
    log.info("Abort upload request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const bodySizeError = validateBodySize(
      request.headers.get("content-length"),
      MAX_BODY_SIZE_KB
    );
    if (bodySizeError) return bodySizeError;

    const body = await request.json();
    const { key, uploadId } = body as { key?: string; uploadId?: string };

    if (!key || typeof key !== "string") {
      log.warn("Validation failed: key required", { body: { key, uploadId } });
      return NextResponse.json(
        { error: "key is required and must be a string" },
        { status: 400 }
      );
    }
    if (!uploadId || typeof uploadId !== "string") {
      log.warn("Validation failed: uploadId required", { body: { key, uploadId } });
      return NextResponse.json(
        { error: "uploadId is required and must be a string" },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const bucket = getR2FilesBucket();
    if (bucket instanceof NextResponse) return bucket;

    await r2Client.send(
      new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      })
    );

    log.success("Upload aborted", { key });
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Abort upload failed", err);
    return NextResponse.json(
      { error: "Failed to abort upload" },
      { status: 500 }
    );
  }
}
