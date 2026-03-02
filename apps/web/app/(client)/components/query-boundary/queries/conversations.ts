import { useQuery } from "@tanstack/react-query"

import { api } from "../api-client"
import type { ConversationListItem } from "@/(client)/libs/types"
import {
  FETCH_CONVERSATIONS_KEYS,
  FETCH_WORKFLOWS_KEYS,
  FETCH_RAG_CONVERSATIONS_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"

export { FETCH_CONVERSATIONS_KEYS, FETCH_WORKFLOWS_KEYS, FETCH_RAG_CONVERSATIONS_KEYS }
export type { ConversationListItem } from "@/(client)/libs/types"

export type ConversationTypeFilter = "WORKFLOW" | "RAG"

export function useConversations(typeFilter?: ConversationTypeFilter) {
  const queryKey = typeFilter
    ? (["FETCH_CONVERSATIONS", typeFilter] as const)
    : FETCH_CONVERSATIONS_KEYS

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = typeFilter
        ? `/api/conversations?type=${typeFilter}`
        : "/api/conversations"
      const res = await api.get<ConversationListItem[]>(url)
      return res.data
    },
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function useWorkflows() {
  return useConversations("WORKFLOW")
}

export function useRagConversations() {
  return useConversations("RAG")
}
