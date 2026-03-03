"use client"

import { AlertCircleIcon } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import { cn } from "@/(client)/libs/utils"

interface IProps {
  className?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState(props: IProps) {
  const { className, message = "Something went wrong", onRetry } = props

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircleIcon className="size-6" aria-hidden />
      </div>
      <p className="text-center text-sm font-medium text-foreground">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}
