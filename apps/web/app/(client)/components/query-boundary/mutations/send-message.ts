import { useMutation } from "@tanstack/react-query"

import type {
  SendMessagePayload,
  SendMessageResponse,
} from "@/(client)/libs/types"
import { api } from "../api-client"

export type { SendMessagePayload, SendMessageResponse } from "@/(client)/libs/types"

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
