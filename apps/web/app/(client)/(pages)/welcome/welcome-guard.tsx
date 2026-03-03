"use client"

import { useFetchUserConfig } from "@/(client)/components/query-boundary/queries"
import { QueryBoundary } from "@/(client)/components/query-boundary"
import type { UserConfigResponse } from "@repo/database/types"

interface IProps {
  children: React.ReactNode
}

function redirectWhenOnboardingComplete([data]: readonly [UserConfigResponse | undefined]): string | null {
  if (data?.userConfig?.onboardingCompleted) return "/dashboard/integrations"
  return null
}

export function WelcomeGuard(props: IProps) {
  const { children } = props
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
