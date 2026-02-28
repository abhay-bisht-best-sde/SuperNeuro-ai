import type {
  ConversationWithMessages,
} from "@/(client)/components/query-boundary"

export interface ChatWorkspaceProps {
  conversation: ConversationWithMessages | null
  hasConversations?: boolean
  isConversationLoading?: boolean
  isTyping: boolean
  sidebarOpen?: boolean
  onCreateConversation?: () => void
  onSendMessage: (content: string) => void
  onSidebarToggle?: () => void
}

export type ChatWorkspaceView =
  | "loading"
  | "no-conversation"
  | "welcome"
  | "messages"
