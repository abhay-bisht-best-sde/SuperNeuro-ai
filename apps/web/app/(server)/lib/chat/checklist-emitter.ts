import {
  ConversationEventType,
  type ChecklistItem,
  type ConversationGraphStageEvent,
} from "@/libs/ably-types"

import type { ChatGraphInput } from "@/(server)/core/types"
import { getStepLabelForTool, type ToolStepCallback } from "./utils"

export type ChecklistEmitter = {
  addStage: (
    stage: ConversationGraphStageEvent["stage"],
    label: string,
    details?: ConversationGraphStageEvent["details"]
  ) => void
  onToolStep: ToolStepCallback
  handleToolEvent: (
    toolSlug: string,
    phase: "start" | "end",
    meta?: Record<string, unknown>
  ) => void
}

export function createChecklistEmitter(
  onEvent: ChatGraphInput["onEvent"]
): ChecklistEmitter {
  const items: ChecklistItem[] = []

  function emit(
    stage: ConversationGraphStageEvent["stage"],
    label: string,
    details?: ConversationGraphStageEvent["details"]
  ) {
    if (!onEvent) return

    const event: ConversationGraphStageEvent = {
      type: ConversationEventType.GRAPH_STAGE,
      stage,
      label,
      checklistItems: items.map((i) => ({ ...i })),
      details,
    }

    void Promise.resolve(onEvent(event)).catch(() => {})
  }

  function addStage(
    stage: ConversationGraphStageEvent["stage"],
    label: string,
    details?: ConversationGraphStageEvent["details"]
  ) {
    const activeIdx = items.findIndex((i) => i.status === "in_progress")
    if (activeIdx >= 0) {
      items[activeIdx] = { ...items[activeIdx], status: "completed" }
    }

    items.push({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      status: "in_progress",
    })

    emit(stage, label, details)
  }

  function handleToolEvent(
    toolSlug: string,
    phase: "start" | "end",
    meta?: Record<string, unknown>
  ) {
    const label = getStepLabelForTool(toolSlug)
    const stage =
      phase === "start" ? "tool_executing" : "tool_executed"

    if (phase === "end") {
      const activeIdx = items.findIndex((i) => i.status === "in_progress")
      if (activeIdx >= 0) {
        items[activeIdx] = { ...items[activeIdx], status: "completed" }
      }
    } else {
      items.push({
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        status: "in_progress",
      })
    }

    emit(stage, label, {
      tool: toolSlug,
      ...meta,
    })
  }

  const onToolStep: ToolStepCallback = (toolName, phase) => {
    handleToolEvent(toolName, phase ?? "start")
  }

  return { addStage, handleToolEvent, onToolStep }
}
