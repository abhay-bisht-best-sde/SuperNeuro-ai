import { useQuery } from "@tanstack/react-query"

import type { UserConfigResponse } from "@repo/database/types"

import { api } from "../api-client"
import {
  FETCH_USER_CONFIGS_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"

export { FETCH_USER_CONFIGS_KEYS }

export function useFetchUserConfig() {
  return useQuery({
    queryKey: FETCH_USER_CONFIGS_KEYS,
    queryFn: async () => {
      const res = await api.get<UserConfigResponse>("/api/user-config")
      return res.data
    },
    retry: false,
    staleTime: QUERY_STALE_TIME_MS,
  })
}
