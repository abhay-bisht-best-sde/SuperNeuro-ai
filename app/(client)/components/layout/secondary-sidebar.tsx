"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { SidebarSection, Conversation, Agent, KnowledgeBase } from "@/(client)/lib/store"
import { ConversationsPanel } from "@/(client)/components/panels/conversations-panel"
import { AgentsPanel } from "@/(client)/components/panels/agents-panel"
import { KnowledgePanel } from "@/(client)/components/panels/knowledge-panel"
import { KeysPanel } from "@/(client)/components/panels/keys-panel"

const sectionTitles: Record<SidebarSection, string> = {
  conversations: "Conversations",
  agents: "Agents",
  knowledge: "Knowledge Base",
  keys: "API Keys",
}

interface SecondarySidebarProps {
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
  isOpen: boolean
}

export function SecondarySidebar(props: SecondarySidebarProps) {
  const {
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
    isOpen,
  } = props
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
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
              onDeleteConversation={onDeleteConversation}
            />
          )}
          {activeSection === "agents" && <AgentsPanel agents={agents} />}
          {activeSection === "knowledge" && (
            <KnowledgePanel
              knowledgeBases={knowledgeBases}
              onAddKnowledgeBase={onAddKnowledgeBase}
              onRetry={onRetryKnowledgeBase}
            />
          )}
          {activeSection === "keys" && <KeysPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
