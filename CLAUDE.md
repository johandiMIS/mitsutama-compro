# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Freshly scaffolded Turborepo monorepo — `apps/web` and `apps/api` are still close to their
`create-next-app`/`nest new` defaults. `docs/architecture.md` is the target structure this repo
should grow into. So far only the workspace-level plumbing from that doc exists: `packages/types`
and `packages/utils` (currently empty stubs, linked into both apps via `workspace:*`) and a shared
`tsconfig.base.json`. Feature-based `apps/web/src/features/*` and per-domain `apps/api/src/modules/*`
don't exist yet — consult the doc before introducing them.

**Note:** on this machine, Windows Code Integrity (WDAC) blocks `turbo.exe` outright because it's
unsigned (`Get-AuthenticodeSignature` → `NotSigned`; CodeIntegrity event log shows Event ID 3033,
"did not meet the Enterprise signing level requirements", Policy ID `0283ac0f-fff1-49ae-ada1-8a933130cad6`).
This is a machine-level enterprise policy, not a project issue. Two workarounds are in place:
- `pnpm dev` no longer uses turbo — it runs `pnpm --filter "./apps/*" --parallel run dev` directly.
- `pnpm build:wsl` / `pnpm lint:wsl` / `pnpm test:wsl` run the real `turbo` pipeline inside WSL2
  (Ubuntu, Node 22 + pnpm via nvm/corepack, set up under `~/projects/compro` — a synced mirror, not
  the same `node_modules` as Windows, since native binaries differ per-OS). `scripts/wsl-turbo.sh`
  handles the rsync + install + run. The plain `pnpm build`/`lint`/`test` scripts still shell out to
  turbo directly and will fail on this machine the same way `pnpm dev` used to.

## Commands

Run from repo root (Turborepo fans out to both apps via `pnpm-workspace.yaml`: `apps/*`):

```bash
pnpm dev          # apps/web on :3006, apps/api on :3007 (bypasses turbo, see note above)
pnpm build        # turbo run build (packages/* build before apps/*)
pnpm lint         # turbo run lint
pnpm test         # turbo run test
pnpm build:wsl    # same tasks via WSL, if turbo is blocked natively (see note above)
pnpm lint:wsl
pnpm test:wsl
```

Target a single app with `--filter`, e.g. `pnpm --filter @compro/web dev` or
`pnpm --filter @compro/api test`.

### apps/api (NestJS + Prisma)

- Single test file: `pnpm --filter @compro/api test -- app.controller.spec.ts`
- e2e tests: `pnpm --filter @compro/api test:e2e`
- Watch mode: `pnpm --filter @compro/api test:watch`
- After editing `prisma/schema.prisma`: `pnpm --filter @compro/api exec prisma migrate dev --name <name>`
  (regenerates the client too; `postinstall` also runs `prisma generate`)
- `apps/api/.env` points at the docker-compose Postgres
  (`postgresql://postgres:postgres@localhost:5432/compro`); start it with `docker compose up -d`.

### apps/web (Next.js)

- App Router, Tailwind CSS v4, no test runner configured yet.

## Architecture

- **Monorepo**: pnpm workspaces (`apps/*`) + Turborepo. `turbo.json`'s `build` task depends on
  `^build` (upstream workspace deps build first) — relevant once `packages/*` is introduced per
  `docs/architecture.md`.
- **apps/api**: `PrismaService`/`PrismaModule` (`src/prisma/`) is the injectable DB client wrapper,
  imported into `AppModule` — follow this pattern for future domain modules rather than
  instantiating `PrismaClient` directly.
- **Shared contracts**: not yet extracted. When frontend/backend need a shared type, that's the
  trigger to create `packages/types` per `docs/architecture.md` rather than duplicating it.
- `docs/auth-passportjs-google.md` and `docs/email-module.md` contain implementation reference
  notes for those specific features — check them before building auth or email flows.
- `docs/shadcn.md` covers shadcn/ui setup conventions and the components registry for `apps/web`
  (not yet initialized) — check it before running `shadcn init`/`add` or building any UI component.
