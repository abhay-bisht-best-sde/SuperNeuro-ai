"use client"

import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/(client)/components/ui/button"
import { useConnectIntegration } from "@/(client)/components/query-boundary/mutations"

import { IntegrationLogo } from "@/(client)/components/panels/integration-logo"
import { useBootupState } from "../bootup/bootup-store"
import type { Integrations } from "@repo/database"

interface IProps {
  integrations: Integrations[]
}


const DEFAULT_TOOLS = [
  {
    id: "tavily",
    name: "Tavily",
    description: "Search",
    url: "https://www.tavily.com/",
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    description: "Extract site data",
    url: "https://www.firecrawl.dev/",
  },
] as const

const FAVICON_BASE = "https://favicon.im"

const INTEGRATION_LOGOS: Record<string, string> = {
  GMAIL: "https://img.icons8.com/color/96/gmail.png",
  GOOGLE_CALENDAR: "https://img.icons8.com/color/96/google-calendar.png",
  GOOGLE_DRIVE: "https://img.icons8.com/color/96/google-drive.png",
  GOOGLE_SHEETS: "https://img.icons8.com/color/96/google-sheets.png",
  GOOGLE_DOCS: "https://img.icons8.com/color/96/google-docs.png",
  NOTION: `${FAVICON_BASE}/notion.so?larger=true`,
  SLACK: `${FAVICON_BASE}/slack.com?larger=true`,
  YOUTUBE: `${FAVICON_BASE}/youtube.com?larger=true`,
  REDDIT: `${FAVICON_BASE}/reddit.com?larger=true`,
}

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
            Default tools
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">
            Always enabled. Cannot be disabled.
          </p>
          <div className="flex flex-col gap-2">
            {DEFAULT_TOOLS.map((tool) => (
              <motion.div
                key={tool.id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-muted ${tool.id === "firecrawl" ? "rounded-full" : "rounded-lg"}`}
                >
                  <IntegrationLogo
                    src={`${FAVICON_BASE}/${tool.id === "tavily" ? "tavily.com" : "firecrawl.dev"}?larger=true`}
                    alt={tool.name}
                    fallback={tool.name.charAt(0)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground">
                    {tool.name}
                  </span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    — {tool.description}
                  </span>
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={`Open ${tool.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Integrations
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">
            Connect integrations to use with Composio.
          </p>
          <div className="flex flex-col rounded-xl border border-border p-2">
            {integrations.map((integration, index) => {
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
