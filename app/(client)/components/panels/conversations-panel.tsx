"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { Button } from "@/(client)/components/ui/button"
import { formatTimestamp } from "@/(client)/lib/date-utils"
import { cn } from "@/(client)/lib/utils"
import type { Conversation } from "@/(client)/lib/store"

interface ConversationsPanelProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
}

export function ConversationsPanel({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationsPanelProps) {
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
            <motion.div
              key={conversation.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              onClick={() => onSelectConversation(conversation.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectConversation(conversation.id)
                }
              }}
              className={cn(
                "group relative isolate mb-0.5 flex w-full cursor-pointer flex-col items-start overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors",
                activeConversationId === conversation.id
                  ? "bg-sidebar-accent"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              {activeConversationId === conversation.id && (
                <div className="absolute inset-0 rounded-xl bg-sidebar-accent" />
              )}
              <span className="relative z-10 truncate text-sm font-medium text-foreground">
                {conversation.title}
              </span>
              <span className="relative z-10 mt-0.5 text-xs text-muted-foreground">
                {formatTimestamp(conversation.timestamp)}
              </span>

              <div className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6 rounded-md hover:bg-secondary"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                  <span className="sr-only">Rename</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conversation.id)
                  }}
                  className="h-6 w-6 rounded-md hover:bg-destructive/20"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}
