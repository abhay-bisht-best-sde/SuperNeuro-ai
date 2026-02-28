"use client"

import { CreateConversationEmptyState } from "./create-conversation-empty-state"
import { ChatWorkspaceLoading } from "./chat-workspace-loading"
import { ChatWorkspaceWelcome } from "./chat-workspace-welcome"
import { ChatMessagesView } from "./chat-messages-view"

import type { ChatWorkspaceProps, ChatWorkspaceView } from "./chat-workspace-types"

function getViewType(props: ChatWorkspaceProps): ChatWorkspaceView {
  const { isConversationLoading, conversation } = props
  if (isConversationLoading) return "loading"
  if (!conversation) return "no-conversation"
  if (conversation.messages.length === 0) return "welcome"
  return "messages"
}

export interface ChatWorkspaceContentProps extends ChatWorkspaceProps {
  inputValue: string
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: () => void
  onSuggestionClick: (suggestion: string) => void
}

export function ChatWorkspaceContent(props: ChatWorkspaceContentProps) {
  const {
    conversation,
    hasConversations = false,
    isTyping,
    inputValue,
    inputRef,
    onInputChange,
    onKeyDown,
    onSubmit,
    onSuggestionClick,
    onCreateConversation,
  } = props

  const viewType = getViewType(props)

  switch (viewType) {
    case "loading":
      return <ChatWorkspaceLoading />
    case "no-conversation":
      return (
        <CreateConversationEmptyState
          hasConversations={hasConversations}
          onCreateConversation={onCreateConversation}
        />
      )
    case "welcome":
      return (
        <ChatWorkspaceWelcome
          inputValue={inputValue}
          inputRef={inputRef}
          onInputChange={onInputChange}
          onKeyDown={onKeyDown}
          onSubmit={onSubmit}
          onSuggestionClick={onSuggestionClick}
        />
      )
    case "messages":
      if (!conversation) return null
      return (
        <ChatMessagesView
          key={conversation.id}
          conversation={conversation}
          isTyping={isTyping}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onKeyDown={onKeyDown}
          onSubmit={onSubmit}
        />
      )
    default:
      return null
  }
}
