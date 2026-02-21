"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type PipelineStage = "idle" | "chunking" | "indexing" | "completed"

interface PipelineStatusProps {
  stage: PipelineStage
}

const stages: { key: PipelineStage; label: string }[] = [
  { key: "chunking", label: "Chunking" },
  { key: "indexing", label: "Indexing" },
  { key: "completed", label: "Completed" },
]

export function PipelineStatus({ stage }: PipelineStatusProps) {
  if (stage === "idle") return null

  const currentIndex = stages.findIndex((s) => s.key === stage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-secondary/50 p-4"
    >
      {stages.map((s, i) => {
        const isActive = i === currentIndex
        const isDone = i < currentIndex
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center">
              {isDone ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </motion.div>
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span
              className={`text-sm ${
                isDone
                  ? "text-emerald-400"
                  : isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {isActive && s.key === "indexing" && (
              <div className="flex-1">
                <Progress value={65} className="h-1" />
              </div>
            )}
          </div>
        )
      })}
    </motion.div>
  )
}
