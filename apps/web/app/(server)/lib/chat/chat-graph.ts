import { logger } from "@/core/logger"

import type { ChatGraphInput, ChatGraphResult } from "@/(server)/core/types"
import { createChecklistEmitter } from "./checklist-emitter"
import { routeAndPlan } from "./task_router"
import { toBaseMessages } from "./utils"
import { executeComposioPath } from "./paths/composio-path"
import { executeDirectLlmPath } from "./paths/direct-llm-path"
import { getChatModel } from "./model"

const log = logger.withTag("chat-graph")

export async function runChatGraph(input: ChatGraphInput): Promise<ChatGraphResult> {
  const { messages, userId, connectedProviders = [], onEvent } = input

  log.info("runChatGraph started", {
    messageCount: messages.length,
    userId: userId ?? null,
    connectedProvidersCount: connectedProviders.length,
  })

  const baseMessages = toBaseMessages(messages)
  const model = getChatModel()
  const lastUserContent =
    messages.filter((m) => m.role.toLowerCase() === "user").pop()?.content ?? ""

  // Build a condensed conversation history for the router so it can
  // understand follow-up messages like "give me the link" or "send it".
  // We take the last few messages (excluding system) to keep the prompt short.
  const recentMessages = messages
    .filter((m) => m.role.toLowerCase() !== "system")
    .slice(-6)
  const conversationHistory =
    recentMessages.length > 1
      ? recentMessages
          .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`)
          .join("\n")
      : undefined

  const emitter = createChecklistEmitter(onEvent)
  emitter.addStage("routing", "Analyzing your request...")

  // ─── Single LLM call: route + plan ───
  const routeResult = await routeAndPlan({
    query: lastUserContent,
    connectedProviders,
    model,
    conversationHistory,
  })

  const { route, connectedProviders: selectedConnected, missingProviders, intent } = routeResult

  log.info("Router decision", { route, selectedConnected, missingProviders, intent })

  // ─── Auth pre-check: missing provider → surface to user BEFORE executing ───
  // Do NOT let the agent discover missing auth at runtime — that causes
  // infinite meta-tool loops while the LLM tries to figure out the problem.
  if (route === "composio" && missingProviders.length > 0) {
    const firstMissing = missingProviders[0]!
    log.info("Required provider not connected", { provider: firstMissing })
    emitter.addStage("planning", `Connect ${firstMissing} to continue`, { intent })
    return { type: "requires_connection", provider: firstMissing }
  }

  // ─── Composio path: only if we have connected providers to work with ───
  if (route === "composio" && selectedConnected.length > 0 && userId) {
    emitter.addStage("planning", intent, { intent })

    const response = await executeComposioPath({
      userId,
      connectedProviders,
      selectedProviders: selectedConnected,
      baseMessages,
      model,
      emitter,
    })

    if (response !== null) {
      return { type: "message", content: response }
    }

    log.warn("Composio path returned null, falling through to direct_llm")
  }

  // ─── Fallback: direct LLM ───
  const content = await executeDirectLlmPath({ baseMessages, model, emitter })

  log.info("runChatGraph completed", { route, responseLength: content.length })

  return { type: "message", content }
}
