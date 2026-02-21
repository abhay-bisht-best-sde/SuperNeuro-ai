"use client"

import { Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopNavbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <svg
            width="16"
            height="16"
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
        <span className="text-sm font-semibold tracking-tight text-foreground">
          SuperNeuro.ai
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face" alt="User avatar" />
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
