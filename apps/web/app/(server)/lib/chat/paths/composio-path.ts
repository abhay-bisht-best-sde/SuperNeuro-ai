import {
  AIMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"
import type { IntegrationType } from "@repo/database"

import { logger } from "@/core/logger"
import { getComposioTools } from "@/(server)/lib/composio"
import { SYSTEM_MESSAGE } from "@/(server)/core/constants"
import type { ChecklistEmitter } from "../checklist-emitter"
import { DynamicStructuredTool } from "@langchain/core/tools"

const log = logger.withTag("composio-path")

/**
 * Maximum tool call iterations per request.
 * Prevents runaway agents. 10 is generous for any realistic task.
 */
const MAX_TOOL_CALLS = 10

type RawTool = {
  name: string
  invoke: (input: unknown, options?: unknown) => Promise<unknown>
  [key: string]: unknown
}

/**
 * Safety-net: reject any COMPOSIO_* meta-tools that may slip through.
 */
function filterOutMetaTools(tools: DynamicStructuredTool[]): DynamicStructuredTool[] {
  return tools.filter((t) => !t.name.startsWith("COMPOSIO_"))
}

export async function executeComposioPath(params: {
  userId: string
  connectedProviders: IntegrationType[]
  selectedProviders: IntegrationType[]
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  emitter: ChecklistEmitter
}): Promise<string | null> {
  const { userId, connectedProviders, selectedProviders, baseMessages, model, emitter } = params

  try {
    const sessionProviders = selectedProviders.length > 0 ? selectedProviders : connectedProviders

    const rawTools = await getComposioTools({
      userId,
      connectedProviders: sessionProviders,
    })

    if (!Array.isArray(rawTools) || rawTools.length === 0) {
      log.warn("No Composio tools returned", { providers: sessionProviders })
      return null
    }

    // Safety-net filter in case any COMPOSIO_* meta-tools slip through
    const tools = filterOutMetaTools(rawTools)

    if (tools.length === 0) {
      log.warn("No business tools after filtering", {
        raw: rawTools.length,
        providers: sessionProviders,
        rawTools: rawTools,
      })
      return null
    }

    // ─── TOOL CALLING LOOP ───────────────────────────────────────────────────
    // Use model.bindTools() + manual loop instead of createAgent().
    // Benefits:
    //   - We control the iteration count (MAX_TOOL_CALLS)
    //   - We emit events on every tool call
    //   - No LangGraph ReAct recursion stack
    //   - Tool errors are caught gracefully per-tool
    const modelWithTools = model.bindTools(
      tools 
    )

    const toolsByName = new Map(tools.map((t) => [t.name, t]))

    const loopMessages: BaseMessage[] = [
      new SystemMessage(SYSTEM_MESSAGE),
      ...baseMessages,
    ]

    let toolCallCount = 0

    while (toolCallCount < MAX_TOOL_CALLS) {
      const response = await modelWithTools.invoke(loopMessages)
      loopMessages.push(response)

      const aiMsg = response as AIMessage
      const toolCalls = aiMsg.tool_calls

      // No tool calls → model has finished reasoning, break to synthesis
      if (!toolCalls?.length) break

      for (const toolCall of toolCalls) {
        if (toolCallCount >= MAX_TOOL_CALLS) {
          log.warn("Max tool calls reached, stopping loop", { toolCallCount })
          break
        }

        emitter.onToolStep(toolCall.name, "start")

        const tool = toolsByName.get(toolCall.name)
        let result: unknown

        if (!tool) {
          log.warn("Tool not found", { tool: toolCall.name })
          result = { error: `Tool "${toolCall.name}" is not available` }
        } else {
          try {
            result = await tool.invoke(
              toolCall.args as Record<string, unknown>
            )
          } catch (err) {
            log.error("Tool execution failed", { tool: toolCall.name, err })
            result = { error: `Tool execution failed: ${String(err)}` }
          }
        }

        emitter.onToolStep(toolCall.name, "end")
        toolCallCount++

        loopMessages.push(
          new ToolMessage({
            content:
              typeof result === "string" ? result : JSON.stringify(result),
            tool_call_id: toolCall.id ?? `call_${toolCallCount}`,
          })
        )
      }
    }

    // ─── STREAMING SYNTHESIS ─────────────────────────────────────────────────
    // Run a final, tools-free pass to synthesize all accumulated tool results
    // into a coherent response. We stream each token so the UI updates live.
    emitter.addStage("synthesizing", "Synthesizing results...")

    const stream = await model.stream(loopMessages)
    let content = ""

    for await (const chunk of stream) {
      const token = typeof chunk.content === "string" ? chunk.content : ""
      content += token
      if (token) emitter.emitToken(token)
    }

    emitter.flushTokens()
    log.info("Composio path completed", { toolCallCount, contentLength: content.length })
    return content || ""
  } catch (err) {
    log.error("Composio path failed", err)
    return null
  }
}
