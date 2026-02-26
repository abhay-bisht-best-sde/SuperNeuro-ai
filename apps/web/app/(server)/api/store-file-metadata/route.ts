import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { KnowledgeBaseIndexingStatus } from "@repo/database";
import { createFileUploadMessage } from "@repo/database/types";
import { logger } from "@/core/logger";
import { sqsPublisher } from "@/(server)/lib/publishers";
import {
  requireAuth,
  validateBodySize,
  validateUserKey,
  MAX_BODY_SIZE_KB,
} from "@/(server)/lib/api";

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "fileName is required and must be a string" },
        { status: 400 }
      );
    }
    if (typeof fileSize !== "number" || fileSize < 0) {
      return NextResponse.json(
        { error: "fileSize is required and must be a non-negative number" },
        { status: 400 }
      );
    }
    if (!key || typeof key !== "string") {
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
      return NextResponse.json({ success: true });
    }

    const file = await prisma.knowledgeBase.create({
      data: {
        userId,
        fileName,
        fileSize,
        key,
        indexingStatus: KnowledgeBaseIndexingStatus.pending,
      },
    });

    if (sqsPublisher) {
      const message = createFileUploadMessage({
        fileId: file.id,
        key: file.key,
        userId: file.userId,
        fileName: file.fileName,
        fileSize: file.fileSize,
      });
      await sqsPublisher.publish(message, {
        deduplicationId: file.id,
        groupId: file.userId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.withTag("api/store-file-metadata").error("Store metadata failed", err);
    return NextResponse.json(
      { error: "Failed to store file metadata" },
      { status: 500 }
    );
  }
}
