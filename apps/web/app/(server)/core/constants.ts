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

export const SYSTEM_MESSAGE = `You are SuperNeuro.ai — an action-oriented workflow co-pilot. Help users automate and execute tasks across their connected tools (Google Workspace, Notion, Slack, YouTube, Reddit, Tavily, Firecrawl). Be concise, use tools proactively, and format results clearly with markdown.`

export const SYSTEM_MESSAGE_OBJ = {
  role: MessageRole.SYSTEM.toLowerCase(),
  content: SYSTEM_MESSAGE,
}

/** Canonical Composio toolkit slugs — single source of truth for Composio API */
export const COMPOSIO_TOOLKIT_SLUGS = [
  "firecrawl",
  "tavily",
  "reddit",
  "youtube",
  "slack",
  "notion",
  "googledocs",
  "googlesheets",
  "googledrive",
  "googlecalendar",
  "gmail",
] as const

export type ComposioToolkitSlug = (typeof COMPOSIO_TOOLKIT_SLUGS)[number]

/** Map our IntegrationType (DB/enum) to Composio toolkit slug (API) */
export const INTEGRATION_TYPE_TO_COMPOSIO_SLUG: Record<
  IntegrationType,
  ComposioToolkitSlug
> = {
  GMAIL: "gmail",
  GOOGLECALENDAR: "googlecalendar",
  GOOGLEDRIVE: "googledrive",
  GOOGLESHEETS: "googlesheets",
  GOOGLEDOCS: "googledocs",
  NOTION: "notion",
  SLACK: "slack",
  YOUTUBE: "youtube",
  REDDIT: "reddit",
  TAVILY: "tavily",
  FIRECRAWL: "firecrawl",
}

export const APP_NAME_TO_INTEGRATION_TYPE: Record<string, IntegrationType> = {
  GMAIL: IntegrationType.GMAIL,
  GOOGLECALENDAR: IntegrationType.GOOGLECALENDAR,
  GOOGLEDRIVE: IntegrationType.GOOGLEDRIVE,
  GOOGLESHEETS: IntegrationType.GOOGLESHEETS,
  GOOGLEDOCS: IntegrationType.GOOGLEDOCS,
  NOTION: IntegrationType.NOTION,
  SLACK: IntegrationType.SLACK,
  YOUTUBE: IntegrationType.YOUTUBE,
  REDDIT: IntegrationType.REDDIT,
  TAVILY: IntegrationType.TAVILY,
  FIRECRAWL: IntegrationType.FIRECRAWL,
}

export const VALID_COMPOSIO_PROVIDERS = [
  "GMAIL",
  "GOOGLECALENDAR",
  "GOOGLEDRIVE",
  "GOOGLESHEETS",
  "GOOGLEDOCS",
  "NOTION",
  "SLACK",
  "YOUTUBE",
  "REDDIT",
  "TAVILY",
  "FIRECRAWL",
] as const satisfies readonly IntegrationType[]

export function getComposioAuthConfigsForSession(): Partial<
  Record<IntegrationType, string>
> {
  return {
    GMAIL: env.COMPOSIO_AUTH_CONFIG_GMAIL,
    GOOGLECALENDAR: env.COMPOSIO_AUTH_CONFIG_GOOGLECALENDAR,
    GOOGLEDRIVE: env.COMPOSIO_AUTH_CONFIG_GOOGLEDRIVE,
    GOOGLESHEETS: env.COMPOSIO_AUTH_CONFIG_GOOGLESHEETS,
    GOOGLEDOCS: env.COMPOSIO_AUTH_CONFIG_GOOGLEDOCS,
    NOTION: env.COMPOSIO_AUTH_CONFIG_NOTION,
    SLACK: env.COMPOSIO_AUTH_CONFIG_SLACK,
    YOUTUBE: env.COMPOSIO_AUTH_CONFIG_YOUTUBE,
    REDDIT: env.COMPOSIO_AUTH_CONFIG_REDDIT,
    TAVILY: env.COMPOSIO_AUTH_CONFIG_TAVILY,
    FIRECRAWL: env.COMPOSIO_AUTH_CONFIG_FIRECRAWL,
  }
}

