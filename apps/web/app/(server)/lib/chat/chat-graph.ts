import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages"
import { createReactAgent } from "@langchain/langgraph/prebuilt"

import { logger } from "@/core/logger"
import { env } from "@/core/env"
import {
  ConversationEventType,
  type ConversationGraphStageEvent,
} from "@/libs/ably-types"

import type { ChatGraphInput } from "@/(server)/core/types"
import {
  SYSTEM_MESSAGE,
  TAVILY_WEB_SEARCH,
  FIRECRAWL_SCRAPE_URL,
} from "@/(server)/core/constants"
import { getChatModel } from "@/(server)/lib/openai-chat-client"
import { createComposioSession } from "@/(server)/lib/composio"
import {
  getTavilyTool,
  getFirecrawlTool,
} from "@/(server)/lib/chat/api-tools"

import type { IntegrationType } from "@repo/database"

function getStepLabelForTool(toolName: string): string {
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

export type { ChatMessage, ChatGraphInput } from "@/(server)/core/types"

const log = logger.withTag("chat-graph")

type RouteDecision = "tavily" | "firecrawl" | "composio" | "direct_llm"

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
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

function buildRouterPrompt(availableTools: string[]): string {
  const toolDescriptions = availableTools.map((t) => {
    if (t === "tavily") return "tavily: Web search for current events, research, real-time info. No URL provided."
    if (t === "firecrawl") return "firecrawl: Extract content from a specific URL the user provides."
    if (t.startsWith("composio:")) {
      const providers = t.replace("composio:", "").split(",")
      const desc = providers
        .map((p) => PROVIDER_DISPLAY_NAMES[p] ?? p)
        .join("; ")
      return `composio: Connected apps - ${desc}`
    }
    return t
  }).join("\n- ")

  return `You are a router. The user has these tools available:
- ${toolDescriptions}

User query: "{query}"

Can ANY of these tools serve this query? If YES, output the exact tool name (tavily, firecrawl, or composio). If NO or not possible, output: direct_llm

Output ONLY one word.`
}

function toBaseMessages(
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

function extractLastResponse(messages: BaseMessage[]): string {
  const last = messages[messages.length - 1]
  if (!last) return ""
  const content = last.content
  return typeof content === "string" ? content : String(content ?? "")
}

function emitStage(
  onEvent: ChatGraphInput["onEvent"],
  event: ConversationGraphStageEvent
): void {
  if (onEvent) {
    void Promise.resolve(onEvent(event)).catch(() => {})
  }
}

function getAvailableTools(params: {
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

type Capabilities = {
  hasTavily: boolean
  hasFirecrawl: boolean
  hasComposio: boolean
  availableTools: string[]
}

function resolveCapabilities(connectedProviders: IntegrationType[]): Capabilities {
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

function createToolCallHandler(
  onEvent: ChatGraphInput["onEvent"]
): (toolName: string) => void {
  return (toolName: string) => {
    log.info("Tool invoked", { tool: toolName })
    emitStage(onEvent, {
      type: ConversationEventType.GRAPH_STAGE,
      stage: "tool_executing",
      label: getStepLabelForTool(toolName),
      details: { tool: toolName },
    })
  }
}

function parseRouterResponse(raw: string, availableTools: string[]): RouteDecision {
  const normalized = raw.trim().toLowerCase()
  const validRoutes: RouteDecision[] = ["tavily", "firecrawl", "composio", "direct_llm"]
  if (validRoutes.includes(normalized as RouteDecision)) {
    const route = normalized as RouteDecision
    if (route === "direct_llm") return "direct_llm"
    const toolKey = route === "composio"
      ? availableTools.find((t) => t.startsWith("composio:"))
      : availableTools.find((t) => t === route)
    if (toolKey) return route
  }
  return "direct_llm"
}

async function runRouter(params: {
  lastUserContent: string
  availableTools: string[]
  model: ReturnType<typeof getChatModel>
}): Promise<RouteDecision> {
  const { lastUserContent, availableTools, model } = params

  if (availableTools.length === 0) return "direct_llm"

  const prompt = buildRouterPrompt(availableTools).replace("{query}", lastUserContent)
  const response = await model.invoke([
    new SystemMessage("Output exactly one word. No explanation."),
    new HumanMessage(prompt),
  ])
  const raw = String((response as { content?: unknown }).content ?? "").trim()
  return parseRouterResponse(raw, availableTools)
}

async function executeAgentPath(params: {
  tools: Parameters<typeof createReactAgent>[0]["tools"]
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
  systemMessage?: string
}): Promise<string> {
  const { tools, baseMessages, model, systemMessage = SYSTEM_MESSAGE } = params
  const agent = createReactAgent({
    llm: model,
    tools,
    prompt: systemMessage,
  })
  const result = await agent.invoke({ messages: baseMessages })
  const outputMessages = result?.messages as BaseMessage[] | undefined
  return outputMessages?.length ? extractLastResponse(outputMessages) : ""
}

async function executeDirectLlm(params: {
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
}): Promise<string> {
  const { baseMessages, model } = params
  const messages = [new SystemMessage(SYSTEM_MESSAGE), ...baseMessages]
  const response = await model.invoke(messages)
  const content = (response as { content?: unknown }).content
  return typeof content === "string" ? content : String(content ?? "")
}

const TAVILY_FORMATTING_HINT = `
When presenting web search results:
- Format links as markdown: [title](url)
- Use tables for multiple results when appropriate
- Structure lists clearly with bullet points
`

async function executeTavilyPath(params: {
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
  onToolCall: (toolName: string) => void
  onEvent: ChatGraphInput["onEvent"]
}): Promise<string> {
  const { baseMessages, model, onToolCall, onEvent } = params

  log.info("Executing tavily path")
  emitStage(onEvent, {
    type: ConversationEventType.GRAPH_STAGE,
    stage: "tavily",
    label: "Searching the web...",
  })

  const tavilyTool = getTavilyTool(onToolCall)
  if (!tavilyTool) {
    log.warn("Tavily tool not available")
    return ""
  }

  const response = await executeAgentPath({
    tools: [tavilyTool],
    baseMessages,
    model,
    systemMessage: SYSTEM_MESSAGE + TAVILY_FORMATTING_HINT,
  })
  log.info("Tavily path completed", { responseLength: response.length })
  return response
}

async function executeFirecrawlPath(params: {
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
  onToolCall: (toolName: string) => void
  onEvent: ChatGraphInput["onEvent"]
}): Promise<string> {
  const { baseMessages, model, onToolCall, onEvent } = params

  log.info("Executing firecrawl path")
  emitStage(onEvent, {
    type: ConversationEventType.GRAPH_STAGE,
    stage: "firecrawl",
    label: "Extracting page content...",
  })

  const firecrawlTool = getFirecrawlTool(onToolCall)
  if (!firecrawlTool) {
    log.warn("Firecrawl tool not available")
    return ""
  }

  const response = await executeAgentPath({
    tools: [firecrawlTool],
    baseMessages,
    model,
  })
  log.info("Firecrawl path completed", { responseLength: response.length })
  return response
}

async function executeComposioPath(params: {
  userId: string
  connectedProviders: IntegrationType[]
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
  onEvent: ChatGraphInput["onEvent"]
}): Promise<string | null> {
  const { userId, connectedProviders, baseMessages, model, onEvent } = params

  log.info("Executing composio path", { userId, connectedProviders })
  emitStage(onEvent, {
    type: ConversationEventType.GRAPH_STAGE,
    stage: "composio",
    label: "Using your connected integrations...",
  })

  try {
    const session = await createComposioSession({
      userId,
      connectedProviders,
    })
    const composioTools = await session.tools()
    log.debug("Composio session tools", {
      toolsCount: Array.isArray(composioTools) ? composioTools.length : 0,
    })

    if (!Array.isArray(composioTools) || composioTools.length === 0) {
      log.warn("Composio: no tools available")
      emitStage(onEvent, {
        type: ConversationEventType.GRAPH_STAGE,
        stage: "planning",
        label: "No Composio tools available, generating response...",
      })
      return null
    }

    const allTools = composioTools as unknown as Parameters<
      typeof createReactAgent
    >[0]["tools"]
    const response = await executeAgentPath({
      tools: allTools,
      baseMessages,
      model,
    })
    log.info("Composio path completed", { responseLength: response.length })
    return response
  } catch (err) {
    log.error("Composio session failed", err)
    emitStage(onEvent, {
      type: ConversationEventType.GRAPH_STAGE,
      stage: "planning",
      label: "Integrations unavailable, generating response...",
    })
    return null
  }
}

async function executeDirectLlmPath(params: {
  baseMessages: BaseMessage[]
  model: ReturnType<typeof getChatModel>
  onEvent: ChatGraphInput["onEvent"]
}): Promise<string> {
  const { baseMessages, model, onEvent } = params

  log.info("Executing direct_llm path")
  emitStage(onEvent, {
    type: ConversationEventType.GRAPH_STAGE,
    stage: "direct_llm",
    label: "Generating response...",
  })

  return executeDirectLlm({ baseMessages, model })
}

export async function runChatGraph(input: ChatGraphInput): Promise<string> {
  const { messages, userId, connectedProviders = [], onEvent } = input

  log.info("runChatGraph started", {
    messageCount: messages.length,
    userId: userId ?? null,
    connectedProvidersCount: connectedProviders.length,
  })

  const baseMessages = toBaseMessages(messages)
  const model = getChatModel()
  const lastUserContent =
    messages.filter((m) => m.role.toLowerCase() === "user").pop()?.content ?? ""

  const capabilities = resolveCapabilities(connectedProviders)
  const { hasTavily, hasFirecrawl, hasComposio, availableTools } = capabilities

  log.debug("Capabilities", {
    hasTavily,
    hasFirecrawl,
    hasComposio,
    availableTools,
  })

  const onToolCall = createToolCallHandler(onEvent)

  emitStage(onEvent, {
    type: ConversationEventType.GRAPH_STAGE,
    stage: "routing",
    label: "Analyzing your request...",
  })

  const route = await runRouter({
    lastUserContent,
    availableTools,
    model,
  })

  log.info("Router: selected route", { route, availableTools })

  if (route === "tavily" && hasTavily) {
    return executeTavilyPath({
      baseMessages,
      model,
      onToolCall,
      onEvent,
    })
  }

  if (route === "firecrawl" && hasFirecrawl) {
    return executeFirecrawlPath({
      baseMessages,
      model,
      onToolCall,
      onEvent,
    })
  }

  if (route === "composio" && hasComposio && userId) {
    const response = await executeComposioPath({
      userId,
      connectedProviders,
      baseMessages,
      model,
      onEvent,
    })
    if (response !== null) return response
  }

  const finalResponse = await executeDirectLlmPath({
    baseMessages,
    model,
    onEvent,
  })

  log.info("runChatGraph completed", {
    route,
    responseLength: finalResponse.length,
  })

  return finalResponse
}
