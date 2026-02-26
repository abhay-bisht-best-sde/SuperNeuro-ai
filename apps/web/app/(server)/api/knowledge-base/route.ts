import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { logger } from "@/core/logger";
import { requireAuth, INTERNAL_ERROR } from "@/(server)/lib/api";
import  {KnowledgeBaseIndexingStatus} from "@repo/database"

const log = logger.withTag("api/get-knowledge-base");

export async function GET() {
  try {
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
      sourceType: "document" as const,
      lastUpdated: item.updatedAt,
      status: item.indexingStatus,
      progress:
        item.indexingStatus === KnowledgeBaseIndexingStatus.indexing
          ? undefined
          : undefined,
    }));

    return NextResponse.json(knowledgeBases);
  } catch (err) {
    log.error("Knowledge base fetch failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
