export enum ConversationEventType {
  THINKING = "thinking",
  MESSAGE = "message",
  GRAPH_STAGE = "graph_stage",
}

export interface ConversationThinkingEvent {
  type: ConversationEventType.THINKING
}

export interface ConversationMessageEvent {
  type: ConversationEventType.MESSAGE
  message: {
    id: string
    role: "assistant"
    content: string
    createdAt: string
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
  | "tavily"
  | "firecrawl"
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

export type ConversationEvent =
  | ConversationThinkingEvent
  | ConversationMessageEvent
  | ConversationGraphStageEvent

export function getConversationChannelName(
  userId: string,
  conversationId: string
): string {
  return `user:${userId}:conversation:${conversationId}`
}
