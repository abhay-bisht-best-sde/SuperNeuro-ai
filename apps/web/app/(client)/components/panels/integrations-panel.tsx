"use client"

import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/(client)/components/ui/button"
import { useConnectIntegration } from "@/(client)/components/query-boundary/mutations"

import { IntegrationLogo } from "@/(client)/components/panels/integration-logo"
import { useBootupState } from "../bootup/bootup-store"
import type { Integrations } from "@repo/database"

interface IProps {
  integrations: Integrations[]
}


import {
  INTEGRATION_LOGOS,
} from "@/(client)/libs/constants"

function formatIntegrationName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

function getIntegrationLogo(name: string): string {
  return INTEGRATION_LOGOS[name] ?? ""
}

export function IntegrationsPanel(props: IProps) {
  const { integrations } = props
  const searchParams = useSearchParams()
  const { connectedProviders } = useBootupState()
  const connectIntegration = useConnectIntegration()

  useEffect(() => {
    const result = searchParams.get("integration")
    if (result === "connected") {
      toast.success("Integration connected successfully")
    } else if (result === "error") {
      toast.error("Failed to connect integration")
    }
  }, [searchParams])

  const handleConnect = useCallback(
    async (integration: Integrations) => {
      try {
        const data = await connectIntegration.mutateAsync({
          provider: integration.name,
          returnUrl: "/dashboard/integrations",
        })
        if (data?.redirectUrl) {
          window.location.href = data.redirectUrl
          return
        }
      } catch (err) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? String(err.response.data.error)
            : "Failed to connect integration"
        toast.error(message)
      }
    },
    [connectIntegration]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 p-3">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Integrations
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">
            Connect integrations for your AI assistant.
          </p>
          <div className="flex flex-col rounded-xl border border-border p-2">
            {integrations.map((integration) => {
                const isConnected = connectedProviders.includes(integration.name)
                const logoUrl = getIntegrationLogo(integration.name)
                const isConnecting =
                  connectIntegration.isPending &&
                  connectIntegration.variables?.provider === integration.name

                return (
                  <motion.div
                    key={integration.id}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-muted ${integration.name === "NOTION" ? "rounded-full" : "rounded-lg"}`}
                    >
                      {logoUrl ? (
                        <IntegrationLogo
                          src={logoUrl}
                          alt={formatIntegrationName(integration.name)}
                          fallback={
                            formatIntegrationName(integration.name).charAt(0)
                          }
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted-foreground/20 text-xs font-medium text-muted-foreground">
                          {formatIntegrationName(integration.name).charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {formatIntegrationName(integration.name)}
                    </span>
                    <Button
                      variant={isConnected ? "secondary" : "outline"}
                      size="sm"
                      loading={isConnecting}
                      onClick={() => handleConnect(integration)}
                      disabled={isConnecting}
                    >
                      {!isConnecting && (isConnected ? "Connected" : "Connect")}
                    </Button>
                  </motion.div>
                )
              })}
          </div>
        </section>
      </div>
    </div>
  )
}
