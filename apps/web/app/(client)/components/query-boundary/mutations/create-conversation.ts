import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "../api-client"
import { FETCH_CONVERSATIONS_KEYS } from "../queries/conversations"

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/conversations")
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FETCH_CONVERSATIONS_KEYS })
    },
  })
}
