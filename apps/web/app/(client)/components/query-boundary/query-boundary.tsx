"use client"

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { redirect } from "next/navigation"

import { EmptyState } from "./components/empty-state"
import { ErrorState } from "./components/error-state"
import { LoadingState } from "./components/loading-state"

type QueryData<T extends readonly UseQueryResult<unknown, Error>[]> = {
  [K in keyof T]: T[K] extends UseQueryResult<infer D, Error> ? D : never
}

export interface QueryBoundaryProps<
  TQueries extends readonly UseQueryResult<unknown, Error>[],
  TMutations extends readonly UseMutationResult<unknown, Error, unknown>[] = []
> {
  queries: TQueries
  mutations?: TMutations
  showEmptyWhenNoData?: boolean
  loadingMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  children: React.ReactNode
  redirectWhen?: (data: QueryData<TQueries>) => string | null
}

function isEmpty(data: unknown): boolean {
  if (data === null || data === undefined) return true
  if (Array.isArray(data) && data.length === 0) return true
  return false
}

export function QueryBoundary<
  TQueries extends readonly UseQueryResult<unknown, Error>[],
  TMutations extends readonly UseMutationResult<unknown, Error, unknown>[] = []
>(props: QueryBoundaryProps<TQueries, TMutations>) {
  const {
    queries,
    mutations = [] as unknown as TMutations,
    showEmptyWhenNoData = false,
    redirectWhen,
    loadingMessage = "Loading…",
    emptyTitle = "No data",
    emptyDescription = "There's nothing here yet.",
    children,
  } = props

  const anyLoading = queries.some((q) => q.isLoading || q.isPending)
  const anyMutationPending = mutations.some((m) => m.isPending)
  const anyError = queries.find((q) => q.isError)
  const anyEmpty =
    showEmptyWhenNoData &&
    queries.some((q) => !q.isLoading && !q.isError && isEmpty(q.data))

  const handleRetry = () => {
    queries.forEach((q) => q.refetch?.())
  }

  if (anyLoading || anyMutationPending) {
    return (
      <LoadingState
        message={
          anyMutationPending && !anyLoading ? "Saving…" : loadingMessage
        }
      />
    )
  }

  if (anyError) {
    return (
      <ErrorState
        message={
          anyError.error instanceof Error
            ? anyError.error.message
            : "Something went wrong"
        }
        onRetry={handleRetry}
      />
    )
  }

  if (redirectWhen && queries.length > 0) {
    const data = queries.map((q) => q.data) as QueryData<TQueries>
    const path = redirectWhen(data)
    if (path) redirect(path)
  }

  if (anyEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return <>{children}</>
}
