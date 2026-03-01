"use client"

import { useState, memo } from "react"

import { AddKnowledgeBaseModal } from "@/(client)/components/modal/add-knowledge-base-modal"
import { TopNavbar } from "@/(client)/components/layout/top-navbar"
import { ChatWorkspace } from "@/(client)/components/workspace/chat-workspace"
import { SidebarTogglePanel } from "./sidebar-toggle-panel"
import { useRetryKnowledgeBase } from "@/(client)/components/query-boundary"
import type { SidebarSection } from "@/(client)/libs/types"
import type { ConversationWithMessages } from "@/(client)/components/query-boundary"

interface IProps {
  activeSection: SidebarSection
  activeConversationId: string | null
  activeConversation: ConversationWithMessages | null
  hasConversations: boolean
  isConversationLoading?: boolean
  isTyping: boolean
  onSelectConversation: (id: string) => void
  onCreateConversation: () => void
  onConversationCreated: (id: string) => void
  onConversationDeleted: (id: string) => void
  onSendMessage: (content: string) => void
}

function MainDashboardContentInner(props: IProps) {
  const {
    activeSection,
    activeConversationId,
    activeConversation,
    hasConversations,
    isConversationLoading = false,
    isTyping,
    onSelectConversation,
    onCreateConversation,
    onConversationCreated,
    onConversationDeleted,
    onSendMessage,
  } = props

  const [kbModalOpen, setKbModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const retryKnowledgeBase = useRetryKnowledgeBase()

  return (
    <>
      <TopNavbar />

      <div className="relative flex flex-1 overflow-hidden">
        <SidebarTogglePanel
          activeSection={activeSection}
          activeConversationId={activeConversationId}
          sidebarOpen={sidebarOpen}
          onSelectConversation={onSelectConversation}
          onConversationCreated={onConversationCreated}
          onConversationDeleted={onConversationDeleted}
          onAddKnowledgeBase={() => setKbModalOpen(true)}
          onRetryKnowledgeBase={(id) => retryKnowledgeBase.mutate(id)}
        >
          <ChatWorkspace
            conversation={activeConversation}
            hasConversations={hasConversations}
            isConversationLoading={isConversationLoading}
            isTyping={isTyping}
            sidebarOpen={sidebarOpen}
            onCreateConversation={onCreateConversation}
            onSendMessage={onSendMessage}
            onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          />
        </SidebarTogglePanel>
      </div>

      <AddKnowledgeBaseModal
        open={kbModalOpen}
        onOpenChange={setKbModalOpen}
      />
    </>
  )
}

export const MainDashboardContent = memo(MainDashboardContentInner)
