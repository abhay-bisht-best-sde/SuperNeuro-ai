import { useQuery } from "@tanstack/react-query";

import { api } from "../api-client";
import {
  FETCH_KNOWLEDGE_BASE_KEYS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"
import type { KnowledgeBaseListItem } from "@repo/database/types"

export { FETCH_KNOWLEDGE_BASE_KEYS }

type KnowledgeBaseApiResponse = Omit<KnowledgeBaseListItem, "lastUpdated"> & {
  lastUpdated: string | null;
}

export function useKnowledgeBase() {
  return useQuery({
    queryKey: FETCH_KNOWLEDGE_BASE_KEYS,
    queryFn: async () => {
      const res = await api.get<KnowledgeBaseApiResponse[]>(
        "/api/knowledge-base"
      );
      return res.data.map(
        (item): KnowledgeBaseListItem => ({
          ...item,
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : undefined,
        })
      );
    },
    staleTime: QUERY_STALE_TIME_MS,
    refetchInterval: 5_000,
  });
}
