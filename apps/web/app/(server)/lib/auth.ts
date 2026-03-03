import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { logger } from "@/core/logger";
import { UNAUTHORIZED_ERROR } from "../core/constants";

const log = logger.withTag("api/auth");

export async function requireAuth(): Promise<string | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    log.warn("Auth failed: unauthenticated request");
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: 401 });
  }
  return userId;
}
