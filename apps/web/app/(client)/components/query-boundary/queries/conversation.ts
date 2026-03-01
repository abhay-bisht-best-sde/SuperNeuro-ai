import { useQuery } from "@tanstack/react-query"

import { api } from "../api-client"
import type { ConversationWithMessages } from "@/(client)/libs/types"
import {
  FETCH_CONVERSATION_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"

export { FETCH_CONVERSATION_KEYS }
export type { ConversationWithMessages } from "@/(client)/libs/types"

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
