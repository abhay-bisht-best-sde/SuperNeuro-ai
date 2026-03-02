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
    
    1. Route to "composio" ONLY if the user wants to perform an action on an external system:
       - Send, draft, search, or read emails → GMAIL
       - Create/edit/read spreadsheets → GOOGLESHEETS
       - Create/edit/read documents → GOOGLEDOCS
       - Manage files → GOOGLEDRIVE
       - Schedule events → GOOGLECALENDAR
       - Search live web or fetch current information → TAVILY
       - Scrape a specific URL → FIRECRAWL
       - Interact with Slack, Notion, YouTube, Reddit → respective provider
    
    2. Route to "direct_llm" if the request is:
       - Explanation
       - Brainstorming
       - Coding
       - Writing
       - Summarization
       - General knowledge
       - Any task that does NOT require performing an external action
    
    3. Multi-step tasks:
       If the request requires multiple external systems, include ALL required providers.
       Example:
       - "Research AI trends and add to a Google Sheet"
         → composio with ["TAVILY","GOOGLESHEETS"]
    
    4. Follow-up behavior:
       If the user refers to a previous tool action (e.g., "send it", "share that document", "add more rows"),
       route to composio using the same relevant provider(s).
    
    5. Do NOT route to composio just because an integration name appears in the text.
       Only route to composio if an actual external action is required.
    
    User Query:
    "${query}"
    
    Respond strictly in JSON format:
    {
      "route": "composio" | "direct_llm",
      "providers": ["PROVIDER1","PROVIDER2"],
      "intent": "short intent summary (max 5 words)"
    }`
}
