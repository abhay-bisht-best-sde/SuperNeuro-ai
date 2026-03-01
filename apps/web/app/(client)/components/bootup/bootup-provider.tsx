"use client"

import { useEffect } from "react"

import { useAuth } from "@clerk/nextjs"

import {
  useIntegrations,
  useFetchUserConfig,
  QueryBoundary,
} from "@/(client)/components/query-boundary"

import { useBootupStore } from "./bootup-store"

interface BootupWrapperProps {
  children: React.ReactNode
}

interface BootupWrapperContentProps {
  children: React.ReactNode
  integrationsQuery: ReturnType<typeof useIntegrations>
  userConfigQuery: ReturnType<typeof useFetchUserConfig>
}

function BootupWrapperContent(props: BootupWrapperContentProps) {
  const { children, integrationsQuery, userConfigQuery } = props
  const setBootupState = useBootupStore((s) => s.setBootupState)

  useEffect(() => {
    setBootupState({
      integrations: integrationsQuery.data ?? [],
      selectedIntegrationIds: userConfigQuery.data?.integrationIds ?? [],
      userConfig: userConfigQuery.data ?? null,
      isReady: true,
    })
  }, [
    integrationsQuery.data,
    userConfigQuery.data,
    setBootupState,
  ])

  return <>{children}</>
}

export function BootupWrapper(props: BootupWrapperProps) {
  const { children } = props

  const { isSignedIn } = useAuth()
  const integrationsQuery = useIntegrations()
  const userConfigQuery = useFetchUserConfig()
  const setBootupState = useBootupStore((s) => s.setBootupState)

  useEffect(() => {
    if (!isSignedIn) {
      setBootupState({
        integrations: [],
        selectedIntegrationIds: [],
        userConfig: null,
        isReady: true,
      })
    }
  }, [isSignedIn, setBootupState])

  if (!isSignedIn) {
    return <>{children}</>
  }

  return (
    <QueryBoundary
      queries={[integrationsQuery, userConfigQuery] as const}
      loadingMessage="Loading…"
    >
      <BootupWrapperContent
        integrationsQuery={integrationsQuery}
        userConfigQuery={userConfigQuery}
      >
        {children}
      </BootupWrapperContent>
    </QueryBoundary>
  )
}

