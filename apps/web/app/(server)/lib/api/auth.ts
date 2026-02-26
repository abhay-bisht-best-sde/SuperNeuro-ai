import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UNAUTHORIZED_ERROR } from "./constants";

export async function requireAuth(): Promise<string | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: 401 });
  }
  return userId;
}
