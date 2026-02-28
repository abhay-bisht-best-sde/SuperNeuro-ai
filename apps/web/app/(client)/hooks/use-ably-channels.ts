"use client"

import { useEffect, useMemo, useRef } from "react"

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

export interface UseAblyChannelsOptions {
  userId: string | null
  conversationIds: string[]
  onThinking: (conversationId: string) => void
  onMessage: (
    conversationId: string,
    message: ConversationMessageEvent["message"]
  ) => void
}

export function useAblyChannels(options: UseAblyChannelsOptions): void {
  const {
    userId,
    conversationIds,
    onThinking,
    onMessage,
  } = options

  const onThinkingRef = useRef(onThinking)
  const onMessageRef = useRef(onMessage)
  onThinkingRef.current = onThinking
  onMessageRef.current = onMessage

  const conversationIdsKey = useMemo(
    () => [...conversationIds].sort().join(","),
    [conversationIds]
  )

  useEffect(() => {
    if (!userId || conversationIds.length === 0) return

    const client = getAblyClient()
    const unsubscribes: (() => void)[] = []

    for (const conversationId of conversationIds) {
      const channelName = getConversationChannelName(userId, conversationId)
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
      unsubscribes.push(() => {
        channel.unsubscribe("conversation_event", handler)
        channel.detach()
      })
    }

    return () => {
      for (const unsub of unsubscribes) {
        unsub()
      }
    }
  }, [userId, conversationIdsKey])
}
