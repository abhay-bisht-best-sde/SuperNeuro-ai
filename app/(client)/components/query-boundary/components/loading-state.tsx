"use client"

import { Loader2Icon } from "lucide-react"
import { cn } from "@/(client)/lib/utils"

interface LoadingStateProps {
  className?: string
  message?: string
}

export function LoadingState({ className, message = "Loading…" }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-4 rounded-lg border border-border/50 bg-card/30 p-8",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Loader2Icon className="size-6 animate-spin" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  )
}
