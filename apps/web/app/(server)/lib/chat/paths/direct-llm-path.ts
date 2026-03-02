import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { logger } from "@/core/logger"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeDirectLlm } from "./agent-executor"

const log = logger.withTag("direct-llm-path")

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
    emitToken: emitter.emitToken,
    flushTokens: emitter.flushTokens,
  })

  return content
}
