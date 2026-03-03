import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "../api-client"
import {
  FETCH_CONVERSATIONS_KEYS,
  FETCH_WORKFLOWS_KEYS,
  FETCH_RAG_CONVERSATIONS_KEYS,
} from "../queries/conversations"

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/conversations/${id}`)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FETCH_CONVERSATIONS_KEYS })
      await queryClient.invalidateQueries({ queryKey: FETCH_WORKFLOWS_KEYS })
      await queryClient.invalidateQueries({ queryKey: FETCH_RAG_CONVERSATIONS_KEYS })
    },
  })
}
