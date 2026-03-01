"use client"

import {
  useIntegrations,
  QueryBoundary,
} from "@/(client)/components/query-boundary"

import { IntegrationsPanel } from "@/(client)/components/panels/integrations-panel"

export function IntegrationsSection() {
  const integrationsQuery = useIntegrations()

  return (
    <QueryBoundary
      queries={[integrationsQuery] as const}
      loadingMessage="Loading integrations…"
    >
      <IntegrationsPanel integrations={integrationsQuery.data ?? []} />
    </QueryBoundary>
  )
}
