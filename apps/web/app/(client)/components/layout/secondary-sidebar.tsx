"use client"

import { AnimatePresence, motion } from "framer-motion"

import { WorkflowsPanel } from "@/(client)/components/panels/workflows-panel"
import { RagPanel } from "@/(client)/components/panels/rag-panel"
import { KnowledgeSection } from "@/(client)/components/layout/knowledge-section"
import { IntegrationsSection } from "@/(client)/components/layout/integrations-section"

import type { SidebarSection } from "@/(client)/libs/types"

const sectionTitles: Record<SidebarSection, string> = {
  workflows: "Workflows",
  rag: "Intelligent Chat",
  knowledge: "Knowledge Base",
  integrations: "Integrations",
}

interface IProps {
  activeSection: SidebarSection
  activeConversationId: string | null
  isOpen: boolean
  onSelectConversation: (id: string) => void
  onConversationCreated: (id: string) => void
  onConversationDeleted: (id: string) => void
  onAddKnowledgeBase: () => void
  onRetryKnowledgeBase: (id: string) => void
}

export function SecondarySidebar(props: IProps) {
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

  if (!isOpen) return null

  return (
    <div className="flex h-full w-[368px] flex-col border-r border-border bg-sidebar">
      <div className="flex h-12 items-center border-b border-border px-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeSection}
            initial={false}
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
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.15 }}
          className="min-h-0 flex-1 overflow-hidden"
        >
          {activeSection === "workflows" && (
            <WorkflowsPanel
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onConversationCreated={onConversationCreated}
              onConversationDeleted={onConversationDeleted}
            />
          )}
          {activeSection === "rag" && (
            <RagPanel
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onConversationCreated={onConversationCreated}
              onConversationDeleted={onConversationDeleted}
            />
          )}
          {activeSection === "knowledge" && (
            <KnowledgeSection
              onAddKnowledgeBase={onAddKnowledgeBase}
              onRetry={onRetryKnowledgeBase}
            />
          )}
          {activeSection === "integrations" && <IntegrationsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
