import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { logger } from "@/core/logger";
import { INTERNAL_ERROR } from "@/(server)/core/constants"
import { KnowledgeBaseIndexingStatus } from "@repo/database";
import { ImageProcessingStatus } from "@repo/database";
import { requireAuth } from "@/(server)/lib/auth";

const log = logger.withTag("api/get-knowledge-base");

export async function GET() {
  try {
    log.info("Get knowledge base list request");
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const items = await prisma.knowledgeBase.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        images: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const knowledgeBases = items.map((item) => {
      const imagesIndexed = item.images.filter(
        (img) => img.indexingStatus === ImageProcessingStatus.INDEXED
      ).length;
      const imagesError = item.images.filter(
        (img) => img.indexingStatus === ImageProcessingStatus.ERROR
      ).length;
      const imagesNotStarted = item.images.filter(
        (img) => img.indexingStatus === ImageProcessingStatus.PENDING
      ).length;
      const totalImages = item.images.length;
      return {
        id: item.id,
        name: item.fileName,
        sourceType: "document" as const,
        lastUpdated: item.updatedAt,
        status: item.indexingStatus,
        totalImages,
        imagesIndexed,
        imagesError,
        imagesNotStarted,
        images: item.images.map((img) => ({
          id: img.id,
          r2Key: img.r2Key,
          indexingStatus: img.indexingStatus,
          textSummary: img.textSummary,
          processingAttempts: img.processingAttempts,
          errorMessage: img.errorMessage,
          createdAt: img.createdAt,
        })),
        errorMessage: item.errorMessage,
        processingAttempts: item.processingAttempts,
        progress:
          item.indexingStatus === KnowledgeBaseIndexingStatus.INDEXING
            ? undefined
            : undefined,
      };
    });

    log.success("Knowledge base list fetched", { count: knowledgeBases.length, userId });
    return NextResponse.json(knowledgeBases);
  } catch (err) {
    log.error("Knowledge base fetch failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
