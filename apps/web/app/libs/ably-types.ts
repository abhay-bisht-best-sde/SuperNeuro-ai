export enum ConversationEventType {
  THINKING = "thinking",
  MESSAGE = "message",
  GRAPH_STAGE = "graph_stage",
  TOKEN_STREAM = "token_stream",
  REQUIRES_CONNECTION = "requires_connection",
}

export interface ConversationThinkingEvent {
  type: ConversationEventType.THINKING
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

export interface ConversationMessageEvent {
  type: ConversationEventType.MESSAGE
  message: {
    id: string
    role: "assistant"
    content: string
    createdAt: string
    ragSources?: RagSource[]
  }
}

export type GraphStage =
  | "planning"
  | "planned"
  | "routing"
  | "direct_llm"
  | "tool_executing"
  | "tool_executed"
  | "tool_step"
  | "synthesizing"
  | "composio"

export type StepStatus = "pending" | "in_progress" | "completed"

export interface ExecutionStep {
  id: string
  label: string
  status: StepStatus
}

export interface ChecklistItem {
  id: string
  label: string
  status: StepStatus
}

export interface ConversationGraphStageEvent {
  type: ConversationEventType.GRAPH_STAGE
  stage: GraphStage
  label: string
  /** Ordered list of all events in arrival order. Use for Cursor-like checklist UI. */
  checklistItems: ChecklistItem[]
  details?: {
    intent?: string
    requiresTools?: boolean
    tool?: string
    stepId?: string
    stepIndex?: number
    totalSteps?: number
    steps?: ExecutionStep[]
  }
}

/** Streamed text token — emitted during LLM synthesis for progressive rendering */
export interface ConversationTokenEvent {
  type: ConversationEventType.TOKEN_STREAM
  token: string
}

/** Emitted when a required provider is not connected — client shows Connect button */
export interface ConversationRequiresConnectionEvent {
  type: ConversationEventType.REQUIRES_CONNECTION
  provider: string
  connectUrl: string
}

export type ConversationEvent =
  | ConversationThinkingEvent
  | ConversationMessageEvent
  | ConversationGraphStageEvent
  | ConversationTokenEvent
  | ConversationRequiresConnectionEvent

export function getConversationChannelName(
  userId: string,
  conversationId: string
): string {
  return `user:${userId}:conversation:${conversationId}`
}
