import Redis from "ioredis"

import { env } from "./env"

let redisClient: Redis | null = null

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
    })
  }
  return redisClient
}