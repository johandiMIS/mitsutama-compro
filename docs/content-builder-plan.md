# Content Builder Plan — Products, Services, Solutions

**Status:** Phases 1 (foundation) and 2 (admin) implemented 2026-10-05; Phases 3–4 pending · **Date:** 2026-10-01

## 1. Context

`/products/[slug]`, `/services/[slug]` and `/solutions/[slug]` exist as placeholders
(`apps/web/src/components/CatalogPage.tsx`): a `PageHero` with breadcrumbs, an empty body
and `ContactCta`. The mega-menu entries are hard-coded in
`apps/web/src/components/nav/nav-links.ts` and link to those placeholders.

Goal: pages are **created in the admin and rendered on the live site**, by either of two
routes that produce the same thing:

1. **Visual editor** — compose a page from predefined blocks in `/admin`.
2. **AI import** — have an AI write the page as JSON, upload it, review, publish.

The top navigation, breadcrumbs and footer must follow the pages automatically, with no
second list to maintain.

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Puck** (`@puckeditor/core`, MIT, v0.23) as the editor | Runs inside our Next.js app; stores pages as plain JSON in our own Postgres; renders in React Server Components (`react-server` export); the JSON is simple enough for an AI to write. Alternatives rejected: Payload CMS (second CMS/admin alongside NestJS), Builder.io/Plasmic (hosted, paid, content off-site), Craft.js (flat node-map format, hard to hand-write), MDX (no visual editor). |
| D2 | **One page format** for editor and AI | A Puck document `{ root, content: [{ type, props }] }` is both what the editor saves and what an AI writes. No separate import format. |
| D3 | **Database is the single source of truth for the menu** | The menu is a *view* of published pages. Current entries are moved, not duplicated. |
| D4 | **Every write goes through the API's validator** | AI JSON is never written to the DB directly (no SQL inserts). One wrong block name would otherwise break a live page. |
| D5 | **Pages are data, never code** | No raw-HTML or script block. Rich text is sanitised. Image URLs must be on our S3/CDN host. |
| D6 | **Draft and published are separate** | Editing never changes the live page until Publish. |
| D7 | **On-demand revalidation** on publish | Live page and menu update immediately, instead of the hero's 60s polling. |

## 3. Open questions

**Answered 2026-10-05:** (1) English only. **Assumed, not yet confirmed:** (2) single admin
password for now; (3) unknown slugs **404** (implemented); (4) badges `ce | rohs2 |
taiwan-excellence`, rendered as text chips until logo artwork is supplied.

Original questions, kept for reference:

1. **Languages** — English only, or English + Indonesian? Changes the schema (`data` per
   locale) and URLs (`/en/...`, `/id/...`). Cheap now, a migration later.
2. **Who edits** — still the single admin password, or real accounts first
   (`docs/auth-passportjs-google.md`)? Affects only Phase 2's audit fields.
3. **Unknown slugs** — today any `/products/<anything>` renders a placeholder. After Phase 1,
   should unknown slugs **404** (recommended) or keep the placeholder?
4. **Certification badges** — confirm the fixed list: CE, RoHS 2, Taiwan Excellence, …?

## 4. Content model

The design shows four levels:

```
Products  ›  Chroma  ›  Power Electronic Test and Equipment  ›  AC Power Source
section      group      category page (in the menu)             product page (not in the menu)
```

### Prisma schema (Phase 1)

```prisma
model NavGroup {                 // "Chroma", "IMC", "Calibration", "Standard Compliance"
  id        String   @id @default(cuid())
  section   String                 // products | services | solutions
  title     String
  sortOrder Int      @default(0)
  pages     Page[]
  @@unique([section, title])
}

model Page {
  id            String    @id @default(cuid())
  section       String               // products | services | solutions
  slug          String               // URL: /<section>/<slug>
  title         String               // H1 + breadcrumb
  navLabel      String?              // menu text if shorter than title
  groupId       String?              // set on top-level pages -> menu group
  group         NavGroup? @relation(fields: [groupId], references: [id])
  parentId      String?              // set on child pages (product under category)
  parent        Page?     @relation("PageTree", fields: [parentId], references: [id])
  children      Page[]    @relation("PageTree")
  sortOrder     Int       @default(0)
  showInNav     Boolean   @default(true)
  status        String    @default("draft")   // draft | published
  draftData     Json?                // Puck document being edited
  publishedData Json?                // Puck document live on the site
  seoTitle       String?
  seoDescription String?
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@unique([section, slug])
  @@index([section, status])
}
```

Phase 3 adds `PageRevision` (snapshot on every publish, for rollback) and `Redirect`
(`fromPath` → `toPath`, written automatically when a published page's slug changes).

### Derived data

- **Menu** = published pages where `groupId != null && showInNav`, grouped by `NavGroup`,
  ordered by `NavGroup.sortOrder` then `Page.sortOrder`.
- **Breadcrumb** = walk `parent` up to the top-level page, then its `group.title`, then the
  section. E.g. AC Power Source → Power Electronic Test and Equipment → Chroma → Products.
- **Footer "Products" column** = `NavGroup` rows for `products` (needs a `footerLabel`
  if "IMC" must display as "IMC Axiometrix" — or rename the group).

## 5. Blocks

Each block = one React component + one field definition. The field definition drives three
things: the Puck editor form, the zod validator used by the API, and the JSON Schema handed
to the AI.

### Phase 1 set (covers the supplied design)

| Block | Fields | Notes |
|---|---|---|
| `ProductIntro` | `tagline`, `title`, `paragraphs[]`, `image`, `imageSide` | Top "PRODUCT DETAILS" section |
| `CategorizedProducts` | `tagline`, `title`, `intro`, `categories[{ name, products[{ name, model, image, badges[], bullets[], href? }] }]` | "Tailored Solutions" section with the **scroll-spy** sidebar |
| `SectionHeading` | `tagline`, `title`, `intro` | Generic section header |
| `RichText` | `body` (sanitised Markdown subset) | Free text |
| `TextImage` | `title`, `body`, `image`, `imageSide` | Text beside image |
| `SpecTable` | `rows[{ label, value }]` | Specifications |
| `FeatureGrid` | `items[{ title, text, icon? }]` | Feature cards |
| `ContactCta` | — | Wraps existing `ContactCta` |

Every block gets an `id` (Puck provides it); it becomes the section's DOM id so deep links
and scroll-spy work.

### Scroll-spy (`CategorizedProducts`)

- Server-rendered cards; only the sidebar is a client component (`"use client"`).
- Each category section carries `id={slugify(name)}`; the sidebar is generated from
  `categories[].name` — adding a category adds the menu item.
- `IntersectionObserver` with a `rootMargin` that accounts for the sticky header marks the
  category nearest the top as active (red + arrow); the right-column heading follows.
- Click → smooth scroll + `history.replaceState('#<slug>')`; loading with a hash jumps there.
- Below `lg`: sidebar becomes a sticky horizontal chip bar with the same active state.
- Works inside the Puck editor preview as well (same component).

### Badges

Fixed enum (e.g. `ce | rohs2 | taiwan-excellence`) mapped to logos in `apps/web/public/badges/`.
The JSON names a badge; it can never supply a badge image URL.

## 6. API (`apps/api/src/modules/pages/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/nav` | public | Menu tree for header/footer (published only) |
| `GET` | `/pages/:section/:slug` | public | Published page + breadcrumb, 404 if none |
| `GET` | `/admin/pages` | admin | Tree per section, drafts included |
| `GET` | `/admin/pages/:id` | admin | One page incl. `draftData` |
| `POST` | `/admin/pages` | admin | Create (metadata, optional `draftData`) |
| `PATCH` | `/admin/pages/:id` | admin | Update metadata and/or `draftData` |
| `POST` | `/admin/pages/:id/publish` | admin | `draftData` → `publishedData`, revalidate |
| `POST` | `/admin/pages/:id/unpublish` | admin | Hide from site + menu, revalidate |
| `DELETE` | `/admin/pages/:id` | admin | Delete (refuse if it has children) |
| `POST` | `/admin/pages/import` | admin | Validate AI JSON, create/update **as draft** |
| `GET` | `/admin/pages/schema` | admin | JSON Schema of all blocks, for AI prompts |
| `PATCH` | `/admin/nav-groups/...` | admin | Create/rename/reorder groups |

**Validation** runs on create, update, import and publish:
- document shape (`root`, `content[]`), every `type` is a known block;
- each block's props against its zod schema; errors returned with paths
  (`content[3].props.categories[0].products[2].name: required`);
- image fields: only `https://<S3 host or CDN>/media/...` (reuse `StorageService.publicUrl`);
- links: relative paths or `https:`; `href` to `javascript:` etc. rejected;
- size cap on the document (e.g. 512 KB).

**Shared schemas:** the zod block schemas live in `packages/types/src/index.ts` (single
file — see the header note there), so web (editor/types) and API (validation) cannot
drift. Requires adding `zod` as a dependency of `packages/types`.

**Revalidation:** on publish/unpublish/rename/reorder the API calls
`POST {WEB_URL}/api/revalidate` with a shared secret (`REVALIDATE_SECRET`); the web route
handler calls `revalidateTag('nav', 'max')` and `revalidateTag('page:<section>/<slug>', 'max')`
(Next 16 two-argument form).

## 7. Web

- `src/app/{products,services,solutions}/[slug]/page.tsx` → fetch
  `/pages/:section/:slug` (tagged `page:<section>/<slug>`), render with Puck's
  `<Render config={blocks} data={publishedData} />` under the existing `PageHero`
  (title + breadcrumb from the API) and `ContactCta`.
- `src/app/layout.tsx` fetches `/nav` once (tagged `nav`) and passes it to `TopNav`,
  `MobileNav` and `Footer`. `nav-links.ts` keeps only static links (Home, About, Partners,
  Insight) plus the current groups as an **offline fallback** (same pattern as
  `src/lib/hero-images.ts`).
- Blocks live in `src/features/pages/blocks/` (first use of `features/`, per
  `docs/architecture.md`), with `config.tsx` (Puck config) shared by editor and renderer.
- `generateStaticParams` from `/nav` so menu pages are prebuilt; others render on demand.

## 8. Admin

- `/admin/pages` — tree per section: Group → category page → product pages; status badge;
  drag to reorder; "show in menu" toggle; New page (choose section + group *or* parent).
- `/admin/pages/:id` — Puck editor on `draftData`; Save draft; Preview; Publish.
- `/admin/pages/import` — paste or upload JSON → validation result with exact error paths →
  saved as draft → opens in the editor.
- `/admin/pages/schema` — "Copy schema for AI" button.
- Image fields use the existing presign → S3 → commit flow (with the WebP converter in
  `src/lib/image-to-webp.ts`) under a new `media/` prefix (`MEDIA_KEY_PREFIX`, hardcoded as
  with `HERO_KEY_PREFIX`).

## 9. AI workflow

1. In admin, **Copy schema for AI**.
2. Prompt: *"Using only these blocks, write a page for Chroma 61800 AC Power Source in
   section `products` under parent `power-electronic-test-and-equipment`. Output JSON
   only."*
3. Paste into **Import** (or `pnpm --filter @compro/api page:import ./file.json`, which
   posts to the same endpoint).
4. Fix any reported errors, review in the editor, **Publish**.

Import envelope:

```json
{
  "section": "products",
  "slug": "ac-power-source-61800",
  "title": "AC Power Source 61800",
  "parent": "power-electronic-test-and-equipment",
  "seoDescription": "…",
  "data": { "root": { "props": {} }, "content": [ { "type": "ProductIntro", "props": { … } } ] }
}
```

Re-importing the same `section` + `slug` updates that page's **draft**; it never publishes.

## 10. Migration from the hard-coded menu

Seed script (`apps/api/prisma/seed-nav.ts`, idempotent):
- creates 8 `NavGroup` rows from `PRODUCT_GROUPS`, `SERVICE_GROUPS`, `SOLUTION_GROUPS`;
- creates 49 top-level `Page` rows (50 entries minus the duplicated IEC 61215), **same slugs
  as today**, status `published`, empty content.

Result: every current URL and menu entry keeps working and shows the placeholder body until
filled in. Run locally, then on the server after `prisma migrate deploy`.

## 11. Phases

| Phase | Scope | Done when |
|---|---|---|
| **0. Prototype** (optional, ~½ day) | `ProductIntro` + `CategorizedProducts` rendered from a static JSON file on `/products/ac-power-source` | Scroll-spy and layout signed off against the design |
| **1. Foundation** | Prisma models + migration; seed; `pages` module (CRUD, import, validate, publish, schema); `/nav`; revalidate route; site renders pages + menu + breadcrumb from DB with fallback; Phase 1 blocks | AI JSON imported via API publishes a live page; menu reflects DB; unknown slug 404s |
| **2. Admin** | Pages tree, Puck editor, Import screen, Copy schema, media uploads | A page can be created, edited, previewed and published entirely from `/admin` |
| **3. Hardening** | `PageRevision` + rollback; `Redirect` on slug change; group management UI; footer from DB | Old URLs redirect; a bad publish can be rolled back |
| **4. More blocks** | Gallery, downloads (datasheets), related products, video | As needed |

## 11a. Phase 1 as built

- API `src/modules/pages/`: validator (`page-validator.ts`), menu/breadcrumb logic
  (`page-tree.ts`), service, public + admin controllers, best-effort `RevalidateService`.
  Menu groups: `GET/POST/PATCH/DELETE /admin/nav-groups` (added with Phase 2).
- Block schemas live in `packages/types/src/index.ts`. `GET /admin/pages/schema` returns the
  JSON Schema. Only the first failing stage is reported: a document with a schema error will
  not also list its image-host errors until the schema errors are fixed.
- Images must be under `<public base>/media/`; the editor uploads there via `/admin/media`.
- A published page's slug is frozen (409) until Redirects exist (Phase 3).
- Web: blocks in `features/pages/blocks`, `config.tsx` (Puck config), `catalog-route.tsx`;
  header menu from `/nav` via `lib/nav.ts`. Footer "Products" column is still static (Phase 3).
- Seed: `pnpm --filter @compro/api seed:nav` (49 pages, 8 groups; idempotent, never overwrites).
- Verified: 59 API unit tests; manual run of import, publish, 4-level breadcrumb, unpublish
  to 404, parent delete 409, bad import errors; scroll-spy in a browser. Not yet verified:
  `next build` with the API up and down, mobile chip bar.

## 12. Verification

- **API unit tests:** validator accepts every example document and rejects: unknown block,
  missing required prop, foreign image host, `javascript:` link, oversize doc. Breadcrumb
  resolution for 1–3 levels. Import upsert creates draft only.
- **E2E (local):** seed → `/products/power-electronic-test-and-equipment` renders → import a
  product under it → publish → it appears with correct 4-level breadcrumb and **without**
  a page reload delay → unpublish → 404 and gone from menu.
- **Fallback:** stop the API → site still renders with the static menu; build with API down
  succeeds (as with the hero).
- **Scroll-spy (browser):** highlight follows scroll on desktop and mobile; click scrolls and
  sets the hash; loading `#dc-power-supply` lands there; works in the editor preview.
- **Production checklist:** `prisma migrate deploy`, run seed, set `REVALIDATE_SECRET`
  (both apps) and `WEB_URL` (API), env values **without quotes**.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Puck is pre-1.0; breaking changes between minors | Pin exact version; blocks are plain React, so the renderer can be replaced without changing stored JSON much |
| AI produces plausible but wrong specs | Import is draft-only; human publishes |
| Slug changes break links/SEO | `Redirect` table (Phase 3); warn in UI when changing a published slug |
| `packages/types` single-file constraint grows with block schemas | Acceptable for ~10 blocks; beyond that give the package a build step (see its header comment) |
| Menu fetch on every request | Tag-cached `fetch` + on-demand revalidation; static fallback |
