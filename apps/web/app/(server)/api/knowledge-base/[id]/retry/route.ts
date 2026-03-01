import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { logger } from "@/core/logger";
import { INTERNAL_ERROR, MAX_RETRY_ATTEMPTS } from "@/(server)/core/constants"
import { KnowledgeBaseIndexingStatus } from "@repo/database";
import { createPdfIndexMessage } from "@repo/database/types";
import { pdfIndexingPublisher } from "@/(server)/lib/publishers";
import { requireAuth } from "@/(server)/lib/auth";

const log = logger.withTag("api/retry-knowledge-base");

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    log.info("Retry knowledge base request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id: knowledgeBaseId } = await params;

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, userId },
    });

    if (!kb) {
      log.warn("Knowledge base not found", { knowledgeBaseId, userId });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (kb.indexingStatus !== KnowledgeBaseIndexingStatus.ERROR) {
      log.warn("Can only retry failed knowledge bases", {
        knowledgeBaseId,
        status: kb.indexingStatus,
      });
      return NextResponse.json(
        { error: "Can only retry failed knowledge bases" },
        { status: 400 }
      );
    }

    if ((kb.processingAttempts ?? 0) < MAX_RETRY_ATTEMPTS) {
      log.warn("SQS will retry automatically; manual retry only after max attempts", {
        knowledgeBaseId,
        processingAttempts: kb.processingAttempts,
      });
      return NextResponse.json(
        { error: "SQS will retry automatically. Manual retry available after max attempts." },
        { status: 400 }
      );
    }

    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        indexingStatus: KnowledgeBaseIndexingStatus.PENDING,
        processingAttempts: 0,
        errorMessage: null,
      },
    });

    if (pdfIndexingPublisher) {
      const message = createPdfIndexMessage({
        fileId: kb.id,
        key: kb.key,
        userId: kb.userId,
        fileName: kb.fileName,
        fileSize: kb.fileSize,
      });
      await pdfIndexingPublisher.publish(message);
      log.success("Knowledge base retry queued", { knowledgeBaseId });
    } else {
      log.error(
        "PDF indexing queue not configured: AWS_SQS_PDF_INDEXING_QUEUE_URL is missing or invalid. Status reset but retry will not run."
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Retry knowledge base failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
