import type { BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"
import { createAgent } from "langchain"

import { createComposioSession } from "@/(server)/lib/composio"
import type { ChecklistEmitter } from "../checklist-emitter"
import { runComposioPlanner } from "../router"
import { filterToolsByProviders, type LangChainTool } from "../utils"
import { executeAgentPath } from "./agent-executor"

import type { IntegrationType } from "@repo/database"

type AgentTools = Parameters<typeof createAgent>[0]["tools"]

export async function executeComposioPath(params: {
  userId: string
  connectedProviders: IntegrationType[]
  baseMessages: BaseMessage[]
  lastUserContent: string
  model: ChatOpenAI
  emitter: ChecklistEmitter
}): Promise<string | null> {
  const {
    userId,
    connectedProviders,
    baseMessages,
    lastUserContent,
    model,
    emitter,
  } = params

  const { providers: selectedProviders, intent } =
    await runComposioPlanner({
      query: lastUserContent,
      connectedProviders,
      model,
    })

  emitter.addStage("planning", intent, { intent })

  try {
    const session = await createComposioSession({
      userId,
      connectedProviders,
    })

    const composioTools = await session.tools()

    if (!Array.isArray(composioTools) || composioTools.length === 0) {
      emitter.addStage(
        "planning",
        "No integrations available, generating response..."
      )
      return null
    }

    const filteredTools = filterToolsByProviders(
      composioTools as LangChainTool[],
      selectedProviders.length > 0
        ? selectedProviders
        : connectedProviders
    )

    const toolsToUse =
      filteredTools.length > 0 ? filteredTools : (composioTools as LangChainTool[])

    const response = await executeAgentPath({
      tools: toolsToUse as AgentTools,
      baseMessages,
      model,
      onToolCall: emitter.onToolStep,
    })

    return response || ""
  } catch (err) {
    emitter.addStage(
      "planning",
      "Integrations unavailable, generating response..."
    )
    return null
  }
}
