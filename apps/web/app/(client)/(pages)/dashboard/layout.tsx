"use client"

import { memo, useMemo } from "react"
import { usePathname } from "next/navigation"

import { IconSidebar } from "@/(client)/components/layout/icon-sidebar"
import { useConversations as useConversationsQuery } from "@/(client)/components/query-boundary"
import { ResourceViewerModals } from "@/(client)/components/resource-viewer"
import { useConversations } from "../../hooks/use-conversations"
import { MainDashboardContent } from "./components/main-dashboard-content"
import { DashboardGuard } from "./dashboard-guard"
import { BootupWrapper } from "@/(client)/components/bootup"

import type { SidebarSection } from "@/(client)/libs/types"

const MemoizedIconSidebar = memo(IconSidebar)

function pathnameToSection(pathname: string): SidebarSection {
  if (pathname === "/dashboard/integrations") return "integrations"
  if (pathname === "/dashboard/knowledge") return "knowledge"
  if (pathname === "/dashboard/documents") return "rag"
  return "workflows"
}

export default function DashboardLayout() {
  const pathname = usePathname()
  const activeSection = useMemo(
    () => pathnameToSection(pathname ?? "/dashboard"),
    [pathname]
  )

  const conversationTypeFilter =
    activeSection === "rag" ? "RAG" : activeSection === "workflows" ? "WORKFLOW" : undefined
  const conversationsQuery = useConversationsQuery(conversationTypeFilter)
  const {
    activeConversationId,
    isConversationLoading,
    isTyping,
    graphStage,
    streamingContent,
    requiresConnection,
    activeConversation,
    setActiveConversationId,
    handleNewConversation,
    handleConversationCreated,
    handleConversationDeleted,
    handleSendMessage,
  } = useConversations(activeSection)

  const hasConversations = (conversationsQuery.data?.length ?? 0) > 0

  return (
    <DashboardGuard>
      <BootupWrapper>
        <ResourceViewerModals />
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
              graphStage={graphStage}
              streamingContent={streamingContent}
              requiresConnection={requiresConnection}
            />
          </div>
        </div>
      </BootupWrapper>
    </DashboardGuard>
  )
}
