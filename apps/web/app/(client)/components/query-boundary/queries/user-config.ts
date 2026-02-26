import { useQuery } from "@tanstack/react-query";
import type { UserConfig } from "@repo/database";
import { api } from "../api-client";
import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants";

export const FETCH_USER_CONFIGS_KEYS = ["FETCH_USER_CONFIGS_KEY"];

export function useFetchUserConfig() {
  return useQuery({
    queryKey: FETCH_USER_CONFIGS_KEYS,
    queryFn: async () => {
      const res = await api.get<UserConfig | null>("/api/user-config");
      return res.data;
    },
    retry: false,
    staleTime: QUERY_STALE_TIME_MS,
  });
}
