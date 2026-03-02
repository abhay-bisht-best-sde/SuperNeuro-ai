import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

import { logger } from "@/core/logger"
import { env } from "@/core/env"

import {
  TAVILY_WEB_SEARCH,
  FIRECRAWL_SCRAPE_URL,
} from "@/(server)/core/constants"
import type {
  ToolExecutionResult,
  TavilySearchInput,
  FirecrawlScrapeInput,
} from "@/(server)/core/types"

export { TAVILY_WEB_SEARCH, FIRECRAWL_SCRAPE_URL }
export type { ToolExecutionResult, TavilySearchInput, FirecrawlScrapeInput } from "@/(server)/core/types"

export type ApiToolEventCallback = (toolName: string) => void

const log = logger.withTag("api-tools")

export function getTavilyTool(
  onToolCall?: ApiToolEventCallback
): DynamicStructuredTool | null {
  if (!env.TAVILY_API_KEY) return null
  return new DynamicStructuredTool({
    name: TAVILY_WEB_SEARCH,
    description: `Search the web for real-time information. Use when the user asks about:
- Current events, news, or recent happenings
- Facts that may have changed (prices, statistics, company info)
- Research on any topic requiring up-to-date sources
- Finding articles, blog posts, or documentation
- General knowledge questions where web results would help`,
    schema: z.object({
      query: z.string().describe("The search query to look up on the web"),
      max_results: z.number().min(1).max(20).default(5),
      search_depth: z
        .enum(["basic", "advanced", "fast", "ultra-fast"])
        .default("basic"),
      topic: z.enum(["general", "news", "finance"]).default("general"),
    }),
    func: async (input) => {
      const inputObj = input as TavilySearchInput
      log.info("Tavily search invoked", { query: inputObj.query })
      onToolCall?.(TAVILY_WEB_SEARCH)
      const result = await executeTavilySearch(inputObj)
      log.debug("Tavily search result", {
        successful: result.successful,
        hasError: Boolean(result.error),
      })
      return JSON.stringify(result.error ? { error: result.error } : result.data)
    },
  })
}

export function getFirecrawlTool(
  onToolCall?: ApiToolEventCallback
): DynamicStructuredTool | null {
  if (!env.FIRECRAWL_API_KEY) return null
  return new DynamicStructuredTool({
    name: FIRECRAWL_SCRAPE_URL,
    description: `Extract and parse content from a specific webpage URL. Use when the user:
- Provides a URL they want to read, summarize, or analyze
- Asks to extract text, markdown, or HTML from a web page
- Needs content from a specific article, documentation, or blog post
- Wants to process or understand the contents of a given link`,
    schema: z.object({
      url: z.string().url().describe("The full URL of the webpage to scrape"),
      formats: z.array(z.enum(["markdown", "html"])).default(["markdown"]),
      onlyMainContent: z.boolean().default(true),
    }),
    func: async (input) => {
      const inputObj = input as FirecrawlScrapeInput
      log.info("Firecrawl scrape invoked", { url: inputObj.url })
      onToolCall?.(FIRECRAWL_SCRAPE_URL)
      const result = await executeFirecrawlScrape(inputObj)
      log.debug("Firecrawl scrape result", {
        successful: result.successful,
        hasError: Boolean(result.error),
      })
      return JSON.stringify(result.error ? { error: result.error } : result.data)
    },
  })
}

export async function executeTavilySearch(
  input: TavilySearchInput
): Promise<ToolExecutionResult> {
  const apiKey = env.TAVILY_API_KEY
  if (!apiKey) {
    log.warn("Tavily: API key not configured")
    return { error: "TAVILY_API_KEY is not configured", successful: false }
  }

  log.debug("Tavily: fetching", { query: input.query, max_results: input.max_results })
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: input.query,
        max_results: input.max_results ?? 5,
        search_depth: input.search_depth ?? "basic",
        topic: input.topic ?? "general",
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const body = data as Record<string, unknown>
      const errMsg =
        (typeof body.detail === "string" ? body.detail : null) ??
        (typeof body.error === "string" ? body.error : null) ??
        `HTTP ${res.status}`
      log.warn("Tavily: request failed", { status: res.status, error: errMsg })
      return { error: errMsg, successful: false }
    }

    log.debug("Tavily: success")
    return { data, successful: true }
  } catch (err) {
    log.error("Tavily: fetch error", err)
    return {
      error: err instanceof Error ? err.message : String(err),
      successful: false,
    }
  }
}

export async function executeFirecrawlScrape(
  input: FirecrawlScrapeInput
): Promise<ToolExecutionResult> {
  const apiKey = env.FIRECRAWL_API_KEY
  if (!apiKey) {
    log.warn("Firecrawl: API key not configured")
    return { error: "FIRECRAWL_API_KEY is not configured", successful: false }
  }

  log.debug("Firecrawl: scraping", { url: input.url })
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: input.url,
        formats: input.formats ?? ["markdown"],
        onlyMainContent: input.onlyMainContent ?? true,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const body = data as Record<string, unknown>
      const errMsg =
        (typeof body.error === "string" ? body.error : null) ??
        `HTTP ${res.status}`
      log.warn("Firecrawl: request failed", { status: res.status, error: errMsg })
      return { error: errMsg, successful: false }
    }

    log.debug("Firecrawl: success")
    return { data, successful: true }
  } catch (err) {
    log.error("Firecrawl: fetch error", err)
    return {
      error: err instanceof Error ? err.message : String(err),
      successful: false,
    }
  }
}
