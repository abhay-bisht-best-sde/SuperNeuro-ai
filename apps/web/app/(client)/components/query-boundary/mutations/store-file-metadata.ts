import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { StoreFileMetadataPayload } from "@/(client)/libs/types"
import { FETCH_KNOWLEDGE_BASE_KEYS } from "../queries/knowledge-base"
import { api } from "../api-client"

export type { StoreFileMetadataPayload } from "@/(client)/libs/types"

async function storeFileMetadata(payload: StoreFileMetadataPayload) {
  const { data } = await api.post("/api/store-file-metadata", payload)
  return data
}

export function useStoreFileMetadata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeFileMetadata,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FETCH_KNOWLEDGE_BASE_KEYS })
    },
  })
}
