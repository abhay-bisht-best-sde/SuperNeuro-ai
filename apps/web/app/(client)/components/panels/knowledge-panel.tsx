"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, FileText, Search, X } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/(client)/components/ui/input-group"
import { useResourceViewerStore } from "@/(client)/components/resource-viewer"
import { StatusIndicator } from "./status-indicator"

import type { KnowledgeBaseListItem } from "@repo/database/types"
import { KnowledgeBaseIndexingStatus } from "@repo/database/types"

function getFileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? ""
  return ext === "PDF" ? "PDF" : `${ext || "Document"}`
}

interface IProps {
  knowledgeBases: KnowledgeBaseListItem[]
  onAddKnowledgeBase: () => void
  onRetry: (id: string) => void
}

const DEBOUNCE_MS = 300

export function KnowledgePanel(props: IProps) {
  const { knowledgeBases, onAddKnowledgeBase, onRetry } = props
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const openPdfViewer = useResourceViewerStore((s) => s.openPdfViewer)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredBases = debouncedQuery.trim()
    ? knowledgeBases.filter((kb) =>
        kb.name.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
      )
    : knowledgeBases

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 p-3">
        <Button
          onClick={onAddKnowledgeBase}
          className="w-full justify-start gap-2 border-0 bg-primary/10 text-primary hover:bg-primary/20"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Knowledge Base
        </Button>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search knowledge bases…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col">
          {filteredBases.map((kb) => {
            const isProcessing =
              kb.status === KnowledgeBaseIndexingStatus.INDEXING ||
              kb.status === KnowledgeBaseIndexingStatus.PENDING

            return (
              <motion.div
                key={kb.id}
                role="button"
                tabIndex={0}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  openPdfViewer({
                    r2Key: kb.key,
                    fileName: kb.name,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openPdfViewer({ r2Key: kb.key, fileName: kb.name })
                  }
                }}
                className={`flex cursor-pointer flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-sidebar-accent/50 ${
                  isProcessing
                    ? "animate-dash-border rounded-md border border-dashed border-primary/40"
                    : "border-b border-border"
                }`}
              >
                <div className="flex w-full min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1 max-w-[300px] truncate text-sm font-medium text-foreground">
                    {kb.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-xs text-muted-foreground">Document</span>
                    <StatusIndicator
                      status={kb.status}
                      progress={kb.progress}
                      errorMessage={kb.errorMessage}
                      processingAttempts={kb.processingAttempts ?? 0}
                      onRetry={() => onRetry(kb.id)}
                      typeLabel={getFileTypeLabel(kb.name)}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {kb.lastUpdated
                      ? `Updated ${kb.lastUpdated.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`
                      : "—"}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
