
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
<img width="1710" height="948" alt="Screenshot 2026-03-03 at 6 48 22 AM" src="https://github.com/user-attachments/assets/467b25ef-aa4b-4b0a-8c53-44efbb3a29de" />
<img width="1710" height="949" alt="Screenshot 2026-03-03 at 6 48 32 AM" src="https://github.com/user-attachments/assets/e10e4986-f3cd-4c36-92d9-880f85c5aff2" />
<img width="1710" height="955" alt="Screenshot 2026-03-03 at 6 47 20 AM" src="https://github.com/user-attachments/assets/ba234793-889e-4292-8a8f-206df8e9ec73" />
<img width="1709" height="950" alt="Screenshot 2026-03-03 at 6 47 27 AM" src="https://github.com/user-attachments/assets/c8d4d502-02fa-4b09-aa48-86133ef4d034" />
<img width="1710" height="948" alt="Screenshot 2026-03-03 at 6 48 22 AM" src="https://github.com/user-attachments/assets/54e9f109-eae9-48f2-a156-3436c7b25db4" />
<img width="1710" height="951" alt="Screenshot 2026-03-03 at 6 48 15 AM" src="https://github.com/user-attachments/assets/fba6709c-b985-42b4-8d61-f46a75c06faa" />
<img width="1710" height="951" alt="Screenshot 2026-03-03 at 6 48 15 AM" src="https://github.com/user-attachments/assets/66341856-cac1-4193-a092-f06ab5cb0c06" />
<img width="1710" height="950" alt="Screenshot 2026-03-03 at 6 48 05 AM" src="https://github.com/user-attachments/assets/673a86f3-0713-4249-a20c-e96e875ba05b" />
<img width="1710" height="950" alt="Screenshot 2026-03-03 at 6 47 55 AM" src="https://github.com/user-attachments/assets/3ee3605a-1ed9-42bb-a988-2ad74e327034" />

