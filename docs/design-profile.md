# Design Profile (apps/web)

Documents the design tokens actually implemented in `apps/web` today — unlike
`docs/top-nav.md`/`docs/i18n-next.md`, this is **project-specific, not a reusable template**.
Source of truth is `apps/web/src/app/globals.css` plus the Tailwind utility classes used across
`src/components/`; update this file whenever those change, don't let it drift.

## Colors

Defined in `apps/web/src/app/globals.css`:

```css
:root {
  color-scheme: light;
  --background: #ffffff;
  --foreground: #171717;
  --primary: #e91f28;       /* brand red as a FILL */
  --primary-hover: #bf1921;
  --brand-ink: #e91f28;     /* brand red as TEXT/ICON */
  --muted-ink: #52525b;     /* de-emphasised body copy */
  --surface: #e2e2e2;
  --brand-navy: #2d3282;
  --band: #18181b;          /* always-dark section band */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-brand-ink: var(--brand-ink);
  --color-muted-ink: var(--muted-ink);
  --color-band: var(--band);
  --color-surface: var(--surface);
  --color-brand-navy: var(--brand-navy);
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --background: #18181b;
    --foreground: #ededed;
    --brand-ink: #ff5a61;
    --muted-ink: #a1a1aa;
    --surface: #27272a;
    --band: #27272a;
  }
}
```

| Role | Light | Dark | Tailwind usage |
|---|---|---|---|
| Page background | `#ffffff` | `#18181b` (zinc-900) | `bg-background` — used site-wide (`body`, `TopNav`, `page.tsx`, `MobileNav` panel); no component should hardcode `bg-white`/`dark:bg-black` directly, use this token so a future background change is a one-line edit |
| Page text | `#171717` | `#ededed` | `text-foreground` — on `body` and on every heading. The old `text-black dark:text-zinc-50` pair is gone; don't reintroduce it |
| Secondary/body text | `#52525b` (zinc-600) | `#a1a1aa` (zinc-400) | `text-muted-ink` — paragraph copy, card descriptions, footer labels, nav group headings. Replaced the old `text-zinc-600 dark:text-zinc-400` pair |
| Primary brand **fill** | `#e91f28` | same (constant across themes) | `bg-primary`, `border-primary`, the active-nav inset rule — anything where the red is a surface or a rule, never text |
| Primary hover | `#bf1921` (~18% darker) | same | `hover:bg-primary-hover` |
| Brand red as **ink** | `#e91f28` | `#ff5a61` (lifted) | `text-brand-ink` — taglines, active/hover nav, card categories, footer strapline, icon `color="var(--color-brand-ink)"`. Split out from `--primary` because `#e91f28` only measures **3.96:1** on the dark page; the lifted tint measures **5.81:1**. Never use `--brand-ink` for a fill, never use `--primary` for text |
| Button text (on primary) | `#ffffff` | same | `text-white` — fixed white, not theme-dependent, since it's specifically for light text on the red fill |
| Hairline borders/dividers | black 8% | white 14.5% | `border-black/[.08] dark:border-white/[.145]` — section dividers, nav border, card borders. Alpha, not solid grays, so it composes over any surface |
| Surface (utility button bg) | `#e2e2e2` | `#27272a` (zinc-800) | `bg-surface` — the language/search buttons in `NavActions.tsx`, the Industries panel, the AboutIntro image box |
| Band (always-dark section) | `#18181b` | `#27272a` (zinc-800) | `bg-band` + `always-dark` — `Header`, `VisionMission`, `WhyChooseUs`. Lifts one step in dark mode so the band still separates from the `#18181b` page instead of melting into it |
| Brand navy | `#2d3282` | same (constant across themes) | `bg-brand-navy` / `text-brand-navy` — only ever appears on a fixed brand fill (the red Hero panel, the AboutIntro badge), so it has nothing to adapt to |

There is currently no dedicated "secondary color" distinct from this neutral scale — `zinc-*` at
varying shades **is** the secondary palette (used for de-emphasized text and borders, never as a
background fill), now surfaced through `--muted-ink` rather than written out per component.
`--primary`/`--primary-hover`/`--brand-navy` intentionally don't change between light/dark: each
only ever sits on a fixed brand fill, so there's nothing for them to adapt to.

**Resolved (was an open question):** `--surface` (`#e2e2e2`) originally had no dark counterpart,
and the concern was that a light-gray chip would read wrong against dark chrome. Confirmed against
the actual dark nav — it did — so `--surface` now flips to `#27272a`. `--primary` stays constant;
the text-legibility half of that problem is handled by `--brand-ink` instead.

**Accessibility note:** white text on `#e91f28` measures **4.48:1** (WCAG AA wants 4.5:1 for
normal-weight body text) — a hair under, in both themes, since the red is a constant. It clears the
3:1 large-text/UI threshold comfortably and the shortfall is imperceptible; if a strict AA audit
flags it, bump the button label to `font-semibold` rather than darkening the brand red. Note this
applies to *white on the red fill* only — red-as-text now goes through `--brand-ink`, which clears
4.5:1 on every dark surface in the project.

## Dark mode

**Mechanism: `prefers-color-scheme` only — there is no theme toggle and no `.dark` class.** The OS
setting drives everything; Tailwind v4's default `dark:` variant already compiles to
`@media (prefers-color-scheme: dark)`, so `dark:` utilities and the `:root` token block flip
together. If a user-facing toggle is ever wanted, that's a migration to `next-themes` + a `.dark`
class (`@custom-variant dark`), and every `dark:hidden`/`hidden dark:block` pair below keeps working
unchanged — only the trigger moves. `color-scheme` is set on `:root` in both themes so native
scrollbars, form controls and autofill follow along.

### Every surface is one of three kinds

Classify a region before styling it. This is what stops the "invisible text" class of bug:

1. **Adaptive** — the default. Flips with the theme, reads semantic tokens only
   (`bg-background`, `text-foreground`, `text-muted-ink`, `text-brand-ink`, `border-*` alpha pairs).
   Most of the page.
2. **Always-dark** — dark in *both* themes. Add the `always-dark` class next to its own background:
   `Header` + `bg-band`, `VisionMission`/`WhyChooseUs` + `bg-band`, `Footer` + `bg-black`,
   `Hero`'s red panel and `ContactCta` + `bg-primary`, `PageHero`'s deep-red band.
3. **Always-light** — light in both themes, because it hosts third-party artwork we may not
   recolour. Add the `always-light` class: the client-logo tiles in `Partners`, the principal logo
   strip in `PartnerCard`, the `CoreSolutions` figure, and `ContactCta`'s white button.

`.always-dark` / `.always-light` (defined in `globals.css`, inside `@layer base` so a utility on the
same element still wins) re-point `--foreground`, `--muted-ink`, `--brand-ink` and `--surface` to
the values correct for that island's fixed background, and set `color-scheme`. That means
components nested inside them keep using the same semantic tokens and need **no `dark:` variants at
all** — and nothing can inherit a foreground from the wrong theme. Fixed `text-white` inside an
always-dark island is *correct*; pairing it with `dark:` is a bug.

### Assets

- **Icons** already default to `currentColor` (see `docs/icons.md`) — never pass a hex `color` at a
  call site. Use `color="var(--color-brand-ink)"` when an icon needs the brand red.
- **`logo.png` is near-black ink**, so `TopNav` renders both it and `logo-dark.png` and toggles with
  `dark:hidden` / `hidden dark:block`. **`-dark` names the mode the file is used *in*, not its ink
  colour** — `logo-dark.png` is the light-inked one, same dimensions as the original.
- **Marks that need no dark variant** are commented `dark-mode:exempt` at the point of use:
  `logo-square.webp` and `app/icon.png` (brand red/navy only, no dark ink), `UkFlagIcon` (a flag has
  fixed real-world colours), the hero carousel dots (always over photography).
- **Third-party logos are never recoloured or inverted** — `filter: invert()` would turn brand red
  into cyan. They go on an `always-light` chip instead.
- **`core-solution-desktop.webp` bakes in near-black labels** and has no dark-inked twin, so it sits
  on an `always-light` chip. If a dark version is ever drawn, add it as
  `core-solution-desktop-dark.webp` and swap the chip for a `dark:hidden`/`hidden dark:block` pair.
- **Photos are left alone.** Where a photo sits under text the fix is the scrim, not a second asset.
- `theme-color` is declared per scheme in `layout.tsx`'s `viewport` export, matching `--band` (the
  utility bar at the very top of the page).

### Measured contrast

Measured with `~/.claude/skills/dark-mode/scripts/contrast.mjs`. AA thresholds: 4.5:1 body,
3:1 large text and UI components.

| Pair | Ratio | |
|---|---|---|
| `foreground` on dark page `#18181b` | 15.13:1 | ✅ |
| `muted-ink` on dark page | 6.91:1 | ✅ |
| `brand-ink` on dark page | 5.81:1 | ✅ (was 3.96:1 with the unlifted red) |
| `foreground` on band `#27272a` | 12.72:1 | ✅ |
| `muted-ink` on band | 5.81:1 | ✅ |
| `brand-ink` on band | 4.88:1 | ✅ |
| `foreground` on footer black | 17.94:1 | ✅ |
| `muted-ink` on footer black | 8.19:1 | ✅ (was 4.35:1 with `text-zinc-500`) |
| `brand-ink` on footer black | 6.89:1 | ✅ |
| `foreground` / `muted-ink` on light page | 17.93:1 / 7.73:1 | ✅ |
| `foreground` on `bg-surface` (light `#e2e2e2` / dark `#27272a`) | 13.84:1 / 12.72:1 | ✅ |
| `foreground` / `muted-ink` on `zinc-800/40` over dark page | 14.20:1 / 6.49:1 | ✅ |
| `foreground` / `muted-ink` on `bg-white/5` over the band | 10.95:1 / 5.00:1 | ✅ |
| white on `PageHero` band `#c5242b` (+ breadcrumb at 90%) | 5.74:1 / 4.89:1 | ✅ |
| white on brand navy `#2d3282` | 11.11:1 | ✅ |
| white on primary red `#e91f28` | 4.48:1 | ⚠️ see the accessibility note above |
| `border-primary` outline on the dark page (UI, 3:1) | 3.96:1 | ✅ |

`Services.tsx` still carries the old `text-black dark:text-zinc-50` / `text-zinc-600
dark:text-zinc-400` pairs — it's off the homepage pending a redesign, and both pairs are correct as
written, so it was left alone. Migrate it to `text-foreground`/`text-muted-ink` when it's rebuilt.

## Typography

```ts
// apps/web/src/app/layout.tsx
const lufga = localFont({
  src: [
    { path: "./fonts/lufga/Lufga-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/lufga/Lufga-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/lufga/Lufga-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/lufga/Lufga-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-lufga",
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

```css
/* globals.css */
@theme inline {
  --font-sans: var(--font-lufga);
  --font-mono: var(--font-geist-mono);
}
body {
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

- **Body/UI font: Lufga**, self-hosted via `next/font/local` (**not** a Google Font — a commercial
  typeface by Adam Ladd Design; the licensing source of the font files added to this repo is the
  project owner's responsibility, not verified as part of this change). Font files live at
  `apps/web/src/app/fonts/lufga/*.otf`. Only the four static weights actually referenced by
  Tailwind classes in the codebase are included — Regular (400, the unstyled default), Medium (500,
  `font-medium`), SemiBold (600, `font-semibold`), Bold (700, `font-bold`) — matching real weight
  files rather than letting the browser fake/synthesize bold from Regular. No italic files are
  included since no component uses `italic`. If a new component needs a weight/style outside this
  set (e.g. Light, or any italic), add the corresponding `.otf` from the source zip to the same
  folder and a matching entry to the `src` array — don't let the browser synthesize a style that has
  a real static file sitting unused in the source archive.
- **Monospace: Geist Mono** — loaded, currently unused anywhere (no `font-mono` class exists yet).
  Fine to leave in place for future use (code snippets, tabular numbers), or remove the
  `Geist_Mono` import/variable if it's confirmed nothing will ever need it.

### Font rules

Six fixed (size, weight) pairs — every text element in the project resolves to one of these, no
other size/weight combination is used:

| Token | Size | Weight | Tailwind classes | Used for |
|---|---|---|---|---|
| `tagline` | 12px | 400 (regular) | `text-xs` | `SectionTagline` — the eyebrow label above every section title |
| `title` | 39px | 600 (semibold) | `text-[39px] font-semibold tracking-tight` | `SectionTitle`, and every other page/section-level heading (Hero `<h1>`) |
| `body-base-medium` | 16px | 600 (semibold) | `text-base font-semibold` | Card/list sub-headings (`FeatureCard`, `InsightCard`, `PartnerCard`, `FeatureListItem`, `Industries` active panel `<h3>`), CTA button labels |
| `body-sm-medium` | 14px | 600 (semibold) | `text-sm font-semibold` | Emphasized small text — nav links, footer links/list items, "View All", card category labels, `Industries` list buttons |
| `body-sm` | 14px | 400 (regular) | `text-sm` | Default paragraph copy and secondary/meta text |
| `body-xs` | 12px | 400 (regular) | `text-xs` | Fine print — footer copyright line |

Only these six pairs are valid: `font-medium` (500) and `font-bold` (700) don't appear anywhere in
the project — anything that needs emphasis takes `font-semibold` (600) instead, everything else
stays at the unstyled default (400, no `font-normal` class needed). Sizes outside {12, 14, 16,
39}px (`text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl`, arbitrary px values other than
`39`) don't appear either — every heading collapses to `title`, every other piece of text collapses
to whichever body token is closest in size and weight.

**Applied project-wide** (2026-08-05) — notable roundings made migrating existing components onto
this scale, since the strict 6-token set didn't leave room for everything that was there before:
- Hero's `<h1>` was `text-4xl sm:text-5xl` (36px/48px) — now flat `title` (39px), same size as every
  section heading. There's deliberately no separate "hero/display" tier above `title`.
- Regular paragraph copy that was `text-base`/`text-lg` (16px/18px, regular weight) is now `body-sm`
  (14px) — there's no regular-weight 16px token in this scale.
- Anything that was `font-medium` (nav links, footer links/list items, "View All", card category
  labels, CTA buttons) or `font-bold` (`Partners` intro line, `PartnerCard` name) is now
  `font-semibold`, paired with whichever size token it already matched.
- `SectionTagline` previously had no explicit size class (inherited the page's base 16px) — now
  explicitly `text-xs` so it actually renders at the `tagline` token's 12px.
- `Services.tsx` was left untouched — it's already off the homepage pending a full redesign, so
  restyling it now would be thrown away.
- `ui/button.tsx` and `ui/carousel*.tsx` (shadcn primitives, not project-authored content) were left
  untouched — same treatment as their pre-existing lint issues, out of scope for this pass.

## Spacing & layout

- **Content width cap:** `max-w-[1920px]` — nav only so far (`TopNav.tsx`), per `docs/top-nav.md`.
  Homepage sections instead cap per-element: `max-w-2xl` (Hero heading), `max-w-xl` (Hero/ContactCta
  paragraphs), `max-w-4xl` (Services grid).
- **Section vertical rhythm:** `py-8` (32px, matching the [Gap scale](#gap-scale) below) — uniform
  across every homepage section (`Hero`/`Partners`/`About`/`Industries`/`WhyChooseUs`/`Services`/
  `ContactCta`). No section gets taller padding than another, including `Hero` — a deliberate
  reset from an earlier version of this doc that gave `Hero` taller `py-24 sm:py-32` banner padding;
  that's no longer the case.
- **Section horizontal padding:** `px-6` flat, no responsive scaling yet on homepage sections
  (`TopNav` is the only place that scales `px-6 → sm:px-10 → lg:px-16`, since it needs the extra
  room at the 1920px cap — see `top-nav.md` § 2).
- **Nav height:** fixed `h-16` (64px) — referenced by `scroll-mt-16` on every anchor-target section
  so the sticky header doesn't cover the heading when jumped to, and by `MobileNav`'s panel
  (`top-16`) to sit flush beneath the bar.
- **z-index scale:** `z-50` (TopNav header), `z-40` (mobile nav panel) — keep any future overlay
  (modal, toast) above `z-50` or explicitly reason about where it sits relative to the nav.

### Gap scale

Gap values follow an 8px-multiple scale (Tailwind's spacing unit is 4px, so these are always even
steps). New spacing decisions — `gap-*`, and by extension `p-*`/`m-*` — should snap to one of these
six values rather than picking an arbitrary Tailwind step:

| px | rem | Tailwind class | Used for |
|---|---|---|---|
| 8px | 0.5rem | `gap-2` | Tightest grouping — icon+label pairs (`SectionTagline`, `NavActions`, `TopNav`'s action cluster) |
| 16px | 1rem | `gap-4` | Default content gap — card/list internals (`FeatureCard`, `FeatureListItem`, the stacks inside `About`/`Partners`/`WhyChooseUs`) |
| 24px | 1.5rem | `gap-6` | Grid gaps between cards (`Services`, `Industries`), `Hero`/`ContactCta` top-level stacks |
| 32px | 2rem | `gap-8` | Larger block separation within a section (`WhyChooseUs` content stack) |
| 40px | 2.5rem | `gap-10` | Section-level separation — between a section's header block and its content grid/list (`About`, `Services`, `Partners`, `Industries`, `WhyChooseUs`, `TopNav`'s logo+nav cluster) |
| 64px | 4rem | `gap-16` | Reserved for large top-level separation — not in use yet, available for a future wide header/content split |

**Pre-existing off-scale exceptions**, kept as-is rather than "fixed" as a drive-by edit while
touching something else: `gap-1` (4px — `FeatureCard`'s and `FeatureListItem`'s title-to-description)
and `gap-3` (12px — `Industries`' list items, `Header`'s bar). Both are tight inline pairs where the
half-step reads better than jumping straight to 8px; revisit only if one of those components is
being touched for another reason anyway.

## Shape

**Default: no radius (square corners).** Any new panel/card/container/button starts square unless
one of the deliberate exceptions below applies — don't add a `rounded-*` class "because it looks
nicer" without a reason; square is the baseline this project has settled on.

- `rounded-full` — the primary CTA buttons/pill (`Hero`/`ContactCta`), hamburger button. A
  deliberate exception, not the default — reserved for primary-CTA/pill treatment specifically.
- **Square (no radius), matching the default** — `NavActions` button trio (language, search,
  Contact Us in `TopNav`), `FeatureCard` (`About`'s cards), `FeatureListItem`
  (`WhyChooseUs`'s icon rows), the Industries image panel, Partners logo placeholders. Don't
  accidentally round these to match Hero/ContactCta's pill CTAs — the two shapes signal different
  things (primary action vs. everything else).
- **`rounded-2xl` — Services cards only, not yet migrated to the square default above.** A holdover
  from before this project settled on square-by-default; revisit if Services is touched again, but
  don't change it as a drive-by edit while working on something else.

## Recommendations

- If a second brand hue is ever needed, add it as `--color-secondary`/`--color-secondary-hover`
  next to `--primary` in `globals.css`, following the same pattern — don't reach for a raw Tailwind
  color or an arbitrary hex literal in a component file.
- Keep using `bg-background`/`text-foreground` (not `bg-white dark:bg-black` pairs) for any new
  full-bleed section background — that's what already made the zinc-900 dark-background change a
  three-file edit instead of a repo-wide find-and-replace.
- Same rule for text: reach for `text-foreground` / `text-muted-ink` / `text-brand-ink` before
  writing a `text-<something> dark:text-<something-else>` pair. A new `dark:` variant in a component
  is a signal that a token is missing, not that the component needs a second colour. The exception
  is a genuinely fixed island — and that gets `always-dark`/`always-light` instead.
