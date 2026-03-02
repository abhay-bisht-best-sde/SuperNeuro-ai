import type { IntegrationType } from "@repo/database"

import type { ConversationGraphStageEvent } from "@/libs/ably-types"
import type { API_TOOLS } from "./constants"

export interface ExecutionStep {
  stepId: string
  tool: string
  input: Record<string, unknown>
}

export interface ToolResultItem {
  stepId: string
  tool: string
  result: unknown
}

export interface PlannerOutput {
  intent: string
  requiresTools: boolean
  executionPlan: ExecutionStep[]
}

export interface ToolExecutionResult {
  data?: unknown
  error?: string
  successful?: boolean
}

export type ApiToolName = (typeof API_TOOLS)[number]

export type TavilySearchDepth =
  | "basic"
  | "advanced"
  | "fast"
  | "ultra-fast"

export type TavilyTopic = "general" | "news" | "finance"

export interface TavilySearchInput {
  query: string
  max_results?: number
  search_depth?: TavilySearchDepth
  topic?: TavilyTopic
}

export type FirecrawlFormat = "markdown" | "html"

export interface FirecrawlScrapeInput {
  url: string
  formats?: FirecrawlFormat[]
  onlyMainContent?: boolean
}

export interface ChatMessage {
  role: string
  content: string
}

export interface RagPdfSource {
  type: "pdf"
  knowledgeBaseId: string
  fileName: string
  r2Key: string
  page: number
  text: string
}

export interface RagImageSource {
  type: "image"
  knowledgeBaseId: string
  fileName: string
  r2Key: string
  page: number
  textSummary: string
}

export type RagSource = RagPdfSource | RagImageSource

export interface ChatGraphResult {
  content: string
  ragSources?: RagSource[]
}

export interface ChatGraphInput {
  messages: ChatMessage[]
  userId?: string | null
  conversationSummary?: string | null
  connectedProviders?: IntegrationType[]
  onEvent?: (event: ConversationGraphStageEvent) => void | Promise<void>
}

export interface ModelResponse {
  content?: unknown
}
