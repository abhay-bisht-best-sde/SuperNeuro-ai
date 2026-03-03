import { VALID_COMPOSIO_PROVIDERS } from "@/(server)/core/constants"
import type { IntegrationType } from "@repo/database"

const PROVIDER_CAPS: Record<string, string> = {
  GMAIL: "emails, threads, send/read/search mail",
  GOOGLECALENDAR: "events, schedule, meetings, availability",
  GOOGLEDRIVE: "files, folders, upload/download",
  GOOGLESHEETS: "spreadsheets, Excel, worksheets, cell data",
  GOOGLEDOCS: "documents, Google Docs, create/read/edit",
  NOTION: "pages, databases, Notion workspace",
  SLACK: "messages, channels, Slack workspace",
  YOUTUBE: "videos, YouTube search, channels, trending",
  REDDIT: "posts, subreddits, Reddit search, comments",
  TAVILY: "web search, current events, real-time info, research",
  FIRECRAWL: "scrape/read a specific URL, extract page content",
}

export const ROUTER_SYSTEM_MESSAGE =
  "Return valid JSON only. No markdown. No explanation."

export function buildRouterPrompt(params: {
  query: string
  connectedProviders: IntegrationType[]
  conversationHistory?: string
}): string {
  const { query, connectedProviders, conversationHistory } = params

  const connectedSet = new Set(connectedProviders)
  const allProviders = VALID_COMPOSIO_PROVIDERS as readonly string[]

  const integrations = allProviders
    .map((p) => {
      const status = connectedSet.has(p as IntegrationType)
        ? "[connected]"
        : "[not connected]"
      return `${p} ${status}: ${PROVIDER_CAPS[p] ?? p}`
    })
    .join("\n")

  const historyBlock = conversationHistory
    ? `\nRECENT CONVERSATION (use this to understand follow-ups):\n${conversationHistory}\n`
    : ""

    return `You are a routing engine that decides how to execute a user request.

    Your job:
    - Decide whether the request requires external integrations (composio)
    - Or can be handled purely by the LLM (direct_llm)
    - Select ALL integrations required for the task (even if not connected)
    
    AVAILABLE INTEGRATIONS:
    ${integrations}
    
    ${historyBlock}
    
    ROUTING PRINCIPLES:

    1. Route to "composio" if the user wants to perform an action on an external system:
       - Send, draft, search, or read emails → GMAIL
       - Create/edit/read spreadsheets → GOOGLESHEETS
       - Create/edit/read documents → GOOGLEDOCS
       - Manage files → GOOGLEDRIVE
       - Schedule events → GOOGLECALENDAR
       - Search the web, find links, find resources, research a topic, get current/latest info → TAVILY
       - Scrape or extract content from a specific URL → FIRECRAWL
       - Interact with Slack, Notion, YouTube, Reddit → respective provider

    2. Route to "composio" with TAVILY when the user wants:
       - To find, search, or discover information online
       - Links, resources, articles, or references on a topic
       - Current/recent/latest news or data
       - Research or "look up" anything that requires real-time web data
       - Learning resources, tutorials, or guides (user wants actual links)

    3. Route to "direct_llm" ONLY if the request can be fully answered from the LLM's knowledge:
       - Explaining a concept the LLM already knows
       - Brainstorming ideas
       - Writing code or text
       - Summarizing content already provided in the conversation
       - General knowledge questions that don't need real-time data or links

    4. Multi-step tasks:
       If the request requires multiple external systems, include ALL required providers.
       Example:
       - "Research AI trends and add to a Google Sheet"
         → composio with ["TAVILY","GOOGLESHEETS"]

    5. Follow-up behavior:
       If the user refers to a previous tool action (e.g., "send it", "share that document", "add more rows"),
       route to composio using the same relevant provider(s).

    6. Do NOT route to composio just because an integration name appears in the text.
       Only route to composio if an actual external action is required.

    7. When in doubt between direct_llm and composio+TAVILY, prefer composio+TAVILY if the user would benefit from real, up-to-date links or data.
    
    User Query:
    "${query}"
    
    Respond strictly in JSON format:
    {
      "route": "composio" | "direct_llm",
      "providers": ["PROVIDER1","PROVIDER2"],
      "intent": "short intent summary (max 5 words)"
    }`
}
