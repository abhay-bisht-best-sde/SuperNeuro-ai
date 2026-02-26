import { NextResponse } from "next/server";
import { BODY_TOO_LARGE_ERROR, FORBIDDEN_ERROR } from "./constants";

export function validateBodySize(
  contentLength: string | null,
  maxSize: number
): NextResponse | null {
  if (!contentLength) return null;
  const size = parseInt(contentLength, 10);
  if (!Number.isNaN(size) && size > maxSize) {
    return NextResponse.json({ error: BODY_TOO_LARGE_ERROR }, { status: 413 });
  }
  return null;
}

export function validateUserKey(key: string, userId: string): NextResponse | null {
  if (!key.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: FORBIDDEN_ERROR }, { status: 403 });
  }
  return null;
}
