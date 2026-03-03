
## Tech Stack

| Area | Technologies |
|------|---------------|
| **App** | Next.js, TypeScript |
| **UI** | React, Shadcn UI, Tailwind CSS, Framer Motion |
| **State** | Zustand, TanStack React Query |
| **Auth** | Clerk |
| **AI / LLM** | OpenAI, LangChain, LangGraph |
| **Tools** | Composio (tool library: Gmail, Google Calendar, Drive, Sheets, Docs, Notion, Slack, YouTube, Reddit, Tavily, Firecrawl) |
| **Real-time** | Ably (Realtime events, messages) |
| **Database** | MongoDB, Prisma |
| **Cache** | Redis (LRU cache for conversation & massages) |
| **RAG** | Pinecone, LlamaIndex (chunking, embeddings), Pinecone |
| **Storage** | Cloudflare R2 (storing pdfs and images) |
| **Queue** | AWS SQS (image processing events) |

## What’s Implemented

- **Knowledge base pipeline** — OCR + PDF processing: uploads to R2 → SQS → worker chunks PDFs (LlamaIndex), extracts images, processes in parallel, embeds (OpenAI), stores in Pinecone.
- **Tool integration** — Composio-backed tools; router picks providers (e.g. Gmail, Sheets, Tavily); OAuth connect/callback; tool-calling loop with LangChain/LangGraph.
- **Conversation caching** — Redis cache for conversation payloads; cache invalidation on new messages.
- **Knowledge base chat** — RAG conversations: retrieve from Pinecone by user query, inject context, LLM response with optional source citations (PDF/image).
- **Workflow chat** — Workflow conversations: route → composio (tools) or direct LLM; real-time stages and token streaming via Ably.

## Setup

1. **Environment** — Copy `.env.example` to `.env` at repo root and set required keys (see [Environment Variables](#environment-variables)).
2. **Database** — `npm run db:generate`, `npm run db:push`, optionally `npm run db:seed`.

## Running Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run worker` | Run worker (dev) |
| `npm run worker:start` | Run worker (prod) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |
| `npm run start` | Running build file |
| `npm run dev` | Starting dev servers |

