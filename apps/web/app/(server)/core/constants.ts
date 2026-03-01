import { MessageRole, IntegrationType } from "@repo/database"

import { env } from "@/core/env"

export const MAX_BODY_SIZE_KB = 1024
export const MAX_BODY_SIZE_MB = 1024 * 1024
export const R2_BUCKET_ERROR = "R2 bucket not configured"
export const UNAUTHORIZED_ERROR = "Unauthorized"
export const FORBIDDEN_ERROR = "Forbidden"
export const BODY_TOO_LARGE_ERROR = "Request body too large"
export const INTERNAL_ERROR = "Internal Server Error"

export const ALLOWED_CONTENT_TYPES = ["application/pdf"] as const
export const SIGNED_URL_EXPIRES_SEC = 3600
export const MAX_PART_NUMBER = 10_000
export const MAX_RETRY_ATTEMPTS = 3

export const CACHE_PREFIX = "conv:"
export const CACHE_TTL_SECONDS = 300

export const SYSTEM_MESSAGE = `
You are SuperNeuro.ai, an intelligent workflow co-pilot.

Your purpose is to help users automate, organize, retrieve, create, and execute tasks across connected tools such as Notion, Google Workspace (Docs, Sheets, Drive, Gmail, Calendar), Slack, and other integrated platforms.

You are not a generic chatbot.
You are an action-oriented productivity assistant.
`

export const SYSTEM_MESSAGE_OBJ = {
  role: MessageRole.SYSTEM.toLowerCase(),
  content: SYSTEM_MESSAGE,
}

export const TAVILY_WEB_SEARCH = "TAVILY_WEB_SEARCH"
export const FIRECRAWL_SCRAPE_URL = "FIRECRAWL_SCRAPE_URL"
export const API_TOOLS = [TAVILY_WEB_SEARCH, FIRECRAWL_SCRAPE_URL] as const

export const APP_NAME_TO_INTEGRATION_TYPE: Record<string, IntegrationType> = {
  GMAIL: IntegrationType.GMAIL,
  GOOGLE_CALENDAR: IntegrationType.GOOGLE_CALENDAR,
  GOOGLE_DRIVE: IntegrationType.GOOGLE_DRIVE,
  GOOGLE_SHEETS: IntegrationType.GOOGLE_SHEETS,
  GOOGLE_DOCS: IntegrationType.GOOGLE_DOCS,
  NOTION: IntegrationType.NOTION,
  SLACK: IntegrationType.SLACK,
  YOUTUBE: IntegrationType.YOUTUBE,
  REDDIT: IntegrationType.REDDIT,
}

export const VALID_COMPOSIO_PROVIDERS = [
  "GMAIL",
  "GOOGLE_CALENDAR",
  "GOOGLE_DRIVE",
  "GOOGLE_SHEETS",
  "GOOGLE_DOCS",
  "NOTION",
  "SLACK",
  "YOUTUBE",
  "REDDIT",
] as const satisfies readonly IntegrationType[]

export function getComposioAuthConfigsForSession(): Partial<
  Record<IntegrationType, string>
> {
  return {
    GMAIL: env.COMPOSIO_AUTH_CONFIG_GMAIL,
    GOOGLE_CALENDAR: env.COMPOSIO_AUTH_CONFIG_GOOGLE_CALENDAR,
    GOOGLE_DRIVE: env.COMPOSIO_AUTH_CONFIG_GOOGLE_DRIVE,
    GOOGLE_SHEETS: env.COMPOSIO_AUTH_CONFIG_GOOGLE_SHEETS,
    GOOGLE_DOCS: env.COMPOSIO_AUTH_CONFIG_GOOGLE_DOCS,
    NOTION: env.COMPOSIO_AUTH_CONFIG_NOTION,
    SLACK: env.COMPOSIO_AUTH_CONFIG_SLACK,
    YOUTUBE: env.COMPOSIO_AUTH_CONFIG_YOUTUBE,
    REDDIT: env.COMPOSIO_AUTH_CONFIG_REDDIT,
  }
}

