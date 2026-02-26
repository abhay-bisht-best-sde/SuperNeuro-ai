"use client"

import { Plus } from "lucide-react"
import { ScrollArea } from "@/(client)/components/ui/scroll-area"
import { Button } from "@/(client)/components/ui/button"
import { Badge } from "@/(client)/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/(client)/components/ui/accordion"
import type { Agent } from "@/(client)/libs/store"

interface AgentsPanelProps {
  agents: Agent[]
}

export function AgentsPanel({ agents }: AgentsPanelProps) {
  const defaultOpen = agents[0]?.id ?? undefined

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
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen}
          className="flex flex-col gap-1"
        >
          {agents.map((agent) => (
            <AccordionItem
              key={agent.id}
              value={agent.id}
              className="overflow-hidden rounded-xl border border-border border-b-0 bg-card px-0"
            >
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-secondary/50 data-[state=open]:rounded-none">
                <span className="text-sm font-medium text-foreground">
                  {agent.name}
                </span>
              </AccordionTrigger>
              <AccordionContent>
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
                    <span className="text-xs text-muted-foreground">KB:</span>
                    {agent.knowledgeBases.map((kb) => (
                      <Badge key={kb} variant="outline" className="text-xs">
                        {kb}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
