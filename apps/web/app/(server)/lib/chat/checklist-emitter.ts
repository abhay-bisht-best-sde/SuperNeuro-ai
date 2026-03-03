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
  /** Emit a single text token for progressive streaming in the UI.
   *  Tokens are internally batched (~100 ms) to stay under Ably rate limits. */
  emitToken: (token: string) => void
  /** Flush any buffered tokens immediately (call before the final MESSAGE). */
  flushTokens: () => void
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

  // ─── Token batching ────────────────────────────────────────────────────
  // Ably free-tier caps at 50 msg/sec per channel.  We accumulate tokens
  // and flush at most every 100 ms so we never exceed ~10 msg/sec of
  // token events while still giving a smooth streaming feel.
  let tokenBuffer = ""
  let flushTimer: ReturnType<typeof setTimeout> | null = null
  const TOKEN_FLUSH_MS = 100

  function flushTokens() {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    if (!tokenBuffer || !onEvent) return
    const batch = tokenBuffer
    tokenBuffer = ""
    void Promise.resolve(
      onEvent({ type: ConversationEventType.TOKEN_STREAM, token: batch })
    ).catch(() => {})
  }

  function emitToken(token: string) {
    if (!onEvent || !token) return
    tokenBuffer += token
    if (!flushTimer) {
      flushTimer = setTimeout(flushTokens, TOKEN_FLUSH_MS)
    }
  }

  return { addStage, handleToolEvent, onToolStep, emitToken, flushTokens }
}
