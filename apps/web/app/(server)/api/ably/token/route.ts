import { NextResponse } from "next/server"

import { requireAuth } from "@/(server)/lib/auth"
import { getAblyRest } from "@/(server)/lib/ably"

export async function POST() {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const rest = getAblyRest()
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`user:${userId}:conversation:*`]: ["subscribe", "presence"],
      },
    })

    return NextResponse.json(tokenRequest)
  } catch {
    return NextResponse.json(
      { error: "Failed to create Ably token" },
      { status: 500 }
    )
  }
}
