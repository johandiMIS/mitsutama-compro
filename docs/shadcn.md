# shadcn/ui — Standards & Components (apps/web)

Project-specific conventions for adopting [shadcn/ui](https://ui.shadcn.com) in `apps/web`, plus a
running registry of components as they're added. **Initialized** — `components.json` and
`src/lib/utils.ts` exist; `init` and the first `add` have already run (see
[Components](#components) below for what's installed).

## Why shadcn/ui here

Unlike a normal npm dependency, `shadcn add` copies component source directly into the repo
(`src/components/ui/`) instead of installing a black-box package. That fits how this project
already treats UI code — `docs/icons.md` hand-owns every icon file for the same reason: full
control, no fighting a library's internals to reskin it, and a future swap only touches the files
that actually need to change. Components are built on unstyled Radix primitives + Tailwind, so
they inherit this project's existing `globals.css` tokens rather than shipping their own design
system.

## Init conventions

Run from **`apps/web/`**, not the repo root — `components.json`, the aliases below, and the
`globals.css` file it patches are all app-scoped, same as every other web-only tool in this repo
(there's no `packages/ui` yet — see `docs/architecture.md`, don't create one speculatively for a
single app).

```bash
cd apps/web
pnpm dlx shadcn@latest init -y -p nova
```

**Note:** the shadcn CLI has moved to a preset-based flow (verified against the actual installed
version, not assumed) — there's no more interactive style/base-color prompt sequence. `init` alone
prompts for a preset (`nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`, or `custom`);
pass `-p <preset>` to skip the prompt non-interactively. `nova` ("Lucide / Geist") was picked here
since the project already uses Geist fonts. `-y` skips the remaining confirmation. The resulting
`components.json`:

| Field | Value | Why |
|---|---|---|
| `style` | `base-nova` | Set by the `nova` preset — arbitrary pick, easily changed later since the output is owned code, not a locked-in theme. |
| `tailwind.baseColor` | `neutral` | Matches the zinc/neutral scale `design-profile.md` already uses for secondary text and borders. |
| `tailwind.cssVariables` | `true` | The project already drives theming through CSS custom properties + `@theme inline` in `globals.css` — see [Token reconciliation](#token-reconciliation) below, `init` does **not** merge cleanly on its own. |
| `tailwind.config` | `""` (empty) | Correctly auto-detected Tailwind v4 CSS-first config (`@import "tailwindcss"` in `globals.css`, no `tailwind.config.ts` anywhere in `apps/web`) — didn't try to scaffold a legacy config file. |
| `aliases.components` / `.utils` / `.ui` / `.lib` / `.hooks` | `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks` | Matches the `@/*` → `./src/*` alias already in `tsconfig.json`. |
| `rsc` | `true` | App Router project. |
| `iconLibrary` | `lucide` | See [Icons inside shadcn components](#icons-inside-shadcn-components). |

## Token reconciliation

`init` appends its own set of CSS variables to `globals.css` — `--card`, `--popover`,
`--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`,
`--chart-*`, `--sidebar-*` — and a matching `@theme inline` color mapping. It does **not** merge
cleanly with what was already there; three real regressions showed up in the actual `init` diff on
this repo (not hypothetical — this is what happened, fixed in the same change that ran `init`):

1. **`--primary` got clobbered.** `init` overwrote it to a generated near-black
   (`oklch(0.205 0 0)`), silently shadowing the brand red (`#e91f28`) used by every CTA per
   `design-profile.md`. Fix: re-point `--primary` back at the brand red immediately after `init`,
   keep `--primary-hover`/`--surface` untouched — those three intentionally don't change between
   light/dark (see `design-profile.md`), so they never belong in a dark-mode override block.
2. **`--font-sans` became circular.** `init` rewrote `--font-sans: var(--font-geist-sans)` to
   `--font-sans: var(--font-sans)` — a self-reference. Fix: restore the reference to
   `--font-geist-sans` (the actual `next/font` variable name set in `layout.tsx`).
3. **`init` added `@custom-variant dark (&:is(.dark *));`**, which redefines Tailwind's `dark:`
   variant to require a `.dark` class instead of Tailwind v4's default `prefers-color-scheme`
   media query — and moved all dark-mode token overrides into a `.dark { ... }` block. **This app
   has no theme toggle that ever adds a `.dark` class** — dark mode is purely OS-preference-driven,
   and every existing `dark:` utility across `Header`/`TopNav`/`Hero`/etc. depends on that. Left
   as-is, this change would silently break dark mode app-wide, not just for new shadcn components.
   Fix: delete the `@custom-variant dark` line, and move the `.dark { ... }` block's contents into
   `@media (prefers-color-scheme: dark) { :root { ... } }` instead, merged with the existing
   `--background`/`--foreground` dark overrides.

```css
/* apps/web/src/app/globals.css — reconciled state */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #e91f28;          /* restored — not shadcn's generated default */
  --primary-hover: #bf1921;
  --primary-foreground: #ffffff;
  --surface: #e2e2e2;
  --card: oklch(1 0 0);        /* shadcn-generated tokens with no prior collision: left as-is */
  /* ...--popover/--secondary/--muted/--accent/--destructive/--border/--input/--ring/--chart-*/--sidebar-*... */
}

@theme inline {
  --font-sans: var(--font-geist-sans);  /* fixed — was circular after init */
  /* ...--color-* mappings... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #18181b;
    --foreground: #ededed;
    --card: oklch(0.205 0 0);
    /* ...rest of shadcn's dark values, moved here from the now-deleted .dark block...
       --primary/--primary-hover/--surface deliberately absent — they stay constant. */
  }
}
```

**Rule going forward:** after any `shadcn add` or `init` re-run, diff `globals.css` before
trusting it — check for exactly one `--primary` definition, no circular `--font-sans`, and no
`@custom-variant dark` reappearing. Update `design-profile.md` afterward too, since it documents
actual implemented tokens and would otherwise drift per its own stated rule.

## File/folder conventions

- **`apps/web/src/components/ui/`** — shadcn-owned primitives only (`button.tsx`, `carousel.tsx`,
  `dialog.tsx`, …), one file per component, generated by the CLI. Don't hand-write a component here
  that didn't come from `shadcn add`.
- **`apps/web/src/components/`** (existing: `header/`, `nav/`, `icons/`, `Hero.tsx`, `Services.tsx`,
  etc.) — unchanged. Compose `ui/` primitives into these; don't move existing hand-authored
  components into `ui/`.
- **`apps/web/src/lib/utils.ts`** — the `cn()` helper, created by `init`. This is the seed of the
  `src/lib/` directory `docs/architecture.md` describes for the eventual feature-based layout.
- Once `apps/web/src/features/*` exists per `docs/architecture.md`, `components/ui/` stays shared
  (cross-feature) for the same reason `components/icons/` does — it's genuinely reused primitive
  UI, not one feature's concern.

## Adding / customizing a component

```bash
cd apps/web
pnpm dlx shadcn@latest add <name>
```

- The CLI copies source into `components/ui/` — that file is now **owned code**. Editing it
  directly for a project-specific tweak (spacing, a removed variant, brand-specific styling) is
  expected and correct, not a hack — that's the entire point of the copy-in model. Keep the
  exported prop/variant API stable unless the change is meant to apply everywhere that component
  is used.
- Re-running `add` on an already-customized component **overwrites the file** with fresh upstream
  source. Check `git diff` before and after; don't blindly re-run `add` on something you've since
  hand-edited without expecting to redo those edits.

## Icons inside shadcn components

Generated component source frequently imports `lucide-react` icons inline (chevrons on Select,
arrows on Carousel, the close `X` on Dialog, etc.) — this conflicts on the surface with
`docs/icons.md`'s "every icon is its own wrapped component" rule.

**Policy:** leave `lucide-react` imports as-is inside `components/ui/*` — they're vendored
primitive code, not hand-authored feature code, the same carve-out logic `icons.md` already applies
to flag icons. **Don't** import `lucide-react` anywhere outside `components/ui/`; everywhere else
in the app keeps using the `docs/icons.md` convention (hand-drawn, or `@gravity-ui/icons` wrapped
in `components/icons/`). `lucide-react` becomes a prod dependency the first time an added component
needs it — expected, not a mistake to "fix" by swapping it for the project's own icon set inside a
shadcn primitive.

## Components

Registry of components as they're added — update this table alongside each `shadcn add`.

| Component | Status | Location | Extra deps | Used in | Notes |
|---|---|---|---|---|---|
| Carousel | Installed | `apps/web/src/components/ui/carousel.tsx` | `embla-carousel-react`, `embla-carousel-autoplay` | `Hero.tsx` | See below |
| Button | Installed (transitive) | `apps/web/src/components/ui/button.tsx` | `class-variance-authority` | Carousel's prev/next controls | Pulled in automatically by `shadcn add carousel` — carousel's arrow buttons are built on it. Not deliberately added on its own yet; treat as a normal owned primitive if it later gets used directly. |
| Carousel dots (companion, not a `shadcn add`) | Installed | `apps/web/src/components/ui/carousel-dots.tsx` | — | `Hero.tsx` | Hand-built per the "Dot/square indicators are not built in" note below. |

### Carousel

Requirement: full-width/big-screen carousel, auto-slide with manual override, dot/square page
indicators.

- **Base component** (`shadcn add carousel`) wraps [Embla Carousel](https://www.embla-carousel.com/)
  — pulls in `embla-carousel-react` automatically. Ships `Carousel`, `CarouselContent`,
  `CarouselItem`, `CarouselPrevious`, `CarouselNext` — previous/next arrow buttons only.
- **Autoplay is not built in.** Requires the separate `embla-carousel-autoplay` package, passed as
  a plugin:
  ```tsx
  import Autoplay from "embla-carousel-autoplay";

  <Carousel plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}>
  ```
  `stopOnInteraction: false` (or `stopOnMouseEnter: true`) is what satisfies "auto-slide but still
  manual" — a manual arrow/dot click doesn't permanently kill autoplay, it just pauses/resumes per
  the plugin's own option.
- **Page indicators are not built in either.** shadcn's carousel only ships prev/next buttons —
  indicators must be hand-built via the `CarouselApi` returned from `setApi`, tracking
  `api.selectedScrollSnap()` / `api.scrollSnapList()` / `api.on("select", …)`, per the pattern in
  shadcn's own docs. Built once as a small companion component (`components/ui/carousel-dots.tsx`,
  extending the primitive) rather than re-implementing the `useState`/`useEffect` wiring at every
  call site — it's generic enough to belong next to `carousel.tsx`, not inside whichever page
  section uses it first. Despite the filename, the actual shape is **square** (`h-2 w-2`, no
  `rounded-full`) — active = `bg-primary`, inactive = `bg-white` with `shadow-sm` for legibility
  against varying slide backgrounds. In `Hero.tsx` it's absolutely positioned
  (`absolute inset-x-0 bottom-4`) inside `<Carousel>` (already `position: relative`) so it overlays
  bottom-center on the slide instead of sitting below it as a separate block.
- **Full-width/big-screen:** the `<Carousel>` wrapper needs an explicit width (e.g. full-bleed
  section, no `max-w-*` cap) — the default shadcn example is card-width, so this is a per-usage
  override, not something to change in the owned primitive itself.

### Logo marquee (Partners section)

Not a `shadcn add` component — a composition pattern on top of the same `Carousel` primitive, for
an infinitely-scrolling row of logos (no pages/dots, continuous motion instead of discrete slides).
Used in `Partners.tsx`.

- **`embla-carousel-auto-scroll`** (separate plugin package, same Embla engine already installed
  for the Hero carousel — reuses the primitive instead of pulling in a second marquee library like
  `react-fast-marquee`):
  ```tsx
  import AutoScroll from "embla-carousel-auto-scroll";

  <Carousel
    opts={{ loop: true, dragFree: true, align: "start" }}
    plugins={[AutoScroll({ speed: 1, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: true })]}
  >
  ```
  `dragFree: true` lets it glide continuously instead of snapping to a slide; `stopOnMouseEnter`
  pauses on hover (a click/drag would otherwise also pause it, since `stopOnInteraction` is off).
  `startDelay` defaults to **1000ms and applies on every restart, not just the initial load** — so
  without overriding it to `0`, resuming after mouse-leave has a visible stall before motion
  continues.
- **`CarouselItem` needs `basis-auto`**, not the primitive's default `basis-full` — a marquee shows
  many fixed-width items at once, not one full-width slide per view.
- **Duplicate the item list** (e.g. `[...items, ...items]`) so there's enough total width to loop
  seamlessly — with too few real logos, Embla's `loop: true` still wraps correctly but the gap
  before the wrap becomes visible on wide screens.
- **Edge fade**: `[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]`
  on the `<Carousel>` wrapper fades logos in/out at the row's edges instead of a hard clip.

## Verification checklist

- `apps/web/components.json` exists; aliases match the `@/*` alias already in `tsconfig.json`.
- `globals.css` has exactly one `--primary` definition in effect (no shadcn default silently
  shadowing the brand red) — check by rendering a shadcn `<Button>` and confirming it's the brand
  red, not shadcn's generated default.
- `grep -rl "lucide-react" apps/web/src` only matches files under `apps/web/src/components/ui/`.
- `pnpm --filter @compro/web build` succeeds after each `shadcn add`.
- This file's [Components](#components) table reflects what's actually installed — update it in
  the same change that runs `shadcn add`.
