import { NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  getR2Bucket,
  MAX_BODY_SIZE_MB,
} from "@/(server)/lib/api";

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "key is required and must be a string" },
        { status: 400 }
      );
    }
    if (!uploadId || typeof uploadId !== "string") {
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
      return NextResponse.json(
        { error: "parts must be an array of { PartNumber, ETag } objects" },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const bucket = getR2Bucket();
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

    return NextResponse.json({ success: true, key });
  } catch (err) {
    logger.withTag("api/complete-upload").error("Complete upload failed", err);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
