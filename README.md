# compro

Turborepo monorepo:

- `apps/web` — Next.js (TypeScript, Tailwind CSS)
- `apps/api` — NestJS (TypeScript, Prisma, PostgreSQL)

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local PostgreSQL) or your own PostgreSQL instance

## Setup

```bash
pnpm install

# start local postgres
docker compose up -d

# apply the Prisma schema to the database
pnpm --filter @compro/api exec prisma migrate dev --name init
```

`apps/api/.env` already points at the default docker-compose database
(`postgresql://postgres:postgres@localhost:5432/compro`). Adjust if you're
using your own PostgreSQL instance.

## Development

```bash
pnpm dev
```

Runs `apps/web` on http://localhost:3006 and `apps/api` on http://localhost:3007.

## Build

```bash
pnpm build
```
