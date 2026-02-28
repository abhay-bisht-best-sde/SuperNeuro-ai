import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import { INTERNAL_ERROR } from "@/(server)/core/constants"

const log = logger.withTag("api/conversations")

export async function GET() {
  try {
    log.info("Get conversations request")
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const items = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    log.success("Conversations fetched", { count: items.length, userId })
    return NextResponse.json(items)
  } catch (err) {
    log.error("Conversations fetch failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}

export async function POST() {
  try {
    log.info("Create conversation request")
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: "New Conversation",
      },
    })

    return NextResponse.json({ id: conversation.id })
  } catch (err) {
    log.error("Conversation create failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
