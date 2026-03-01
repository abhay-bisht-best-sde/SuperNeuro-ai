"use client"

import { Clock, RotateCcw } from "lucide-react"

import { Badge } from "@/(client)/components/ui/badge"
import { Button } from "@/(client)/components/ui/button"
import { Progress } from "@/(client)/components/ui/progress"

import { KnowledgeBaseIndexingStatus } from "@repo/database/types"

import { MAX_RETRY_ATTEMPTS } from "@/(client)/libs/constants"

interface IProps {
  status: KnowledgeBaseIndexingStatus;
  progress?: number
  errorMessage?: string | null
  processingAttempts?: number
  onRetry?: () => void
  typeLabel?: string
}

export function StatusIndicator(props: IProps) {
  const {
    status,
    progress,
    errorMessage,
    processingAttempts = 0,
    onRetry,
    typeLabel = "PDF (type stored)",
  } = props

  const statusPrefix = `${typeLabel} - `

  switch (status) {
    case KnowledgeBaseIndexingStatus.PENDING:
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {statusPrefix}Pending
            </span>
          </div>
        </div>
      )
    case KnowledgeBaseIndexingStatus.INDEXING:
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary">
              {statusPrefix}Indexing...
            </span>
            <span className="text-xs text-muted-foreground">
              {progress ?? 0}%
            </span>
          </div>
          <Progress value={progress ?? 0} className="h-1" />
        </div>
      )
    case KnowledgeBaseIndexingStatus.INDEXED:
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="secondary"
            className="w-fit border-0 bg-secondary/80 text-xs text-muted-foreground"
          >
            {statusPrefix}Completed
          </Badge>
        </div>
      )
    case KnowledgeBaseIndexingStatus.ERROR:
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {statusPrefix}Error
            </Badge>
            {processingAttempts >= MAX_RETRY_ATTEMPTS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
          {errorMessage && (
            <span className="line-clamp-2 text-xs text-destructive">
              {errorMessage}
            </span>
          )}
        </div>
      )
    default:
      return null
  }
}
