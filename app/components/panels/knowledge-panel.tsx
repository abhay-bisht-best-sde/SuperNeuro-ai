"use client"

import { motion } from "framer-motion"
import { Plus, Globe, FileText, RotateCcw, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { KnowledgeBase } from "@/lib/store"

interface KnowledgePanelProps {
  knowledgeBases: KnowledgeBase[]
  onAddKnowledgeBase: () => void
  onRetry: (id: string) => void
}

function StatusIndicator({
  status,
  progress,
  onRetry,
}: {
  status: KnowledgeBase["status"]
  progress?: number
  onRetry?: () => void
}) {
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
          className="bg-emerald-500/10 text-emerald-400 border-0 text-xs"
        >
          Completed
        </Badge>
      )
    case "error":
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="destructive"
            className="text-xs"
          >
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

export function KnowledgePanel({
  knowledgeBases,
  onAddKnowledgeBase,
  onRetry,
}: KnowledgePanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={onAddKnowledgeBase}
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Knowledge Base
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-2">
          {knowledgeBases.map((kb, index) => (
            <motion.div
              key={kb.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {kb.sourceType === "website" ? (
                  <Globe className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-accent" />
                )}
                <span className="flex-1 text-sm font-medium text-foreground">
                  {kb.name}
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{kb.sourceType}</span>
                <span>
                  Updated{" "}
                  {kb.lastUpdated.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <StatusIndicator
                status={kb.status}
                progress={kb.progress}
                onRetry={() => onRetry(kb.id)}
              />
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
