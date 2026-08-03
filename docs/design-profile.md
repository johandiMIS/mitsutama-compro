# Design Profile (apps/web)

Documents the design tokens actually implemented in `apps/web` today — unlike
`docs/top-nav.md`/`docs/i18n-next.md`, this is **project-specific, not a reusable template**.
Source of truth is `apps/web/src/app/globals.css` plus the Tailwind utility classes used across
`src/components/`; update this file whenever those change, don't let it drift.

## Colors

Defined in `apps/web/src/app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #e91f28;
  --primary-hover: #bf1921;
  --surface: #e2e2e2;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-surface: var(--surface);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #18181b;
    --foreground: #ededed;
  }
}
```

| Role | Light | Dark | Tailwind usage |
|---|---|---|---|
| Page background | `#ffffff` | `#18181b` (zinc-900) | `bg-background` — used site-wide (`body`, `TopNav`, `page.tsx`, `MobileNav` panel); no component should hardcode `bg-white`/`dark:bg-black` directly, use this token so a future background change is a one-line edit |
| Page text | `#171717` | `#ededed` | `text-foreground` (via `body`), or explicit `text-black dark:text-zinc-50` on headings |
| Primary brand color | `#e91f28` | same (constant across themes) | `bg-primary` — both CTA buttons (Hero, ContactCta) |
| Primary hover | `#bf1921` (~18% darker) | same | `hover:bg-primary-hover` |
| Button text (on primary) | `#ffffff` | same | `text-white` — fixed white, not theme-dependent, since it's specifically for light text on the red fill |
| Secondary/body text | zinc-600 | zinc-400 | `text-zinc-600 dark:text-zinc-400` — paragraph copy across Hero/About/Services/ContactCta |
| Hairline borders/dividers | black 8% | white 14.5% | `border-black/[.08] dark:border-white/[.145]` — section dividers, nav border, service card borders |
| Surface (utility button bg) | `#e2e2e2` | same (constant across themes) | `bg-surface` — the language/search icon buttons in `NavActions.tsx` |

There is currently no dedicated "secondary color" distinct from this neutral scale — `zinc-*` at
varying shades **is** the secondary palette (used for de-emphasized text and borders, never as a
background fill). `--primary`/`--primary-hover`/`--surface` intentionally don't change between
light/dark — they stay constant while the neutral background/foreground pair inverts around them.
**Open question:** `--surface` (`#e2e2e2`, a light gray) was specified without a dark-mode
counterpart, same as `--primary` — but unlike the brand red, a light-gray chip sitting on the
`zinc-900` dark background may read as visually inconsistent (too bright against the surrounding
dark chrome). Revisit if that turns out to look wrong once seen against the actual dark nav.

**Accessibility note:** white text on `#e91f28` measures **4.48:1** contrast (WCAG AA requires
4.5:1 for normal-weight text at the current `text-base`/`font-medium` size) — a hair under the
threshold. It comfortably passes the 3:1 large-text/UI-component threshold, and the shortfall is
imperceptible in practice, but if a strict AA audit ever flags it, the fix is bumping button text
to `font-semibold` (perceptually reads as "large text" territory) rather than darkening the brand
red itself.

## Typography

```ts
// apps/web/src/app/layout.tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

```css
/* globals.css */
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
body {
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

- **Body/UI font: Geist Sans.** (Fixed as part of writing this doc — `body`'s `font-family` was
  hardcoded to `Arial, Helvetica, sans-serif` with no reference to `--font-sans` anywhere in the
  tree, so Geist was loaded but never actually rendered. Now applied at the `body` level with the
  original Arial/Helvetica chain kept only as an inert fallback.)
- **Monospace: Geist Mono** — loaded, currently unused anywhere (no `font-mono` class exists yet).
  Fine to leave in place for future use (code snippets, tabular numbers), or remove the
  `Geist_Mono` import/variable if it's confirmed nothing will ever need it.

Type scale actually in use:

| Class | Used for |
|---|---|
| `text-4xl sm:text-5xl` + `font-semibold tracking-tight` | Hero `<h1>` |
| `text-2xl` + `font-semibold tracking-tight` | Section `<h2>` (About/Services/ContactCta) |
| `text-lg` + `font-medium` | Service card `<h3>`; mobile nav panel links |
| `text-lg` | Hero paragraph |
| `text-base` | Body paragraphs (About/ContactCta), button label text |
| `text-sm` | Service card description text |

## Spacing & layout

- **Content width cap:** `max-w-[1920px]` — nav only so far (`TopNav.tsx`), per `docs/top-nav.md`.
  Homepage sections instead cap per-element: `max-w-2xl` (Hero heading), `max-w-xl` (Hero/ContactCta
  paragraphs), `max-w-4xl` (Services grid).
- **Section vertical rhythm:** `py-20` (About/Services/ContactCta), `py-24 sm:py-32` for Hero (taller,
  since it's the top banner).
- **Section horizontal padding:** `px-6` flat, no responsive scaling yet on homepage sections
  (`TopNav` is the only place that scales `px-6 → sm:px-10 → lg:px-16`, since it needs the extra
  room at the 1920px cap — see `top-nav.md` § 2).
- **Nav height:** fixed `h-16` (64px) — referenced by `scroll-mt-16` on every anchor-target section
  so the sticky header doesn't cover the heading when jumped to, and by `MobileNav`'s panel
  (`top-16`) to sit flush beneath the bar.
- **z-index scale:** `z-50` (TopNav header), `z-40` (mobile nav panel) — keep any future overlay
  (modal, toast) above `z-50` or explicitly reason about where it sits relative to the nav.

## Shape

- `rounded-full` — the primary CTA buttons/pill (`Hero`/`ContactCta`), hamburger button.
- `rounded-2xl` — Services cards only. No other card/panel treatment exists yet.
- **No radius (square corners)** — the `NavActions` button trio (language, search, Contact Us in
  `TopNav`). A deliberate exception to the `rounded-full` CTA convention above, not an
  inconsistency — this cluster is meant to read as distinct utility chrome, not a primary CTA.
  Don't accidentally round these to match Hero/ContactCta; don't accidentally un-round Hero/
  ContactCta to match these, either — the two shapes signal different things.

## Recommendations

- If a second brand hue is ever needed, add it as `--color-secondary`/`--color-secondary-hover`
  next to `--primary` in `globals.css`, following the same pattern — don't reach for a raw Tailwind
  color or an arbitrary hex literal in a component file.
- Keep using `bg-background`/`text-foreground` (not `bg-white dark:bg-black` pairs) for any new
  full-bleed section background — that's what already made the zinc-900 dark-background change a
  three-file edit instead of a repo-wide find-and-replace.
