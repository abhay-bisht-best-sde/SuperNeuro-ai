import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { invalidateConversation } from "@/(server)/lib/conversation-cache"
import {
  ConversationEventType,
  publishConversationEvent,
} from "@/(server)/lib/ably"
import { initiateComposioConnection } from "@/(server)/lib/composio"
import { runChatGraph, runRagGraph } from "@/(server)/lib/chat"
import { SYSTEM_MESSAGE_OBJ } from "@/(server)/core/constants"
import { MessageRole, ConversationType, type IntegrationType } from "@repo/database"
import { saveCheckpoint } from "@/(server)/lib/chat/checkpoint"
import type { ConversationEvent } from "@/libs/ably-types"

const log = logger.withTag("message-processor")

export async function processConversationMessage(params: {
  userId: string
  conversationId: string
  content: string
  origin: string
}): Promise<void> {
  const { userId, conversationId, content, origin } = params

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!conversation) {
    log.warn("Conversation not found", { conversationId, userId })
    return
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

  await prisma.message.create({
    data: { conversationId, role: MessageRole.USER, content },
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

  const onEvent = async (event: ConversationEvent) => {
    try {
      // publishConversationEvent accepts ConversationEvent
      await publishConversationEvent(userId, conversationId, event)
    } catch (e) {
      log.warn("Ably event publish failed", e)
    }
  }

  const conversationType = conversation.type ?? ConversationType.WORKFLOW

  const result =
    conversationType === ConversationType.RAG
      ? await runRagGraph({ messages, userId, onEvent })
      : await runChatGraph({ messages, userId, connectedProviders, onEvent, origin })

  // ─── Handle requires_connection ───────────────────────────────────────────
  if (result.type === "requires_connection") {
    const { provider } = result

    log.info("Requires connection", { provider, conversationId })

    // Initiate OAuth and get the redirect URL
    let connectUrl = `${origin}/dashboard/integrations`
    try {
      const callbackUrl = new URL(`${origin}/api/integrations/callback`)
      callbackUrl.searchParams.set("provider", provider)
      callbackUrl.searchParams.set("conversationId", conversationId)
      callbackUrl.searchParams.set("returnUrl", `/dashboard?conv=${conversationId}`)

      const { redirectUrl } = await initiateComposioConnection({
        userId,
        provider: provider as IntegrationType,
        callbackUrl: callbackUrl.toString(),
      })
      connectUrl = redirectUrl
    } catch (err) {
      log.error("Failed to initiate Composio connection for requires_connection", err)
    }

    // Save checkpoint so we can resume after OAuth
    await saveCheckpoint(conversationId, {
      userId,
      conversationId,
      pendingMessage: content,
      requiredProviders: [provider],
      origin,
      createdAt: new Date().toISOString(),
    })

    // Publish requires_connection event to the UI
    try {
      await publishConversationEvent(userId, conversationId, {
        type: ConversationEventType.REQUIRES_CONNECTION,
        provider,
        connectUrl,
      })
    } catch (e) {
      log.warn("Ably requires_connection event failed", e)
    }

    // Save a placeholder assistant message that the UI can display
    const providerLabel = provider.replace(/_/g, " ").toLowerCase()
    await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: `To complete this task, please connect **${providerLabel}**. Click the button below to authorize access.`,
      },
    })

    await invalidateConversation(conversationId)
    return
  }

  // ─── Normal message response ───────────────────────────────────────────────
  // Small pause so the last batched token event is received before MESSAGE
  await new Promise((r) => setTimeout(r, 150))

  const assistantMessage = await prisma.message.create({
    data: {
      conversationId,
      role: MessageRole.ASSISTANT,
      content: result.content,
      executionStepsWithStatus: result.ragSources?.length
        ? ({ ragSources: result.ragSources } as object)
        : undefined,
    },
  })

  try {
    await publishConversationEvent(userId, conversationId, {
      type: ConversationEventType.MESSAGE,
      message: {
        id: assistantMessage.id,
        role: "assistant",
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt.toISOString(),
        ragSources: result.ragSources,
      },
    })
  } catch (e) {
    log.warn("Ably message event failed", e)
  }

  await invalidateConversation(conversationId)

  log.success("Message processed", { conversationId })
}
