import { useQuery } from "@tanstack/react-query"
import type { UserConfig } from "@prisma/client"
import { api } from "@/(client)/components/query-boundary/api-client"

export type { UserConfig }

export const FETCH_USER_CONFIGS_KEYS = ["FETCH_USER_CONFIGS_KEY"]
export const userConfigKeys = FETCH_USER_CONFIGS_KEYS

export function useFetchUserConfig() {
  return useQuery({
    queryKey: FETCH_USER_CONFIGS_KEYS,
    queryFn: async () => {
      const res = await api.get<UserConfig | null>("/api/user-config")
      return res.data
    },
    retry: false,
    staleTime: 60_000,
  })
}
