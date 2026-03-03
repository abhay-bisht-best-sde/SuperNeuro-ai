import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { logger } from "@/core/logger"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeDirectLlm } from "./agent-executor"
import { retrieveFromKnowledgeBase } from "@/(server)/lib/rag/retrieval"
import type { ChatGraphResult, RagSource } from "@/(server)/core/types"
import {
  RAG_CONTEXT_PREFIX,
  buildRagSystemMessage,
} from "../prompts/rag-prompts"

const log = logger.withTag("rag-path")

export async function executeRagPath(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
  userId?: string | null
  lastUserContent?: string
}): Promise<ChatGraphResult> {
  const { baseMessages, model, emitter, userId, lastUserContent = "" } = params

  log.info("Executing RAG path")

  let ragSources: RagSource[] = []
  let contextToInject = ""

  if (userId) {
    emitter.addStage("direct_llm", "Searching your documents...")
    try {
      const result = await retrieveFromKnowledgeBase({
        query: lastUserContent.trim() || "general overview",
        userId,
      })

      if (result.contextText) {
        contextToInject = RAG_CONTEXT_PREFIX + result.contextText
        ragSources = [...result.pdfChunks, ...result.imageChunks]
        log.info("RAG context injected", {
          pdfChunks: result.pdfChunks.length,
          imageChunks: result.imageChunks.length,
        })
      }
    } catch (err) {
      log.warn("RAG retrieval failed, proceeding without context", err)
    }
  }

  emitter.addStage("direct_llm", "Generating response...")

  const systemWithContext = contextToInject
    ? buildRagSystemMessage(contextToInject)
    : undefined

  const content = await executeDirectLlm({
    baseMessages,
    model,
    systemMessage: systemWithContext,
    emitToken: emitter.emitToken,
    flushTokens: emitter.flushTokens,
  })

  return {
    type: "message",
    content,
    ragSources: ragSources.length > 0 ? ragSources : undefined,
  }
}
