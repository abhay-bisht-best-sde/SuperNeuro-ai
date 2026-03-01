import { useQuery } from "@tanstack/react-query";

import { api } from "../api-client";
import {
  FETCH_KNOWLEDGE_BASE_KEYS,
  KNOWLEDGE_BASE_POLL_INTERVAL_MS,
  QUERY_STALE_TIME_MS,
} from "@/(client)/libs/constants"
import type {
  KnowledgeBaseListItem,
  KnowledgeBaseImageItem,
} from "@repo/database/types"

export { FETCH_KNOWLEDGE_BASE_KEYS }

type KnowledgeBaseApiResponse = Omit<
  KnowledgeBaseListItem,
  "lastUpdated" | "images"
> & {
  lastUpdated: string | null;
  images: (Omit<KnowledgeBaseImageItem, "createdAt"> & {
    createdAt: string;
  })[];
};

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
          images: item.images.map((img) => ({
            ...img,
            createdAt: new Date(img.createdAt),
          })),
        })
      );
    },
    staleTime: QUERY_STALE_TIME_MS,
    // refetchInterval: KNOWLEDGE_BASE_POLL_INTERVAL_MS,
  });
}
