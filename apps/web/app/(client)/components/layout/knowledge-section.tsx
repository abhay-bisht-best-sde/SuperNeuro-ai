"use client"

import {
  useKnowledgeBase,
  QueryBoundary,
} from "@/(client)/components/query-boundary"

import { KnowledgePanel } from "@/(client)/components/panels/knowledge-panel"

interface IProps {
  onAddKnowledgeBase: () => void
  onRetry: (id: string) => void
}

export function KnowledgeSection(props: IProps) {
  const { onAddKnowledgeBase, onRetry } = props
  const knowledgeBaseQuery = useKnowledgeBase()

  return (
    <QueryBoundary
      queries={[knowledgeBaseQuery] as const}
      loadingMessage="Loading knowledge bases…"
    >
      <KnowledgePanel
        knowledgeBases={knowledgeBaseQuery.data ?? []}
        onAddKnowledgeBase={onAddKnowledgeBase}
        onRetry={onRetry}
      />
    </QueryBoundary>
  )
}
