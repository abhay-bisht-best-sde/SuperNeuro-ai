import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { logger } from "@/core/logger"
import { SYSTEM_MESSAGE } from "@/(server)/core/constants"
import { getTavilyTool } from "../api-tools"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeAgentPath } from "./agent-executor"

const log = logger.withTag("tavily-path")

const TAVILY_FORMATTING_HINT = `
When presenting web search results:
- Format links as markdown: [title](url)
- Use tables for multiple results when appropriate
- Structure lists clearly with bullet points
`

export async function executeTavilyPath(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
}): Promise<string> {
  const { baseMessages, model, emitter } = params

  log.info("Executing tavily path")
  emitter.addStage("tavily", "Searching the web...")

  const tavilyTool = getTavilyTool()
  if (!tavilyTool) {
    log.warn("Tavily tool not available")
    return ""
  }

  const response = await executeAgentPath({
    tools: [tavilyTool],
    baseMessages,
    model,
    systemMessage: SYSTEM_MESSAGE + TAVILY_FORMATTING_HINT,
    onToolCall: emitter.onToolStep,
  })
  log.info("Tavily path completed", { responseLength: response.length })
  return response
}
