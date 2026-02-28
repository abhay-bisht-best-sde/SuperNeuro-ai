import { NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  getR2FilesBucket,
  MAX_BODY_SIZE_MB,
} from "@/(server)/lib/api";

const log = logger.withTag("api/complete-upload");

export async function POST(request: Request) {
  try {
    log.info("Complete upload request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const bodySizeError = validateBodySize(
      request.headers.get("content-length"),
      MAX_BODY_SIZE_MB
    );
    if (bodySizeError) return bodySizeError;

    const body = await request.json();
    const { key, uploadId, parts } = body as {
      key?: string;
      uploadId?: string;
      parts?: Array<{ PartNumber: number; ETag: string }>;
    };

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
    if (
      !Array.isArray(parts) ||
      !parts.every(
        (p) =>
          typeof p === "object" &&
          typeof p?.PartNumber === "number" &&
          typeof p?.ETag === "string"
      )
    ) {
      log.warn("Validation failed: invalid parts array", { key, partsCount: parts?.length });
      return NextResponse.json(
        { error: "parts must be an array of { PartNumber, ETag } objects" },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const bucket = getR2FilesBucket();
    if (bucket instanceof NextResponse) return bucket;

    await r2Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p) => ({ PartNumber: p.PartNumber, ETag: p.ETag })),
        },
      })
    );

    log.success("Upload completed", { key });
    return NextResponse.json({ success: true, key });
  } catch (err) {
    log.error("Complete upload failed", err);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
