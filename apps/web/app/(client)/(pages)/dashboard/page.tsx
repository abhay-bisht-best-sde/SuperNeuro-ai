"use client"

import { useState, memo } from "react"

import { IconSidebar } from "@/(client)/components/layout/icon-sidebar"
import { useConversations as useConversationsQuery } from "@/(client)/components/query-boundary"
import { useConversations } from "../../hooks/use-conversations"
import { MainDashboardContent } from "./components/main-dashboard-content"
import { DashboardGuard } from "./dashboard-guard"

import type { SidebarSection } from "@/(client)/libs/types"

const MemoizedIconSidebar = memo(IconSidebar)

export default function DashboardPage() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("conversations")

  const conversationsQuery = useConversationsQuery()
  const {
    activeConversationId,
    isConversationLoading,
    isTyping,
    activeConversation,
    setActiveConversationId,
    handleNewConversation,
    handleConversationCreated,
    handleConversationDeleted,
    handleSendMessage,
  } = useConversations()

  const hasConversations = (conversationsQuery.data?.length ?? 0) > 0

  return (
    <DashboardGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <MemoizedIconSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <MainDashboardContent
            activeConversation={activeConversation}
            activeSection={activeSection}
            activeConversationId={activeConversationId}
            hasConversations={hasConversations}
            onSelectConversation={setActiveConversationId}
            onCreateConversation={handleNewConversation}
            onConversationCreated={handleConversationCreated}
            onConversationDeleted={handleConversationDeleted}
            onSendMessage={handleSendMessage}
            isConversationLoading={isConversationLoading}
            isTyping={isTyping}
          />
        </div>
      </div>
    </DashboardGuard>
  )
}
