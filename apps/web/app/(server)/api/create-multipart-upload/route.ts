import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import {
  requireAuth,
  validateBodySize,
  getR2FilesBucket,
  MAX_BODY_SIZE_KB,
  ALLOWED_CONTENT_TYPES,
} from "@/(server)/helpers";

const log = logger.withTag("api/create-multipart-upload");

export async function POST(request: Request) {
  try {
    log.info("Create multipart upload request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const bodySizeError = validateBodySize(
      request.headers.get("content-length"),
      MAX_BODY_SIZE_KB
    );
    if (bodySizeError) return bodySizeError;

    const body = await request.json();
    const { fileName, contentType } = body as {
      fileName?: string;
      contentType?: string;
    };

    if (!fileName || typeof fileName !== "string") {
      log.warn("Validation failed: fileName required", { body: { fileName, contentType } });
      return NextResponse.json(
        { error: "fileName is required and must be a string" },
        { status: 400 }
      );
    }
    if (!contentType || typeof contentType !== "string") {
      log.warn("Validation failed: contentType required", { body: { fileName, contentType } });
      return NextResponse.json(
        { error: "contentType is required and must be a string" },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_CONTENT_TYPES.includes(
        contentType as (typeof ALLOWED_CONTENT_TYPES)[number]
      )
    ) {
      log.warn("Validation failed: invalid contentType", { contentType });
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const bucket = getR2FilesBucket();
    if (bucket instanceof NextResponse) return bucket;

    const uuid = randomUUID();
    const key = `${userId}/${uuid}`;

    const result = await r2Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      })
    );

    log.success("Multipart upload created", { key, uploadId: result.UploadId });
    return NextResponse.json({
      uploadId: result.UploadId,
      key,
    });
  } catch (err) {
    log.error("Create multipart upload failed", err);
    return NextResponse.json(
      { error: "Failed to create multipart upload" },
      { status: 500 }
    );
  }
}
