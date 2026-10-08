# Admin Panel

Site configuration UI at `/admin` in `apps/web`, backed by modules in `apps/api`.
Currently one section: **hero carousel images** (add / remove, `.webp` only).

## Layout

```
apps/web/src/
  app/admin/
    layout.tsx          admin shell, noindex
    page.tsx            redirects to /admin/hero
    login/page.tsx      password form
    hero/page.tsx       hero image manager
  lib/admin-api.ts      API client + presigned S3 upload helper

apps/api/src/modules/
  admin-auth/           session cookie + AdminGuard
  storage/              S3 wrapper (presign, stat, ranged read, delete)
  hero-images/          controllers, service, DTOs

packages/types/src/index.ts   shared contracts (see the note in that file
                              before splitting it into multiple files)
```

## Setup

### 1. Environment

Copy the templates and fill them in:

```bash
cp apps/api/.env.example apps/api/.env       # already present; add the values
cp apps/web/.env.example apps/web/.env.local
```

`apps/api/.env` needs, at minimum:

```
ADMIN_PASSWORD="…"
ADMIN_SESSION_SECRET="…"    # openssl rand -base64 48
AWS_REGION="ap-southeast-1"
S3_BUCKET="…"
```

Both admin vars must be set or the panel **fails closed** — `isConfigured` is false and
nothing authenticates. If S3 is unset the API still boots and the public site is
unaffected; only upload and delete return 503, and a warning is logged at startup.

`apps/web/.env.local` needs `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_IMAGE_HOST` (the bare
hostname serving the images, allowlisted for `next/image` in `next.config.ts`).

### 2. Migration

```bash
pnpm --filter @compro/api exec prisma migrate dev
```

### 3. Bucket policy — public read

The site links images directly, so objects under the hero prefix must be publicly
readable. Grant that with a **bucket policy**, not an ACL:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadHeroImages",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": [
      "arn:aws:s3:::YOUR-BUCKET/hero/*",
      "arn:aws:s3:::YOUR-BUCKET/media/*"
    ]
  }]
}
```

Buckets created since April 2023 default to Object Ownership = *Bucket owner enforced*,
which **disables ACLs entirely** — sending `acl=public-read` with an upload makes S3
reject it. Leave `S3_UPLOAD_ACL` empty unless you have deliberately re-enabled ACLs.

You must also turn off "Block all public access" for the `s3:GetObject` statement to take
effect, or put CloudFront in front of the bucket and set `S3_PUBLIC_BASE_URL` to the
distribution domain instead.

### 4. Bucket CORS — required

**The browser uploads straight to S3**, so the bucket needs a CORS rule permitting `POST`
from the web origin. Without this every upload fails in the browser with an opaque CORS
error, even though the presign call succeeded.

```json
[{
  "AllowedOrigins": ["http://localhost:3006", "https://YOUR-WEB-DOMAIN"],
  "AllowedMethods": ["POST"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": [],
  "MaxAgeSeconds": 3000
}]
```

### 5. IAM

The API's credentials need `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on
`arn:aws:s3:::YOUR-BUCKET/hero/*` **and** `…/media/*` (page images). `GetObject` is needed for the magic-byte check, not
just for reads. On a deployed host prefer an instance role and leave
`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` unset — the SDK falls back to its own
credential chain.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/hero-images` | public | List, for the site |
| `GET` | `/admin/session` | public | Is the caller signed in |
| `POST` | `/admin/session` | public | Sign in with the password |
| `DELETE` | `/admin/session` | public | Sign out |
| `GET` | `/admin/hero-images` | guarded | List, for the panel |
| `POST` | `/admin/hero-images/presign` | guarded | Authorise one upload |
| `POST` | `/admin/hero-images` | guarded | Commit an uploaded object |
| `DELETE` | `/admin/hero-images/:id` | guarded | Remove image and object |

## Upload flow

```
browser                    API                       S3
   |  presign ------------->|                         |
   |                        |-- createPresignedPost ->|
   |<-- url + fields -------|                         |
   |                                                  |
   |  POST multipart (fields first, then file) ------>|   S3 enforces the policy:
   |<------------------------------------------ 204 --|   content-type + size
   |                                                  |
   |  commit(key) --------->|                         |
   |                        |-- HeadObject ---------->|   size
   |                        |-- GetObject Range 0-15 >|   magic bytes
   |                        |   write row, or delete object and 400
   |<-- HeroImageDto -------|                         |
```

Bytes never pass through the API — it only signs, then verifies what landed.

## How `.webp` only is enforced

The panel accepts JPG, PNG and WebP, but **only WebP ever reaches the API or S3**:
`apps/web/src/lib/image-to-webp.ts` converts JPG/PNG to WebP (quality 0.82) in the
browser and downscales anything over 2560px on its longest edge. A WebP already within
that size is uploaded untouched. Browsers without a WebP canvas encoder (older Safari)
get a clear error instead of a silent PNG.

Three layers, because the first two are bypassable:

1. **File picker `accept`** and the in-browser conversion — convenience only.
2. **Presign checks + POST policy conditions** — the API rejects a non-webp MIME type,
   a non-`.webp` filename or an oversized file, and S3 itself enforces
   `content-length-range` and an exact `Content-Type` at upload time.
3. **Magic-byte check on commit** — a ranged `GetObject` of the first 16 bytes confirms
   a real `RIFF….WEBP` container before any row is written; a failure deletes the
   object and returns 400.

Layer 3 is the one that actually matters. A client is free to send
`Content-Type: image/webp` with a PDF, an HTML file or a script as the body, and layers 1
and 2 would both pass. `isWebp` also rejects other RIFF containers (WAV, AVI), which a
`RIFF`-only check would let through. Covered by
`apps/api/src/modules/hero-images/hero-images.service.spec.ts`.

## Auth

Interim and deliberately minimal: one shared password from `ADMIN_PASSWORD`, and a
stateless httpOnly cookie carrying nothing but an HMAC-signed expiry. No users, roles or
refresh tokens.

- Password comparison is constant-time over HMAC digests.
- `sameSite=lax` suffices in both environments: `localhost:3006 → localhost:3007` and
  `compro.example.com → api.compro.example.com` are both same-site (ports and subdomains
  do not affect SameSite; only the registrable domain does). `secure` is set when
  `NODE_ENV=production`.
- CORS runs with `credentials: true`, required for the cookie to cross origins.

**Replace this** when `docs/auth-passportjs-google.md` is implemented: swap `AdminGuard`
and delete `admin-auth/`. Nothing in the hero-image feature depends on *how* the caller
was authenticated.

`POST /admin/session` is rate limited with `@nestjs/throttler`: **10 attempts per IP
per 15 minutes**, successful or not, after which that IP is locked out for 15 minutes
(429). Configured in `admin-auth.module.ts`; only the login route opts in. Two caveats:

- Storage is in-memory — per process and reset on restart. Fine for one instance; use a
  shared store (e.g. Redis) if the API is scaled out.
- Behind a reverse proxy, set `TRUST_PROXY` (hop count, usually `1`) or every visitor
  appears as the proxy's IP and shares one bucket. Leave it unset when the API is
  exposed directly, or clients can spoof `X-Forwarded-For` to dodge the limit.

## Live site

`Hero` (a server component) calls `getHeroSlides()` in `apps/web/src/lib/hero-images.ts`,
which fetches `GET /hero-images` and passes the result to `HeroCarousel`.

- **Cached for 60 s** (`next.revalidate`), so an admin change reaches the homepage within
  about a minute, not instantly.
- **Falls back** to the bundled `apps/web/public/hero/*.webp` when the API is down, slow
  (3 s timeout), errors, or the table is empty. Keep those files.
- Images whose host isn't `NEXT_PUBLIC_IMAGE_HOST` are dropped with a server-side
  warning, since `next/image` would otherwise throw and break the page. If the panel
  shows images but the site still shows the bundled set, check that variable first.

Also absent by design, since the brief was add/remove only: reordering, alt-text editing,
and replacing an image in place. The schema carries `sortOrder` and `alt` ready for them.

## Pages, menu groups and the page editor

Added with the content builder (`docs/content-builder-plan.md`). All behind the same admin
session cookie.

| Screen | Route | What it does |
|---|---|---|
| Pages | `/admin/pages` | Tree per section (group → page → child pages). Create, reorder (up/down), show/hide in menu, add child, delete. |
| Page editor | `/admin/pages/:id` | Puck editor on the **draft**; Save draft, Publish (saves what is on screen first), Unpublish, Page settings (title, slug, placement, menu label, SEO). |
| Import | `/admin/pages/import` | Paste or load AI-written JSON; saved as a draft with exact error paths. "Copy prompt and schema for AI" builds the prompt from the live schema. |
| Menu groups | `/admin/navigation` | Create, rename, reorder and delete the menu columns. A group with pages can't be deleted. |

API: `/admin/pages*`, `/admin/nav-groups*`, and `/admin/media` (presign + commit).

Content images are **WebP only**, uploaded browser-direct to S3 under `media/` (same bucket
policy and CORS rule as hero images — the `media/*` prefix needs the same public-read
bucket-policy statement and IAM access as `hero/*` — see sections 3 and 5 above). The editor converts JPG/PNG to WebP in the browser first. A page may
only reference URLs under `<public base>/media/`; the API rejects any other image host.

Notes: a live page's slug is locked (unpublish to change it); the editor is not run in an
iframe so the site's own styles apply to the preview; Puck's own header is hidden in favour of
the page's header bar.
