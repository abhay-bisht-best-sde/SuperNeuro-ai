import Ably from "ably"

import { env } from "@/core/env"

import type { ConversationEvent } from "@/libs/ably-types"
import { getConversationChannelName } from "@/libs/ably-types"

export {
  ConversationEventType,
  getConversationChannelName,
  type ConversationEvent,
  type ConversationMessageEvent,
  type ConversationThinkingEvent,
} from "@/libs/ably-types"

const RestPromise = Ably.Rest.Promise
type AblyRest = InstanceType<typeof RestPromise>

let restClient: AblyRest | null = null

export function getAblyRest(): AblyRest {
  if (!restClient) {
    const apiKey = env.ABLY_API_KEY
    if (!apiKey) {
      throw new Error("ABLY_API_KEY is required for Ably")
    }
    restClient = new RestPromise({ key: apiKey })
  }
  return restClient
}

export function getConversationChannel(
  userId: string,
  conversationId: string
): ReturnType<AblyRest["channels"]["get"]> {
  const channelName = getConversationChannelName(userId, conversationId)
  return getAblyRest().channels.get(channelName)
}

export async function publishConversationEvent(
  userId: string,
  conversationId: string,
  event: ConversationEvent
): Promise<void> {
  const channel = getConversationChannel(userId, conversationId)
  await channel.publish("conversation_event", event)
}
