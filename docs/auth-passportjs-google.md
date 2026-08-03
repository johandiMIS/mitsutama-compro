# Auth Module — Design (v5, hardened + adversarially reviewed)

Status: **design doc, ready for implementation**
Target location: `apps/api/src/app/auth/` — a normal NestJS feature module (single consumer). Shared enums (`Role`, `UserStatus`, `AuthProvider`, `VerificationTokenType`) live in `packages/enums`, consumed by both apps.

v5 changes: the 12 fixes from v4's gap review were run through an independent 5-agent adversarial swarm (security / correctness / implementation-feasibility / product-scope lenses + synthesis) before being written in here. Three fixes had real, independently-corroborated defects in their first draft and were reworked (marked **[reworked]** below); the rest were tightened with specific modifications (marked **[tightened]**); two were accepted as-is.

---

## 0. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| ORM | **Prisma** | already scaffolded; type-safe client, no separate entity/repository boilerplate |
| Auth module location | `apps/api/src/app/auth/`, not a shared package | one consumer; only cross-app enums go in `packages/enums` |
| Role model | hardcoded `Role` enum + `ROLE_LEVEL` map in code | reuse happens by forking the repo, not runtime-configuring one deployment |
| Password hashing | **argon2id**, OWASP baseline params (§4) | current OWASP recommendation |
| Refresh tokens | rotating opaque tokens, reuse detection | standard practice for cookie-based sessions |
| Rate limiting | `@nestjs/throttler`, composite keys where needed, plus a global per-IP layer | default IP-only tracking isn't enough for several of these endpoints (§8) |
| Audit log | dedicated `AuditLog` table, `userId` = actor, nullable | supports the owner-approval flow where the actor (the owner) isn't a `User` row |
| Sensitive-field leakage | Prisma client-level `omit` config, not a Nest interceptor | the interceptor approach was tested and found to be a silent no-op against Prisma objects (§1a) |
| Soft-delete enforcement | explicit two-step query at the security-sensitive lookup sites, not a blanket extension | a Prisma Client Extension alone does not cover relation-traversal reads — confirmed by all four swarm reviewers independently (§1a) |

---

## 1. Schema (Prisma)

```prisma
enum UserStatus {
  PENDING_APPROVAL
  APPROVED
  INVITED
  ACTIVE
  SUSPENDED
}

enum AuthProvider {
  LOCAL
  GOOGLE
}

enum VerificationTokenType {
  OWNER_APPROVAL
  SET_ACCOUNT
  PASSWORD_RESET
  INVITE
}

enum Role {
  SUPER_ADMIN
  ADMIN
  MANAGER
  USER
}

enum AuditEvent {
  LOGIN_SUCCESS
  LOGIN_FAILED
  LOGOUT
  LOGOUT_ALL
  TOKEN_REFRESHED
  TOKEN_REUSE_DETECTED
  BOOTSTRAP_REQUESTED
  BOOTSTRAP_APPROVED
  ACCOUNT_SET
  INVITE_SENT
  INVITE_ACCEPTED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  GOOGLE_LINKED
}

model User {
  id              String     @id @default(uuid())
  displayName     String     @map("display_name")
  email           String     @unique
  status          UserStatus
  role            Role
  resendCount     Int        @default(0) @map("resend_count")   // NEW (fix 5/10 [tightened]) — caps total resend attempts across a pending registration's lifetime, independent of the hourly rate limit
  emailVerifiedAt DateTime?  @map("email_verified_at")
  lastLoginAt     DateTime?  @map("last_login_at")
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")
  deletedAt       DateTime?  @map("deleted_at")

  authAccounts       AuthAccount[]
  verificationTokens VerificationToken[]
  refreshTokens      RefreshToken[]
  profile            UserProfile?
  invitationsSent    User[]              @relation("InvitedBy")
  invitedById        String?             @map("invited_by_id")
  invitedBy          User?               @relation("InvitedBy", fields: [invitedById], references: [id])
  auditLogs          AuditLog[]

  @@map("users")
}

model AuthAccount {
  id             String       @id @default(uuid())
  userId         String       @map("user_id")
  user           User         @relation(fields: [userId], references: [id])
  provider       AuthProvider
  providerUserId String?      @map("provider_user_id")
  email          String?
  passwordHash   String?      @map("password_hash")   // argon2id, LOCAL only — omitted by default at the client level, see §1a
  lastUsedAt     DateTime?    @map("last_used_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  @@unique([provider, userId])
  @@unique([provider, providerUserId])
  @@map("auth_accounts")
}

model VerificationToken {
  id        String                @id @default(uuid())
  userId    String                @map("user_id")
  user      User                  @relation(fields: [userId], references: [id])
  type      VerificationTokenType
  tokenHash String                @unique @map("token_hash")   // omitted by default at the client level, see §1a
  expiresAt DateTime              @map("expires_at")
  usedAt    DateTime?             @map("used_at")
  createdAt DateTime              @default(now()) @map("created_at")

  @@index([userId, type])
  @@map("verification_tokens")
}

model RefreshToken {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  user       User      @relation(fields: [userId], references: [id])
  familyId   String    @map("family_id")
  tokenHash  String    @unique @map("token_hash")   // omitted by default at the client level, see §1a
  expiresAt  DateTime  @map("expires_at")
  revokedAt  DateTime? @map("revoked_at")
  replacedBy String?   @map("replaced_by")
  createdAt  DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([familyId])
  @@map("refresh_tokens")
}

model UserProfile {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  avatar    String?
  timezone  String   @default("UTC")
  theme     String   @default("system")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("user_profiles")
}

model AuditLog {
  id        String     @id @default(uuid())
  userId    String?    @map("user_id")
  user      User?      @relation(fields: [userId], references: [id])
  event     AuditEvent
  ip        String?
  userAgent String?    @map("user_agent")
  metadata  Json?
  createdAt DateTime   @default(now()) @map("created_at")

  @@index([userId])
  @@index([event])
  @@map("audit_logs")
}
```

```ts
export const ROLE_LEVEL: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 3,
  [Role.ADMIN]: 2,
  [Role.MANAGER]: 1,
  [Role.USER]: 0,
};
```

### 1a. Prisma Client configuration — the two fixes that needed a different mechanism than originally planned

**passwordHash / tokenHash leakage [reworked, was fix 4]**: the first draft planned a `ClassSerializerInterceptor` + `@Exclude()` DTO layer as defense-in-depth. The swarm found this is a silent no-op — the interceptor only transforms actual class instances, and Prisma always returns plain objects, so any handler that ever returns a raw Prisma row bypasses it with zero warning. Replaced with Prisma's own field-selection primitive, which is the real equivalent of TypeORM's `select: false`:

```ts
const prisma = new PrismaClient({
  omit: {
    authAccount: { passwordHash: true },
    verificationToken: { tokenHash: true },
    refreshToken: { tokenHash: true },
  },
});
```

This applies at Prisma's core field-selection layer, so — unlike a custom extension hook — it holds regardless of whether the model is queried directly or reached via `include` from another model. The one place that legitimately needs `passwordHash` (login password verification) explicitly overrides the omit for that one query: `prisma.authAccount.findFirst({ where: {...}, omit: { passwordHash: false } })`. DTOs are still used for response shaping, but that's now an API-contract concern, not a security control.

**Soft-delete enforcement [reworked, was fix 6]**: a Prisma Client Extension that auto-injects `deletedAt: null` was the first plan. All four swarm reviewers independently identified the same structural gap: extensions intercept direct calls on the extended model (`prisma.user.*`) but do **not** intercept relation-traversal reads from another model — and that's exactly the shape of the login lookup (`authAccount.findFirst({ include: { user: true } })`), meaning a soft-deleted user could still authenticate through the primary auth path despite the extension existing.

Fix: restructure the two security-sensitive lookups (local login, Google login) into two explicit queries instead of one nested `include`, so the second query is a genuine top-level `User` call the extension actually covers:

```ts
const authAccount = await prisma.authAccount.findFirst({ where: { provider, providerUserId } });
if (!authAccount) return null;
const user = await prisma.user.findFirst({ where: { id: authAccount.userId } }); // extension's deletedAt:null filter applies here for real
```

The extension itself is registered via `$allOperations` (not a hand-listed method set — that reliably misses `count`/`aggregate`/`groupBy`). Hard policy: no `$queryRaw`/`$executeRaw` touching `User` (extensions never cover raw queries). The admin "view deleted users" escape hatch is an explicit per-call parameter, not a mutable module-level toggle — a toggle risks leaking deleted rows into a concurrent, unrelated request under Node's async concurrency.

**Acceptance gate for both**: an integration test that actually exercises the real login path (not a unit test of the extension/omit config in isolation) — one asserting a soft-deleted user's login attempt fails, one asserting `passwordHash`/`tokenHash` never appear in any serialized auth-module response.

---

## 2. Status lifecycle

```
PENDING_APPROVAL → APPROVED → ACTIVE     (bootstrap path)
INVITED → ACTIVE                          (invite path)
ACTIVE → SUSPENDED                        (admin action, out of scope of this doc)
```

---

## 3. JWT payload

```ts
interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  level: number;
}
```

`access_token` is a signed JWT of this payload. `refresh_token` is an opaque random value (`crypto.randomBytes(32)`), only its SHA-256 hash stored.

---

## 4. Password policy

NIST 800-63B: minimum 10 characters, no forced complexity rules, no forced rotation. Argon2id parameters: memory cost 19 MiB, time cost 2, parallelism 1 (OWASP baseline for constrained hosting — tunable via env vars if a deployment has headroom to go higher).

---

## 5. Use-case flows

### UC-AU-001 · Login
`POST /auth/login` → find `User` by email → find `AuthAccount(provider=LOCAL)` → verify password (argon2id) → issue `access_token` + `refresh_token` (new `family_id`) → update `lastLoginAt`/`lastUsedAt` → `AuditLog(LOGIN_SUCCESS)`.
Every failure (email not found, no LOCAL account, wrong password, non-`ACTIVE` status) → identical `401 INVALID_CREDENTIALS` → `AuditLog(LOGIN_FAILED)`.
Rate limit: 10/15min/IP.

### UC-AU-002 · Logout / Logout Everywhere
`POST /auth/logout` → revoke current `RefreshToken` row, clear cookies, `AuditLog(LOGOUT)`.
`POST /auth/logout-all` → revoke every `RefreshToken` for the user across all `family_id`s, `AuditLog(LOGOUT_ALL)`.

### UC-AU-003 · Super-Admin Bootstrap **[reworked, was fix 1]**
**Precondition**: reuse is scoped strictly to bootstrap-originated rows. An existing `User` for the requested email blocks or reuses as follows:
- `status ACTIVE`, or a non-bootstrap-originated row (`invitedById` set, or `status = INVITED`) → real conflict, `409 DUPLICATE_ENTRY`. This is what closes the cross-flow hijack the swarm found: an attacker who lets someone else's `INVITE` token expire and then hits this public endpoint with that email gets rejected, not a takeover.
- `role = SUPER_ADMIN`, `invitedById = null`, `status IN (PENDING_APPROVAL, APPROVED)`, with a still-**valid** token → `403 SUPER_ADMIN_ALREADY_EXISTS` (in flight, don't spam).
- Same, but the token has **expired** → reuse the row: reissue a new `OWNER_APPROVAL` token, resend the email, `resendCount` reset is not needed (this is a fresh flow attempt, not a resend).

**Concurrency**: the lookup-and-branch runs inside one Prisma interactive transaction opening with `SELECT id FROM users WHERE email = $1 FOR UPDATE`, so two simultaneous requests for the same email serialize instead of racing (closes the read-then-write race the swarm flagged).

**Flow**: create/reuse `User(status=PENDING_APPROVAL, role=SUPER_ADMIN)` → create `VerificationToken(type=OWNER_APPROVAL, expiresAt=+48h)` → email `APP_OWNER_EMAIL` → `AuditLog(BOOTSTRAP_REQUESTED, userId: null, metadata: { targetUserId })`.
**Mail failure** [tightened, fix 7]: DB writes commit first; if the send throws, respond `500 EMAIL_DELIVERY_FAILED` with a **generic** message (this is a public, unauthenticated endpoint — don't disclose mail-infrastructure health specifics) so the caller knows to retry via resend rather than assume success. This fail-loud pattern is scoped to bootstrap/invite-class endpoints only — **never** applied to forgot-password (§ UC-AU-008), which must stay fire-and-forget to preserve anti-enumeration.
`APP_OWNER_EMAIL` unset → `500 OWNER_EMAIL_NOT_CONFIGURED`.
Rate limit: 3/hour/IP.

### UC-AU-004 · Owner Approves Bootstrap **[reworked, was fix 2]**
Split into a non-mutating validation step and an explicit mutating action, closing the email-scanner-prefetch problem (Outlook Safe Links etc. silently consuming a single-use token via automated pre-fetch):
- `GET /auth/approve-registration?token=` → validates the token (exists, unexpired, unused) **without marking it used or changing status** → renders/redirects to an `apps/web` confirmation page showing the pending registrant's email, with the raw token carried in a hidden form field (not relied upon via a cookie/session — the owner has no session). Response headers include `Referrer-Policy: no-referrer` and `X-Frame-Options: DENY` (clickjacking protection on this one-shot sensitive action).
- `POST /auth/approve-registration` (triggered by the confirmation page's button, token resubmitted in the body) → re-validates the token, marks it used, `status → APPROVED`, issues `VerificationToken(type=SET_ACCOUNT, expiresAt=+7d)`, emails the user → `AuditLog(BOOTSTRAP_APPROVED, userId: null, metadata: { targetUserId })`.

Errors: token not found/expired/used → `400 INVALID_OR_EXPIRED_TOKEN` (on either call).

### UC-AU-005 · Set Account **[tightened, fix 12]**
`POST /auth/set-account` → the entire operation — token validation, `AuthAccount` insert, `status → ACTIVE`, `UserProfile` creation, token mark-used — runs inside **one Prisma `$transaction`**. A `P2002` unique-constraint error on the `AuthAccount` insert (two concurrent completions of the same token racing) is caught **within that same transaction** and translated to `409 DUPLICATE_ENTRY` as a clean rollback — not a partial commit that could otherwise strand a user with a consumed token and `ACTIVE` status but no actual credential.
Errors: token invalid/expired/used → `400`.

### UC-AU-006 · Invite User **[reworked, was fix 1]**
**Precondition**: `ROLE_LEVEL[inviter.role] >= ROLE_LEVEL[dto.role]`, enforced server-side via a shared `assertRoleCeiling()` helper (`common/utils/role-ceiling.ts`) **[tightened, fix 11]** — extracted rather than left as bespoke inline logic, so any future privilege-sensitive endpoint (role changes, re-invites) can reuse the same check instead of risking a forgotten copy.

**Reuse scoped strictly to invite-originated rows**: an existing `User` for the target email reuses only if it is itself `status = INVITED` with an **expired** `INVITE` token. On reuse, `role` and `invitedById` are **always overwritten** to the current request's values, and the ceiling check runs against that fresh value — never against whatever a previous, possibly more-privileged inviter stored. This closes the privilege-escalation path the swarm found (a low-privileged inviter "reviving" a stale higher-privileged pending invite). Any other existing row (`ACTIVE`, or a still-valid pending invite, or a bootstrap-originated row) → real conflict, `409`. Same `FOR UPDATE` transaction locking as UC-AU-003.

**Flow**: create/reuse `User(status=INVITED, role=dto.role, invitedById=inviter.id)` → create `VerificationToken(type=INVITE, expiresAt=+7d)` → email invitee → `AuditLog(INVITE_SENT, userId: inviter.id, metadata: { targetUserId, invitedEmail, role })`.
Errors: role above inviter's level → `403 ROLE_CEILING_EXCEEDED`; invalid role value → `400`.
Rate limit: 20/hour/inviter.

### UC-AU-007 · Accept Invitation
Same transactional mechanics as UC-AU-005, sourced from an `INVITE` token. Role is read-only on the frontend — always `user.role`, never client-supplied at accept time.

### UC-AU-008 · Forgot Password
`POST /auth/forgot-password` → if user exists, `status=ACTIVE`, has a `LOCAL` `AuthAccount` → create `PASSWORD_RESET` token (+1h), send email → **always** respond `{ message: 'email_sent' }` regardless of outcome. **This flow must never adopt UC-AU-003's fail-loud-on-mail-error pattern** — a differing response based on send success would leak account existence. `AuditLog(PASSWORD_RESET_REQUESTED)` only on a real match.
Rate limit: 5/hour per IP+email (composite — see §8).

### UC-AU-009 · Reset Password
Validate token → update `passwordHash` (argon2id) → mark token used → **revoke every `RefreshToken` for this user across all families** (force logout everywhere) → `AuditLog(PASSWORD_RESET_COMPLETED)`.
Errors: token invalid/expired → `400`; no `LOCAL` `AuthAccount` (Google-only user) → `404`.

### UC-AU-010 · Resend Emails (set-account, invite) **[tightened, fix 5]**
`POST /auth/resend-set-account` (public, by email) / `POST /auth/resend-invite` (authenticated) → invalidate the current unused token of that type, issue + send a new one.
**Anti-enumeration + abuse cap**: identical generic response regardless of whether a match was found (parity with forgot-password). In addition to the 3/hour rate limit, `User.resendCount` is incremented on every resend and capped at **5 total** for the lifetime of a pending registration — closes the DoS the swarm found (3/hour alone still permits ~144 token invalidations across a 48h window, enough to perpetually kill the token before the real recipient acts on it). Once capped, further resend calls return the same generic response without creating new state.

### UC-AU-010b · Resend Owner Approval **[new endpoint, fix 5]**
`POST /auth/resend-owner-approval` (public, body `{ email }`) — fills the gap where the original bootstrap email fails or the owner loses it. Same anti-enumeration + `resendCount` cap + rate limit (3/hour) as UC-AU-010. Finds the `PENDING_APPROVAL` super-admin row by email, invalidates the old `OWNER_APPROVAL` token, issues a new one, resends.

### UC-AU-011 · Get Current User
`GET /auth/me` → JWT `sub` → user + profile. Read-only.

### UC-AU-012 · Refresh Access Token
`POST /auth/refresh` → hash incoming token → find `RefreshToken` row → validate not expired/revoked → issue new `access_token` + `refresh_token` (same `family_id`) → mark old row revoked → `AuditLog(TOKEN_REFRESHED)`.
**Reuse detection**: presented token already revoked (replay) → revoke the entire `family_id`, force full re-login → `AuditLog(TOKEN_REUSE_DETECTED)`.
Errors: not found/expired (non-reuse) → `401`.
Rate limit: 60/hour/IP.

### UC-AU-013 · Google Login (existing linked user) **[tightened, fix 10]**
`GET /auth/google` → consent → `GET /auth/google/callback` → find `AuthAccount(provider=GOOGLE, providerUserId=<sub>)` → **re-verify `status = ACTIVE` before issuing tokens** (a previously-linked but now-`SUSPENDED` user must not complete login just because the `AuthAccount` row still exists — this was an unstated gap in the original fix) → issue tokens as UC-AU-001, update `lastUsedAt`.
Non-`ACTIVE` match → `403 ACCOUNT_SUSPENDED` (or equivalent for the specific status).

### UC-AU-014 · Google Completes Bootstrap/Invitation, or Rejects **[tightened, fix 10]**
On callback, branch explicitly over every relevant status rather than a single pending-vs-reject binary:
- No `AuthAccount` match, but `User.email` matches a `PENDING_APPROVAL`/`APPROVED`/`INVITED` user, **and Google reports `email_verified=true`** → complete onboarding via UC-AU-005/007 logic, credential is `AuthAccount(provider=GOOGLE, providerUserId=<sub>)` instead of a password. `AuditLog(GOOGLE_LINKED)`.
- No `AuthAccount` match, but `User.email` matches an `ACTIVE` user → `409 EMAIL_ALREADY_ACTIVE`, "an account with this email already exists — log in with your password." Self-service "connect Google to an existing account" stays out of scope for v1. This is a **deliberate, documented exception** to the anti-enumeration posture used elsewhere — accepted because triggering it requires actually controlling the matching Google account (Google's signed ID token guarantees that), unlike a plain email-based enumeration attempt.
- No `AuthAccount` match, `User.email` matches a `SUSPENDED` user → `403 ACCOUNT_SUSPENDED`, not the generic "no invitation" message.
- No match at all, or `email_verified=false` → `403 NO_INVITATION_FOUND`. No account is ever created from an unrecognized or unverified identity.

---

## 6. Endpoints

| Method | Path | Guard | UC |
|---|---|---|---|
| POST | `/auth/login` | `LocalAuthGuard`, rate-limited | 001 |
| POST | `/auth/logout` | `JwtAuthGuard` | 002 |
| POST | `/auth/logout-all` | `JwtAuthGuard` | 002 |
| POST | `/auth/register/super-admin` | `@Public()`, self-locking, rate-limited | 003 |
| GET | `/auth/approve-registration` | `@Public()`, token, non-mutating | 004 |
| POST | `/auth/approve-registration` | `@Public()`, token, mutating | 004 |
| POST | `/auth/set-account` | `@Public()`, token | 005 |
| POST | `/auth/invite` | `JwtAuthGuard` + role-ceiling, rate-limited | 006 |
| POST | `/auth/accept-invite` | `@Public()`, token | 007 |
| POST | `/auth/forgot-password` | `@Public()`, rate-limited | 008 |
| POST | `/auth/reset-password` | `@Public()`, token | 009 |
| POST | `/auth/resend-set-account` | `@Public()`, rate-limited, capped | 010 |
| POST | `/auth/resend-invite` | `JwtAuthGuard`, rate-limited, capped | 010 |
| POST | `/auth/resend-owner-approval` | `@Public()`, rate-limited, capped | 010b |
| GET | `/auth/me` | `JwtAuthGuard` | 011 |
| POST | `/auth/refresh` | reads `refresh_token` cookie, rate-limited | 012 |
| GET | `/auth/google` | `@Public()`, rate-limited | 013 |
| GET | `/auth/google/callback` | `@Public()`, rate-limited | 013/014 |

---

## 7. Cookies & CORS **[tightened, fix 3]**

| Cookie | Path | httpOnly | TTL |
|---|---|---|---|
| `access_token` | `/` | yes | 15 min |
| `refresh_token` | `/auth/refresh` | yes | 30 days |

Both `secure` in production, `sameSite=lax`.

**Google's OAuth redirect lands directly on `apps/api`'s callback URL**, bypassing `apps/web`'s same-origin proxy — the "everything is same-origin" assumption doesn't hold for this one flow. Resolution: `apps/web` and `apps/api` **must share a parent domain in production**, with the cookie `Domain` attribute set to that parent (`COOKIE_DOMAIN=.yourapp.com`) so a cookie set from the API's callback is visible to the web app. Required alongside it: CORS configured with `Access-Control-Allow-Origin` set to the specific web origin (never a wildcard) and `Access-Control-Allow-Credentials: true`; the web client's fetches use `credentials: 'include'`.

**Fail-fast guard**: at boot, if `NODE_ENV=production` and `COOKIE_DOMAIN` is unset, or the configured web/api origins don't share that suffix, throw immediately rather than deploying a silently-broken Google login — this matters specifically because the template gets forked quickly across many differently-configured client domains, and a doc-only requirement is easy to miss under time pressure.

**Accepted tradeoff, documented deliberately**: `Domain=.yourapp.com` widens the cookie's visibility to every sibling subdomain under that parent (staging, marketing, any future service), and is incompatible with the `__Host-` cookie-name-prefix hardening pattern (which forbids any `Domain` attribute). The alternative — a code-exchange redirect back through the web origin, avoiding shared-domain cookies entirely — is deliberately deferred until a client actually needs fully separate domains, rather than built speculatively now.

---

## 8. Rate limiting (`@nestjs/throttler`) **[tightened, fix 8]**

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 10 / 15 min / IP |
| `POST /auth/register/super-admin` | 3 / hour / IP |
| `POST /auth/forgot-password` | 5 / hour / IP+email (composite) |
| `POST /auth/resend-set-account`, `/auth/resend-invite`, `/auth/resend-owner-approval` | 3 / hour / target email (composite) + 5 total lifetime (`resendCount`) |
| `POST /auth/invite` | 20 / hour / inviter (composite, keyed post-auth) |
| `POST /auth/refresh` | 60 / hour / IP |
| `GET /auth/google`, `/auth/google/callback` | 20 / hour / IP |
| **all of the above, additionally** | a plain global per-IP limiter layered underneath every composite-key limit |

Composite keys (IP+email, per-inviter) require a custom `ThrottlerGuard` subclass overriding `getTracker()` — the default tracker is IP-only. Implementation notes:
- The **global per-IP layer is required alongside** the composite ones — a composite-only limiter never trips for one real IP making single attempts against many different target emails (breadth-first enumeration), since each pair gets its own fresh bucket.
- `getTracker()` built from `request.ip` is only as strong as reverse-proxy configuration — document `trust proxy` setup as a deployment prerequisite; without it, IP either collapses to a constant or becomes spoofable via `X-Forwarded-For`.
- Guard ordering matters: for per-inviter throttling, `JwtAuthGuard` must run **before** the custom `ThrottlerGuard` so `req.user` is populated when `getTracker()` executes.
- `getTracker()` runs before Nest's `ValidationPipe` — it must defensively handle a missing/malformed `req.body`, not assume DTO-shaped input.
- `@nestjs/throttler`'s default `ThrottlerStorageService` is in-memory and per-process — fine for a single-instance deployment, but composite limits won't hold once `apps/api` scales horizontally. Documented upgrade path: a Redis-backed `ThrottlerStorage`, not needed until a client deployment actually scales out.

---

## 9. Audit log

`AuditLog.userId` is always the actor, nullable when none exists (owner approval, failed login on an unknown email). When actor differs from the affected user, the affected user's id goes in `metadata.targetUserId`. Written directly from each service method.

---

## 10. Token hygiene

`verification_tokens` and `refresh_tokens` accumulate indefinitely — recommend a scheduled cleanup job deleting rows past `expiresAt` by some margin (e.g. 30 days). Operational concern, not a security one.

---

## 11. Mail

Reuse the existing `@nestjs-modules/mailer` + `nodemailer` + EJS integration. Needed sends: owner-approval request (→ `APP_OWNER_EMAIL`), set-account-after-approval, invitation, password-reset. `resend-owner-approval` reuses the same `super-admin-registration.ejs` template as the original send.

---

## 12. Dependencies

```
argon2
passport-google-oauth20 (+ @types/passport-google-oauth20)
@nestjs/throttler
@nestjs/passport, passport, passport-local, passport-jwt (+ @types/passport-local, @types/passport-jwt)
@nestjs/jwt
cookie-parser (+ @types/cookie-parser)
class-validator, class-transformer
```

Mail deps as already listed in the existing mail block (`@nestjs-modules/mailer`, `nodemailer`, `ejs`).

---

## 13. `apps/api` module structure

```
apps/api/src/
├── app/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts            # login, logout, reuseOrCreateBootstrapRequest(), reuseOrCreateInvitation() -- two distinct, flow-scoped methods, not one shared generic helper (see UC-003/006)
│   │   ├── refresh-token.service.ts
│   │   ├── audit-log.service.ts
│   │   └── dto/
│   │       ├── register-super-admin.dto.ts
│   │       ├── login.dto.ts
│   │       ├── set-account.dto.ts
│   │       ├── invite-user.dto.ts
│   │       ├── accept-invite.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       ├── reset-password.dto.ts
│   │       ├── approve-registration.dto.ts   # token, for the POST step
│   │       └── resend-email.dto.ts
│   └── user-profile/
├── common/
│   ├── guard/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts             # generic static @Roles() infra, unused by this module today
│   │   └── composite-throttler.guard.ts   # NEW -- getTracker() override for IP+email / per-inviter composite keys (§8)
│   ├── strategy/
│   │   ├── jwt.strategy.ts            # cookie OR Authorization: Bearer
│   │   ├── local.strategy.ts
│   │   └── google.strategy.ts
│   ├── decorator/
│   │   ├── public.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   └── utils/
│       ├── token.ts                   # crypto.randomBytes(32) + SHA-256 helpers
│       ├── password.ts                # argon2id hash/verify, OWASP baseline params
│       └── role-ceiling.ts            # NEW -- assertRoleCeiling(inviterRole, targetRole), shared by invite and any future privilege-sensitive endpoint
├── integration/mail/
├── prisma/                            # PrismaService instantiates PrismaClient with the omit config (§1a) and the soft-delete $extends (§1a)
├── app.module.ts
└── main.ts
```

`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` global. `JwtAuthGuard` global via `APP_GUARD`, `@Public()` opts out explicitly (including the existing health-check/root route).

---

## 14. `packages/enums`

```
packages/enums/
├── src/
│   ├── role.enum.ts               # Role, ROLE_LEVEL
│   ├── user-status.enum.ts
│   ├── auth-provider.enum.ts
│   └── verification-token-type.enum.ts
├── package.json                    # name: "@compro/enums"
└── tsconfig.json
```

Consumed as `"@compro/enums": "workspace:*"` from both apps, built to `dist/*.js` + `.d.ts`.

---

## 15. `apps/web`

Pages: `/login`, `/register/super-admin`, `/set-account`, `/accept-invite`, `/forgot-password`, `/reset-password`, and **`/approve-registration`** (new — the GET-rendered confirmation page from UC-AU-004, showing the pending registrant's details with a form that POSTs the token to actually approve; served with `Referrer-Policy: no-referrer` and frame-busting headers).

Required client-side piece: a fetch/axios `401` interceptor that calls `POST /auth/refresh` once and retries, redirecting to `/login` if that also fails — without it, refresh rotation has nothing to trigger it.

Route protection: presence-check the `access_token` cookie server-side before rendering protected routes; real authorization always happens in `apps/api`.

---

## 16. Environment variables

```
APP_OWNER_EMAIL=
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
OWNER_APPROVAL_TOKEN_EXPIRES=48h
SET_ACCOUNT_TOKEN_EXPIRES=7d
INVITE_TOKEN_EXPIRES=7d
PASSWORD_RESET_TOKEN_EXPIRES=1h
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
MAIL_HOST=
MAIL_PORT=587
MAIL_FROM=
SMTP_USERNAME=
SMTP_PASSWORD=
FRONTEND_URL=http://localhost:3000
COOKIE_DOMAIN=localhost
```

---

## 17. Migration note

`compro/apps/api/prisma/schema.prisma` currently has a placeholder `User` model from the initial scaffold. This design replaces it entirely — no production data exists yet, so this is a clean `prisma migrate dev`, not a data migration.

---

## 18. Minimum test coverage before calling this done

- Login: correct credentials, wrong password, unknown email, non-ACTIVE status — all four return identical `401`.
- Bootstrap: second attempt while one is pending/approved/active → `403`/`409` per §5 UC-003; succeeds again once the pending token has expired.
- **Bootstrap cannot hijack an unrelated expired `INVITE` row** — targeting a stranger's expired invite email via the public bootstrap endpoint returns `409`, never a takeover.
- Invite: role above the inviter's level → `403`; a reused invite row always reflects the *current* inviter's role/`invitedById`, never a stale prior value.
- Concurrent duplicate bootstrap/invite requests for the same email serialize correctly under the `FOR UPDATE` lock — no duplicate tokens, no lost update.
- A race between two concurrent completions of the same set-account/accept-invite token leaves the losing request cleanly rejected (`409`), never a partial-state stranded user.
- Refresh: normal rotation succeeds; replaying an already-rotated token revokes the whole family.
- **A soft-deleted user cannot log in via the actual login/Google-login code path** (integration test against the real endpoint, not a unit test of the extension alone).
- **`passwordHash`/`tokenHash` never appear in any serialized auth-module response**, including from a deliberately careless handler.
- Google: unverified email never completes a pending invitation; a `SUSPENDED` user with a linked Google account is rejected at login despite the `AuthAccount` row existing.
- Password reset: revokes all of the user's refresh tokens.
- Resend endpoints: capped at 5 total regardless of the hourly rate limit resetting.
