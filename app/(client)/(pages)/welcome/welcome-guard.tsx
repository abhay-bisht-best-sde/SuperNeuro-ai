"use client"

import { useFetchUserConfig } from "@/(client)/components/query-boundary/queries"
import { QueryBoundary } from "@/(client)/components/query-boundary"
import type { UserConfig } from "@prisma/client"

interface WelcomeGuardProps {
  children: React.ReactNode
}

function redirectWhenOnboardingComplete([userConfig]: readonly [
  UserConfig | null | undefined
]): string | null {
  if (userConfig?.onboardingCompleted) return "/dashboard"
  return null
}

export function WelcomeGuard({ children }: WelcomeGuardProps) {
  const userConfig = useFetchUserConfig()

  return (
    <QueryBoundary
      queries={[userConfig] as const}
      showEmptyWhenNoData={false}
      redirectWhen={redirectWhenOnboardingComplete}
      loadingMessage="Checking for configs"
    >
      {children}
    </QueryBoundary>
  )
}
