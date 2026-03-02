import { SystemMessage, type BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { SYSTEM_MESSAGE } from "@/(server)/core/constants"

/**
 * Direct LLM call — no tools, no agent loop.
 * Streams tokens so the UI updates progressively.
 */
export async function executeDirectLlm(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  systemMessage?: string
  emitToken?: (token: string) => void
  flushTokens?: () => void
}): Promise<string> {
  const {
    baseMessages,
    model,
    systemMessage = SYSTEM_MESSAGE,
    emitToken,
    flushTokens,
  } = params

  const messages = [new SystemMessage(systemMessage), ...baseMessages]
  const stream = await model.stream(messages)

  let content = ""
  for await (const chunk of stream) {
    const token = typeof chunk.content === "string" ? chunk.content : ""
    content += token
    if (token && emitToken) emitToken(token)
  }

  // Flush any buffered tokens before the caller publishes the final MESSAGE
  if (flushTokens) flushTokens()

  return content
}
