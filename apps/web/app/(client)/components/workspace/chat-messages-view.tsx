"use client"

import { useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ExternalLink, Plug } from "lucide-react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { getDisplayLabelForStage } from "@/(client)/libs/utils"
import { cn } from "@/(client)/libs/utils"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import { ChatInputBar } from "./chat-input-bar"

import type { ConversationWithMessages } from "@/(client)/components/query-boundary"
import type {
  ConversationGraphStageEvent,
  ConversationRequiresConnectionEvent,
} from "@/libs/ably-types"
import type { Message } from "@repo/database"

interface IProps {
  conversation: ConversationWithMessages
  isTyping: boolean
  graphStage?: ConversationGraphStageEvent | null
  /** Streaming text received token-by-token before final MESSAGE arrives */
  streamingContent?: string
  /** Present when AI needs OAuth before continuing */
  requiresConnection?: ConversationRequiresConnectionEvent | null
  inputValue: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Threshold (px) from the bottom to consider the user "at bottom". */
const SCROLL_BOTTOM_THRESHOLD = 80

function formatProviderName(provider: string): string {
  return provider
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

function ConnectProviderCard({
  event,
}: {
  event: ConversationRequiresConnectionEvent
}) {
  const providerName = formatProviderName(event.provider)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      {/* AI avatar placeholder */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
        <Plug className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
          To complete this task I need access to{" "}
          <strong>{providerName}</strong>. Click below to connect it — I'll
          automatically continue once you've authorized access.
        </div>
        <a
          href={event.connectUrl}
          target="_self"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Connect {providerName}
        </a>
      </div>
    </motion.div>
  )
}

function StreamingMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      {/* AI avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
        <span className="text-xs text-primary">AI</span>
      </div>
      <div className="max-w-lg rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
        <div
          className={cn(
            "markdown-content text-sm leading-relaxed",
            "[&_p]:mb-2 [&_p:last-child]:mb-0",
            "[&_ul]:my-2 [&_ol]:my-2 [&_li]:ml-4",
            "[&_pre]:rounded-lg [&_pre]:bg-muted/50 [&_pre]:p-3",
            "[&_code]:rounded [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/50 hover:[&_a]:decoration-primary",
            "[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-white/20 [&_td]:px-3 [&_td]:py-2"
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ChatMessagesView(props: IProps) {
  const {
    conversation,
    isTyping,
    graphStage = null,
    streamingContent = "",
    requiresConnection = null,
    inputValue,
    onInputChange,
    onKeyDown,
    onSubmit,
  } = props

  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const inputBarRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const seenMessageIdsRef = useRef<Map<string, Set<string>>>(new Map())

  // ─── "User scrolled up" detection ──────────────────────────────────────
  // Track whether the user has manually scrolled away from the bottom.
  // While true we suppress auto-scroll so the user can read earlier content
  // without being yanked back down on every streaming token.
  const userScrolledUpRef = useRef(false)

  /** Returns the Radix viewport element inside ScrollArea. */
  const getViewport = useCallback((): HTMLElement | null => {
    return scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) ?? null
  }, [])

  const isNearBottom = useCallback(
    (el: HTMLElement) =>
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_BOTTOM_THRESHOLD,
    []
  )

  // Listen for manual scroll events on the viewport
  useEffect(() => {
    const viewport = getViewport()
    if (!viewport) return

    const handleScroll = () => {
      userScrolledUpRef.current = !isNearBottom(viewport)
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [getViewport, isNearBottom])

  // ─── Auto-scroll logic ─────────────────────────────────────────────────
  const lastUserMessageIndex = (() => {
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i]?.role === "USER") return i
    }
    return -1
  })()

  // When a new user message is sent, always re-enable auto-scroll
  const prevMessageCountRef = useRef(conversation.messages.length)
  useEffect(() => {
    const prev = prevMessageCountRef.current
    prevMessageCountRef.current = conversation.messages.length
    if (conversation.messages.length > prev) {
      const newest = conversation.messages[conversation.messages.length - 1]
      if (newest?.role === "USER") {
        userScrolledUpRef.current = false
      }
    }
  }, [conversation.messages])

  // Smooth-scroll to bottom when new content arrives (unless user scrolled up)
  useEffect(() => {
    if (userScrolledUpRef.current) return

    const viewport = getViewport()
    if (!viewport) return

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    })
  }, [conversation.messages, isTyping, streamingContent, getViewport])

  // On first load / conversation switch, jump to last user message instantly
  const prevConvIdRef = useRef(conversation.id)
  useEffect(() => {
    if (prevConvIdRef.current !== conversation.id) {
      prevConvIdRef.current = conversation.id
      userScrolledUpRef.current = false

      // Jump to last user message (or bottom)
      requestAnimationFrame(() => {
        const target =
          lastUserMessageIndex >= 0 ? lastUserMessageRef : latestMessageRef
        target.current?.scrollIntoView({
          behavior: "instant",
          block: lastUserMessageIndex >= 0 ? "center" : "end",
        })
      })
    }
  }, [conversation.id, lastUserMessageIndex])

  const isStreaming = Boolean(streamingContent)
  const showTypingIndicator = isTyping && !isStreaming && !requiresConnection

  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="flex min-h-0 flex-1 px-4" data-chat-scroll>
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

            {/* Progressive streaming text */}
            {isStreaming && <StreamingMessage content={streamingContent} />}

            {/* Connect provider button (requires_connection) */}
            {requiresConnection && !isStreaming && (
              <ConnectProviderCard event={requiresConnection} />
            )}

            {/* Thinking / tool-call progress indicator */}
            {showTypingIndicator && (
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
            ref={inputBarRef}
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
