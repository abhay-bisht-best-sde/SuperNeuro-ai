"use client"

import { InboxIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/(client)/components/ui/empty"
import { cn } from "@/(client)/libs/utils"

interface EmptyStateProps {
  className?: string
  title?: string
  description?: string
}

export function EmptyState(props: EmptyStateProps) {
  const {
    className,
    title = "No data",
    description = "There's nothing here yet.",
  } = props

  return (
    <Empty className={cn("min-h-[200px]", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon className="size-5 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
