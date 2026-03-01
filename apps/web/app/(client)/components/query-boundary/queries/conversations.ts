import { useQuery } from "@tanstack/react-query"

import { api } from "../api-client"
import type { ConversationListItem } from "@/(client)/libs/types"
import {
  FETCH_CONVERSATIONS_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"

export { FETCH_CONVERSATIONS_KEYS }
export type { ConversationListItem } from "@/(client)/libs/types"

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
