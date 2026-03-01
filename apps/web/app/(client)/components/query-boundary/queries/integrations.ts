import { useQuery } from "@tanstack/react-query"

import type { Integrations } from "@repo/database"

import { api } from "../api-client"
import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants"

export const FETCH_INTEGRATIONS_KEYS = ["FETCH_INTEGRATIONS"] as const

export function useIntegrations() {
  return useQuery({
    queryKey: FETCH_INTEGRATIONS_KEYS,
    queryFn: async () => {
      const res = await api.get<Integrations[]>("/api/integrations")
      return res.data
    },
    staleTime: QUERY_STALE_TIME_MS,
  })
}
