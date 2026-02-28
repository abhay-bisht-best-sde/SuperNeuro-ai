"use client"

import { AnimatePresence, motion } from "framer-motion"

import { SecondarySidebar } from "@/(client)/components/layout/secondary-sidebar"

import type {
  SidebarSection,
  Conversation,
  Agent,
} from "@/(client)/libs/store"

interface SidebarTogglePanelProps {
  activeSection: SidebarSection
  conversations: Conversation[]
  activeConversationId: string | null
  agents: Agent[]
  sidebarOpen: boolean
  children: React.ReactNode
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onAddKnowledgeBase: () => void
  onRetryKnowledgeBase: (id: string) => void
}

export function SidebarTogglePanel(props: SidebarTogglePanelProps) {
  const {
    activeSection,
    conversations,
    activeConversationId,
    agents,
    sidebarOpen,
    children,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    onAddKnowledgeBase,
    onRetryKnowledgeBase,
  } = props

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
              agents={agents}
              isOpen={true}
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
              onDeleteConversation={onDeleteConversation}
              onAddKnowledgeBase={onAddKnowledgeBase}
              onRetryKnowledgeBase={onRetryKnowledgeBase}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1">{children}</div>
    </>
  )
}
