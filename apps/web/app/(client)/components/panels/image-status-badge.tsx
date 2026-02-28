"use client"

import { Badge } from "@/(client)/components/ui/badge"
import { ImageProcessingStatus } from "@repo/database/types"

interface ImageStatusBadgeProps {
  status: ImageProcessingStatus
}

export function ImageStatusBadge(props: ImageStatusBadgeProps) {
  const { status } = props

  switch (status) {
    case ImageProcessingStatus.PENDING:
      return (
        <Badge variant="secondary" className="text-xs">
          PENDING
        </Badge>
      )
    case ImageProcessingStatus.INDEXING:
      return (
        <Badge variant="secondary" className="text-xs animate-pulse">
          INDEXING
        </Badge>
      )
    case ImageProcessingStatus.INDEXED:
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-emerald-500/10 text-xs text-emerald-400"
        >
          INDEXED
        </Badge>
      )
    case ImageProcessingStatus.ERROR:
      return (
        <Badge variant="destructive" className="text-xs">
          ERROR
        </Badge>
      )
    default:
      return null
  }
}
