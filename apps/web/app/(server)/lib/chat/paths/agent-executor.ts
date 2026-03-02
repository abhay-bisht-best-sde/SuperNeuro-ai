import { createAgent } from "langchain"
import { SystemMessage, type BaseMessage } from "@langchain/core/messages"
import type { ChatOpenAI } from "@langchain/openai"

import { SYSTEM_MESSAGE } from "@/(server)/core/constants"
import {
  extractLastResponse,
  wrapToolsWithCallback,
  type LangChainTool,
  type ToolStepCallback,
} from "../utils"

type AgentTools = Parameters<typeof createAgent>[0]["tools"]

export async function executeAgentPath(params: {
  tools: AgentTools
  baseMessages: BaseMessage[]
  model: ChatOpenAI
  systemMessage?: string
  onToolCall?: ToolStepCallback
}): Promise<string> {
  const {
    tools,
    baseMessages,
    model,
    systemMessage = SYSTEM_MESSAGE,
    onToolCall,
  } = params
  const toolsToUse =
    onToolCall && Array.isArray(tools)
      ? wrapToolsWithCallback(tools as LangChainTool[], onToolCall)
      : tools
  const agent = createAgent({
    model,
    tools: toolsToUse,
    systemPrompt: systemMessage,
  })
  const result = await agent.invoke(
    { messages: baseMessages },
    { recursionLimit: 50 }
  )
  const outputMessages = result?.messages as BaseMessage[] | undefined
  return outputMessages?.length ? extractLastResponse(outputMessages) : ""
}

export async function executeDirectLlm(params: {
  baseMessages: BaseMessage[]
  model: ChatOpenAI
}): Promise<string> {
  const { baseMessages, model } = params
  const messages = [new SystemMessage(SYSTEM_MESSAGE), ...baseMessages]
  const response = await model.invoke(messages)
  const content = (response as { content?: unknown }).content
  return typeof content === "string" ? content : String(content ?? "")
}
