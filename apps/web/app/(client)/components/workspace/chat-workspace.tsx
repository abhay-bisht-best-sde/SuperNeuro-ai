"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { Textarea } from "@/(client)/components/ui/textarea"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"

import type { Conversation } from "@/(client)/libs/store"

const SUGGESTIONS = [
  "Explain quantum computing",
  "Write a REST API in Node.js",
  "Compare SQL vs NoSQL",
  "Design a system architecture",
]

interface ChatWorkspaceProps {
  conversation: Conversation | null
  isTyping: boolean
  sidebarOpen?: boolean
  onSendMessage: (content: string) => void
  onSidebarToggle?: () => void
}

export function ChatWorkspace(props: ChatWorkspaceProps) {
  const {
    conversation,
    isTyping,
    sidebarOpen = true,
    onSendMessage,
    onSidebarToggle,
  } = props

  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages, isTyping])

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  const hasMessages = conversation && conversation.messages.length > 0

  return (
    <div className="flex h-full flex-1 flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        {onSidebarToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSidebarToggle}
            className="h-8 w-8 shrink-0 rounded-lg hover:bg-primary/60!"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
            ) : (
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            </span>
          </Button>
        )}
        <h2 className="truncate text-sm font-medium text-foreground">
          {conversation?.title ?? "New Chat"}
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-2 text-center text-xl font-semibold text-foreground text-balance">
                How can I help you today?
              </h1>
              <p className="mb-8 text-center text-sm text-muted-foreground text-balance">
                Ask anything or use an agent to get started
              </p>

              <div className="mb-8 w-full max-w-xl">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything or use an agent..."
                    rows={1}
                    className="min-h-0 w-full resize-none rounded-2xl border-border bg-card px-4 py-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 rounded-xl hover:bg-primary/20"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!inputValue.trim()}
                      size="sm"
                      className="h-8 w-8 rounded-xl bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion, index) => (
                  <motion.div
                    key={suggestion}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue(suggestion)
                        textareaRef.current?.focus()
                      }}
                      className="rounded-xl border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    >
                      {suggestion}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="mx-auto max-w-2xl py-6">
                <div className="flex flex-col gap-6">
                  <AnimatePresence>
                    {conversation.messages.map((message, index) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>

                  {isTyping && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>

            <div className="border-t border-border bg-background px-4 py-3">
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="min-h-0 w-full resize-none rounded-2xl border-border bg-card px-4 py-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 rounded-xl hover:bg-primary/20"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!inputValue.trim()}
                      size="sm"
                      className="h-8 w-8 rounded-xl bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
