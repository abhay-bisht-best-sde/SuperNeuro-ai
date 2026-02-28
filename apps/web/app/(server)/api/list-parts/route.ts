import { NextResponse } from "next/server";
import { ListPartsCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/(server)/lib/r2";
import { logger } from "@/core/logger";
import { requireAuth, validateUserKey, getR2FilesBucket } from "@/(server)/helpers";

const log = logger.withTag("api/list-parts");

export async function GET(request: Request) {
  try {
    log.info("List parts request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const uploadId = searchParams.get("uploadId");

    if (!key || !uploadId) {
      log.warn("Validation failed: key and uploadId required", { key, uploadId });
      return NextResponse.json(
        { error: "key and uploadId are required" },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const bucket = getR2FilesBucket();
    if (bucket instanceof NextResponse) return bucket;

    const result = await r2Client.send(
      new ListPartsCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      })
    );

    const parts = (result.Parts ?? []).map((p) => ({
      PartNumber: p.PartNumber,
      ETag: p.ETag,
      Size: p.Size,
    }));

    log.success("Parts listed", { key, count: parts.length });
    return NextResponse.json(parts);
  } catch (err) {
    log.error("List parts failed", err);
    return NextResponse.json(
      { error: "Failed to list parts" },
      { status: 500 }
    );
  }
}
