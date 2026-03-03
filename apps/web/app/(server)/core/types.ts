import type { IntegrationType } from "@repo/database"

import type { ConversationEvent } from "@/libs/ably-types"

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

export type ChatGraphResult =
  | { type: "message"; content: string; ragSources?: RagSource[] }
  | { type: "requires_connection"; provider: IntegrationType }

export interface ChatGraphInput {
  messages: ChatMessage[]
  userId?: string | null
  conversationSummary?: string | null
  connectedProviders?: IntegrationType[]
  /** Origin URL (e.g. https://app.superneuro.ai) — required for OAuth callback URLs */
  origin?: string
  onEvent?: (event: ConversationEvent) => void | Promise<void>
}

export interface ModelResponse {
  content?: unknown
}
