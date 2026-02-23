import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FETCH_USER_CONFIGS_KEYS } from "../queries/user-config"
import { api } from "../api-client"

export interface CreateUserConfigPayload {
  purpose: string
  companyName: string
  teamSize: string
  industry: string
  useCases: string[]
}

async function createUserConfig(payload: CreateUserConfigPayload) {
  const { data } = await api.post("/api/user-config", payload)
  return data
}

export function useInsertUserConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUserConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FETCH_USER_CONFIGS_KEYS })
    },
  })
}
