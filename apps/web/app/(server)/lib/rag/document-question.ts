import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages"

import type { ChatOpenAI } from "@langchain/openai"

const DOCUMENT_KEYWORDS = [
  "document",
  "pdf",
  "file",
  "uploaded",
  "my document",
  "my file",
  "my pdf",
  "the document",
  "the file",
  "the pdf",
  "what does",
  "summarize",
  "extract",
  "find in",
  "search in",
  "from my",
  "in my",
  "page",
  "image",
  "chart",
  "figure",
  "table",
]

export function looksLikeDocumentQuery(query: string): boolean {
  const lower = query.trim().toLowerCase()
  if (lower.length < 4) return false
  return DOCUMENT_KEYWORDS.some((kw) => lower.includes(kw))
}

export async function isDocumentRelatedQuery(params: {
  query: string
  model: ChatOpenAI
}): Promise<boolean> {
  const { query, model } = params

  if (looksLikeDocumentQuery(query)) return true

  const prompt = `Does the user's query ask about their own uploaded documents, PDFs, files, or images? Answer YES or NO only.

Query: "${query}"

Answer:`
  const response = await model.invoke([
    new SystemMessage("Output exactly YES or NO. No explanation."),
    new HumanMessage(prompt),
  ])
  const raw = String((response as { content?: unknown }).content ?? "").trim().toUpperCase()
  return raw.startsWith("YES")
}
