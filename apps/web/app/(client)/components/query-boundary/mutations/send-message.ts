import { useMutation } from "@tanstack/react-query"

import { api } from "../api-client"

export interface SendMessagePayload {
  conversationId: string
  content: string
}

export interface SendMessageResponse {
  id: string
  role: "user"
  content: string
  createdAt: string
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      await api.post<SendMessageResponse>(
        `/api/conversations/${payload.conversationId}/messages`,
        { content: payload.content }
      )
    },
  })
}
