import { BaseCallbackHandler } from "@langchain/core/callbacks/base"

import { logger } from "@/core/logger"

const log = logger.withTag("openai")

function logLLMStart(prompts: string[]): void {
  const preview = prompts[0]?.slice(0, 200) ?? ""
  log.info("OpenAI request start", {
    promptLength: prompts[0]?.length ?? 0,
    promptPreview: preview + (preview.length >= 200 ? "..." : ""),
  })
}

function logLLMEnd(output: unknown): void {
  const result = output as {
    generations?: Array<Array<{ text?: string; message?: { content?: string } }>>
  }
  const gen = result.generations?.[0]?.[0]
  const text = gen?.text ?? (gen?.message as { content?: string })?.content ?? ""
  const preview = String(text).slice(0, 200)
  log.info("OpenAI request end", {
    responseLength: String(text).length,
    responsePreview: preview + (preview.length >= 200 ? "..." : ""),
  })
}

export function createOpenAILoggingCallback(): BaseCallbackHandler {
  return BaseCallbackHandler.fromMethods({
    handleLLMStart: (_llm, prompts: string[]) => logLLMStart(prompts),
    handleLLMEnd: (output: unknown) => logLLMEnd(output),
    handleLLMError: (err: Error) => log.error("OpenAI request error", err),
    handleChatModelStart: (_llm, messages: unknown[]) => {
      const msgPreview = JSON.stringify(messages).slice(0, 200)
      log.info("OpenAI chat request start", {
        messageCount: messages?.length ?? 0,
        preview: msgPreview + (msgPreview.length >= 200 ? "..." : ""),
      })
    },
  })
}
