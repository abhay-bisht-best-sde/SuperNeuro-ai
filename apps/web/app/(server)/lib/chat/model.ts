import { ChatOpenAI } from "@langchain/openai"

import { env } from "@/core/env"

import { createOpenAILoggingCallback } from "./logger"

let chatModel: ChatOpenAI | null = null

export function getChatModel(): ChatOpenAI {
  if (!chatModel) {
    chatModel = new ChatOpenAI({
      modelName: env.OPENAI_CHAT_MODEL,
      apiKey: env.OPENAI_API_KEY,
      temperature: 0.3,
      callbacks: [createOpenAILoggingCallback()],
    })
  }
  return chatModel
}
