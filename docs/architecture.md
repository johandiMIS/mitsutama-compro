# Monorepo Architecture Reference

Reusable starting structure for a **Turborepo + pnpm** monorepo with a **Next.js** frontend and a **NestJS + Prisma** backend. Written to be copy-pasted as the baseline for new projects on this stack — swap the `@app` package scope below for the new project's name and the rest applies as-is.

## Stack

- **Package manager / workspaces:** pnpm
- **Task orchestration:** Turborepo
- **Frontend:** Next.js (App Router)
- **Backend:** NestJS
- **ORM:** Prisma
- **Shared packages:** `types` (cross-app contracts), `utils` (generic helpers)

## Repo layout

```
<project>/
├── apps/
│   ├── web/                     # Next.js App Router
│   └── api/                     # NestJS + Prisma
├── packages/
│   ├── types/                   # @app/types — shared DTOs/interfaces
│   └── utils/                   # @app/utils — shared helpers
├── turbo.json                   # pipeline definition (build/lint/test/dev)
├── pnpm-workspace.yaml          # workspace globs: apps/*, packages/*
├── package.json                 # root scripts, shared devDependencies
├── tsconfig.base.json           # base compiler options, extended by every app/package
├── .eslintrc.cjs / eslint.config.js
├── .prettierrc
└── .gitignore
```

Root `tsconfig.base.json` and root ESLint/Prettier config are kept as plain shared files (not dedicated `packages/eslint-config` / `packages/tsconfig` packages) — each app/package extends them by relative path. Add dedicated config packages later only if config needs diverge enough to justify it (e.g. a third app with different lint rules).

## apps/web (Next.js)

```
apps/web/
├── src/
│   ├── app/                     # routes (App Router) — layout.tsx, page.tsx per route segment
│   ├── components/              # shared/dumb UI components (not tied to one feature)
│   ├── features/                # feature-based modules, e.g. features/contact, features/careers
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── api.ts           # feature's data-fetching calls to apps/api
│   ├── lib/                     # api client instance, env access, generic client utils
│   ├── hooks/                   # cross-feature hooks
│   └── styles/
├── public/
├── next.config.ts
├── tsconfig.json                 # extends ../../tsconfig.base.json
└── package.json                  # depends on @app/types, @app/utils
```

**Rationale:** feature-based (vertical slice) organization under `src/features` scales better than pure layer-based (`components/`, `hooks/`, `services/` at top level) once the app grows past a handful of pages. Keep `src/components` limited to genuinely cross-feature/shared UI (buttons, layout shell, etc.). API calls go through a thin client in `src/lib`, typed with `@app/types`.

## apps/api (NestJS + Prisma)

```
apps/api/
├── src/
│   ├── modules/                 # one folder per domain module
│   │   └── <domain>/
│   │       ├── <domain>.module.ts
│   │       ├── <domain>.controller.ts
│   │       ├── <domain>.service.ts
│   │       └── dto/
│   ├── common/                  # guards, interceptors, filters, pipes, decorators
│   ├── config/                  # ConfigModule setup + env validation (zod/class-validator)
│   ├── prisma/                  # PrismaService + PrismaModule (injectable client wrapper)
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/                        # e2e tests (Nest's default Jest e2e setup)
├── tsconfig.json                 # extends ../../tsconfig.base.json
└── package.json                  # depends on @app/types, @app/utils
```

**Rationale:** one module per domain (e.g. `users`, `auth`, `contact`), each self-contained with its own controller/service/DTOs — the standard NestJS convention. This mirrors the frontend's feature split, so a "domain" maps 1:1 across `apps/web/src/features/<x>` and `apps/api/src/modules/<x>` where relevant. `PrismaService` is a single injectable wrapped in its own module and imported wherever needed, per the standard Prisma+Nest pattern.

## packages/types and packages/utils

```
packages/types/
├── src/
│   └── index.ts                 # barrel export of shared interfaces/DTOs
├── package.json                 # name: "@app/types"
└── tsconfig.json

packages/utils/
├── src/
│   └── index.ts
├── package.json                 # name: "@app/utils"
└── tsconfig.json
```

Both apps depend on these via the workspace protocol (`"@app/types": "workspace:*"`). `packages/types` is the single source of truth for shapes shared between the API's responses and the frontend's consumption — update it first when a contract changes, so both apps stay in sync. Add `packages/ui` later only once a second frontend app (e.g. an admin panel) needs to share components — don't create it speculatively.

## turbo.json pipeline

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

`dependsOn: ["^build"]` on the `build` task ensures `packages/*` build before `apps/*` consume them. `outputs` covers both Next.js (`.next/**`) and NestJS (`dist/**`) build artifacts so Turborepo caching works for both apps from one pipeline definition.

## Bootstrapping a new project from this template

1. `pnpm init` at the root, set `packageManager` and `engines.node`.
2. Create `pnpm-workspace.yaml` with `packages: ["apps/*", "packages/*"]`.
3. Scaffold `apps/web` (`create-next-app`, App Router, TypeScript) and `apps/api` (`nest new`), rename their `package.json` `name` fields to `@<scope>/web` and `@<scope>/api`.
4. Create `packages/types` and `packages/utils` as minimal TS packages (`src/index.ts` + `package.json` + `tsconfig.json`), add them as `workspace:*` dependencies to both apps.
5. Add root `tsconfig.base.json`, ESLint/Prettier config; have each app/package extend them.
6. Add `turbo.json` (pipeline above) and root `package.json` scripts (`build`/`dev`/`lint`/`test` → `turbo run <task>`).
7. `pnpm install`, then verify: `pnpm turbo run build` builds packages before apps; `pnpm --filter web dev` and `pnpm --filter api dev` start independently; both apps can import from `@<scope>/types` and `@<scope>/utils`.
8. Set up Prisma in `apps/api` (`prisma init`, define `schema.prisma`, wire `PrismaService`/`PrismaModule`).

## Verification checklist

- `pnpm install` succeeds and links workspace packages.
- `pnpm turbo run build` builds `packages/*` before `apps/*` without errors.
- `pnpm --filter web dev` and `pnpm --filter api dev` start both apps independently.
- Both apps successfully import from the shared `types`/`utils` packages, confirming workspace linking resolves correctly.
