"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { formatConversationTimestamp } from "@/(client)/libs/date-utils"
import { cn } from "@/(client)/libs/utils"
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  QueryBoundary,
} from "@/(client)/components/query-boundary"
import { UpdateConversationModal } from "@/(client)/components/modal/update-conversation-modal"

import type { ConversationListItem } from "@/(client)/components/query-boundary/queries/conversations"

interface IProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onConversationCreated: (id: string) => void
  onConversationDeleted: (id: string) => void
}

interface IInnerProps extends IProps {
  conversations: ConversationListItem[]
  createConversation: ReturnType<typeof useCreateConversation>
  deleteConversation: ReturnType<typeof useDeleteConversation>
}

function ConversationsPanelInner(props: IInnerProps) {
  const {
    activeConversationId,
    onSelectConversation,
    onConversationCreated,
    onConversationDeleted,
    conversations,
    createConversation,
    deleteConversation,
  } = props

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingConversation, setEditingConversation] = useState<{
    id: string
    title: string
  } | null>(null)

  const handleNewConversation = () => {
    createConversation.mutate(undefined, {
      onSuccess: (data: { id: string }) => {
        onConversationCreated(data.id)
      },
    })
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation.mutate(id, {
      onSuccess: () => {
        onConversationDeleted(id)
      },
    })
  }

  const handleEditClick = (e: React.MouseEvent, conv: ConversationListItem) => {
    e.stopPropagation()
    setEditingConversation({ id: conv.id, title: conv.title })
    setEditModalOpen(true)
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="p-3">
          <Button
            onClick={handleNewConversation}
            disabled={createConversation.isPending}
            className="w-full justify-start gap-2 border-0 bg-primary/10 text-primary hover:bg-primary/20"
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>
              New Conversation
            </span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <AnimatePresence mode="popLayout">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                role="button"
                tabIndex={0}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
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
                  {formatConversationTimestamp(conversation.createdAt)}
                </span>

                <div className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleEditClick(e, conversation)}
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
                      handleDeleteConversation(conversation.id)
                    }}
                    disabled={deleteConversation.isPending}
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
      <UpdateConversationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        conversationId={editingConversation?.id ?? null}
        currentTitle={editingConversation?.title ?? ""}
      />
    </>
  )
}

export function ConversationsPanel(props: IProps) {
  const conversationsQuery = useConversations()
  const createConversation = useCreateConversation()
  const deleteConversation = useDeleteConversation()

  return (
    <QueryBoundary
      queries={[conversationsQuery] as const}
      mutations={[createConversation, deleteConversation] as const}
      loadingMessage="Loading conversations…"
      showEmptyWhenNoData={false}
    >
      <ConversationsPanelInner
        {...props}
        conversations={conversationsQuery.data ?? []}
        createConversation={createConversation}
        deleteConversation={deleteConversation}
      />
    </QueryBoundary>
  )
}
