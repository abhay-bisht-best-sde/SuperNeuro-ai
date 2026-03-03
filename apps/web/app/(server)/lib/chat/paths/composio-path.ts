import {
  AIMessage,
  HumanMessage,
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

/**
 * Safety-net: reject any COMPOSIO_* meta-tools that may slip through.
 */
function filterOutMetaTools(tools: DynamicStructuredTool[]): DynamicStructuredTool[] {
  return tools.filter((t) => !t.name.startsWith("COMPOSIO_"))
}

/**
 * When a tool fails, append corrective guidance so the model picks the right
 * tool on the next iteration instead of repeating the same mistake.
 *
 * Covers: Gmail (send vs draft, label errors), Google Sheets (create vs add,
 * permission errors, sheet-not-found), Google Docs (create vs edit, permission),
 * and generic resource-ID re-use problems.
 */
function appendErrorGuidance(resultStr: string, toolName: string): string {
  const upper = toolName.toUpperCase()
  const lower = resultStr.toLowerCase()

  // ── Gmail ─────────────────────────────────────────────────────────────────
  // 1. Model tries BATCH_MODIFY_MESSAGES to "send" a draft (label errors)
  if (
    upper.includes("BATCH_MODIFY") ||
    upper.includes("MODIFY_MESSAGE")
  ) {
    return (
      resultStr +
      "\n\n⚠️ CORRECTION: BATCH_MODIFY_MESSAGES cannot send emails or change DRAFT/SENT labels. " +
      "To SEND an email, call GMAIL_SEND_EMAIL with recipient, subject, and body. " +
      "Do NOT create a draft first — send directly."
    )
  }

  // 2. Any Gmail tool that mentions draft/label issues
  if (upper.includes("GMAIL")) {
    if (lower.includes("draft") && (lower.includes("cannot") || lower.includes("error") || lower.includes("failed"))) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: To SEND an email use GMAIL_SEND_EMAIL directly. " +
        "Do NOT create a draft and then try to send it — that workflow does not work. " +
        "GMAIL_SEND_EMAIL takes recipient (to), subject, and body as parameters."
      )
    }
    if (lower.includes("invalid label") || lower.includes("label")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: Do not manipulate Gmail labels like SENT or DRAFT. " +
        "To send email use GMAIL_SEND_EMAIL. To create a draft use GMAIL_CREATE_EMAIL_DRAFT."
      )
    }
    if (lower.includes("message not found") || lower.includes("not found") || lower.includes("404")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: The message ID was not found. Do NOT reuse message IDs from earlier in the conversation. " +
        "If the user wants to send a new email, use GMAIL_SEND_EMAIL with fresh parameters."
      )
    }
  }

  // ── Google Sheets ─────────────────────────────────────────────────────────
  if (upper.includes("SHEET") || upper.includes("SPREADSHEET") || upper === "BATCH_UPDATE" || upper === "ADD_SHEET") {
    if (lower.includes("403") || lower.includes("not have permission") || lower.includes("permission")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: Permission denied — you used a spreadsheet ID the user does not own. " +
        "Do NOT reuse spreadsheet IDs from conversation history. " +
        "Call GOOGLESHEETS_CREATE_SPREADSHEET to create a brand new spreadsheet, then use the returned ID."
      )
    }
    if (lower.includes("not found") || lower.includes("404")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: The spreadsheet or sheet was not found. " +
        "If you need a new spreadsheet, call GOOGLESHEETS_CREATE_SPREADSHEET. " +
        "If writing data, make sure you use the sheet title returned by the create call."
      )
    }
    if (lower.includes("invalid") || lower.includes("error")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: The request was invalid. Common fixes: " +
        "1) Use GOOGLESHEETS_CREATE_SPREADSHEET (not ADD_SHEET) to create a new spreadsheet. " +
        "2) Only use spreadsheet IDs returned by a tool in THIS conversation. " +
        "3) Use the exact sheet title from the create response."
      )
    }
  }

  // ── Google Docs ───────────────────────────────────────────────────────────
  if (upper.includes("DOC")) {
    if (lower.includes("403") || lower.includes("not have permission") || lower.includes("permission")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: Permission denied — you used a document ID the user does not own. " +
        "Do NOT reuse document IDs from conversation history. " +
        "Call GOOGLEDOCS_CREATE_DOCUMENT to create a brand new document, then use the returned ID."
      )
    }
    if (lower.includes("not found") || lower.includes("404")) {
      return (
        resultStr +
        "\n\n⚠️ CORRECTION: The document was not found. " +
        "Call GOOGLEDOCS_CREATE_DOCUMENT to create a new one. " +
        "Never invent document IDs — only use IDs returned by tools."
      )
    }
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  if (lower.includes("403") || lower.includes("not have permission") || lower.includes("not found") || lower.includes("404")) {
    return (
      resultStr +
      "\n\n⚠️ CORRECTION: This failed due to a permission or not-found error. " +
      "Do NOT reuse resource IDs from earlier in the conversation. Create a new resource instead."
    )
  }

  return resultStr
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
      })
      return null
    }

    // ─── TOOL CALLING LOOP ───────────────────────────────────────────────────
    const modelWithTools = model.bindTools(tools)

    const toolsByName = new Map(tools.map((t) => [t.name, t]))
    const toolNamesList = tools.map((t) => t.name).join(", ")

    const toolAwareSystem =
      SYSTEM_MESSAGE +
      `\n\nYour available tools: [${toolNamesList}]` +
      `\nIMPORTANT TOOL SELECTION RULES:` +
      `\n- To SEND an email: use GMAIL_SEND_EMAIL (NOT create draft + modify labels)` +
      `\n- To CREATE a spreadsheet: use GOOGLESHEETS_CREATE_SPREADSHEET (NOT ADD_SHEET)` +
      `\n- To CREATE a document: use GOOGLEDOCS_CREATE_DOCUMENT` +
      `\n- NEVER use BATCH_MODIFY_MESSAGES to send emails` +
      `\n- NEVER invent resource IDs — only use IDs returned by tools in THIS conversation`

    const loopMessages: BaseMessage[] = [
      new SystemMessage(toolAwareSystem),
      ...baseMessages,
    ]

    let toolCallCount = 0
    // Track previous tool calls: signature → "ok" | "fail"
    const previousToolCalls = new Map<string, "ok" | "fail">()

    while (toolCallCount < MAX_TOOL_CALLS) {
      const response = await modelWithTools.invoke(loopMessages)
      loopMessages.push(response)

      const aiMsg = response as AIMessage
      const toolCalls = aiMsg.tool_calls

      // No tool calls → model has finished reasoning
      if (!toolCalls?.length) break

      // Detect if ALL tool calls are duplicates of previous SUCCESSFUL calls
      const callSignatures = toolCalls.map(
        (tc) => `${tc.name}::${JSON.stringify(tc.args)}`
      )
      const allSuccessDuplicates = callSignatures.every(
        (sig) => previousToolCalls.get(sig) === "ok"
      )
      if (allSuccessDuplicates) {
        log.warn("Duplicate tool calls detected, breaking loop", {
          toolCallCount,
          duplicates: callSignatures,
        })
        for (const tc of toolCalls) {
          loopMessages.push(
            new ToolMessage({
              content: "Duplicate call — already completed successfully. Provide your final answer now.",
              tool_call_id: tc.id ?? `call_dup_${toolCallCount++}`,
            })
          )
        }
        break
      }

      let hitMax = false

      for (const toolCall of toolCalls) {
        const callSig = `${toolCall.name}::${JSON.stringify(toolCall.args)}`

        if (hitMax || toolCallCount >= MAX_TOOL_CALLS) {
          log.warn("Max tool calls reached, skipping", { tool: toolCall.name })
          loopMessages.push(
            new ToolMessage({
              content: "Tool call limit reached. Provide your final answer with the results you already have.",
              tool_call_id: toolCall.id ?? `call_max_${toolCallCount++}`,
            })
          )
          hitMax = true
          continue
        }

        // Skip duplicate calls only if the previous attempt succeeded
        const prevStatus = previousToolCalls.get(callSig)
        if (prevStatus === "ok") {
          log.warn("Skipping duplicate tool call", { tool: toolCall.name })
          loopMessages.push(
            new ToolMessage({
              content: "This tool was already called with the same arguments and succeeded. Use the previous result.",
              tool_call_id: toolCall.id ?? `call_${toolCallCount}`,
            })
          )
          toolCallCount++
          continue
        }

        emitter.onToolStep(toolCall.name, "start")

        const tool = toolsByName.get(toolCall.name)
        let result: unknown
        let succeeded = false

        if (!tool) {
          log.warn("Tool not found", { tool: toolCall.name })
          result = { error: `Tool "${toolCall.name}" is not available` }
        } else {
          try {
            result = await tool.invoke(
              toolCall.args as Record<string, unknown>
            )
            const resultStr = typeof result === "string" ? result : JSON.stringify(result)
            succeeded = !resultStr.includes('"successfull":false') && !resultStr.includes('"successful":false')
          } catch (err) {
            log.error("Tool execution failed", { tool: toolCall.name, err })
            result = { error: `Tool execution failed: ${String(err)}` }
          }
        }

        previousToolCalls.set(callSig, succeeded ? "ok" : "fail")
        emitter.onToolStep(toolCall.name, "end")
        toolCallCount++

        let resultStr = typeof result === "string" ? result : JSON.stringify(result)
        if (!succeeded) {
          resultStr = appendErrorGuidance(resultStr, toolCall.name)
        }

        loopMessages.push(
          new ToolMessage({
            content: resultStr,
            tool_call_id: toolCall.id ?? `call_${toolCallCount}`,
          })
        )
      }

      if (hitMax) break
    }

    // ─── CHECK IF THE LOOP ALREADY PRODUCED A FINAL ANSWER ──────────────────
    const lastMsg = loopMessages[loopMessages.length - 1]
    if (!lastMsg) {
      log.warn("No messages in loop after tool execution")
      return null
    }

    const isToolOrSystem =
      lastMsg instanceof ToolMessage || lastMsg instanceof SystemMessage
    const lastContent =
      typeof lastMsg.content === "string" ? lastMsg.content : ""
    const lastToolCalls =
      lastMsg && "tool_calls" in lastMsg
        ? (lastMsg as AIMessage).tool_calls
        : undefined

    if (!isToolOrSystem && lastContent && !lastToolCalls?.length) {
      log.info("Using inline AI response (no synthesis needed)", {
        toolCallCount,
        contentLength: lastContent.length,
      })
      emitter.emitToken(lastContent)
      emitter.flushTokens()
      return lastContent
    }

    // ─── STREAMING SYNTHESIS ─────────────────────────────────────────────────
    // The loop ended with a ToolMessage (duplicates/max-limit) so the model
    // hasn't summarized yet. Add a nudge so it produces a comprehensive answer.
    emitter.addStage("synthesizing", "Synthesizing results...")

    loopMessages.push(
      new HumanMessage(
        "Now provide your final, comprehensive response based on all the tool results above. " +
        "Include ALL relevant data, links, and content from the tool outputs. " +
        "Format the response clearly with markdown. " +
        "If any tool created a resource, include the direct URL as a clickable markdown link."
      )
    )

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
