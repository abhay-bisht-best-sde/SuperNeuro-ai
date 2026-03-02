"use client"

import { useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"

import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { getDisplayLabelForStage } from "@/(client)/libs/utils"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import { ChatInputBar } from "./chat-input-bar"

import type {
  ConversationWithMessages,
} from "@/(client)/components/query-boundary"
import type { ConversationGraphStageEvent } from "@/libs/ably-types"
import type { Message } from "@repo/database"

interface IProps {
  conversation: ConversationWithMessages
  isTyping: boolean
  graphStage?: ConversationGraphStageEvent | null
  inputValue: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: () => void
}

export function ChatMessagesView(props: IProps) {
  const {
    conversation,
    isTyping,
    graphStage = null,
    inputValue,
    onInputChange,
    onKeyDown,
    onSubmit,
  } = props

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const seenMessageIdsRef = useRef<Map<string, Set<string>>>(new Map())

  const lastUserMessageIndex = (() => {
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i]?.role === "USER") return i
    }
    return -1
  })()

  useEffect(() => {
    const scrollTarget =
      lastUserMessageIndex >= 0 ? lastUserMessageRef : latestMessageRef
    scrollTarget.current?.scrollIntoView({
      behavior: "instant",
      block: lastUserMessageIndex >= 0 ? "center" : "start",
    })
  }, [conversation.messages, isTyping, lastUserMessageIndex])

  return (
    <>
      <ScrollArea
        className="flex min-h-0 flex-1 px-4"
        data-chat-scroll
      >
        <div className="mx-auto w-full max-w-5xl py-6">
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {conversation.messages.map(
                (
                  message: Pick<Message, "id" | "role" | "content" | "createdAt">,
                  index: number
                ) => {
                  const convId = conversation.id
                  let seen = seenMessageIdsRef.current.get(convId)
                  if (!seen) {
                    seen = new Set()
                    seenMessageIdsRef.current.set(convId, seen)
                  }
                  const shouldAnimate = !seen.has(message.id)
                  seen.add(message.id)
                  const isLatest = index === conversation.messages.length - 1
                  const isLastUserMessage = index === lastUserMessageIndex
                  return (
                    <div
                      key={message.id}
                      ref={
                        isLastUserMessage
                          ? lastUserMessageRef
                          : isLatest
                            ? latestMessageRef
                            : undefined
                      }
                    >
                      <ChatMessage
                        message={message}
                        index={index}
                        isLatest={isLatest}
                        shouldAnimate={shouldAnimate}
                      />
                    </div>
                  )
                }
              )}
            </AnimatePresence>
            {isTyping && (
              <TypingIndicator
                label={getDisplayLabelForStage(graphStage?.label)}
              />
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-background px-4 py-3">
        <div className="mx-auto w-full max-w-5xl">
          <ChatInputBar
            ref={textareaRef}
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            onSubmit={onSubmit}
            placeholder="Type a message"
          />
        </div>
      </div>
    </>
  )
}
