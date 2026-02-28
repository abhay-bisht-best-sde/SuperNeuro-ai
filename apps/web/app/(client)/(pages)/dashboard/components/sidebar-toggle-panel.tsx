"use client"

import { AnimatePresence, motion } from "framer-motion"

import { SecondarySidebar } from "@/(client)/components/layout/secondary-sidebar"

import type { SidebarSection } from "@/(client)/libs/types"

interface SidebarTogglePanelProps {
  activeSection: SidebarSection
  activeConversationId: string | null
  sidebarOpen: boolean
  children: React.ReactNode
  onSelectConversation: (id: string) => void
  onConversationCreated: (id: string) => void
  onConversationDeleted: (id: string) => void
  onAddKnowledgeBase: () => void
  onRetryKnowledgeBase: (id: string) => void
}

export function SidebarTogglePanel(props: SidebarTogglePanelProps) {
  const {
    activeSection,
    activeConversationId,
    sidebarOpen,
    children,
    onSelectConversation,
    onConversationCreated,
    onConversationDeleted,
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
              activeConversationId={activeConversationId}
              isOpen={true}
              onSelectConversation={onSelectConversation}
              onConversationCreated={onConversationCreated}
              onConversationDeleted={onConversationDeleted}
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
