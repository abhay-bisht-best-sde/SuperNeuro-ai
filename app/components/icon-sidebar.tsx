"use client"

import { motion } from "framer-motion"
import {
  MessageSquare,
  Bot,
  Database,
  KeyRound,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { SidebarSection } from "@/lib/store"

const navItems: { icon: React.ElementType; label: string; section: SidebarSection }[] = [
  { icon: MessageSquare, label: "Conversations", section: "conversations" },
  { icon: Bot, label: "Agents", section: "agents" },
  { icon: Database, label: "Knowledge Base", section: "knowledge" },
  { icon: KeyRound, label: "Keys", section: "keys" },
]

interface IconSidebarProps {
  activeSection: SidebarSection
  onSectionChange: (section: SidebarSection) => void
}

export function IconSidebar({ activeSection, onSectionChange }: IconSidebarProps) {
  return (
    <div className="flex h-full w-16 flex-col items-center border-r border-border bg-sidebar py-4">
      <div className="mb-8 flex items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
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
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.section
          return (
            <Tooltip key={item.section}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionChange(item.section)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent"
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`relative z-10 h-[18px] w-[18px] transition-colors ${
                      isActive
                        ? "text-sidebar-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </div>
  )
}
