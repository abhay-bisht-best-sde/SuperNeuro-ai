import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import {
  getCachedConversation,
  invalidateConversation,
  setCachedConversation,
} from "@/(server)/lib/conversation-cache"
import { FORBIDDEN_ERROR, INTERNAL_ERROR } from "@/(server)/core/constants"

const log = logger.withTag("api/conversations/[id]")

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    log.info("Get conversation request", { id })

    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const cached = await getCachedConversation(id)
    if (cached && cached.userId === userId) {
      log.success("Conversation fetched from cache", { id, userId })
      return NextResponse.json(cached)
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    await setCachedConversation(id, conversation)

    log.success("Conversation fetched", { id, userId })
    return NextResponse.json(conversation)
  } catch (err) {
    log.error("Conversation fetch failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    log.info("Update conversation request", { id })

    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : null
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const existing = await prisma.conversation.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: FORBIDDEN_ERROR },
        { status: 403 }
      )
    }

    await prisma.conversation.update({
      where: { id },
      data: { title },
    })

    await invalidateConversation(id)

    log.success("Conversation updated", { id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    log.error("Conversation update failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    log.info("Delete conversation request", { id })

    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const existing = await prisma.conversation.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: FORBIDDEN_ERROR },
        { status: 403 }
      )
    }

    await prisma.conversation.delete({
      where: { id },
    })

    await invalidateConversation(id)

    log.success("Conversation deleted", { id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    log.error("Conversation delete failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
