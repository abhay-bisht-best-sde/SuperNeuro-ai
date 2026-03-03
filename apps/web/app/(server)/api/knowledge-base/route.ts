import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { logger } from "@/core/logger";
import { INTERNAL_ERROR } from "@/(server)/core/constants"
import { KnowledgeBaseIndexingStatus } from "@repo/database";
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
    });

    const knowledgeBases = items.map((item) => ({
      id: item.id,
      name: item.fileName,
      key: item.key,
      sourceType: "document" as const,
      lastUpdated: item.updatedAt,
      status: item.indexingStatus,
      errorMessage: item.errorMessage,
      processingAttempts: item.processingAttempts,
      progress:
        item.indexingStatus === KnowledgeBaseIndexingStatus.INDEXING
          ? undefined
          : undefined,
    }));

    log.success("Knowledge base list fetched", { count: knowledgeBases.length, userId });
    return NextResponse.json(knowledgeBases);
  } catch (err) {
    log.error("Knowledge base fetch failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
