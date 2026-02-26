import { useQuery } from "@tanstack/react-query";
import type { KnowledgeBase } from "@/(client)/libs/store";
import { api } from "../api-client";
import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants";
import type { KnowledgeBaseIndexingStatus } from "@repo/database/types"

export const FETCH_KNOWLEDGE_BASE_KEYS = ["FETCH_KNOWLEDGE_BASE"] as const;

interface KnowledgeBaseApiItem {
  id: string;
  name: string;
  sourceType: "document";
  lastUpdated: string;
  status: KnowledgeBaseIndexingStatus
  progress?: number;
}

export function useKnowledgeBase() {
  return useQuery({
    queryKey: FETCH_KNOWLEDGE_BASE_KEYS,
    queryFn: async () => {
      const res = await api.get<KnowledgeBaseApiItem[]>("/api/knowledge-base");
      return res.data.map((item) => ({
        ...item,
        lastUpdated: new Date(item.lastUpdated),
      })) as KnowledgeBase[];
    },
    staleTime: QUERY_STALE_TIME_MS,
  });
}
