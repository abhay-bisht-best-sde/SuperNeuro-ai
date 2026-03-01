"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"

interface IProps {
  hasConversations: boolean
  onCreateConversation?: () => void
}

export function CreateConversationEmptyState(props: IProps) {
  const { hasConversations, onCreateConversation } = props

  const heading = hasConversations
    ? "Select a conversation or create a new one"
    : "Create a conversation to get started"

  const subheading = hasConversations
    ? "Choose a conversation from the sidebar or click below to start a new chat"
    : "You don't have any conversations yet. Click below to start your first one."

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div
          className="mb-6 flex h-32 w-32 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.25 295 / 0.15), oklch(0.72 0.20 330 / 0.1)",
            border: "1px solid oklch(0.65 0.25 295 / 0.3)",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M16 20c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H24c-2.2 0-4-1.8-4-4V20Z"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M20 24h24M20 32h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="48"
              cy="48"
              r="12"
              fill="currentColor"
              fillOpacity="0.3"
            />
            <path
              d="M48 44v8M44 48h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-center text-xl font-semibold text-foreground text-balance">
          {heading}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground text-balance">
          {onCreateConversation ? subheading : "Start a new chat from the sidebar"}
        </p>
        {onCreateConversation && (
          <Button
            onClick={onCreateConversation}
            className="gap-2 rounded-xl bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        )}
      </motion.div>
    </div>
  )
}
