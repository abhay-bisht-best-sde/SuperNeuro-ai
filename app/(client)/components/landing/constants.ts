import type { LucideIcon } from "lucide-react"
import {
  MessageSquare,
  Bot,
  Shield,
  Wrench,
  FileText,
  BrainCircuit,
} from "lucide-react"

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
