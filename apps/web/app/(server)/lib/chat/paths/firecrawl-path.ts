import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { logger } from "@/core/logger"
import { getFirecrawlTool } from "../api-tools"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeAgentPath } from "./agent-executor"

const log = logger.withTag("firecrawl-path")

export async function executeFirecrawlPath(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
}): Promise<string> {
  const { baseMessages, model, emitter } = params

  log.info("Executing firecrawl path")
  emitter.addStage("firecrawl", "Extracting page content...")

  const firecrawlTool = getFirecrawlTool()
  if (!firecrawlTool) {
    log.warn("Firecrawl tool not available")
    return ""
  }

  const response = await executeAgentPath({
    tools: [firecrawlTool],
    baseMessages,
    model,
    onToolCall: emitter.onToolStep,
  })
  log.info("Firecrawl path completed", { responseLength: response.length })
  return response
}
