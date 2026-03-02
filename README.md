# SuperNeuro.ai

An intelligent workflow co-pilot that helps users automate, organize, retrieve, create, and execute tasks across connected tools such as Notion, Google Workspace (Docs, Sheets, Drive, Gmail, Calendar), Slack, and other integrated platforms.

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 16, React 19, Radix UI, Tailwind CSS 4, Framer Motion |
| **State** | Zustand, TanStack React Query |
| **Auth** | Clerk |
| **AI / LLM** | OpenAI, LangChain, LangGraph |
| **Real-time** | Ably |
| **Integrations** | Composio (Gmail, Calendar, Drive, Sheets, Docs, Notion, Slack, YouTube, Reddit) |
| **RAG** | Pinecone, LlamaIndex |
| **Storage** | Cloudflare R2 |
| **Queue** | AWS SQS |
| **Cache** | Redis |
| **Database** | MongoDB (Prisma) |

## Prerequisites

- **Node.js** 20+
- **MongoDB** (local or Atlas)
- **Redis** (e.g. Redis Cloud)
- API keys for: Clerk, OpenAI, Composio, Tavily, Firecrawl, Pinecone, AWS, Ably, Cloudflare R2 (see `.env.example`)

## Folder Structure

```
super_neuro_assignment.ai/
├── apps/
│   ├── web/                    # Next.js app (App Router)
│   │   └── app/
│   │       ├── (client)/       # Client components, hooks, UI
│   │       ├── (server)/       # Server components, API routes, lib
│   │       │   ├── api/        # API routes
│   │       │   ├── core/       # Config, types, constants
│   │       │   └── lib/        # Chat, Composio, Ably, R2, etc.
│   │       └── (pages)/        # Dashboard, auth pages
│   └── worker/                 # SQS consumer & PDF/image processor
│       └── src/
│           ├── asset-processing/
│           ├── libs/
│           └── models/
├── packages/
│   └── database/               # Prisma schema & client
│       └── prisma/
├── package.json
├── turbo.json
└── .env.example
```

## Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd super_neuro_assignment.ai
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` at the repo root
   - Fill in required keys (see [Environment Variables](#environment-variables))

3. **Database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed   # optional
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   - Web: http://localhost:3000
   - Worker: http://localhost:8000 (SQS poller + health)

## Running Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run build` | Build all packages |
| `npm run start` | Start production apps |
| `npm run worker` | Start worker only (dev) |
| `npm run worker:start` | Start worker only (prod) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |

## Architecture

### Chat Graph Flow

```
User message → Router (LLM) → Route decision
  ├── tavily     → Web search (Tavily) → Agent → Response
  ├── firecrawl   → URL scrape (Firecrawl) → Agent → Response
  ├── composio   → Planner → Composio tools → Agent → Response
  └── direct_llm → Direct LLM → Response
```

### RAG Pipeline

- PDFs uploaded to R2 → SQS message → Worker downloads, chunks (LlamaIndex), embeds (OpenAI), stores in Pinecone
- Images extracted from PDFs → processed in parallel → stored in Pinecone

### Ably Event Flow

- Real-time events: `THINKING`, `GRAPH_STAGE` (tool steps), `MESSAGE` (final response)
- Channel: `user:{userId}:conversation:{conversationId}`

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/[id]` | Get conversation |
| POST | `/api/conversations/[id]/messages` | Send message (run chat graph) |
| GET | `/api/conversations/[id]/messages` | Get messages |
| POST | `/api/ably/token` | Get Ably token |
| GET | `/api/integrations` | List integrations |
| GET | `/api/integrations/connect` | Start OAuth |
| GET | `/api/integrations/callback` | OAuth callback |
| GET | `/api/user-config` | Get user config |
| POST | `/api/knowledge-base` | Create knowledge base |
| GET | `/api/knowledge-base` | List knowledge bases |
| POST | `/api/knowledge-base/[id]/retry` | Retry indexing |
| POST | `/api/create-multipart-upload` | Create multipart upload |
| POST | `/api/complete-upload` | Complete upload |
| POST | `/api/abort-multipart-upload` | Abort upload |
| GET | `/api/list-parts` | List parts |
| POST | `/api/sign-part` | Sign part URL |
| POST | `/api/store-file-metadata` | Store file metadata |

## Environment Variables

See `.env.example` for the full list. Key sections:

- **Clerk** — Auth (sign-in, sign-up)
- **Database** — MongoDB connection string
- **OpenAI** — Chat, embeddings, vision
- **Composio** — Integrations + per-provider auth config IDs
- **Tavily / Firecrawl** — Web search and URL scraping
- **Pinecone** — Vector indexes
- **AWS** — SQS queues
- **Ably** — Real-time
- **Redis** — Conversation cache
- **Cloudflare R2** — File storage

## Verification

- **Build:** `npm run build` — compiles without errors
- **Lint:** `npm run lint` — passes
- **Dev:** `npm run dev` — web on 3000, worker on 8000
- **Composio events:** Send a message that triggers integrations (e.g. "list my Gmail inbox") — verify `GRAPH_STAGE` events with tool steps appear in the UI
