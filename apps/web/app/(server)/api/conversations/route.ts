import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import { INTERNAL_ERROR } from "@/(server)/core/constants"
import { ConversationType } from "@repo/database"

const log = logger.withTag("api/conversations")

export async function GET(request: Request) {
  try {
    log.info("Get conversations request")
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get("type") as "WORKFLOW" | "RAG" | null

    const where: { userId: string; type?: ConversationType } = { userId }
    if (typeParam === "WORKFLOW" || typeParam === "RAG") {
      where.type = typeParam as ConversationType
    }

    const items = await prisma.conversation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    log.success("Conversations fetched", { count: items.length, userId, type: typeParam })
    return NextResponse.json(items)
  } catch (err) {
    log.error("Conversations fetch failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    log.info("Create conversation request")
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    let type = ConversationType.WORKFLOW
    const text = await request.text()
    if (text) {
      try {
        const body = JSON.parse(text) as { type?: string }
        if (body?.type === "RAG") type = ConversationType.RAG
      } catch {
        // Use default
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: type === ConversationType.RAG ? "New Intelligent Chat" : "New Workflow",
        type,
      },
    })

    return NextResponse.json({ id: conversation.id })
  } catch (err) {
    log.error("Conversation create failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
