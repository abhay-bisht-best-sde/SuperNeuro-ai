import type { Prisma } from "@repo/database"
import type {
  ConversationGraphStageEvent,
  ConversationRequiresConnectionEvent,
} from "@/libs/ably-types"

export type SidebarSection = "workflows" | "rag" | "knowledge" | "integrations"

export type ConversationListItem = Prisma.ConversationGetPayload<true>

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: { messages: true }
}>

export interface ChatWorkspaceProps {
  conversation: ConversationWithMessages | null
  hasConversations?: boolean
  isConversationLoading?: boolean
  isTyping: boolean
  graphStage?: ConversationGraphStageEvent | null
  /** Accumulated streamed tokens before the final MESSAGE event arrives */
  streamingContent?: string
  /** Set when the AI needs a provider to be connected before it can continue */
  requiresConnection?: ConversationRequiresConnectionEvent | null
  sidebarOpen?: boolean
  onCreateConversation?: () => void
  onSendMessage: (content: string) => void
  onSidebarToggle?: () => void
  createButtonLabel?: string
}

export type ChatWorkspaceView =
  | "loading"
  | "no-conversation"
  | "welcome"
  | "messages"

export interface SendMessagePayload {
  conversationId: string
  content: string
}

export interface SendMessageResponse {
  id: string
  role: "user"
  content: string
  createdAt: string
}

export interface CreateUserConfigPayload {
  purpose: string
  companyName: string
  teamSize: string
  industry: string
  useCases: string[]
}

export interface StoreFileMetadataPayload {
  fileName: string
  fileSize: number
  key: string
}
