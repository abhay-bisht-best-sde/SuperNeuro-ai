"use client"

import { useEffect, useRef } from "react"

import Ably from "ably"

import {
  ConversationEventType,
  getConversationChannelName,
  type ConversationEvent,
  type ConversationMessageEvent,
} from "@/libs/ably-types"

function getAuthUrl(): string {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/api/ably/token`
}

let ablyClient: Ably.Realtime | null = null

function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: getAuthUrl(),
      authMethod: "POST",
    })
  }
  return ablyClient
}

export interface UseAblyChannelOptions {
  userId: string | null
  conversationId: string | null
  onThinking: (conversationId: string) => void
  onMessage: (
    conversationId: string,
    message: ConversationMessageEvent["message"]
  ) => void
}

export function useAblyChannel(options: UseAblyChannelOptions): void {
  const {
    userId,
    conversationId,
    onThinking,
    onMessage,
  } = options

  const onThinkingRef = useRef(onThinking)
  const onMessageRef = useRef(onMessage)
  onThinkingRef.current = onThinking
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!userId || !conversationId) return

    const channelName = getConversationChannelName(userId, conversationId)
    const client = getAblyClient()
    const channel = client.channels.get(channelName)

    const handler = (message: { data: unknown }) => {
      const event = message.data as ConversationEvent
      if (!event) return

      if (event.type === ConversationEventType.THINKING) {
        onThinkingRef.current(conversationId)
      } else if (event.type === ConversationEventType.MESSAGE) {
        onMessageRef.current(conversationId, event.message)
      }
    }

    channel.subscribe("conversation_event", handler)

    return () => {
      channel.unsubscribe("conversation_event", handler)
      channel.detach()
    }
  }, [userId, conversationId])
}
