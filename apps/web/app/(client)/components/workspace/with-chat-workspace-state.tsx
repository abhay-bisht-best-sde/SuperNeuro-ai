"use client"

import { useState, useRef, useCallback } from "react"

import { ChatWorkspaceHeader } from "./chat-workspace-header"
import { ChatWorkspaceContent } from "./chat-workspace-content"

import type { IProps } from "./chat-workspace-types"

export function withChatWorkspaceState<P extends IProps>() {
  return function ChatWorkspaceWithState(props: P) {
    const {
      conversation,
      hasConversations = false,
      isConversationLoading = false,
      isTyping,
      graphStage = null,
      sidebarOpen = true,
      onCreateConversation,
      onSendMessage,
      onSidebarToggle,
    } = props

    const [inputValue, setInputValue] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = useCallback(() => {
      if (!inputValue.trim()) return
      onSendMessage(inputValue.trim())
      setInputValue("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "0px"
        textareaRef.current.style.height = "auto"
      }
    }, [inputValue, onSendMessage])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSubmit()
        }
      },
      [handleSubmit]
    )

    const handleTextareaChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        if (textareaRef.current) {
          textareaRef.current.style.height = "0px"
          const sh = textareaRef.current.scrollHeight
          textareaRef.current.style.height = `${Math.min(sh, 160)}px`
        }
      },
      []
    )

    const handleSuggestionClick = useCallback((suggestion: string) => {
      setInputValue(suggestion)
    }, [])

    return (
      <div className="flex h-full flex-1 flex-col bg-background">
        <ChatWorkspaceHeader
          title={conversation?.title ?? "New Chat"}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={onSidebarToggle}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatWorkspaceContent
            conversation={conversation}
            hasConversations={hasConversations}
            isConversationLoading={isConversationLoading}
            isTyping={isTyping}
            graphStage={graphStage}
            onCreateConversation={onCreateConversation}
            onSendMessage={onSendMessage}
            onSidebarToggle={onSidebarToggle}
            inputValue={inputValue}
            inputRef={textareaRef}
            onInputChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>
    )
  }
}
