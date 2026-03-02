import OpenAI from "openai"

import { env } from "@/core/env"

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for embeddings")
    }
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  }
  return openaiClient
}

export async function embedText(text: string): Promise<number[]> {
  const client = getOpenAIClient()
  const resp = await client.embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: text,
  })
  const item = resp.data[0]
  if (!item?.embedding) throw new Error("Empty embedding response")
  return item.embedding
}
