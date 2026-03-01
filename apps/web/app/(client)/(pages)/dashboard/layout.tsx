"use client"

import { memo, useMemo } from "react"
import { usePathname } from "next/navigation"

import { IconSidebar } from "@/(client)/components/layout/icon-sidebar"
import { useConversations as useConversationsQuery } from "@/(client)/components/query-boundary"
import { useConversations } from "../../hooks/use-conversations"
import { MainDashboardContent } from "./components/main-dashboard-content"
import { DashboardGuard } from "./dashboard-guard"
import { BootupWrapper } from "@/(client)/components/bootup"

import type { SidebarSection } from "@/(client)/libs/types"

const MemoizedIconSidebar = memo(IconSidebar)

function pathnameToSection(pathname: string): SidebarSection {
  if (pathname === "/dashboard/integrations") return "integrations"
  if (pathname === "/dashboard/knowledge") return "knowledge"
  return "conversations"
}

export default function DashboardLayout() {
  const pathname = usePathname()
  const activeSection = useMemo(
    () => pathnameToSection(pathname ?? "/dashboard"),
    [pathname]
  )

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
      <BootupWrapper>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <MemoizedIconSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <MainDashboardContent
              activeSection={activeSection}
              activeConversation={activeConversation}
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
      </BootupWrapper>
    </DashboardGuard>
  )
}
