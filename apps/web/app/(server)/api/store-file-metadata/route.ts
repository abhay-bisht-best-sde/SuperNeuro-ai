import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { KnowledgeBaseIndexingStatus } from "@repo/database";
import { createPdfIndexMessage } from "@repo/database/types";
import { logger } from "@/core/logger";
import { pdfIndexingPublisher } from "@/(server)/lib/publishers";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  MAX_BODY_SIZE_KB,
} from "@/(server)/helpers";

const log = logger.withTag("api/store-file-metadata");

export async function POST(request: Request) {
  try {
    log.info("Store file metadata request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const bodySizeError = validateBodySize(
      request.headers.get("content-length"),
      MAX_BODY_SIZE_KB
    );
    if (bodySizeError) return bodySizeError;

    const body = await request.json();
    const { fileName, fileSize, key } = body as {
      fileName?: string;
      fileSize?: number;
      key?: string;
    };

    if (!fileName || typeof fileName !== "string") {
      log.warn("Validation failed: fileName required", { body: { fileName, fileSize, key } });
      return NextResponse.json(
        { error: "fileName is required and must be a string" },
        { status: 400 }
      );
    }
    if (typeof fileSize !== "number" || fileSize < 0) {
      log.warn("Validation failed: invalid fileSize", { fileSize });
      return NextResponse.json(
        { error: "fileSize is required and must be a non-negative number" },
        { status: 400 }
      );
    }
    if (!key || typeof key !== "string") {
      log.warn("Validation failed: key required", { body: { fileName, fileSize, key } });
      return NextResponse.json(
        { error: "key is required and must be a string" },
        { status: 400 }
      );
    }

    const keyError = validateUserKey(key, userId);
    if (keyError) return keyError;

    const existing = await prisma.knowledgeBase.findFirst({
      where: { key, userId },
    });
    if (existing) {
      log.debug("File already exists", { key, userId });
      return NextResponse.json({ success: true });
    }

    const file = await prisma.knowledgeBase.create({
      data: {
        userId,
        fileName,
        fileSize,
        key,
        indexingStatus: KnowledgeBaseIndexingStatus.PENDING,
      },
    });

    if (pdfIndexingPublisher) {
      const message = createPdfIndexMessage({
        fileId: file.id,
        key: file.key,
        userId: file.userId,
        fileName: file.fileName,
        fileSize: file.fileSize,
      });
      await pdfIndexingPublisher.publish(message, {
        groupId: file.id,
        deduplicationId: file.id,
      });
      log.success("File metadata stored and PDF indexing queued", {
        fileId: file.id,
        fileName: file.fileName,
      });
    } else {
      log.error(
        "PDF indexing queue not configured: AWS_SQS_PDF_INDEXING_QUEUE_URL is missing or invalid. File metadata saved but indexing will not run."
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Store metadata failed", err);
    return NextResponse.json(
      { error: "Failed to store file metadata" },
      { status: 500 }
    );
  }
}
