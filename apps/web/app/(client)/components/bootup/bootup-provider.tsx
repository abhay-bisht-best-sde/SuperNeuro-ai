"use client"

import { useEffect } from "react"

import { useAuth } from "@clerk/nextjs"

import {
  useFetchUserConfig,
  QueryBoundary,
} from "@/(client)/components/query-boundary"

import { useBootupStore } from "./bootup-store"

interface IProps {
  children: React.ReactNode
}

interface IContentProps {
  children: React.ReactNode
  userConfigQuery: ReturnType<typeof useFetchUserConfig>
}

function BootupWrapperContent(props: IContentProps) {
  const { children, userConfigQuery } = props
  const setBootupState = useBootupStore((s) => s.setBootupState)

  useEffect(() => {
    const data = userConfigQuery.data
    setBootupState({
      connectedProviders: data?.connectedProviders ?? [],
      userConfig: data?.userConfig ?? null,
      isReady: true,
    })
  }, [userConfigQuery.data, setBootupState])

  return <>{children}</>
}

export function BootupWrapper(props: IProps) {
  const { children } = props

  const { isSignedIn } = useAuth()
  const userConfigQuery = useFetchUserConfig()
  const setBootupState = useBootupStore((s) => s.setBootupState)

  useEffect(() => {
    if (!isSignedIn) {
      setBootupState({
        integrations: [],
        connectedProviders: [],
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
      queries={[userConfigQuery] as const}
      loadingMessage="Loading…"
    >
      <BootupWrapperContent userConfigQuery={userConfigQuery}>
        {children}
      </BootupWrapperContent>
    </QueryBoundary>
  )
}

