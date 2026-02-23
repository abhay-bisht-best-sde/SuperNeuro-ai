import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Prisma } from "@prisma/client"
import { FETCH_USER_CONFIGS_KEYS } from "../queries/user-config"
import { api } from "@/(client)/components/query-boundary/api-client"

export type CreateUserConfigPayload = Omit<
  Prisma.UserConfigCreateInput,
  "createdAt" | "updatedAt"
>

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
