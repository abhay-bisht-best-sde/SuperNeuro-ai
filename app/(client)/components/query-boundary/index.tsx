"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { QueryBoundary } from "./query-boundary"

export { QueryBoundary }
export type { QueryBoundaryProps } from "./query-boundary"
export { useFetchUserConfig, userConfigKeys } from "./queries"
export { useInsertUserConfig } from "./mutations"
export { LoadingState } from "./components/loading-state"
export { ErrorState } from "./components/error-state"
export { EmptyState } from "./components/empty-state"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
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

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient)
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
