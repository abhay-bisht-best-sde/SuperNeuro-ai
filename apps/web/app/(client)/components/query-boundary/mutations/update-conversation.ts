import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "../api-client"
import { FETCH_CONVERSATIONS_KEYS } from "../queries/conversations"
import { FETCH_CONVERSATION_KEYS } from "../queries/conversation"

export function useUpdateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      title,
    }: {
      id: string
      title: string
    }) => {
      const { data } = await api.patch(`/api/conversations/${id}`, { title })
      return data
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FETCH_CONVERSATIONS_KEYS }),
        queryClient.invalidateQueries({
          queryKey: FETCH_CONVERSATION_KEYS(variables.id),
        }),
      ])
    },
  })
}
