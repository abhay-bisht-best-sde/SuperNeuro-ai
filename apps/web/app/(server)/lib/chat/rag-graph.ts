import { logger } from "@/core/logger"

import type { ChatGraphInput, ChatGraphResult } from "@/(server)/core/types"
import { createChecklistEmitter } from "./checklist-emitter"
import { toBaseMessages } from "./utils"
import { getChatModel } from "./model"
import { executeRagPath } from "./paths/rag-path"

const log = logger.withTag("rag-graph")

export async function runRagGraph(input: ChatGraphInput): Promise<ChatGraphResult> {
  const { messages, userId, onEvent } = input

  log.info("runRagGraph started", {
    messageCount: messages.length,
    userId: userId ?? null,
  })

  const baseMessages = toBaseMessages(messages)
  const model = getChatModel()
  const emitter = createChecklistEmitter(onEvent)
  const lastUserContent =
    messages.filter((m) => m.role.toLowerCase() === "user").pop()?.content ?? ""

  const result = await executeRagPath({
    baseMessages,
    model,
    emitter,
    userId: userId ?? null,
    lastUserContent,
  })

  log.info("runRagGraph completed", {
    responseLength: result.content.length,
    hasRagSources: Boolean(result.ragSources?.length),
  })

  return result
}
