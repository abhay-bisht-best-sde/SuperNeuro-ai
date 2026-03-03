import Redis from "ioredis"

import { logger } from "@/core/logger"
import { env } from "@/core/env"
import { CACHE_PREFIX, CACHE_TTL_SECONDS } from "@/(server)/core/constants"

const log = logger.withTag("conversation-cache")

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = env.REDIS_URL
  if (!url) {
    log.warn("REDIS_URL not set — conversation caching disabled")
    return null
  }
  redis = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true })
  redis.on("error", (err) => log.error("Redis error", err))
  return redis
}

function key(conversationId: string): string {
  return `${CACHE_PREFIX}${conversationId}`
}

export async function getCachedConversation(conversationId: string): Promise<Record<string, unknown> | null> {
  try {
    const client = getRedis()
    if (!client) return null
    const raw = await client.get(key(conversationId))
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    log.error("Cache get failed", err)
    return null
  }
}

export async function setCachedConversation(conversationId: string, data: unknown): Promise<void> {
  try {
    const client = getRedis()
    if (!client) return
    await client.set(key(conversationId), JSON.stringify(data), "EX", CACHE_TTL_SECONDS)
  } catch (err) {
    log.error("Cache set failed", err)
  }
}

export async function invalidateConversation(conversationId: string): Promise<void> {
  try {
    const client = getRedis()
    if (!client) return
    await client.del(key(conversationId))
  } catch (err) {
    log.error("Cache invalidate failed", err)
  }
}
