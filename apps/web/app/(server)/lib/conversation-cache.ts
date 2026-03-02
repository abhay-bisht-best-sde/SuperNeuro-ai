import type { Prisma } from "@repo/database"

import { logger } from "@/core/logger"
import { getRedis } from "@/core/redis"
import { CACHE_PREFIX, CACHE_TTL_SECONDS } from "@/(server)/core/constants"

const log = logger.withTag("conversation-cache")

export type CachedConversation = Prisma.ConversationGetPayload<{
  include: { messages: true }
}>

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
    await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data))
  } catch (error) {
    log.warn("Failed to set cached conversation", { id, error })
  }
}

export async function invalidateConversation(id: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.del(`${CACHE_PREFIX}${id}`)
  } catch (error) {
    log.warn("Failed to invalidate conversation", { id, error })
  }
}
