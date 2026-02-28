# SuperNeuro Turborepo

Monorepo managed with [Turborepo](https://turbo.build/).

## Structure

```
code/
├── apps/
│   ├── web/          # Next.js app (current frontend)
│   └── worker/       # SQS event consumer & processor (24/7)
├── packages/
│   └── database/     # Shared Prisma schema & client
├── package.json
└── turbo.json
```

## Packages

### `@repo/database`
Shared Prisma schema and generated client. Both `apps/web` and `apps/worker` depend on this package.

- **Schema**: `packages/database/prisma/schema.prisma`
- **Output**: `packages/database/dist/client`

### `@repo/web`
Next.js application (App Router). Uses `@repo/database` for Prisma.

### `@repo/worker`
SQS event consumer & processor. Polls AWS SQS, handles events 24/7. Uses `@repo/database` for Prisma.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   - A root `.env` file is used by all apps and packages
   - Copy `.env.example` to `.env` at the repo root if needed
   - Add `DATABASE_URL` (MongoDB connection string)
   - For `apps/web`: add Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

3. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

4. **Run development**
   ```bash
   npm run dev
   ```
   Runs all apps in dev mode (web on 3000, worker on 4000).

   Or run individually:
   ```bash
   npm run dev --workspace=@repo/web
   npm run worker              # Python worker (PDF + image SQS pollers)
   ```

5. **Build**
   ```bash
   npm run build
   ```

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Start all apps in development mode   |
| `npm run build` | Build all packages                 |
| `npm run db:generate` | Generate Prisma client         |
| `npm run db:push` | Push schema to database           |
| `npm run db:studio` | Open Prisma Studio              |
