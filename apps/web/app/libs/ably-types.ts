export enum ConversationEventType {
  THINKING = "thinking",
  MESSAGE = "message",
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

export type ConversationEvent =
  | ConversationThinkingEvent
  | ConversationMessageEvent

export function getConversationChannelName(
  userId: string,
  conversationId: string
): string {
  return `user:${userId}:conversation:${conversationId}`
}
