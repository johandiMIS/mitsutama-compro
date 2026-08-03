# Top Navigation — Standards & Reusable Pattern

Reusable reference for the single top nav used across all public pages. Written to be
copy-pasted as the baseline for new projects on this stack (Next.js App Router + Tailwind CSS
v4) — swap the nav items/branding below for the new project's own and the rest applies as-is.
**This document is a design spec, not yet implemented** — no `TopNav` component exists in
`apps/web` yet; build it from this reference when the nav is actually needed.

## 1. Standards

Baseline expectations for any top nav, regardless of project:

**Semantics & landmarks**
- Wrap the whole bar in `<header>`, the links in a `<nav aria-label="Main">` — screen readers
  and browser landmark navigation rely on this, not on `<div>` soup.
- Use `next/link` for internal routes (prefetching, client-side nav) — plain `<a>` only for
  external links or `mailto:`/`tel:`.
- One `<nav>` per page for the primary nav. If a mobile panel duplicates the same links, it's
  still the same logical nav (toggled visibility), not a second landmark.

**Accessibility**
- Hamburger button: real `<button type="button">`, never a `<div onClick>`. Must carry
  `aria-expanded` (reflects open state) and `aria-controls` (id of the panel it toggles), plus an
  `aria-label` (e.g. `"Toggle navigation menu"`) since the icon alone has no accessible name.
- `Escape` closes the open mobile panel and returns focus to the hamburger button.
- Closing the panel on route change (a link was clicked) is required — a panel that stays open
  after navigation is a common, easy-to-miss bug.
- Lock `document.body` scroll while the mobile panel is open (full-screen/slide-in panels only —
  a small dropdown under the bar doesn't need this).
- Touch targets ≥ 44×44px (Apple HIG / WCAG 2.5.5) — applies to the hamburger button and every
  mobile nav link, not just desktop hover targets.
- Maintain visible focus rings (`:focus-visible`) on every interactive element — don't strip
  outlines for aesthetics without providing a replacement.
- Don't rely on color alone for the active-link state — pair it with `aria-current="page"` and a
  non-color cue (underline, weight change).

**Behavior & UX**
- Sticky (`sticky top-0`) is the default expectation for a top nav; if the project wants it to
  scroll away, that's a deliberate deviation worth calling out in review, not an oversight.
- Keep the nav height stable across states (logged-in/out, scrolled/not) — layout shift in the
  header is one of the more visible CLS regressions.
- If the bar changes appearance on scroll (e.g. adds a shadow/background blur past `y=0`), do it
  with a scroll listener + class toggle, not by fighting `position: sticky` semantics.

## 2. Layout: full-bleed background, capped content

Requirement: the nav's background spans the full browser width at any viewport size, including
ultra-wide monitors, but the actual content (logo, links, actions) never exceeds **1920px** and
stays centered past that width.

Pattern: an unconstrained outer element carries the background/border; an inner element carries
the `max-w` cap and is centered with `mx-auto`.

```tsx
// TopNav.tsx
export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] bg-white/80 backdrop-blur dark:border-white/[.145] dark:bg-black/80">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        {/* logo, DesktopNav, MobileNav go here */}
      </div>
    </header>
  );
}
```

- Outer `<header>`: `w-full`, no `max-w` — this is what makes the background full-bleed.
- Inner `<div>`: `mx-auto w-full max-w-[1920px]` — this is the actual cap. `1920px` is an
  arbitrary Tailwind value (v4 supports `max-w-[<value>]` directly, no config needed).
- Horizontal padding scales with viewport (`px-6` → `sm:px-10` → `lg:px-16`) so content doesn't
  hug the viewport edge on large screens once the cap is in effect — a fixed `max-w` alone leaves
  content flush against nothing to breathe against.
- This is the same full-bleed-bg/capped-content pattern to use for any other full-width section
  (footer, section backgrounds) — not nav-specific.

## 3. Responsive breakpoint: hamburger below `lg`

Tailwind v4 default breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px
(no custom breakpoints are configured in this repo — confirm that's still true before assuming).

**Default recommendation: collapse to hamburger below `lg` (1024px)**, not the more common `md`
(768px). Reasoning: this nav will eventually also host a language switcher (see
[`i18n-next.md`](./i18n-next.md)) alongside the regular links and a CTA — that's more controls
competing for horizontal space than a typical 3-4-link nav, so tablet-width (768–1023px)
viewports need the extra room the mobile layout provides. Revisit to `md` only if the actual link
count stays small (≤3 items) once real content is in.

```tsx
// DesktopNav.tsx — hidden below lg, flex row at lg and up
export function DesktopNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

```tsx
// nav-links.ts — edit per project
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];
```

Active-link color assumes a `--color-primary` token exists (see `docs/design-profile.md`) —
swap `text-primary`/`hover:text-primary` for a plain color if the project doesn't have one yet.

```tsx
// NavLink.tsx — active-state-aware link, shared by desktop and mobile
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "font-medium text-primary underline underline-offset-4"
          : "text-black transition-colors hover:text-primary dark:text-zinc-50"
      }
    >
      {children}
    </Link>
  );
}
```

## 4. Mobile: hamburger menu

```tsx
// MobileNav.tsx — hidden at lg and up
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav-links";
import { NavLink } from "./NavLink";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full"
      >
        {/* swap for real icons (e.g. lucide-react's Menu/X) */}
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Main"
          className="fixed inset-x-0 top-[var(--nav-height,64px)] z-40 flex max-h-[calc(100vh-var(--nav-height,64px))] flex-col gap-6 overflow-hidden bg-background p-8"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
```

Notes:
- `--nav-height` is a placeholder — set it to the header's actual rendered height (either a fixed
  Tailwind value if the header height is constant, or measured via `ResizeObserver` if it isn't).
- The panel sizes to its content (`flex flex-col`, no `bottom-0`/`h-full` forcing it to stretch),
  capped at `max-h-[calc(100vh-var(--nav-height))]` so it never exceeds the available viewport
  height, with `overflow-hidden` so it never shows a scrollbar — appropriate as long as the nav
  link count stays short enough to fit on a phone screen; if it grows past that, `overflow-y-auto`
  (accepting a scrollbar) is the correct trade-off over silently clipping links via `overflow-hidden`.
- **If the panel's background is a fixed color that doesn't follow the site's light/dark theme**
  (unlike `bg-background` above), double-check `NavLink`'s text color still contrasts against it —
  a `dark:` variant assumes the element it's on inverts with the page, which isn't true once the
  panel's own background is pinned to one fixed value. This matters especially when dark mode is
  driven by `prefers-color-scheme` (a media query) rather than a `.dark` class toggle, since there's
  no way to scope a class-based override to just this subtree — the fix has to live in the
  component itself (e.g. an opt-out prop on `NavLink` that drops the `dark:` variant for this case).
- This example uses a simple conditional render + full-screen panel. For a slide/fade transition,
  wrap the panel in a small animation library (e.g. `motion`/Framer Motion) rather than hand-rolling
  CSS transitions on mount/unmount timing — that's a common source of subtle bugs (panel unmounts
  before its exit transition finishes).
- For stricter accessibility (focus trapped inside the open panel, not just Escape-to-close),
  add a focus-trap utility (e.g. `focus-trap-react`) around the `<nav>` — the example above omits
  it to keep the base case readable; add it before shipping to production.
- `MobileNav` and `DesktopNav` share `NAV_LINKS` and `NavLink` — the data and active-state logic
  are defined once, not duplicated between the two layouts.

## 5. File structure

```
apps/web/src/components/nav/
├── TopNav.tsx        # composes DesktopNav + NavActions + MobileNav inside the full-bleed/capped header
├── DesktopNav.tsx     # link row, hidden below `lg`
├── NavActions.tsx      # right-side utility buttons (language/search/primary CTA), visible at every breakpoint
├── MobileNav.tsx      # hamburger + panel, hidden at `lg` and up
├── NavLink.tsx        # shared active-state-aware link
└── nav-links.ts       # NAV_LINKS data — the only file that changes per-project nav content
```

The logo `Link` and `DesktopNav` are wrapped together in one flex container, and `NavActions` +
`MobileNav` are wrapped together in another, rather than left as 4 separate top-level flex
children — with 4 ungrouped items, `justify-between` would space them apart individually instead
of producing "logo + nav links" on the left and "actions + hamburger" on the right. Unlike
`DesktopNav` (hidden below `lg`, replaced by the hamburger panel), `NavActions` is visible at every
breakpoint — on mobile it sits directly on the bar to the left of the hamburger button, not inside
the hamburger panel. Because of this, `NavActions`' own sizing has to hold up standalone on a
360–390px viewport, not just at `lg`+ — see the `Contact Us` → `Contact` truncation below `sm`.
The three `NavActions` buttons are `h-9` (36px), deliberately smaller than the 44px hamburger
button next to them and the logo (`h-10`, 40px) — the logo is meant to read as visually larger
than the utility button row, not matched to it.

Per `docs/architecture.md`'s convention, this lives under `src/components/` (shared, not tied to
one feature) — mount `<TopNav />` once in `apps/web/src/app/layout.tsx`, above `{children}`.

## Verification checklist

- Background spans full viewport width at 1920px+ (check on an ultra-wide monitor or by resizing
  the browser past 1920px); content stays capped and centered, not stretched edge-to-edge.
- At `lg` (1024px) and above: horizontal link row, no hamburger button.
- Below `lg`: hamburger button only, no horizontal link row.
- Hamburger button toggles the panel; `aria-expanded` flips accordingly (check devtools, not just
  visually).
- Escape closes the panel and focus returns visibly to the hamburger button.
- Clicking a link inside the mobile panel navigates and closes the panel.
- Background page does not scroll while the mobile panel is open.
- Keyboard-only navigation (Tab through every link and the hamburger button) never gets stuck or
  skips an interactive element.
