"use client"

import { PanelLeftClose, PanelLeft } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"

interface ChatWorkspaceHeaderProps {
  title: string
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export function ChatWorkspaceHeader(props: ChatWorkspaceHeaderProps) {
  const { title, sidebarOpen = true, onSidebarToggle } = props

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
      {onSidebarToggle && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSidebarToggle}
          className="h-8 w-8 shrink-0 rounded-lg hover:bg-primary/60!"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
          ) : (
            <PanelLeft className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </Button>
      )}
      <h2 className="truncate text-sm font-medium text-foreground">
        {title}
      </h2>
    </div>
  )
}
