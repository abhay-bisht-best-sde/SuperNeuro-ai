import { NextResponse } from "next/server"

import { z } from "zod"

import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import {
  initiateComposioConnection,
  getComposioAuthConfigId,
  VALID_COMPOSIO_PROVIDERS,
} from "@/(server)/lib/composio"
import { INTERNAL_ERROR } from "@/(server)/core/constants"

const log = logger.withTag("api/integrations/connect")

const connectBodySchema = z.object({
  provider: z.enum(VALID_COMPOSIO_PROVIDERS),
  returnUrl: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const parsed = connectBodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid or missing provider" },
        { status: 400 }
      )
    }
    const { provider, returnUrl } = parsed.data

    const authConfigId = getComposioAuthConfigId(provider)
    if (!authConfigId) {
      return NextResponse.json(
        {
          error: `Composio auth config not configured for ${provider}. Add COMPOSIO_AUTH_CONFIG_${provider} to your environment.`,
        },
        { status: 400 }
      )
    }

    const url = new URL(req.url)
    const callbackUrlBase = `${url.origin}/api/integrations/callback`
    const callbackParams = new URLSearchParams()
    callbackParams.set("provider", provider)
    if (returnUrl) {
      callbackParams.set("returnUrl", returnUrl)
    }
    const callbackUrl = `${callbackUrlBase}?${callbackParams.toString()}`

    const { redirectUrl } = await initiateComposioConnection({
      userId,
      provider,
      callbackUrl,
    })

    log.success("Composio connection initiated", { userId, provider })
    return NextResponse.json({ redirectUrl })
  } catch (err) {
    log.error("Composio connect failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
