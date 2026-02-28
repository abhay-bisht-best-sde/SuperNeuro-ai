"use client"

import {
  MessageSquare,
  Database,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/(client)/components/ui/tooltip"
import { cn } from "@/(client)/libs/utils"
import { APP_NAME } from "@/(client)/libs/constants"
import { useSidebarExpanded } from "@/(client)/hooks/use-sidebar-expanded"
import type { SidebarSection } from "@/(client)/libs/types"

const navItems: { icon: React.ElementType; label: string; section: SidebarSection }[] = [
  { icon: MessageSquare, label: "Conversations", section: "conversations" },
  { icon: Database, label: "Knowledge Base", section: "knowledge" },
]

interface IconSidebarProps {
  activeSection: SidebarSection
  onSectionChange: (section: SidebarSection) => void
}

export function IconSidebar(props: IconSidebarProps) {
  const { activeSection, onSectionChange } = props
  const [expanded, toggle] = useSidebarExpanded()

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar py-4 transition-[width] duration-200 ease-in-out",
        expanded ? "w-52" : "w-16"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-3",
          expanded ? "px-3" : "justify-center px-0"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary-foreground"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {expanded && (
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {APP_NAME}
          </span>
        )}
      </div>

      <nav
        className={cn(
          "mt-6 flex flex-1 flex-col gap-1",
          expanded ? "px-3" : "items-center px-0"
        )}
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.section
          const button = (
            <Button
              variant="ghost"
              size={expanded ? "sm" : "icon"}
              onClick={() => onSectionChange(item.section)}
              className={cn(
                "relative isolate h-10 overflow-hidden rounded-xl hover:bg-primary/20",
                expanded ? "w-full justify-start gap-3 px-3" : "w-10"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-sidebar-accent" />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-muted-foreground"
                )}
              />
              {expanded && (
                <span className="relative z-10 truncate text-sm font-medium text-sidebar-foreground">
                  {item.label}
                </span>
              )}
            </Button>
          )

          return expanded ? (
            <div key={item.section}>{button}</div>
          ) : (
            <Tooltip key={item.section}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div
        className={cn(
          "mt-auto shrink-0",
          expanded ? "px-3" : "flex justify-center px-0"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-10 w-10 rounded-xl hover:bg-primary/20"
            >
              {expanded ? (
                <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              ) : (
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {expanded ? "Collapse sidebar" : "Expand sidebar"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {expanded ? "Collapse sidebar" : "Expand sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
