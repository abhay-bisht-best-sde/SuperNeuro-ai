"use client"

import { useState, memo } from "react"
import { TopNavbar } from "@/(client)/components/layout/top-navbar"
import { ChatWorkspace } from "@/(client)/components/workspace/chat-workspace"
import { AddKnowledgeBaseModal } from "@/(client)/components/modal/add-knowledge-base-modal"
import { SidebarTogglePanel } from "./sidebar-toggle-panel"
import type {
  SidebarSection,
  Conversation,
  Agent,
} from "../../../libs/store"
import { sampleAgents } from "../../../libs/store"

interface MainDashboardContentProps {
  activeSection: SidebarSection
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onSendMessage: (content: string) => void
  activeConversation: Conversation | null
  isTyping: boolean
}

function MainDashboardContentInner(props: MainDashboardContentProps) {
  const {
    activeSection,
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    onSendMessage,
    activeConversation,
    isTyping,
  } = props
  const [kbModalOpen, setKbModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <>
      <TopNavbar />

      <div className="relative flex flex-1 overflow-hidden">
        <SidebarTogglePanel
          activeSection={activeSection}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onDeleteConversation={onDeleteConversation}
          agents={sampleAgents}
          onAddKnowledgeBase={() => setKbModalOpen(true)}
          onRetryKnowledgeBase={() => {}}
          sidebarOpen={sidebarOpen}
        >
          <ChatWorkspace
            conversation={activeConversation}
            onSendMessage={onSendMessage}
            isTyping={isTyping}
            sidebarOpen={sidebarOpen}
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
