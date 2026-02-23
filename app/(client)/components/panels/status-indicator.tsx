"use client"

import { Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { Badge } from "@/(client)/components/ui/badge"
import { Progress } from "@/(client)/components/ui/progress"
import type { KnowledgeBase } from "@/(client)/lib/store"

interface StatusIndicatorProps {
  status: KnowledgeBase["status"]
  progress?: number
  onRetry?: () => void
}

export function StatusIndicator({ status, progress, onRetry }: StatusIndicatorProps) {
  switch (status) {
    case "chunking":
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
          <span className="text-xs text-accent">Chunking...</span>
        </div>
      )
    case "indexing":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary">Indexing...</span>
            <span className="text-xs text-muted-foreground">
              {progress ?? 0}%
            </span>
          </div>
          <Progress value={progress ?? 0} className="h-1" />
        </div>
      )
    case "completed":
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-emerald-500/10 text-xs text-emerald-400"
        >
          Completed
        </Badge>
      )
    case "error":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            Error
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )
  }
}
