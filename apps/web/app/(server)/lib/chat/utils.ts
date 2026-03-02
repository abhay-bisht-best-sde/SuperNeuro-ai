import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages"

import { env } from "@/core/env"
import {
  TAVILY_WEB_SEARCH,
  FIRECRAWL_SCRAPE_URL,
} from "@/(server)/core/constants"

import type { IntegrationType } from "@repo/database"

export type RouteDecision = "tavily" | "firecrawl" | "composio" | "direct_llm"

export type LangChainTool = {
  name: string
  invoke: (input: unknown, options?: unknown) => Promise<unknown>
  [key: string]: unknown
}

export type ToolStepCallback = (toolName: string, phase?: "start" | "end") => void

export type Capabilities = {
  hasTavily: boolean
  hasFirecrawl: boolean
  hasComposio: boolean
  availableTools: string[]
}

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  GMAIL: "Gmail (read/send emails, list threads)",
  GOOGLE_CALENDAR: "Google Calendar (events, schedule)",
  GOOGLE_DRIVE: "Google Drive (files, folders)",
  GOOGLE_SHEETS: "Google Sheets (spreadsheets)",
  GOOGLE_DOCS: "Google Docs (documents)",
  NOTION: "Notion (pages, databases)",
  SLACK: "Slack (messages, channels)",
  YOUTUBE: "YouTube (videos, search)",
  REDDIT: "Reddit (posts, comments)",
}

export function getStepLabelForTool(toolName: string): string {
  if (toolName === TAVILY_WEB_SEARCH) return "Searching the web..."
  if (toolName === FIRECRAWL_SCRAPE_URL) return "Extracting page content..."
  const upper = toolName.toUpperCase()
  if (upper.startsWith("GMAIL_")) return "Accessing your emails..."
  if (upper.startsWith("GOOGLE_CALENDAR_")) return "Checking your calendar..."
  if (upper.startsWith("GOOGLE_DRIVE_")) return "Accessing your files..."
  if (upper.startsWith("GOOGLE_SHEETS_")) return "Reading your spreadsheet..."
  if (upper.startsWith("GOOGLE_DOCS_")) return "Reading your document..."
  if (upper.startsWith("NOTION_")) return "Accessing your Notion workspace..."
  if (upper.startsWith("SLACK_")) return "Checking your Slack..."
  if (upper.startsWith("YOUTUBE_")) return "Searching YouTube..."
  if (upper.startsWith("REDDIT_")) return "Searching Reddit..."
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

export function getAvailableTools(params: {
  hasTavily: boolean
  hasFirecrawl: boolean
  connectedProviders: IntegrationType[]
}): string[] {
  const { hasTavily, hasFirecrawl, connectedProviders } = params
  const tools: string[] = []
  if (hasTavily) tools.push("tavily")
  if (hasFirecrawl) tools.push("firecrawl")
  if (connectedProviders.length > 0) {
    tools.push(`composio:${connectedProviders.join(",")}`)
  }
  return tools
}

export function resolveCapabilities(connectedProviders: IntegrationType[]): Capabilities {
  const hasTavily = Boolean(env.TAVILY_API_KEY)
  const hasFirecrawl = Boolean(env.FIRECRAWL_API_KEY)
  const hasComposio = connectedProviders.length > 0
  const availableTools = getAvailableTools({
    hasTavily,
    hasFirecrawl,
    connectedProviders,
  })
  return { hasTavily, hasFirecrawl, hasComposio, availableTools }
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
