import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages"

import { logger } from "@/core/logger"

import type { IntegrationType } from "@repo/database"

import type { ChatOpenAI } from "@langchain/openai"
import { PROVIDER_DISPLAY_NAMES, type RouteDecision } from "./utils"

const log = logger.withTag("chat-router")

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

export async function runRouter(params: {
  lastUserContent: string
  availableTools: string[]
  model: ChatOpenAI
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

export async function runComposioPlanner(params: {
  query: string
  connectedProviders: IntegrationType[]
  model: ChatOpenAI
}): Promise<{ providers: IntegrationType[]; intent: string }> {
  const { query, connectedProviders, model } = params

  if (connectedProviders.length === 0) {
    return { providers: [], intent: "No integrations connected" }
  }

  const providerList = connectedProviders
    .map((p) => `${p}: ${PROVIDER_DISPLAY_NAMES[p] ?? p}`)
    .join("\n- ")

  const prompt = `You are a planner. Given the user query and their connected integrations, pick ONLY the providers needed to fulfill the request.

Connected providers:
- ${providerList}

User query: "${query}"

Rules:
- Pick the MINIMUM set of providers. If the query is about emails, pick only GMAIL.
- If about calendar/events, pick only GOOGLE_CALENDAR.
- If about spreadsheets, pick only GOOGLE_SHEETS.
- If about documents, pick only GOOGLE_DOCS.
- If about files/folders, pick only GOOGLE_DRIVE.
- If about Notion, pick only NOTION.
- If about Slack, pick only SLACK.
- If about YouTube/videos, pick only YOUTUBE.
- If about Reddit, pick only REDDIT.
- If the query needs multiple (e.g. "email my calendar to slack"), list all needed.
- Output ONLY comma-separated provider names from the connected list. Example: GMAIL or GMAIL,SLACK
- Also output a brief intent on the next line after "INTENT:". Example: INTENT: Search emails and share to Slack

Output format:
PROVIDERS: GMAIL,SLACK
INTENT: Search emails and share summary to Slack`

  const response = await model.invoke([
    new SystemMessage("You are a planner. Output only the requested format."),
    new HumanMessage(prompt),
  ])
  const raw = String((response as { content?: unknown }).content ?? "").trim()

  const providersMatch = raw.match(/PROVIDERS?:\s*([A-Z_,\s]+)/i)
  const intentMatch = raw.match(/INTENT:\s*(.+)/i)

  const providersRaw = providersMatch?.[1]?.trim() ?? ""
  const selectedProviders = providersRaw
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => connectedProviders.includes(s as IntegrationType)) as IntegrationType[]

  const intent = intentMatch?.[1]?.trim() ?? "Using integrations"

  if (selectedProviders.length === 0) {
    return { providers: connectedProviders, intent }
  }

  log.info("Composio planner", { query, selectedProviders, intent })
  return { providers: selectedProviders, intent }
}
