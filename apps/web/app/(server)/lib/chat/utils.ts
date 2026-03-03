import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages"

import type { IntegrationType } from "@repo/database"

export type LangChainTool = {
  name: string
  invoke: (input: unknown, options?: unknown) => Promise<unknown>
  [key: string]: unknown
}

export type ToolStepCallback = (toolName: string, phase?: "start" | "end") => void

export function getStepLabelForTool(toolName: string): string {
  const upper = toolName.toUpperCase()
  if (upper.startsWith("GMAIL_")) return "Accessing your emails..."
  if (upper.startsWith("GOOGLECALENDAR_")) return "Checking your calendar..."
  if (upper.startsWith("GOOGLEDRIVE_")) return "Accessing your files..."
  if (upper.startsWith("GOOGLESHEETS_")) return "Reading your spreadsheet..."
  if (upper.startsWith("GOOGLEDOCS_")) return "Reading your document..."
  if (upper.startsWith("NOTION_")) return "Accessing your Notion workspace..."
  if (upper.startsWith("SLACK_")) return "Checking your Slack..."
  if (upper.startsWith("YOUTUBE_")) return "Searching YouTube..."
  if (upper.startsWith("REDDIT_")) return "Searching Reddit..."
  if (upper.startsWith("TAVILY_")) return "Searching the web..."
  if (upper.startsWith("FIRECRAWL_")) return "Extracting page content..."
  return "Using your integrations..."
}

export function toBaseMessages(
  messages: Array<{ role: string; content: string }>
): BaseMessage[] {
  return messages.map((m) => {
    const role = m.role.toLowerCase()
    const content = m.content
    if (role === "system") return new SystemMessage(content)
    if (role === "user") return new HumanMessage(content)
    return new AIMessage(content)
  })
}

export function extractLastResponse(messages: BaseMessage[]): string {
  const last = messages[messages.length - 1]
  if (!last) return ""
  const content = last.content
  return typeof content === "string" ? content : String(content ?? "")
}

export function filterToolsByProviders(
  tools: LangChainTool[],
  providers: IntegrationType[]
): LangChainTool[] {
  if (providers.length === 0) return tools

  return tools.filter((tool) =>
    providers.some((provider) =>
      tool.name.toUpperCase().startsWith(
        provider.toUpperCase() + "_"
      )
    )
  )
}

export function wrapToolsWithCallback(
  tools: LangChainTool[],
  onToolCall: (toolName: string, phase?: "start" | "end") => void
): LangChainTool[] {
  return tools.map((tool) => {
    if (typeof tool.invoke !== "function") return tool
    const originalInvoke = tool.invoke.bind(tool)
    return {
      ...tool,
      invoke: async (input: unknown, options?: unknown) => {
        onToolCall(tool.name, "start")
        try {
          const result = await originalInvoke(input, options)
          onToolCall(tool.name, "end")
          return result
        } catch (err) {
          onToolCall(tool.name, "end")
          throw err
        }
      },
    }
  })
}
