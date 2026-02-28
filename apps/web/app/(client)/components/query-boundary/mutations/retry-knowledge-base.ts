import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FETCH_KNOWLEDGE_BASE_KEYS } from "../queries/knowledge-base";
import { api } from "../api-client";

async function retryKnowledgeBase(knowledgeBaseId: string) {
  const { data } = await api.post(
    `/api/knowledge-base/${knowledgeBaseId}/retry`
  );
  return data;
}

export function useRetryKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FETCH_KNOWLEDGE_BASE_KEYS });
    },
  });
}
