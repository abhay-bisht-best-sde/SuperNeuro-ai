import { NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  getR2FilesBucket,
  MAX_BODY_SIZE_KB,
  SIGNED_URL_EXPIRES_SEC,
  MAX_PART_NUMBER,
} from "@/(server)/lib/api";

const log = logger.withTag("api/sign-part");

export async function POST(request: Request) {
  try {
    log.info("Sign part request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const bodySizeError = validateBodySize(
      request.headers.get("content-length"),
      MAX_BODY_SIZE_KB
    );
    if (bodySizeError) return bodySizeError;

    const body = await request.json();
    const { key, uploadId, partNumber } = body as {
      key?: string;
      uploadId?: string;
      partNumber?: number;
    };

    if (!key || typeof key !== "string") {
      log.warn("Validation failed: key required", { body: { key, uploadId, partNumber } });
      return NextResponse.json(
        { error: "key is required and must be a string" },
        { status: 400 }
      );
    }
    if (!uploadId || typeof uploadId !== "string") {
      log.warn("Validation failed: uploadId required", { body: { key, uploadId, partNumber } });
      return NextResponse.json(
        { error: "uploadId is required and must be a string" },
        { status: 400 }
      );
    }
    const partNum =
      typeof partNumber === "number"
        ? partNumber
        : parseInt(String(partNumber), 10);
    if (!Number.isInteger(partNum) || partNum < 1 || partNum > MAX_PART_NUMBER) {
      log.warn("Validation failed: invalid partNumber", { partNumber: partNum, key });
      return NextResponse.json(
        {
          error: `partNumber must be an integer between 1 and ${MAX_PART_NUMBER}`,
        },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const bucket = getR2FilesBucket();
    if (bucket instanceof NextResponse) return bucket;

    const signedUrl = await getSignedUrl(
      r2Client,
      new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNum,
        Body: "",
      }),
      { expiresIn: SIGNED_URL_EXPIRES_SEC }
    );

    log.success("Part signed", { key, partNumber: partNum });
    return NextResponse.json({ signedUrl });
  } catch (err) {
    log.error("Sign part failed", err);
    return NextResponse.json(
      { error: "Failed to sign part" },
      { status: 500 }
    );
  }
}
