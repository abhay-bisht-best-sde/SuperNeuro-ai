import type { BaseMessage } from "@langchain/core/messages"
import { SystemMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import type { ChecklistEmitter } from "../checklist-emitter"
import { executeDirectLlm } from "./agent-executor"
import { retrieveFromKnowledgeBase } from "@/(server)/lib/rag/retrieval"
import { isDocumentRelatedQuery } from "@/(server)/lib/rag/document-question"
import type { ChatGraphResult, RagSource } from "@/(server)/core/types"

const log = logger.withTag("direct-llm-path")

const RAG_CONTEXT_PREFIX = `Use the following context from the user's uploaded documents and images to answer their question. If the context doesn't contain relevant information, say so and answer from general knowledge.

Context:
`

export async function executeDirectLlmPath(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
  userId?: string | null
  lastUserContent?: string
  ragMode?: boolean
}): Promise<ChatGraphResult> {
  const {
    baseMessages,
    model,
    emitter,
    userId,
    lastUserContent = "",
    ragMode = false,
  } = params

  log.info("Executing direct_llm path", { ragMode })

  let ragSources: RagSource[] = []
  let contextToInject = ""

  if (ragMode && userId && lastUserContent.trim().length > 2) {
    const hasIndexedKbs = await prisma.knowledgeBase.count({
      where: { userId, indexingStatus: "INDEXED" },
    })

    if (hasIndexedKbs > 0) {
      const isDocRelated = await isDocumentRelatedQuery({
        query: lastUserContent,
        model,
      })

      if (isDocRelated) {
        emitter.addStage("direct_llm", "Searching your documents...")
        try {
          const result = await retrieveFromKnowledgeBase({
            query: lastUserContent,
            userId,
          })

          if (result.contextText) {
            contextToInject = RAG_CONTEXT_PREFIX + result.contextText
            ragSources = [
              ...result.pdfChunks,
              ...result.imageChunks,
            ]
            log.info("RAG context injected", {
              pdfChunks: result.pdfChunks.length,
              imageChunks: result.imageChunks.length,
            })
          }
        } catch (err) {
          log.warn("RAG retrieval failed, proceeding without context", err)
        }
      }
    }
  }

  emitter.addStage("direct_llm", "Generating response...")

  const systemWithContext = contextToInject
    ? `You are SuperNeuro.ai, an intelligent workflow co-pilot. Your purpose is to help users automate, organize, retrieve, create, and execute tasks across connected tools.

${contextToInject}`
    : undefined

  const content = await executeDirectLlm({
    baseMessages,
    model,
    systemMessage: systemWithContext,
  })

  return { content, ragSources: ragSources.length > 0 ? ragSources : undefined }
}
