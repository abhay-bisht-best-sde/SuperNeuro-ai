import { useQuery } from "@tanstack/react-query"

import type { Integrations } from "@repo/database"

import { api } from "../api-client"
import {
  FETCH_INTEGRATIONS_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"

export { FETCH_INTEGRATIONS_KEYS }

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
