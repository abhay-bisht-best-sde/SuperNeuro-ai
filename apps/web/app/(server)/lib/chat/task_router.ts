import { HumanMessage, SystemMessage } from "@langchain/core/messages"

import { logger } from "@/core/logger"

import { VALID_COMPOSIO_PROVIDERS } from "@/(server)/core/constants"
import type { IntegrationType } from "@repo/database"
import type { ChatOpenAI } from "@langchain/openai"

import {
  ROUTER_SYSTEM_MESSAGE,
  buildRouterPrompt,
} from "./prompts/router-prompt"

const log = logger.withTag("chat-router")

export type RouteDecision = "composio" | "direct_llm"

export interface RouteAndPlanResult {
  route: RouteDecision
  /** All providers the task needs (may include not-yet-connected ones) */
  providers: IntegrationType[]
  /** Subset of providers that are already connected — safe to execute */
  connectedProviders: IntegrationType[]
  /** Providers the task needs but the user hasn't connected yet */
  missingProviders: IntegrationType[]
  intent: string
}

/**
 * Single LLM call — routes the query AND selects providers in one shot.
 * Knows about ALL possible providers (not just connected) so it can detect
 * when a user needs a provider they haven't connected yet.
 *
 * Accepts optional `conversationHistory` so the router can make correct
 * decisions for follow-up messages (e.g. "give me the link" after a tool
 * call that created a Google Doc).
 */
export async function routeAndPlan(params: {
  query: string
  connectedProviders: IntegrationType[]
  model: ChatOpenAI
  conversationHistory?: string
}): Promise<RouteAndPlanResult> {
  const { query, connectedProviders, model, conversationHistory } = params

  const prompt = buildRouterPrompt({
    query,
    connectedProviders,
    conversationHistory,
  })

  try {
    const response = await model.invoke([
      new SystemMessage(ROUTER_SYSTEM_MESSAGE),
      new HumanMessage(prompt),
    ])
    const raw = String(
      (response as { content?: unknown }).content ?? ""
    ).trim()

    log.info("Router raw output", { raw })
    return parseRouteAndPlanResponse(raw, connectedProviders)
  } catch (err) {
    log.error("Router LLM call failed, falling back to direct_llm", err)
    return {
      route: "direct_llm",
      providers: [],
      connectedProviders: [],
      missingProviders: [],
      intent: "Router error",
    }
  }
}

function parseRouteAndPlanResponse(
  raw: string,
  userConnectedProviders: IntegrationType[]
): RouteAndPlanResult {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim()

  const connectedSet = new Set(userConnectedProviders)
  const validProviderSet = new Set(VALID_COMPOSIO_PROVIDERS as readonly string[])

  try {
    const parsed = JSON.parse(cleaned) as {
      route?: string
      providers?: string[]
      intent?: string
    }

    const rawRoute = (parsed.route ?? "").trim().toLowerCase()
    const route: RouteDecision =
      rawRoute === "composio" ? "composio" : "direct_llm"

    const providers = (parsed.providers ?? [])
      .map((p: string) => p.trim().toUpperCase())
      .filter((p: string) => validProviderSet.has(p)) as IntegrationType[]

    const connected = providers.filter((p) => connectedSet.has(p))
    const missing = providers.filter((p) => !connectedSet.has(p))

    const intent = (parsed.intent ?? "Processing request").slice(0, 60)

    log.info("Router decision", { route, providers, connected, missing, intent })
    return { route, providers, connectedProviders: connected, missingProviders: missing, intent }
  } catch {
    log.warn("Router: failed to parse JSON, falling back", { raw: cleaned })
    return {
      route: "direct_llm",
      providers: [],
      connectedProviders: [],
      missingProviders: [],
      intent: "Parse error",
    }
  }
}
