"use client"

import { useFetchUserConfig } from "@/(client)/components/query-boundary/queries"
import { QueryBoundary } from "@/(client)/components/query-boundary"
import type { UserConfig } from "@repo/database"

interface DashboardGuardProps {
  children: React.ReactNode
}

function redirectWhenNoOnboarding([userConfig]: readonly [UserConfig | null | undefined]): string | null {
  if (!userConfig || !userConfig.onboardingCompleted) return "/welcome"
  return null
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const userConfig = useFetchUserConfig()

  return (
    <QueryBoundary
      queries={[userConfig] as const}
      showEmptyWhenNoData={false}
      redirectWhen={redirectWhenNoOnboarding}
      loadingMessage="Checking for configs"
    >
      {children}
    </QueryBoundary>
  )
}