import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages"

import { getChatModel } from "@/(server)/lib/openai-chat-client"
import { SYSTEM_MESSAGE } from "@/(server)/core/constants"

const ChatState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (left, right) =>
      Array.isArray(right) ? [...left, ...right] : [...left, right],
    default: () => [],
  }),
  response: Annotation<string>(),
})

type ChatStateType = typeof ChatState.State

const inputNode = (state: ChatStateType) => state

const generationNode = async (state: ChatStateType) => {
  const model = getChatModel()

  const langchainMessages = state.messages.map(
    (m: { role: string; content: string }) => {
      if (m.role === "system") return new SystemMessage(m.content)
      if (m.role === "user") return new HumanMessage(m.content)
      return new AIMessage(m.content)
    }
  )

  const messagesWithSystem = [
    new SystemMessage(SYSTEM_MESSAGE),
    ...langchainMessages,
  ]

  const response = await model.invoke(messagesWithSystem)
  const content =
    typeof response.content === "string"
      ? response.content
      : String(response.content)

  return { response: content }
}

const outputNode = (state: ChatStateType) => ({ response: state.response })

const chatGraph = new StateGraph(ChatState)
  .addNode("input", inputNode)
  .addNode("generation", generationNode)
  .addNode("output", outputNode)
  .addEdge(START, "input")
  .addEdge("input", "generation")
  .addEdge("generation", "output")
  .addEdge("output", END)
  .compile()

export interface ChatGraphInput {
  messages: Array<{ role: string; content: string }>
}

export async function runChatGraph(input: ChatGraphInput): Promise<string> {
  const result = await chatGraph.invoke(input)
  return result.response ?? ""
}
