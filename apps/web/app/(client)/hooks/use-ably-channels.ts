"use client"

import { useEffect, useMemo, useRef } from "react"

import Ably from "ably"

import {
  ConversationEventType,
  getConversationChannelName,
  type ConversationEvent,
  type ConversationGraphStageEvent,
  type ConversationMessageEvent,
  type ConversationRequiresConnectionEvent,
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
  onGraphStage: (
    conversationId: string,
    event: ConversationGraphStageEvent
  ) => void
  onMessage: (
    conversationId: string,
    message: ConversationMessageEvent["message"]
  ) => void
  onTokenStream: (conversationId: string, token: string) => void
  onRequiresConnection: (
    conversationId: string,
    event: ConversationRequiresConnectionEvent
  ) => void
}

export function useAblyChannels(options: UseAblyChannelsOptions): void {
  const {
    userId,
    conversationIds,
    onThinking,
    onGraphStage,
    onMessage,
    onTokenStream,
    onRequiresConnection,
  } = options

  const onThinkingRef = useRef(onThinking)
  const onGraphStageRef = useRef(onGraphStage)
  const onMessageRef = useRef(onMessage)
  const onTokenStreamRef = useRef(onTokenStream)
  const onRequiresConnectionRef = useRef(onRequiresConnection)

  onThinkingRef.current = onThinking
  onGraphStageRef.current = onGraphStage
  onMessageRef.current = onMessage
  onTokenStreamRef.current = onTokenStream
  onRequiresConnectionRef.current = onRequiresConnection

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

        switch (event.type) {
          case ConversationEventType.THINKING:
            onThinkingRef.current(conversationId)
            break
          case ConversationEventType.GRAPH_STAGE:
            onGraphStageRef.current(conversationId, event)
            break
          case ConversationEventType.MESSAGE:
            onMessageRef.current(conversationId, event.message)
            break
          case ConversationEventType.TOKEN_STREAM:
            onTokenStreamRef.current(conversationId, event.token)
            break
          case ConversationEventType.REQUIRES_CONNECTION:
            onRequiresConnectionRef.current(conversationId, event)
            break
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
