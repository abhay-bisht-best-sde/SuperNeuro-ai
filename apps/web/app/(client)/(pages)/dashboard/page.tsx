"use client"

import { useState, memo } from "react"
import { IconSidebar } from "@/(client)/components/layout/icon-sidebar"
import type { SidebarSection } from "../../libs/store"
import { useConversations } from "../../hooks/use-conversations"
import { MainDashboardContent } from "./components/main-dashboard-content"
import { DashboardGuard } from "./dashboard-guard"

const MemoizedIconSidebar = memo(IconSidebar)

export default function DashboardPage() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("conversations")

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    isTyping,
    handleNewConversation,
    handleDeleteConversation,
    handleSendMessage,
  } = useConversations()

  return (
    <DashboardGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
      <MemoizedIconSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MainDashboardContent
          activeSection={activeSection}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onSendMessage={handleSendMessage}
          activeConversation={activeConversation}
          isTyping={isTyping}
        />
      </div>
    </div>
    </DashboardGuard>
  )
}
