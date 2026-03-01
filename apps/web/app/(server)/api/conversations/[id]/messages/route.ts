import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import { invalidateConversation } from "@/(server)/lib/conversation-cache"
import {
  ConversationEventType,
  publishConversationEvent,
  type ConversationGraphStageEvent,
} from "@/(server)/lib/ably"
import { runChatGraph } from "@/(server)/lib/chat/chat-graph"
import { INTERNAL_ERROR, SYSTEM_MESSAGE_OBJ } from "@/(server)/core/constants"
import { MessageRole, type IntegrationType } from "@repo/database"

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
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    const userConfig = await prisma.userConfig.findUnique({
      where: { userId },
      include: {
        userIntegrationConnections: {
          where: { connected: true },
          select: { provider: true },
        },
      },
    })
    const connectedProviders: IntegrationType[] =
      userConfig?.userIntegrationConnections.map((c) => c.provider) ?? []

    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.USER,
        content,
      },
    })

    try {
      await publishConversationEvent(userId, conversationId, {
        type: ConversationEventType.THINKING,
      })
    } catch (e) {
      log.warn("Ably thinking event failed", e)
    }

    const messages = [
      SYSTEM_MESSAGE_OBJ,
      ...conversation.messages.map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
      { role: "user", content },
    ]

    const onGraphEvent = async (event: ConversationGraphStageEvent) => {
      try {
        await publishConversationEvent(userId, conversationId, event)
      } catch (e) {
        log.warn("Ably graph stage event failed", e)
      }
    }

    const response = await runChatGraph({
      messages,
      userId,
      conversationSummary: null,
      connectedProviders,
      onEvent: onGraphEvent,
    })

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: response,
      },
    })

    try {
      await publishConversationEvent(userId, conversationId, {
        type:  ConversationEventType.MESSAGE,
        message: {
          id: assistantMessage.id,
          role: 'assistant',
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt.toISOString(),
        },
      })
    } catch (e) {
      log.warn("Ably message event failed", e)
    }

    await invalidateConversation(conversationId)

    log.success("Message and response saved", {
      conversationId,
      messageId: userMessage.id,
    })

    return NextResponse.json({success: true})
  } catch (err) {
    log.error("Send message failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
