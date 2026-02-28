import { useQuery } from "@tanstack/react-query"

import type { Prisma } from "@repo/database"

import { api } from "../api-client"
import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants"

export const FETCH_CONVERSATIONS_KEYS = ["FETCH_CONVERSATIONS"] as const

export type ConversationListItem = Prisma.ConversationGetPayload<true>

export function useConversations() {
  return useQuery({
    queryKey: FETCH_CONVERSATIONS_KEYS,
    queryFn: async () => {
      const res = await api.get<ConversationListItem[]>("/api/conversations")
      return res.data
    },
    staleTime: QUERY_STALE_TIME_MS,
  })
}
