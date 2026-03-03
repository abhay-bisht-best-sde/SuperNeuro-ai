import { NextResponse } from "next/server"

import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import { processConversationMessage } from "@/(server)/lib/message-processor"
import { INTERNAL_ERROR } from "@/(server)/core/constants"

const log = logger.withTag("api/conversations/[id]/messages")

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params
    log.info("Send message request", { conversationId })

    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const body = await request.json()
    const content = typeof body.content === "string" ? body.content.trim() : null

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const url = new URL(request.url)
    const origin = url.origin

    await processConversationMessage({ userId, conversationId, content, origin })

    return NextResponse.json({ success: true })
  } catch (err) {
    log.error("Send message failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
