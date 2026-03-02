import Composio from "@composio/client"
import { Composio as ComposioCore } from "@composio/core"
import { LangchainProvider } from "@composio/langchain"

import { logger } from "@/core/logger"
import { env } from "@/core/env"
import { IntegrationType } from "@repo/database"

import {
  APP_NAME_TO_INTEGRATION_TYPE,
  getComposioAuthConfigsForSession,
  INTEGRATION_TYPE_TO_COMPOSIO_SLUG,
} from "@/(server)/core/constants"
import type { ComposioToolkitSlug } from "@/(server)/core/constants"
import { DynamicStructuredTool } from "@langchain/core/tools"

export { APP_NAME_TO_INTEGRATION_TYPE }
export { VALID_COMPOSIO_PROVIDERS } from "@/(server)/core/constants"
export type { ComposioToolkitSlug } from "@/(server)/core/constants"

const log = logger.withTag("composio")

export function parseComposioAppName(
  appName: string | undefined
): IntegrationType | null {
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

export function getComposioAuthConfigId(
  provider: IntegrationType
): string | null {
  const configs = getComposioAuthConfigsForSession()
  return configs[provider] ?? null
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

  log.info("Initiating Composio connection", { userId, provider })
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

  log.success("Composio connection initiated", { provider })
  return { redirectUrl: result.redirect_url }
}

export function getComposioToolkitsForProviders(
  connectedProviders: IntegrationType[]
): ComposioToolkitSlug[] {
  const toolkits = connectedProviders
    .map((p) => INTEGRATION_TYPE_TO_COMPOSIO_SLUG[p])
    .filter(Boolean)
  return [...new Set(toolkits)]
}

let composioCoreInstance: ComposioCore | null = null

function getComposioCore(): ComposioCore {
  if (composioCoreInstance) return composioCoreInstance
  const apiKey = env.COMPOSIO_API_KEY
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY is required for Composio integration")
  }
  composioCoreInstance = new ComposioCore({
    apiKey,
    provider: new LangchainProvider(),
  }) as unknown as ComposioCore
  return composioCoreInstance
}

export async function getComposioTools(params: {
  userId: string
  connectedProviders: IntegrationType[]
}) : Promise<DynamicStructuredTool[]> {
  const { userId, connectedProviders } = params

  log.info("Fetching Composio tools", { userId, connectedProviders })
  const composio = getComposioCore()
  const toolkits = getComposioToolkitsForProviders(connectedProviders)

  if (toolkits.length === 0) {
    log.warn("No toolkits mapped for providers", { connectedProviders })
    return []
  }

  log.debug("Requesting tools for toolkits", { toolkits })

  const toolArrays = await Promise.all(
    toolkits.map((toolkit) =>
      composio.tools.get(userId, { toolkits: [toolkit], limit: 5 })
    )
  )

  const flatTools = toolArrays.flat() as unknown as DynamicStructuredTool[]

  log.success("Composio tools fetched", {
    toolkitCount: toolkits.length,
    toolCount: flatTools.length,
  })

  return flatTools
}
