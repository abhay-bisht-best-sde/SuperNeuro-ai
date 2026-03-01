import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "../api-client"
import { FETCH_USER_CONFIGS_KEYS } from "../queries/user-config"

async function updateUserIntegrations(integrationIds: string[]) {
  const { data } = await api.patch("/api/user-config", { integrationIds })
  return data
}

export function useUpdateUserIntegrations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUserIntegrations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FETCH_USER_CONFIGS_KEYS })
    },
  })
}
