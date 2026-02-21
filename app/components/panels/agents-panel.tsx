"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/lib/store"

interface AgentsPanelProps {
  agents: Agent[]
}

export function AgentsPanel({ agents }: AgentsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(agents[0]?.id ?? null)

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1">
          {agents.map((agent, index) => {
            const isExpanded = expandedId === agent.id
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : agent.id)
                  }
                  className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <span className="text-sm font-medium text-foreground">
                    {agent.name}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="border-t border-border px-3 pb-3 pt-2">
                        <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
                          {agent.description}
                        </p>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Model:
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-0"
                          >
                            {agent.model}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">
                            KB:
                          </span>
                          {agent.knowledgeBases.map((kb) => (
                            <Badge
                              key={kb}
                              variant="outline"
                              className="text-xs"
                            >
                              {kb}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
