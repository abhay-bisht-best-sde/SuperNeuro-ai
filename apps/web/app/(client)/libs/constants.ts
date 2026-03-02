import type { LucideIcon } from "lucide-react"
import {
  MessageSquare,
  Bot,
  Shield,
  Wrench,
  FileText,
  BrainCircuit,
} from "lucide-react"

export const APP_NAME = "SuperNeuro"
export const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed"

export const QUERY_STALE_TIME_MS = 60_000
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024
export const UPLOAD_CONCURRENCY = 4
export const UPLOAD_RETRY_DELAYS = [0, 1000, 3000] as const
export const ALLOWED_UPLOAD_TYPES = ["application/pdf"] as const

export const MAX_RETRY_ATTEMPTS = 3
export const MOBILE_BREAKPOINT = 768
export const TOAST_LIMIT = 1
export const TOAST_REMOVE_DELAY = 1000000

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

export const FETCH_CONVERSATIONS_KEYS = ["FETCH_CONVERSATIONS"] as const
export const FETCH_WORKFLOWS_KEYS = ["FETCH_CONVERSATIONS", "WORKFLOW"] as const
export const FETCH_RAG_CONVERSATIONS_KEYS = ["FETCH_CONVERSATIONS", "RAG"] as const
export const FETCH_CONVERSATION_KEYS = (id: string | null) =>
  ["FETCH_CONVERSATION", id] as const
export const FETCH_KNOWLEDGE_BASE_KEYS = ["FETCH_KNOWLEDGE_BASE"] as const
export const FETCH_USER_CONFIGS_KEYS = ["FETCH_USER_CONFIGS_KEY"]
export const FETCH_INTEGRATIONS_KEYS = ["FETCH_INTEGRATIONS"] as const

export const CHAT_HEADLINE = "Your AI Research & Knowledge Workspace"
export const CHAT_SUBHEADLINE =
  "Your AI workspace for research, documentation, and team collaboration."
export const CHAT_INPUT_PLACEHOLDER =
  "Research AI hiring trends and share summary to Slack"
export const CHAT_SUGGESTIONS = [
  "Research competitors in my industry",
  "Create a strategy document",
  "Summarize unread emails",
]

export const FAVICON_BASE = "https://favicon.im"
export const INTEGRATION_LOGOS: Record<string, string> = {
  GMAIL: "https://img.icons8.com/color/96/gmail.png",
  GOOGLECALENDAR: "https://img.icons8.com/color/96/google-calendar.png",
  GOOGLEDRIVE: "https://img.icons8.com/color/96/google-drive.png",
  GOOGLESHEETS: "https://img.icons8.com/color/96/google-sheets.png",
  GOOGLEDOCS: "https://img.icons8.com/color/96/google-docs.png",
  NOTION: `${FAVICON_BASE}/notion.so?larger=true`,
  SLACK: `${FAVICON_BASE}/slack.com?larger=true`,
  YOUTUBE: `${FAVICON_BASE}/youtube.com?larger=true`,
  REDDIT: `${FAVICON_BASE}/reddit.com?larger=true`,
  TAVILY: `${FAVICON_BASE}/tavily.com?larger=true`,
  FIRECRAWL: `${FAVICON_BASE}/firecrawl.dev?larger=true`,
}

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const features: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: FileText,
    title: "Document Intelligence",
    description:
      "Upload PDFs, docs, and web pages. SuperNeuro.ai chunks and indexes them with Pinecone for instant semantic retrieval.",
  },
  {
    icon: Bot,
    title: "Custom AI Agents",
    description:
      "Build specialized agents with custom system prompts, attach tools, and connect knowledge bases—all from one dashboard.",
  },
  {
    icon: BrainCircuit,
    title: "RAG-Powered Answers",
    description:
      "Every response is grounded in your data. Retrieval-Augmented Generation ensures accurate, context-aware answers.",
  },
  {
    icon: Wrench,
    title: "Tool Calling & Actions",
    description:
      "Equip agents with custom tools to call APIs, query databases, trigger workflows, and take real actions on your behalf.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Streaming",
    description:
      "Live chat with Ably-powered streaming. See agent thinking, tool calls, and responses as they happen in real time.",
  },
  {
    icon: Shield,
    title: "Bring Your Own Key",
    description:
      "Use your own OpenAI API key. Your data stays yours—no vendor lock-in, full control over costs and models.",
  },
]

export const stats = [
  { value: "100ms", label: "Avg. Retrieval" },
  { value: "50+", label: "File Formats" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "Real-Time", label: "Streaming" },
]

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at Streamline",
    content:
      "SuperNeuro.ai transformed our support workflow. We uploaded 500 docs and had a production-ready copilot in under an hour.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Lead Engineer at Buildfast",
    content:
      "The agent builder is incredibly powerful. Tool calling lets our agents actually do things -- not just chat.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "VP Product at Growthloop",
    content:
      "RAG that actually works. The chunking and indexing pipeline is solid, and the responses are always grounded in our data.",
    rating: 5,
  },
]

export const howItWorksSteps = [
  {
    step: "01",
    title: "Upload & Index",
    description:
      "Upload documents or paste URLs. SuperNeuro.ai automatically chunks content and indexes it in Pinecone for semantic search.",
  },
  {
    step: "02",
    title: "Build Agents",
    description:
      "Create agents with custom system prompts and attach tools. Connect knowledge bases to ground every response in your data.",
  },
  {
    step: "03",
    title: "Chat & Deploy",
    description:
      "Start chatting instantly. See real-time tool calls, agent reasoning, and RAG retrieval—then deploy for your team.",
  },
]

export const TECH_BADGES = [
  "Next.js",
  "OpenAI",
  "Pinecone",
  "Ably",
  "Clerk",
  "Redis",
]

export const industries = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "E-commerce & Retail",
  "Marketing & Advertising",
  "Legal",
  "Real Estate",
  "Manufacturing",
  "Media & Entertainment",
  "Logistics & Supply Chain",
  "Energy & Utilities",
  "Non-profit",
  "Government",
  "Consulting",
  "Insurance",
  "Travel & Hospitality",
  "Other",
]

export const useCases = [
  "Customer Support",
  "Content Generation",
  "Code Assistance",
  "Data Analysis",
  "Research",
  "Sales & CRM",
  "Document Processing",
  "Internal Knowledge Base",
  "Meeting Notes & Summaries",
  "Email Drafting",
  "HR & Recruiting",
  "Legal Drafting",
  "Marketing Copy",
  "Product Documentation",
  "Translation",
]

export const teamSizes = [
  "Just me",
  "2-5 people",
  "6-20 people",
  "21-100 people",
  "101-500 people",
  "500+ people",
]
