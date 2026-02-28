import { useQuery } from "@tanstack/react-query";

import { api } from "../api-client";
import {
  QUERY_STALE_TIME_MS,
  KNOWLEDGE_BASE_POLL_INTERVAL_MS,
} from "@/(client)/libs/constants";
import type {
  KnowledgeBaseListItem,
  KnowledgeBaseImageItem,
} from "@repo/database/types";

export const FETCH_KNOWLEDGE_BASE_KEYS = ["FETCH_KNOWLEDGE_BASE"] as const;

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
    refetchInterval: KNOWLEDGE_BASE_POLL_INTERVAL_MS,
  });
}
