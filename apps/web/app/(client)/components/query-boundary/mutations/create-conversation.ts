import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "../api-client"
import {
  FETCH_CONVERSATIONS_KEYS,
  FETCH_WORKFLOWS_KEYS,
  FETCH_RAG_CONVERSATIONS_KEYS,
} from "../queries/conversations"

export type CreateConversationType = "WORKFLOW" | "RAG"

export function useCreateConversation(type: CreateConversationType = "WORKFLOW") {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/conversations", { type })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FETCH_CONVERSATIONS_KEYS })
      await queryClient.invalidateQueries({ queryKey: FETCH_WORKFLOWS_KEYS })
      await queryClient.invalidateQueries({ queryKey: FETCH_RAG_CONVERSATIONS_KEYS })
    },
  })
}
