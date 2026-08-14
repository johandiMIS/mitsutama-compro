# compro

A company-profile web platform built as a production-oriented monorepo: a Next.js
marketing site backed by a NestJS + PostgreSQL API, sharing typed contracts across
the boundary instead of duplicating them.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white">
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspaces-F69220?logo=pnpm&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white">
</p>

## Why this structure

Most company-profile sites ship as a single Next.js app with no backend and no
reason to think about contracts. This one is deliberately split into a frontend
and a backend service from day one, because the brief calls for CMS-driven
content and form submissions that need real persistence — not just a static
site. That split only pays for itself if the seams are managed well:

- **One workspace, two deployables.** `apps/web` (Next.js App Router) and
  `apps/api` (NestJS + Prisma) live in one pnpm + Turborepo workspace, each
  independently runnable and buildable, with `packages/*` as the shared layer
  between them rather than copy-pasted types.
- **Contracts as a package, not a convention.** `@compro/types` is the single
  source of truth for shapes crossing the frontend/backend boundary — it gets
  created *when* a shared contract is needed, not speculatively, and both apps
  consume it via `workspace:*` so drift is a build error, not a runtime bug.
- **Feature-based frontend, domain-based backend, deliberately mirrored.**
  `apps/web/src/features/<x>` and `apps/api/src/modules/<x>` are meant to map
  1:1 where a concept exists on both sides — see
  [`docs/architecture.md`](docs/architecture.md) for the full rationale, which
  is treated as the target structure this repo grows into rather than
  documentation written after the fact.
- **Tooling failures get diagnosed, not routed around.** Turborepo's binary is
  unsigned and gets hard-blocked by this machine's Windows Code Integrity
  (WDAC) policy — confirmed via `Get-AuthenticodeSignature` and the CodeIntegrity
  event log, not assumed. Rather than ripping out Turborepo, `pnpm dev` bypasses
  it for the interactive loop while `build`/`lint`/`test` still run the real
  pipeline inside WSL2, so CI-equivalent behavior is preserved. Documented in
  [`CLAUDE.md`](CLAUDE.md) so the workaround doesn't get mistaken for the
  intended setup.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 | shadcn/ui + Radix (`@base-ui/react`) primitives, Embla for carousels |
| Backend | NestJS 11 | modular, dependency-injected service layer |
| Database | PostgreSQL via Prisma 6 | `PrismaService`/`PrismaModule` as the single injectable client |
| Monorepo | pnpm workspaces + Turborepo | content-addressed task caching, `^build` dependency ordering |
| Shared | `@compro/types`, `@compro/utils` | contracts and helpers, not duplicated per app |
| Language | TypeScript everywhere | one `tsconfig.base.json`, extended per package |

## Project structure

```
compro/
├── apps/
│   ├── web/            # Next.js — marketing site (App Router)
│   └── api/            # NestJS — API + Prisma-backed persistence
├── packages/
│   ├── types/           # @compro/types — shared DTOs/interfaces
│   └── utils/            # @compro/utils — shared helpers
├── docs/
│   └── architecture.md  # target structure this repo is grown from
├── turbo.json            # build/lint/test/dev pipeline
└── pnpm-workspace.yaml
```

## Getting started

```bash
pnpm install

# local Postgres
docker compose up -d
pnpm --filter @compro/api exec prisma migrate dev --name init

# web on :3006, api on :3007
pnpm dev
```

| Command | Does |
|---|---|
| `pnpm dev` | Runs both apps in parallel for local development |
| `pnpm build` / `lint` / `test` | Turborepo pipeline — `packages/*` build before `apps/*` |
| `pnpm --filter @compro/web dev` | Target a single app |
| `pnpm --filter @compro/api test -- app.controller.spec.ts` | Single test file |

See [`CLAUDE.md`](CLAUDE.md) for the full command reference, including the
WSL-based fallback for `build`/`lint`/`test` on machines where Turborepo's
binary is blocked.

## Status

Active build. The frontend has the full marketing site in place — hero,
services, industries, partners, insights, contact — laid out to slot into
`src/features/*` as each section grows real data behind it. The API currently
exposes the NestJS/Prisma scaffolding; domain modules (contact form
submissions, CMS-backed content) land next, following the module shape in
`docs/architecture.md`.
