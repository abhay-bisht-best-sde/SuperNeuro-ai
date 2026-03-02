import { logger } from "@/core/logger"

import type { ChatGraphInput } from "@/(server)/core/types"
import { getChatModel } from "./model"
import { createChecklistEmitter } from "./checklist-emitter"
import { runRouter } from "./router"
import { toBaseMessages, resolveCapabilities } from "./utils"
import { executeTavilyPath } from "./paths/tavily-path"
import { executeFirecrawlPath } from "./paths/firecrawl-path"
import { executeComposioPath } from "./paths/composio-path"
import { executeDirectLlmPath } from "./paths/direct-llm-path"

const log = logger.withTag("chat-graph")

export async function runChatGraph(input: ChatGraphInput): Promise<string> {
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

  const capabilities = resolveCapabilities(connectedProviders)
  const { hasTavily, hasFirecrawl, hasComposio, availableTools } = capabilities

  log.debug("Capabilities", {
    hasTavily,
    hasFirecrawl,
    hasComposio,
    availableTools,
  })

  const emitter = createChecklistEmitter(onEvent)

  emitter.addStage("routing", "Analyzing your request...")

  const route = await runRouter({
    lastUserContent,
    availableTools,
    model,
  })

  log.info("Router: selected route", { route, availableTools })

  if (route === "tavily" && hasTavily) {
    return executeTavilyPath({
      baseMessages,
      model,
      emitter,
    })
  }

  if (route === "firecrawl" && hasFirecrawl) {
    return executeFirecrawlPath({
      baseMessages,
      model,
      emitter,
    })
  }

  if (route === "composio" && hasComposio && userId) {
    const response = await executeComposioPath({
      userId,
      connectedProviders,
      baseMessages,
      lastUserContent,
      model,
      emitter,
    })
    if (response !== null) return response
  }

  const finalResponse = await executeDirectLlmPath({
    baseMessages,
    model,
    emitter,
  })

  log.info("runChatGraph completed", {
    route,
    responseLength: finalResponse.length,
  })

  return finalResponse
}
