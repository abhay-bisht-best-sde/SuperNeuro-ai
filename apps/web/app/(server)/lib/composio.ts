import Composio from "@composio/client"

import { env } from "@/core/env"
import { IntegrationType } from "@repo/database"

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

export function parseComposioAppName(appName: string | undefined): IntegrationType | null {
  if (!appName) return null
  const normalized = appName.toUpperCase().replace(/-/g, "_")
  return APP_NAME_TO_INTEGRATION_TYPE[normalized] ?? null
}

export function parseComposioCallbackParams(url: URL): {
  status: string | null
  connectedAccountId: string | null
  appName: string | null
} {
  return {
    status: url.searchParams.get("status"),
    connectedAccountId:
      url.searchParams.get("connectedAccountId") ??
      url.searchParams.get("connected_account_id"),
    appName:
      url.searchParams.get("appName") ?? url.searchParams.get("app_name"),
  }
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

const AUTH_CONFIG_MAP: Record<IntegrationType, string | undefined> = {
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

export function getComposioAuthConfigId(provider: IntegrationType): string | null {
  const id = AUTH_CONFIG_MAP[provider]
  return id ?? null
}

export function createComposioClient(): Composio {
  const apiKey = env.COMPOSIO_API_KEY
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY is required for Composio integration")
  }
  return new Composio({ apiKey })
}

export async function initiateComposioConnection(params: {
  userId: string
  provider: IntegrationType
  callbackUrl: string
}): Promise<{ redirectUrl: string }> {
  const { userId, provider, callbackUrl } = params
  
  const authConfigId = getComposioAuthConfigId(provider)
  if (!authConfigId) {
    throw new Error(`No Composio auth config for provider: ${provider}`)
  }

  const composio = createComposioClient()
  const result = await composio.link.create({
    user_id: userId,
    auth_config_id: authConfigId,
    callback_url: callbackUrl,
  })

  return { redirectUrl: result.redirect_url }
}
