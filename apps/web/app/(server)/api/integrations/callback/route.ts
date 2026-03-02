import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import type { IntegrationType } from "@repo/database"
import {
  parseComposioCallbackParams,
  VALID_COMPOSIO_PROVIDERS,
} from "@/(server)/lib/composio"
import {
  loadCheckpoint,
  deleteCheckpoint,
} from "@/(server)/lib/chat/checkpoint"
import { processConversationMessage } from "@/(server)/lib/message-processor"

const log = logger.withTag("api/integrations/callback")

function redirect(reqUrl: URL, result: "connected" | "error") {
  const rawReturnUrl = reqUrl.searchParams.get("returnUrl")
  const returnUrl =
    rawReturnUrl?.startsWith("/") && !rawReturnUrl.startsWith("//")
      ? rawReturnUrl
      : "/dashboard/integrations"
  const target = new URL(returnUrl, reqUrl.origin)
  target.searchParams.set("integration", result)
  return NextResponse.redirect(target)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const { status, connectedAccountId } = parseComposioCallbackParams(url)

    if (status !== "success") {
      log.warn("Callback rejected: non-success status", { status })
      return redirect(url, "error")
    }

    if (!connectedAccountId) {
      log.warn("Callback rejected: missing connectedAccountId")
      return redirect(url, "error")
    }

    const providerParam = url.searchParams.get("provider")
    const provider: IntegrationType | null =
      providerParam && VALID_COMPOSIO_PROVIDERS.includes(providerParam as IntegrationType)
        ? (providerParam as IntegrationType)
        : null

    if (!provider) {
      log.warn("Callback rejected: missing or invalid provider", { providerParam })
      return redirect(url, "error")
    }

    const userConfig = await prisma.userConfig.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!userConfig) {
      log.warn("Callback rejected: no user config found", { userId })
      return redirect(url, "error")
    }

    await prisma.userIntegrationConnection.upsert({
      where: { userId_provider: { userId, provider } },
      update: {
        connected: true,
        composioConnectedAccountId: connectedAccountId,
        userConfigId: userConfig.id,
      },
      create: {
        userId,
        userConfigId: userConfig.id,
        provider,
        connected: true,
        composioConnectedAccountId: connectedAccountId,
      },
    })

    log.success("Integration connected", { userId, provider })

    // ─── Resume pending conversation if a checkpoint exists ──────────────────
    const conversationId = url.searchParams.get("conversationId")
    if (conversationId) {
      const checkpoint = await loadCheckpoint(conversationId)
      if (checkpoint && checkpoint.userId === userId) {
        log.info("Resuming conversation from checkpoint", { conversationId })
        await deleteCheckpoint(conversationId)

        // Process the original message now that the provider is connected.
        // Fire-and-forget — the user is already redirected to the conversation page.
        void processConversationMessage({
          userId,
          conversationId: checkpoint.conversationId,
          content: checkpoint.pendingMessage,
          origin: url.origin,
        }).catch((err) => {
          log.error("Failed to resume conversation after OAuth", err)
        })
      }
    }

    return redirect(url, "connected")
  } catch (err) {
    log.error("Integration callback failed", err)
    return redirect(url, "error")
  }
}
