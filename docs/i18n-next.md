# i18n (Next.js App Router) — Standards & Reusable Pattern

Reusable reference for adding internationalization to a Next.js App Router project, written so a
future **reusable language-switcher component can be dropped into the top nav**
(see [`top-nav.md`](./top-nav.md)) without redesigning the routing/message-loading underneath it.
**This document is a design spec, not yet implemented** — no i18n library, routing changes, or
message files exist in `apps/web` yet.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Library | **`next-intl`** | The only App Router-native i18n library with first-class support for Server Components, static rendering, and typed messages, actively maintained and the de facto standard for this stack. |
| Routing strategy | Locale-prefixed routes (`/about`, `/id/about`) via middleware + `[locale]` segment | SEO-friendly (distinct indexable URL per locale), works with static generation, and gives the language switcher a real URL to link to per locale instead of a client-only state flip. |
| Default-locale prefix | `localePrefix: "as-needed"` (no prefix for the default locale) | Keeps existing clean URLs (`/`, `/about`) for the default locale — minimal disruption to routes already in place — while other locales get an explicit prefix (`/id/about`). |
| Message format | Namespaced JSON per locale (`messages/en.json`) | Simple, no build step, easy for non-developers to edit/translate later; namespacing keeps files manageable as the site grows past a handful of pages. |

**Rejected:**
- **`next-i18next`** — built for the Pages Router; no real App Router / Server Component support.
- **`react-i18next` wired in by hand** — works, but reimplements what `next-intl` already solves
  (locale routing, static rendering, server/client message passing) with more custom glue code.
- **Paraglide (inlang)** — compile-time, type-safe, and genuinely excellent, but a heavier
  tooling commitment (build step, its own CLI/config) for a project this size; revisit only if
  message-file scale or bundle-size becomes an actual problem.
- **Cookie/header-only locale (no URL prefix)** — simplest to build, but no per-locale URL means
  no SEO benefit and no shareable/bookmarkable link to a specific language version of a page.

## Locales

Placeholder only — replace with this project's actual target languages before implementing:

```ts
export const locales = ["en", "id"] as const;
export const defaultLocale = "en";
```

## File structure

```
apps/web/
├── messages/
│   ├── en.json              # default locale messages
│   └── id.json              # one file per locale in `locales`
├── src/
│   ├── i18n/
│   │   ├── routing.ts        # defineRouting({ locales, defaultLocale, localePrefix })
│   │   ├── navigation.ts      # typed Link/useRouter/usePathname wrappers from routing.ts
│   │   └── request.ts         # getRequestConfig — loads the right messages/<locale>.json
│   ├── middleware.ts           # next-intl middleware, matches routing.ts
│   └── app/
│       ├── layout.tsx          # thin root layout — just <html><body>{children}
│       └── [locale]/
│           ├── layout.tsx      # NextIntlClientProvider + messages, per-locale <html lang>
│           ├── page.tsx        # existing homepage moves here
│           └── ...             # every other route moves under [locale]/ too
└── next.config.ts               # wrapped with next-intl's plugin
```

Moving existing routes from `app/` to `app/[locale]/` is the one real migration cost of adopting
this pattern — do it in one pass when i18n is actually implemented, not incrementally per-route.

## Setup reference

```ts
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "id"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
```

```ts
// src/i18n/navigation.ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Use these instead of next/link and next/navigation everywhere in the app —
// they're locale-aware and keep the current locale when navigating.
export const { Link, useRouter, usePathname, redirect } = createNavigation(routing);
```

```ts
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

```ts
// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip static assets and API routes.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

```ts
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  // existing next.config.ts contents go here
});
```

```tsx
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## Using translations

```json
// messages/en.json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "services": "Services",
    "contact": "Contact"
  }
}
```

```tsx
// Server Component (no "use client" needed)
import { useTranslations } from "next-intl";

export function AboutHeading() {
  const t = useTranslations("nav");
  return <h1>{t("about")}</h1>;
}
```

Client Components use the same `useTranslations` hook — `NextIntlClientProvider` (already wired
in `[locale]/layout.tsx` above) makes messages available on the client too, no separate API.

## The reusable language switcher (future top-nav component)

Slots into `apps/web/src/components/nav/` alongside `TopNav.tsx` per `top-nav.md`. Skeleton —
build this once locales are finalized, not before:

```tsx
// src/components/nav/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Select language"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="rounded-full border border-black/[.08] bg-transparent px-3 py-1.5 text-sm dark:border-white/[.145]"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code] ?? code}
        </option>
      ))}
    </select>
  );
}
```

- `usePathname`/`useRouter` come from the typed wrappers in `src/i18n/navigation.ts`, not
  `next/navigation` — that's what lets `router.replace(pathname, { locale })` swap only the
  locale segment while staying on the same page.
- A native `<select>` is the accessible-by-default baseline; swap for a custom dropdown
  (Radix `DropdownMenu`, etc.) only if the design calls for one — don't rebuild `<select>`'s
  keyboard/screen-reader behavior from scratch without a reason to.
- Mount it inside both `DesktopNav.tsx` and `MobileNav.tsx` (per `top-nav.md`'s file structure) —
  same component, no duplication.

## SEO note

Once implemented, set `alternates.languages` in each page's `generateMetadata` (or static
`metadata` export) so search engines see the `hreflang` relationship between locale versions of
the same page — `next-intl` doesn't do this automatically, it has to be added per-route.

## Verification checklist

- Visiting `/` serves the default locale (`en`) with no prefix; visiting `/id` serves the `id`
  locale.
- Every route under `app/[locale]/` renders correctly for every configured locale.
- Switching languages via the language switcher preserves the current page (not a redirect to
  home) and updates the URL's locale segment (or removes it, for the default locale).
- `<html lang="...">` matches the active locale.
- A missing translation key fails loudly in development (check `next-intl`'s `onError`/strict
  behavior) rather than silently rendering blank — the same failure mode the reference in
  `email-module.md` flagged for untyped templates applies here too.
