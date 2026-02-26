import type { KnowledgeBaseIndexingStatus } from "@repo/database/types"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  timestamp: Date
  messages: Message[]
}

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  knowledgeBases: string[]
}

export interface KnowledgeBase {
  id: string
  name: string
  sourceType: "document"
  lastUpdated: Date
  status: KnowledgeBaseIndexingStatus
  progress?: number
}

export type SidebarSection = "conversations" | "agents" | "knowledge"

export const sampleConversations: Conversation[] = [
  {
    id: "1",
    title: "Healthy eating tips",
    timestamp: new Date("2026-02-21T10:30:00"),
    messages: [
      {
        id: "m1",
        role: "user",
        content:
          "Describe to me the basic principles of healthy eating. Briefly, but with all the important aspects, please, also you can tell me a little more about the topic of sports and training",
        timestamp: new Date("2026-02-21T10:30:00"),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Basic principles of a healthy diet:\nBalance: Make sure your diet contains all the essential macro and micronutrients in the correct proportions: carbohydrates, proteins, fats, vitamins and minerals. It is important to maintain a balance of calories to meet your body's needs, but not to overeat.",
        timestamp: new Date("2026-02-21T10:30:15"),
      },
      {
        id: "m3",
        role: "user",
        content: "Tell me more about it, please",
        timestamp: new Date("2026-02-21T10:31:00"),
      },
    ],
  },
  {
    id: "2",
    title: "React performance optimization",
    timestamp: new Date("2026-02-20T14:00:00"),
    messages: [
      {
        id: "m4",
        role: "user",
        content: "How can I optimize React component rendering?",
        timestamp: new Date("2026-02-20T14:00:00"),
      },
      {
        id: "m5",
        role: "assistant",
        content:
          "Here are key strategies for optimizing React rendering:\n\n1. **React.memo()** - Wrap components that receive the same props frequently\n2. **useMemo()** - Memoize expensive calculations\n3. **useCallback()** - Memoize callback functions passed to children\n4. **Code splitting** - Use React.lazy() and Suspense\n5. **Virtual lists** - Use react-window for long lists",
        timestamp: new Date("2026-02-20T14:00:15"),
      },
    ],
  },
  {
    id: "3",
    title: "API design best practices",
    timestamp: new Date("2026-02-19T09:00:00"),
    messages: [],
  },
  {
    id: "4",
    title: "Database schema design",
    timestamp: new Date("2026-02-18T16:30:00"),
    messages: [],
  },
  {
    id: "5",
    title: "TypeScript generics explained",
    timestamp: new Date("2026-02-17T11:00:00"),
    messages: [],
  },
]

export const sampleAgents: Agent[] = [
  {
    id: "a1",
    name: "Code Assistant",
    description: "Helps with code review, debugging, and writing clean code",
    model: "GPT-4o",
    knowledgeBases: ["Documentation", "Codebase"],
  },
  {
    id: "a2",
    name: "Content Writer",
    description:
      "Generates blog posts, documentation, and marketing copy with consistent tone",
    model: "GPT-4o Mini",
    knowledgeBases: ["Style Guide"],
  },
  {
    id: "a3",
    name: "Data Analyst",
    description:
      "Analyzes datasets and generates insights with visualizations",
    model: "Claude 3.5 Sonnet",
    knowledgeBases: ["Analytics DB"],
  },
]

export const sampleKnowledgeBases: KnowledgeBase[] = [
  {
    id: "kb1",
    name: "Documentation",
    sourceType: "document",
    lastUpdated: new Date("2026-02-20"),
    status: "completed",
  },
  {
    id: "kb2",
    name: "Codebase",
    sourceType: "document",
    lastUpdated: new Date("2026-02-19"),
    status: "indexing",
    progress: 65,
  },
  {
    id: "kb3",
    name: "Style Guide",
    sourceType: "document",
    lastUpdated: new Date("2026-02-18"),
    status: "pending",
  },
  {
    id: "kb4",
    name: "Analytics DB",
    sourceType: "document",
    lastUpdated: new Date("2026-02-15"),
    status: "error",
  },
]
