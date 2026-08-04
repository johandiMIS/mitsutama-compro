# Section Container — Standards & Reusable Pattern

Reusable reference for a shared full-bleed-background/capped-content wrapper used across page
sections. Written to be copy-pasted as the baseline for new projects on this stack (Next.js +
Tailwind CSS v4) — same underlying pattern as `docs/top-nav.md` §2, generalized so every section
(not just the nav) gets identical padding/margin/max-width behavior instead of redefining it
per-component. **Implemented** — `apps/web/src/components/SectionContainer.tsx` exists and is
wired into every homepage section (`Hero`/`About`/`Services`/`Partners`/`ContactCta`) and `TopNav`.

## 1. Problem

Page sections written ad hoc (one `<section>` per component, each hand-rolling its own horizontal
spacing) drift in two ways once there's more than a couple of them:

- **No outer width cap.** On an ultra-wide monitor (2560px+), a full-bleed section
  background/content runs edge-to-edge past a comfortable reading width — nothing stops it.
- **Inconsistent horizontal padding.** Some sections use a flat `px-6`, others scale it
  responsively, so sections don't align to the same left/right edge across breakpoints, and the
  nav (which *does* get this right) visually disagrees with the content below it.

`docs/top-nav.md` §2 already solved this once, for the nav specifically. This doc lifts that same
pattern into a shared component so every section gets it for free, instead of the nav being the
only place it's correct.

## 2. Pattern: `SectionContainer`

Same full-bleed-bg/capped-content split as `TopNav`: the outer element (here, each section's own
`<section>`) carries the full-bleed background/border/vertical padding; `SectionContainer` wraps
just the content and applies the `max-w` cap, centering, and responsive horizontal padding —
uniformly, in one place.

```tsx
// components/SectionContainer.tsx
import type { ElementType, ReactNode } from "react";

export function SectionContainer({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16 ${className}`}>
      {children}
    </Tag>
  );
}
```

Usage — a section keeps its own full-bleed background/border/vertical padding on the outer
`<section>`, and wraps only its content in `<SectionContainer>`:

```tsx
// e.g. About.tsx
import { SectionContainer } from "@/components/SectionContainer";

export function About() {
  return (
    <section
      id="about"
      className="w-full border-t border-black/[.08] py-20 dark:border-white/[.145]"
    >
      <SectionContainer className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">About Us</h2>
        <p className="max-w-2xl">...</p>
      </SectionContainer>
    </section>
  );
}
```

- **1920px cap and `px-6 → sm:px-10 → lg:px-16` responsive padding are the exact values already
  established in `docs/top-nav.md` §2** — don't invent a second scale for sections; if that scale
  ever changes, it changes in exactly one file (`SectionContainer.tsx`), not once per section.
- **Does not replace tighter per-content `max-w`** (a heading's `max-w-2xl`, a grid's `max-w-4xl`,
  etc.). Those solve a different problem — readable line length / grid sizing — and stay as an
  *inner* constraint nested inside the 1920px outer cap, not something `SectionContainer` owns.
- **Vertical padding and background/border stay on the outer `<section>`**, not inside
  `SectionContainer`. Vertical rhythm varies per-section on purpose (`py-20` vs. Hero's taller
  `py-24 sm:py-32`, per whatever this project's own design-profile doc says) while horizontal
  behavior should not — `SectionContainer` only owns horizontal centering/padding/max-width.
- **`as` prop** lets it render as a plain `<div>` (the default, nested inside a `<section>`) or
  directly as the outer landmark element itself (`as="header"`, `as="footer"`) when there's no
  extra wrapping needed. `TopNav.tsx` uses the default `<div>` form, nested one level inside its
  own `<header>` — same split described in `docs/top-nav.md` §2, now sourced from this one shared
  component instead of a hand-written copy of the same three classes.

## 3. When to reach for this vs. inline

- **Any full-width page section** (marketing sections, footer, any full-bleed band) — use
  `SectionContainer` for the horizontal cap/padding.
- **Nested, non-full-width content** (a card inside a grid, a modal, a form field) — not
  full-bleed, doesn't need this; just use `max-w-*` directly, same as today.

## 4. File structure

```
apps/web/src/components/SectionContainer.tsx
```

Shared, cross-feature UI — same tier as `components/icons/` and `components/ui/` per
`docs/architecture.md`'s convention, not tied to one page or feature.

## Verification checklist

- A full-bleed section's background spans the full viewport width past 1920px (check on an
  ultra-wide monitor or by resizing the browser past 1920px); its content stays capped and
  centered, not stretched edge-to-edge.
- Horizontal padding matches `TopNav`'s at every breakpoint (`px-6` / `sm:px-10` / `lg:px-16`) so
  every section aligns to the same left/right edges as the nav above it.
- `grep -r "max-w-\[1920px\]" apps/web/src` only matches `SectionContainer.tsx` — no section (or
  `TopNav`) hand-rolls the same three classes again.
