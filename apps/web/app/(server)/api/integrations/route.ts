import { NextResponse } from "next/server"

import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { requireAuth } from "@/(server)/lib/auth"
import { INTERNAL_ERROR } from "@/(server)/core/constants"

const log = logger.withTag("api/integrations")

export async function GET() {
  try {
    log.info("Get integrations request")
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const integrations = await prisma.integrations.findMany({
      orderBy: { name: "asc" },
    })

    log.success("Integrations fetched", { count: integrations.length })
    return NextResponse.json(integrations)
  } catch (err) {
    log.error("Integrations fetch failed", err)
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 })
  }
}
