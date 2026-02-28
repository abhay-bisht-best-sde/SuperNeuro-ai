"use client"

import { useState, memo } from "react"

import { AddKnowledgeBaseModal } from "@/(client)/components/modal/add-knowledge-base-modal"
import { TopNavbar } from "@/(client)/components/layout/top-navbar"
import { ChatWorkspace } from "@/(client)/components/workspace/chat-workspace"
import { SidebarTogglePanel } from "./sidebar-toggle-panel"
import { useRetryKnowledgeBase } from "@/(client)/components/query-boundary"

import type {
  SidebarSection,
  Conversation,
} from "@/(client)/libs/store";

interface MainDashboardContentProps {
  activeSection: SidebarSection
  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null
  isTyping: boolean
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onSendMessage: (content: string) => void
}

function MainDashboardContentInner(props: MainDashboardContentProps) {
  const {
    activeSection,
    conversations,
    activeConversationId,
    activeConversation,
    isTyping,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
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
          conversations={conversations}
          activeConversationId={activeConversationId}
          sidebarOpen={sidebarOpen}
          agents={[]}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onDeleteConversation={onDeleteConversation}
          onAddKnowledgeBase={() => setKbModalOpen(true)}
          onRetryKnowledgeBase={(id) => retryKnowledgeBase.mutate(id)}
        >
          <ChatWorkspace
            conversation={activeConversation}
            isTyping={isTyping}
            sidebarOpen={sidebarOpen}
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
