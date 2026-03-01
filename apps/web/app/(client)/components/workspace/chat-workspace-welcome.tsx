"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import {
  CHAT_HEADLINE,
  CHAT_SUBHEADLINE,
  CHAT_INPUT_PLACEHOLDER,
  CHAT_SUGGESTIONS,
} from "@/(client)/libs/constants"
import { ChatInputBar } from "./chat-input-bar"

interface IProps {
  inputValue: string
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: () => void
  onSuggestionClick: (suggestion: string) => void
}

export function ChatWorkspaceWelcome(props: IProps) {
  const {
    inputValue,
    inputRef,
    onInputChange,
    onKeyDown,
    onSubmit,
    onSuggestionClick,
  } = props

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion)
    inputRef?.current?.focus()
  }

  return (
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
          {CHAT_HEADLINE}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground text-balance">
          {CHAT_SUBHEADLINE}
        </p>

        <div className="mb-8 w-full max-w-xl">
          <ChatInputBar
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            onSubmit={onSubmit}
            placeholder={CHAT_INPUT_PLACEHOLDER}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {CHAT_SUGGESTIONS.map((suggestion, index) => (
            <motion.div
              key={suggestion}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-xl border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground"
              >
                {suggestion}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
