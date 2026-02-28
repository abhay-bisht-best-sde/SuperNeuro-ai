import { useQuery } from "@tanstack/react-query"

import type { Prisma } from "@repo/database"

import { api } from "../api-client"
import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants"

export const FETCH_CONVERSATION_KEYS = (id: string | null) =>
  ["FETCH_CONVERSATION", id] as const

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: { messages: true }
}>

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: FETCH_CONVERSATION_KEYS(id),
    queryFn: async () => {
      if (!id) return null
      const res = await api.get<ConversationWithMessages>(
        `/api/conversations/${id}`
      )
      return res.data
    },
    enabled: !!id,
    staleTime: QUERY_STALE_TIME_MS,
  })
}
