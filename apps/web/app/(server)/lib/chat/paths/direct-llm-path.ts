import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { logger } from "@/core/logger"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeDirectLlm } from "./agent-executor"

const log = logger.withTag("direct-llm-path")

const DIRECT_LLM_SYSTEM = `You are SuperNeuro.ai — a helpful assistant. Answer the user's question using your own knowledge.

Rules:
- Be concise and format results clearly with markdown.
- You do NOT have access to any tools, web search, or external integrations in this mode.
- NEVER say you will "search", "gather links", "compile resources", or perform any external action — you cannot do that here.
- NEVER promise to do something you cannot do. If the user asks for live links or real-time data, explain that you can share what you know but cannot search the web right now.
- Provide helpful, accurate information from your training data.`

export async function executeDirectLlmPath(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
}): Promise<string> {
  const { baseMessages, model, emitter } = params

  log.info("Executing direct_llm path")
  emitter.addStage("direct_llm", "Generating response...")

  const content = await executeDirectLlm({
    baseMessages,
    model,
    systemMessage: DIRECT_LLM_SYSTEM,
    emitToken: emitter.emitToken,
    flushTokens: emitter.flushTokens,
  })

  return content
}
