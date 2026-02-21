"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Conversation } from "@/lib/store"
import { useState } from "react"

interface ConversationsPanelProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
}

function formatTimestamp(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

export function ConversationsPanel({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationsPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <AnimatePresence mode="popLayout">
          {conversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              onClick={() => onSelectConversation(conversation.id)}
              onMouseEnter={() => setHoveredId(conversation.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative mb-0.5 flex w-full flex-col items-start rounded-xl px-3 py-2.5 text-left transition-colors ${
                activeConversationId === conversation.id
                  ? "bg-sidebar-accent"
                  : "hover:bg-sidebar-accent/50"
              }`}
            >
              {activeConversationId === conversation.id && (
                <motion.div
                  layoutId="conversation-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 truncate text-sm font-medium text-foreground">
                {conversation.title}
              </span>
              <span className="relative z-10 mt-0.5 text-xs text-muted-foreground">
                {formatTimestamp(conversation.timestamp)}
              </span>

              <AnimatePresence>
                {hoveredId === conversation.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-secondary"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                      <span className="sr-only">Rename</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}
