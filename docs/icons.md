# Icons — Rule

**Every icon is its own component file under `apps/web/src/components/icons/`, accepting `size`
and `color` props. Never inline a raw `<svg>` inside a page/section/nav component.**

## Why

- The same icon tends to get reused in more than one place (a menu icon, a chevron, a social
  icon) — inlining it means the markup drifts between call sites instead of changing once.
- A consistent `size`/`color` prop contract means every icon behaves the same way regardless of
  where it's used, instead of each inline `<svg>` hardcoding its own `width`/`height`/`stroke`.
- If the project ever switches to an icon library (`lucide-react`, etc.), only the files under
  `components/icons/` change — call sites that import `<PhoneIcon />` don't.

## API contract

```ts
// apps/web/src/components/icons/icon-props.ts
export interface IconProps {
  size?: number;   // px, applied to both width and height — icons are square
  color?: string;  // defaults to "currentColor" so the icon inherits the surrounding text color
}
```

Every icon component takes exactly these two optional props, both with sensible defaults — a
call site should be able to just write `<PhoneIcon />` and get a reasonable result.

## Template

```tsx
// apps/web/src/components/icons/PhoneIcon.tsx
import type { IconProps } from "./icon-props";

export function PhoneIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

Usage: `<PhoneIcon />` (defaults) or `<PhoneIcon size={24} color="#e91f28" />` (override).

## Conventions

- **Naming:** `<Concept>Icon.tsx`, exporting a named `<Concept>Icon` function component — e.g.
  `MenuIcon`, `CloseIcon`, `PhoneIcon`, `UserIcon`. One icon per file, no barrel/grouped exports.
- **`aria-hidden="true"` on the `<svg>` itself, always.** An icon is decorative by default — the
  accessible name belongs on the consuming interactive element (`aria-label` on a `<button>`, or
  visible text next to the icon), never duplicated onto the icon component. This matches the
  hamburger-button pattern already documented in `docs/top-nav.md`.
- **`viewBox` stays fixed** (`0 0 24 24` is the convention here) regardless of the `size` prop —
  only `width`/`height` scale; the path data itself never changes.
- **Stroke-based, not filled**, for consistency with the icons already in the project — `fill="none"`
  on the `<svg>`, `stroke={color}` on each path. Filled icons would need their own `fill={color}`
  convention instead; don't mix both styles in the same icon set without a reason.

## File structure

```
apps/web/src/components/icons/
├── icon-props.ts   # shared IconProps type — every icon imports this, doesn't redeclare it
├── MenuIcon.tsx
├── CloseIcon.tsx
├── PhoneIcon.tsx
└── UserIcon.tsx
```

## Alternative source: an icon library

Hand-drawing every icon doesn't scale once the set grows past basic UI chrome (menu/close/arrows).
For generic icons that aren't brand-specific, pull the glyph from a library instead of drawing it —
reserve hand-authored SVGs for anything genuinely custom. Recommended:
**[`@gravity-ui/icons`](https://github.com/gravity-ui/icons)** — 2500+ MIT-licensed icons, shipped
as plain React components (no dependency on Gravity UI's full `@gravity-ui/uikit` design system).

```bash
pnpm --filter @compro/web add @gravity-ui/icons
```

Production dependency, **not** `--save-dev` — icons render in the browser at runtime, this isn't
a build-time-only tool. (`npm install --save-dev` is the wrong dependency type in general, and this
repo uses pnpm workspaces — see `CLAUDE.md` for the `pnpm --filter` convention.)

### Import styles — verified against the actual published package

**Named import (recommended):**
```tsx
import { ArrowRightToSquare } from "@gravity-ui/icons";
```
This is a real React component — `(props: SVGProps<SVGSVGElement>) => JSX.Element` — that spreads
whatever props you pass onto the root `<svg>`, so `width`/`height` work directly. **Color does
not work the same way as this project's own icons**: the inner `<path>` hardcodes
`fill="currentColor"`, so passing a `fill` or `color` prop to the component does nothing — you
have to set the CSS `color` property on the icon or an ancestor (e.g. via `style={{ color }}` or
a `className`) for `currentColor` to resolve to it. `sideEffects: false` in the package means this
named import tree-shakes fine; a deep import (`@gravity-ui/icons/ArrowRightToSquare`) is
equivalent, not a bundle-size optimization, just more explicit about which icon you're pulling in.

**Raw `.svg` file import — needs extra setup, don't use yet:**
```tsx
import ArrowRightToSquareIcon from "@gravity-ui/icons/svgs/arrow-right-to-square.svg";
```
Without an SVGR loader configured, Next.js treats an imported `.svg` as a plain asset URL (a
string), not a component — this import style only works as `<img src={ArrowRightToSquareIcon} />`
or as a Next `<Image>` source, and can't be recolored via `currentColor` or sized via `size`. This
repo doesn't have SVGR wired up (`next.config.ts` has no such config) — stick to the named-import
style above unless SVGR gets added and this note is updated.

### Keep the `size`/`color` contract by wrapping, don't call library icons directly

Since a library icon's prop shape doesn't match this project's `IconProps`, wrap it once in
`components/icons/` the same as a hand-drawn icon, so every call site stays consistent regardless
of where the glyph actually came from:

```tsx
// apps/web/src/components/icons/ArrowRightToSquareIcon.tsx
import { ArrowRightToSquare } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function ArrowRightToSquareIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <ArrowRightToSquare width={size} height={size} style={{ color }} />;
}
```

Call sites never import from `@gravity-ui/icons` directly — always through a wrapper in
`components/icons/`, exactly like hand-drawn icons. This is what keeps "swap the icon source
later" a one-file change rather than a repo-wide one (the same reasoning as the `Why` section
above, just applied to a library source instead of a hand-drawn one).

## Verification checklist

- No `<svg` appears directly inside a component under `src/components/` other than inside
  `components/icons/` itself (`grep -r "<svg" apps/web/src --include=*.tsx` should only match
  files in `components/icons/`).
- Every icon file exports one component matching its filename (`PhoneIcon.tsx` exports
  `PhoneIcon`), imports `IconProps` from `./icon-props` rather than redeclaring the props inline.
- `<ConceptIcon />` with no props renders at a sensible default size in `currentColor`.
- No component outside `components/icons/` imports from `@gravity-ui/icons` (or any other icon
  library) directly — always through a local wrapper matching `IconProps`
  (`grep -rl "@gravity-ui/icons" apps/web/src` should only match files in `components/icons/`).
