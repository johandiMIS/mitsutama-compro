# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Turborepo monorepo growing into the structure in `docs/architecture.md`.

- `apps/web` has the public marketing site plus an admin panel at `/admin`.
- `apps/api` now has per-domain modules under `src/modules/` (`admin-auth`, `storage`,
  `hero-images`) alongside the original `nest new` scaffolding — follow that layout for new
  domains, per `docs/architecture.md`.
- `packages/types` holds real shared contracts now (hero image DTOs, admin session).
  **It has no build step** — `main` points at `src/index.ts` and consumers import raw TS, so it
  must stay a single file: a relative re-export like `export * from './foo'` compiles and builds
  fine, then throws `ERR_MODULE_NOT_FOUND` under `node dist/main`. The file's header comment
  explains what to do instead. `packages/utils` is still an empty stub.
- `apps/web/src/features/pages/` is the first feature folder (content-page blocks, Puck config,
  catalog route). `/products|services|solutions/[slug]` render published pages from the API
  (`apps/api/src/modules/pages`), and the header menu comes from `GET /nav`. Authoring is by
  JSON import only so far (`POST /admin/pages/import`); the editor UI is Phase 2 — see
  `docs/content-builder-plan.md` (§11a). After pulling, run `prisma migrate dev` then
  `pnpm --filter @compro/api seed:nav`, and set `REVALIDATE_SECRET` in both apps.

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
- `docs/design-profile.md` is the contract for every colour in `apps/web`: components read semantic
  tokens (`text-foreground`, `text-muted-ink`, `text-brand-ink`, `bg-band`, `bg-surface`) and only
  `globals.css` names raw colours. Read its **Dark mode** section before adding any `dark:` variant —
  a needed `dark:` in a component usually means a missing token, or a fixed region that wants the
  `always-dark`/`always-light` class instead.
- `docs/shadcn.md` covers shadcn/ui setup conventions and the components registry for `apps/web`
  (not yet initialized) — check it before running `shadcn init`/`add` or building any UI component.
- `docs/admin-panel.md` documents the `/admin` panel: env vars, the required S3 bucket policy
  **and CORS rule** (browser-direct uploads fail without it), the presign/upload/commit flow, and
  how `.webp`-only is enforced. Read it before touching `apps/api/src/modules/{admin-auth,storage,
  hero-images}` or `apps/web/src/app/admin/*`. Its auth is an interim single password and is meant
  to be replaced by `docs/auth-passportjs-google.md`.
