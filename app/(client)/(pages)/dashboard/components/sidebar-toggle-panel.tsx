"use client"

import { AnimatePresence, motion } from "framer-motion"
import { SecondarySidebar } from "@/(client)/components/layout/secondary-sidebar"
import type {
  SidebarSection,
  Conversation,
  Agent,
  KnowledgeBase,
} from "../../../lib/store"

interface SidebarTogglePanelProps {
  activeSection: SidebarSection
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  agents: Agent[]
  knowledgeBases: KnowledgeBase[]
  onAddKnowledgeBase: () => void
  onRetryKnowledgeBase: (id: string) => void
  sidebarOpen: boolean
  children: React.ReactNode
}

export function SidebarTogglePanel({
  activeSection,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  agents,
  knowledgeBases,
  onAddKnowledgeBase,
  onRetryKnowledgeBase,
  sidebarOpen,
  children,
}: SidebarTogglePanelProps) {
  return (
    <>
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 368, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <SecondarySidebar
              activeSection={activeSection}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
              onDeleteConversation={onDeleteConversation}
              agents={agents}
              knowledgeBases={knowledgeBases}
              onAddKnowledgeBase={onAddKnowledgeBase}
              onRetryKnowledgeBase={onRetryKnowledgeBase}
              isOpen={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1">{children}</div>
    </>
  )
}
