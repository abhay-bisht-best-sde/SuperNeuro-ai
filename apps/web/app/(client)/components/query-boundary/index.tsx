"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { QueryBoundary } from "./query-boundary"

import { QUERY_STALE_TIME_MS } from "@/(client)/libs/constants"

export { QueryBoundary }
export type { QueryBoundaryProps } from "./query-boundary"
export {
  useFetchUserConfig,
  FETCH_USER_CONFIGS_KEYS,
  useIntegrations,
  FETCH_INTEGRATIONS_KEYS,
  useKnowledgeBase,
  FETCH_KNOWLEDGE_BASE_KEYS,
  useConversations,
  FETCH_CONVERSATIONS_KEYS,
  useConversation,
  FETCH_CONVERSATION_KEYS,
} from "./queries"
export type {
  ConversationListItem,
  ConversationWithMessages,
} from "./queries"
export {
  useInsertUserConfig,
  useUpdateUserIntegrations,
  useStoreFileMetadata,
  useRetryKnowledgeBase,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useSendMessage,
} from "./mutations"
export { LoadingState } from "./components/loading-state"
export { ErrorState } from "./components/error-state"
export { EmptyState } from "./components/empty-state"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function QueryProvider(props: { children: React.ReactNode }) {
  const { children } = props
  const [queryClient] = useState(getQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
