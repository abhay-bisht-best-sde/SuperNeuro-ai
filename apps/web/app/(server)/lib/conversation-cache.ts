import type { Prisma } from "@repo/database"

import { getRedis } from "@/core/redis"

export type CachedConversation = Prisma.ConversationGetPayload<{
  include: { messages: true }
}>

const CACHE_PREFIX = "conv:"
const TTL_SECONDS = 300 // 5 minutes

export async function getCachedConversation(
  id: string
): Promise<CachedConversation | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const raw = await redis.get(`${CACHE_PREFIX}${id}`)
    if (!raw) return null
    return JSON.parse(raw) as CachedConversation
  } catch {
    return null
  }
}

export async function setCachedConversation(
  id: string,
  data: CachedConversation
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    const key = `${CACHE_PREFIX}${id}`
    await redis.setex(key, TTL_SECONDS, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to set cached conversation ${id}`, error)
  }
}

export async function invalidateConversation(id: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.del(`${CACHE_PREFIX}${id}`)
  } catch (error) {
    console.error(`Failed to invalidate conversation ${id}`, error)
  }
}
