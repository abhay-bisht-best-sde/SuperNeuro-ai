"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"

import { useAuth } from "@clerk/nextjs"
import { useQueryClient } from "@tanstack/react-query"

import {
  useConversation,
  useCreateConversation,
  useSendMessage,
} from "@/(client)/components/query-boundary"
import type { SidebarSection } from "@/(client)/libs/types"
import { useAblyChannels } from "@/(client)/hooks/use-ably-channels"

import type { Message } from "@repo/database"
import type { ConversationWithMessages } from "@/(client)/components/query-boundary"
import {
  ConversationMessageEvent,
  type ConversationGraphStageEvent,
  type RagSource,
} from "@/libs/ably-types"
import { FETCH_CONVERSATION_KEYS } from "@/(client)/components/query-boundary"

type CachedMessage = Pick<Message, "id" | "role" | "content" | "createdAt"> & {
  executionStepsWithStatus?: { ragSources?: RagSource[] } | null
  ragSources?: RagSource[]
}

type ConversationActivity = {
  isTyping: boolean
  graphStage: ConversationGraphStageEvent | null
}

export function useConversations(activeSection: SidebarSection = "workflows") {
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  )
  const prevSectionRef = useRef<SidebarSection>(activeSection)

  useEffect(() => {
    if (prevSectionRef.current !== activeSection) {
      prevSectionRef.current = activeSection
      setActiveConversationId(null)
    }
  }, [activeSection])
  const [pendingByConv, setPendingByConv] = useState<Map<string, CachedMessage[]>>(
    () => new Map()
  )
  const [activityByConv, setActivityByConv] = useState<
    Map<string, ConversationActivity>
  >(() => new Map())
  const activeIdRef = useRef<string | null>(null)
  activeIdRef.current = activeConversationId

  const conversationQuery = useConversation(activeConversationId)
  const createType = activeSection === "rag" ? "RAG" : "WORKFLOW"
  const createConversation = useCreateConversation(createType)
  const sendMessage = useSendMessage()

  const data = conversationQuery.data
  const isForActive =
    data && activeConversationId && data.id === activeConversationId

  const serverMessages: CachedMessage[] = isForActive ? data.messages : []
  const pending = activeConversationId
    ? (pendingByConv.get(activeConversationId) ?? [])
    : []
  const hasPending = Boolean(
    activeConversationId && pending.length > serverMessages.length
  )

  const messages: CachedMessage[] = hasPending ? pending : serverMessages

  useEffect(() => {
    if (!activeConversationId) return
    if (!data || data.id !== activeConversationId) return
    if (pending.length > data.messages.length) return

    setPendingByConv((prev) => {
      const next = new Map(prev)
      next.set(activeConversationId, data.messages)
      return next
    })
  }, [activeConversationId, data, pending.length])

  const subscribeIds = useMemo(() => {
    const ids = new Set<string>()
    if (activeConversationId) ids.add(activeConversationId)
    activityByConv.forEach((_, id) => ids.add(id))
    return Array.from(ids)
  }, [activeConversationId, activityByConv])

  const onThinking = useCallback((convId: string) => {
    setActivityByConv((prev) => {
      const next = new Map(prev)
      next.set(convId, { isTyping: true, graphStage: null })
      return next
    })
  }, [])

  const onGraphStage = useCallback(
    (convId: string, event: ConversationGraphStageEvent) => {
      setActivityByConv((prev) => {
        const next = new Map(prev)
        const current = next.get(convId)
        next.set(convId, {
          isTyping: current?.isTyping ?? true,
          graphStage: event,
        })
        return next
      })
    },
    []
  )

  const onMessage = useCallback(
    (convId: string, msg: ConversationMessageEvent["message"]) => {
      setActivityByConv((prev) => {
        const next = new Map(prev)
        next.delete(convId)
        return next
      })
      if (activeIdRef.current === convId) {
        const assistantMsg: CachedMessage = {
          id: msg.id,
          role: "ASSISTANT",
          content: msg.content,
          createdAt: new Date(msg.createdAt),
          ragSources: msg.ragSources,
        }
        setPendingByConv((prev) => {
          const next = new Map(prev)
          const list = next.get(convId) ?? []
          next.set(convId, [...list, assistantMsg])
          return next
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: FETCH_CONVERSATION_KEYS(convId),
        })
      }
    },
    [queryClient]
  )

  useAblyChannels({
    userId: userId ?? null,
    conversationIds: subscribeIds,
    onThinking,
    onGraphStage,
    onMessage,
  })

  const activeConversation: ConversationWithMessages | null = useMemo(() => {
    if (!activeConversationId) return null
    const base = data && data.id === activeConversationId ? data : null
    return {
      id: activeConversationId,
      userId: userId ?? "",
      title: base?.title ?? "New Conversation",
      createdAt: base?.createdAt ?? new Date(),
      updatedAt: base?.updatedAt ?? new Date(),
      messages: messages as Message[],
    } as ConversationWithMessages
  }, [activeConversationId, data, messages, userId])

  const activeActivity = activeConversationId
    ? activityByConv.get(activeConversationId) ?? null
    : null
  const isTyping = activeActivity?.isTyping ?? false
  const graphStage = activeActivity?.graphStage ?? null

  const handleNewConversation = useCallback(() => {
    createConversation.mutate(undefined, {
      onSuccess: (res: { id: string }) => setActiveConversationId(res.id),
    })
  }, [createConversation])

  const handleConversationCreated = useCallback((id: string) => {
    setActiveConversationId(id)
  }, [])

  const handleConversationDeleted = useCallback((id: string) => {
    if (activeConversationId === id) setActiveConversationId(null)
    setPendingByConv((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setActivityByConv((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [activeConversationId])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeConversationId) return

      const userMsg: CachedMessage = {
        id: `msg-${Date.now()}`,
        role: "USER",
        content,
        createdAt: new Date(),
      }

      setActivityByConv((prev) => {
        const next = new Map(prev)
        next.set(activeConversationId, {
          isTyping: true,
          graphStage: null,
        })
        return next
      })
      setPendingByConv((prev) => {
        const next = new Map(prev)
        const list = next.get(activeConversationId) ?? serverMessages
        next.set(activeConversationId, [...list, userMsg])
        return next
      })
      sendMessage.mutate({ conversationId: activeConversationId, content })
    },
    [activeConversationId, serverMessages, sendMessage]
  )

  return {
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    isConversationLoading:
      conversationQuery.isLoading || conversationQuery.isFetching,
    isTyping: Boolean(isTyping),
    graphStage,
    handleNewConversation,
    handleConversationCreated,
    handleConversationDeleted,
    handleSendMessage,
  }
}
