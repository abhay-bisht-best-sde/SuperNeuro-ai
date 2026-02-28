"use client"

import { motion } from "framer-motion"
import { Plus, FileText } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/(client)/components/ui/accordion"
import { Button } from "@/(client)/components/ui/button"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { StatusIndicator } from "./status-indicator"

import type { KnowledgeBaseListItem } from "@repo/database/types"
import { KnowledgeBaseIndexingStatus } from "@repo/database/types"

function getFileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? ""
  return ext === "PDF" ? "PDF (type stored)" : `${ext || "Document"} (type stored)`
}

interface KnowledgePanelProps {
  knowledgeBases: KnowledgeBaseListItem[]
  onAddKnowledgeBase: () => void
  onRetry: (id: string) => void
}

export function KnowledgePanel(props: KnowledgePanelProps) {
  const { knowledgeBases, onAddKnowledgeBase, onRetry } = props

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={onAddKnowledgeBase}
          className="w-full justify-start gap-2 border-0 bg-primary/10 text-primary hover:bg-primary/20"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Knowledge Base
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <Accordion
          type="single"
          collapsible
          className="flex flex-col gap-2"
        >
          {knowledgeBases.map((kb, index) => {
            const isProcessing =
              kb.status === KnowledgeBaseIndexingStatus.INDEXING ||
              kb.status === KnowledgeBaseIndexingStatus.PENDING

            return (
              <motion.div
                key={kb.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={kb.id}
                  className={`overflow-hidden rounded-xl border bg-card last:border-b! ${
                    isProcessing
                      ? "animate-dash-border border-dashed border-primary/60"
                      : "border-border"
                  }`}
                >
                  <AccordionTrigger className="px-3 py-3 hover:bg-secondary/50 hover:no-underline data-[state=open]:rounded-none">
                    <div className="flex flex-1 flex-col items-start gap-1 text-left">
                      <div className="flex w-full items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-accent" />
                        <span className="flex-1 text-sm font-medium text-foreground">
                          {kb.name}
                        </span>
                      </div>
                      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                        <span>Document</span>
                        <span>
                          Updated{" "}
                          {kb.lastUpdated
                            ? kb.lastUpdated.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <StatusIndicator
                          status={kb.status}
                          progress={kb.progress}
                          errorMessage={kb.errorMessage}
                          processingAttempts={kb.processingAttempts ?? 0}
                          onRetry={() => onRetry(kb.id)}
                          typeLabel={getFileTypeLabel(kb.name)}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border-t border-border px-3 pb-3 pt-2">
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <span>Images: {kb.totalImages}</span>
                        <span>Indexed: {kb.imagesIndexed}</span>
                        <span>Errors: {kb.imagesError ?? 0}</span>
                        <span>Not started: {kb.imagesNotStarted ?? 0}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
