import { Pinecone } from "@pinecone-database/pinecone"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { env } from "@/core/env"
import { embedText } from "./embeddings"

const log = logger.withTag("rag-retrieval")

const RAG_TOP_K = 5
const RAG_IMAGE_TOP_K = 3

let pineconeClient: Pinecone | null = null

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is required for RAG retrieval")
    }
    pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY })
  }
  return pineconeClient
}

function getPdfIndexName(): string {
  const name = env.PINECONE_PDF_INDEX_NAME
  if (!name) throw new Error("PINECONE_PDF_INDEX_NAME is required")
  return name
}

function getImageIndexName(): string {
  const name = env.PINECONE_IMG_TEXT_INDEX_NAME
  if (!name) throw new Error("PINECONE_IMG_TEXT_INDEX_NAME is required")
  return name
}

export interface PdfChunkSource {
  type: "pdf"
  knowledgeBaseId: string
  fileName: string
  r2Key: string
  page: number
  text: string
}

export interface ImageChunkSource {
  type: "image"
  knowledgeBaseId: string
  fileName: string
  r2Key: string
  page: number
  textSummary: string
}

export type RagSource = PdfChunkSource | ImageChunkSource

export interface RagRetrievalResult {
  pdfChunks: PdfChunkSource[]
  imageChunks: ImageChunkSource[]
  contextText: string
}

export async function retrieveFromKnowledgeBase(params: {
  query: string
  userId: string
}): Promise<RagRetrievalResult> {
  const { query, userId } = params

  const [embedding, indexedKbs] = await Promise.all([
    embedText(query),
    prisma.knowledgeBase.findMany({
      where: { userId, indexingStatus: "INDEXED" },
      select: { id: true, fileName: true, key: true },
    }),
  ])

  if (indexedKbs.length === 0) {
    log.debug("No indexed knowledge bases for user", { userId })
    return { pdfChunks: [], imageChunks: [], contextText: "" }
  }

  const kbIds = indexedKbs.map((kb) => kb.id)
  const kbMap = new Map(indexedKbs.map((kb) => [kb.id, kb]))

  const pc = getPineconeClient()
  const pdfIndex = pc.index(getPdfIndexName())
  const imageIndex = pc.index(getImageIndexName())

  const [pdfQuery, imageQuery] = await Promise.all([
    pdfIndex.query({
      vector: embedding,
      topK: RAG_TOP_K,
      filter: { kb_id: { $in: kbIds } },
      includeMetadata: true,
    }),
    imageIndex.query({
      vector: embedding,
      topK: RAG_IMAGE_TOP_K,
      filter: { kb_id: { $in: kbIds } },
      includeMetadata: true,
    }),
  ])

  const pdfChunks: PdfChunkSource[] = []
  for (const match of pdfQuery.matches ?? []) {
    const meta = match.metadata as Record<string, unknown> | undefined
    const kbId = meta?.kb_id as string | undefined
    const kb = kbId ? kbMap.get(kbId) : undefined
    if (!kb || !meta?.text) continue
    pdfChunks.push({
      type: "pdf",
      knowledgeBaseId: kb.id,
      fileName: kb.fileName,
      r2Key: kb.key,
      page: (meta.page as number) ?? 0,
      text: String(meta.text),
    })
  }

  const imageIds = (imageQuery.matches ?? [])
    .map((m) => (m.metadata as Record<string, unknown>)?.image_id as string)
    .filter(Boolean)

  const imageChunks: ImageChunkSource[] = []
  if (imageIds.length > 0) {
    const imageRecords = await prisma.knowledgeBaseImages.findMany({
      where: { id: { in: imageIds } },
      include: { knowledgeBase: true },
    })
    for (const img of imageRecords) {
      imageChunks.push({
        type: "image",
        knowledgeBaseId: img.knowledgeBaseId,
        fileName: img.knowledgeBase.fileName,
        r2Key: img.r2Key,
        page: img.pageNumber,
        textSummary: img.textSummary ?? "",
      })
    }
  }

  const contextParts: string[] = []
  if (pdfChunks.length > 0) {
    contextParts.push(
      "Relevant document excerpts:\n" +
        pdfChunks
          .map(
            (c) =>
              `[${c.fileName} p.${c.page + 1}]: ${c.text.slice(0, 500)}${c.text.length > 500 ? "..." : ""}`
          )
          .join("\n\n")
    )
  }
  if (imageChunks.length > 0) {
    contextParts.push(
      "Relevant image descriptions:\n" +
        imageChunks
          .map(
            (c) =>
              `[${c.fileName} p.${c.page + 1} image]: ${c.textSummary.slice(0, 300)}${c.textSummary.length > 300 ? "..." : ""}`
          )
          .join("\n\n")
    )
  }

  const contextText = contextParts.join("\n\n")

  log.info("RAG retrieval done", {
    userId,
    pdfChunks: pdfChunks.length,
    imageChunks: imageChunks.length,
  })

  return { pdfChunks, imageChunks, contextText }
}
