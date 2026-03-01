"use client"

import { AnimatePresence, motion } from "framer-motion"

import { ConversationsPanel } from "@/(client)/components/panels/conversations-panel"
import { KnowledgePanel } from "@/(client)/components/panels/knowledge-panel"
import { IntegrationsPanel } from "@/(client)/components/panels/integrations-panel"
import {
  useKnowledgeBase,
  QueryBoundary,
} from "@/(client)/components/query-boundary"

import type { SidebarSection } from "@/(client)/libs/types"

const sectionTitles: Record<SidebarSection, string> = {
  conversations: "Conversations",
  knowledge: "Knowledge Base",
  integrations: "Integrations",
}

interface SecondarySidebarProps {
  activeSection: SidebarSection
  activeConversationId: string | null
  isOpen: boolean
  onSelectConversation: (id: string) => void
  onConversationCreated: (id: string) => void
  onConversationDeleted: (id: string) => void
  onAddKnowledgeBase: () => void
  onRetryKnowledgeBase: (id: string) => void
}

export function SecondarySidebar(props: SecondarySidebarProps) {
  const {
    activeSection,
    activeConversationId,
    isOpen,
    onSelectConversation,
    onConversationCreated,
    onConversationDeleted,
    onAddKnowledgeBase,
    onRetryKnowledgeBase,
  } = props

  const knowledgeBaseQuery = useKnowledgeBase()

  if (!isOpen) return null

  return (
    <div className="flex h-full w-[368px] flex-col border-r border-border bg-sidebar">
      <div className="flex h-12 items-center border-b border-border px-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeSection}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold text-foreground"
          >
            {sectionTitles[activeSection]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.15 }}
          className="flex-1 overflow-hidden"
        >
          {activeSection === "conversations" && (
            <ConversationsPanel
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onConversationCreated={onConversationCreated}
              onConversationDeleted={onConversationDeleted}
            />
          )}
          {activeSection === "knowledge" && (
            <QueryBoundary
              queries={[knowledgeBaseQuery] as const}
              loadingMessage="Loading knowledge bases…"
            >
              <KnowledgePanel
                knowledgeBases={knowledgeBaseQuery.data ?? []}
                onAddKnowledgeBase={onAddKnowledgeBase}
                onRetry={onRetryKnowledgeBase}
              />
            </QueryBoundary>
          )}
          {activeSection === "integrations" && (
            <IntegrationsPanel
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
