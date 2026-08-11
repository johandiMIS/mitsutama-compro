# Email Module Design (apps/api)

Design reference for a reusable transactional email capability in `apps/api`, first consumed by a future `AuthModule` (verification, password reset, etc.) and intended for any domain module that needs to send email later. **This document is a design spec, not yet implemented** — no code, dependencies, or config exist in the repo yet.

## Background

`apps/api` is currently a day-zero NestJS scaffold — only `app.module.ts`/`app.controller.ts`/`app.service.ts`/`main.ts` and `src/prisma/` exist, no auth module yet, no env validation library installed.

A reference implementation at a sibling project (`F:\PGS\product-factory`) was reviewed for inspiration only — not copied — because it had real problems worth designing around:
- Every `.ejs` template duplicated ~100+ lines of layout/CSS (no shared layout/partials).
- Zero type safety on template data — a typo'd variable silently rendered blank (`strict: false`).
- Inconsistent/missing error handling across call sites (unhandled promise rejections, no-op `try/catch { throw error }`).
- An unauthenticated test controller (`POST /mail/welcome`) that could be abused to spam arbitrary addresses.
- No actual Brevo integration despite assumptions otherwise — it was generic SMTP via `nodemailer`.

## Decisions locked in

1. **Provider:** Brevo, via the official `@getbrevo/brevo` SDK's transactional email HTTP API (not SMTP).
2. **Templating:** React Email (typed `.tsx` components) instead of EJS. Chosen specifically to fix the reference's two worst flaws: a shared `<EmailLayout>` component kills the duplication problem, and typed props kill the silent-blank-variable failure mode.
   - Rejected: **Eta** — faster than EJS and fixes duplication via native layouts, but still no type safety (the bigger of the two flaws).
   - Rejected: **MJML + Handlebars** — solves cross-client rendering correctness, but adds a second DSL for no gain over React Email's built-in components, which solve the same problem.
3. **Send strategy:** direct send in the request path, not a BullMQ/Redis queue. No new infra required, Brevo's API is fast, and the SDK already implements retry/backoff internally (see below).
4. **Module scope:** `EmailModule` is explicitly imported by consumers (not `@Global()` like `PrismaModule`) — not every module needs email the way every module needs DB access.
5. **Reusability contract:** `EmailModule`/`EmailService` stays domain-agnostic — no `sendWelcomeEmail()`-style methods (the reference's core coupling flaw). One generic `send()` method; each consuming domain module (e.g. future `AuthModule`) owns its own template files and calls it.
6. **Env validation:** introduce zod (nothing installed yet) via a `validate()` function on `ConfigModule.forRoot()`, covering both the new email vars and the existing unvalidated `DATABASE_URL`/`PORT`/`WEB_ORIGIN`.

## Version-reality findings

Verified against current package metadata at design time, not assumed from memory — re-check versions before implementing, since this ecosystem moves fast:

- **`@getbrevo/brevo` is currently v6**, a rewrite from the older class-based `TransactionalEmailsApi` API seen in older docs/blog posts. Current shape:
  ```ts
  const brevo = new BrevoClient({ apiKey, maxRetries });
  await brevo.transactionalEmails.sendTransacEmail({ subject, htmlContent, textContent, sender, to });
  ```
  It **already implements retry/backoff internally** — default 2 retries, exponential backoff + jitter, retries only `408/429/500/502/503/504`, throws typed errors (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `UnprocessableEntityError`, `TooManyRequestsError`, `InternalServerError`) for everything else. The module should configure this behavior rather than hand-roll a second retry loop.
- **`@react-email/components` is deprecated.** Use the `react-email` package itself (v6, which now exports the components — `Html`, `Body`, `Container`, `Button`, `Text`, `Heading`, `Link`, `Hr`, `Img`, `Preview`, etc.) plus `@react-email/render` for the `render()` function.

## Build config change required

Checked `apps/api/tsconfig.json`, `tsconfig.build.json`, `nest-cli.json` directly against the actual repo state:

- `tsconfig.json` has **no `include`/`files` field**, so TypeScript's default behavior already includes all `.ts`/`.tsx` under `src/`. The only missing piece is the `jsx` compiler option — without it, `.tsx` files fail with `TS17004: Cannot use JSX unless the '--jsx' flag is provided`.
  - **One-line fix:** add `"jsx": "react-jsx"` to `apps/api/tsconfig.json`'s `compilerOptions`.
- `tsconfig.build.json`'s `exclude` (`node_modules`/`test`/`dist`/`*.spec.ts`) needs no change — template `.tsx` files are production source, not test files.
- `nest-cli.json` needs no change — no `assets` config exists that would interfere, and `.tsx` compiles via `tsc` like any other source file once `jsx` is set. **Do not switch to the SWC builder** to "fix" this — it's unrelated scope creep; `tsc` already handles it.
- `package.json`'s embedded `"jest"` block **does** need updating independently (Jest resolves modules via its own config, not `tsconfig.build.json`): add `"tsx"` to `moduleFileExtensions`, widen the `transform` regex from `^.+\\.(t|j)s$` to `^.+\\.(t|j)sx?$`.
- **Verification once implemented:** confirm `pnpm --filter api build` actually emits a `.js` file for a `.tsx` source (silent exclusion would make the build "succeed" while the module 404s at runtime), and confirm a Jest test importing a `.tsx` file actually runs rather than erroring.

## New dependencies (`apps/api/package.json`)

**`dependencies`** (must be runtime, not dev — templates render at request time):
- `@getbrevo/brevo`
- `react-email`
- `@react-email/render`
- `react`
- `react-dom`
- `zod`

**`devDependencies`:**
- `@types/react`, `@types/react-dom` (matching whichever React major is chosen — no functional reason to prefer 18 vs 19, both are supported by every package involved)

Note: `react-email` pulls in CLI/dev tooling (esbuild, chokidar, tailwindcss, etc.) as transitive deps since it bundles both components and CLI. Inert unless the `email` CLI bin is invoked, but real install-size weight worth knowing about, especially for container images.

## File tree

```
apps/api/src/config/
├── env.schema.ts          # zod schema: DATABASE_URL, PORT, WEB_ORIGIN, BREVO_API_KEY,
│                           #   EMAIL_SENDER_ADDRESS, EMAIL_SENDER_NAME, EMAIL_MAX_RETRIES
└── env.validation.ts      # validate() fn wired into ConfigModule.forRoot({ validate })

apps/api/src/email/
├── email.module.ts          # NOT @Global() — providers: [brevoClientProvider, EmailService], exports: [EmailService]
├── email.service.ts         # generic send(options: SendEmailOptions): Promise<SendEmailResult>
├── email.service.spec.ts    # mocked BREVO_CLIENT — render pipeline + retryable/non-retryable error classification
├── brevo-client.provider.ts # DI-token factory (BREVO_CLIENT) wrapping `new BrevoClient({ apiKey, maxRetries })`
├── render-email.util.ts     # renderEmail(element) -> { html, text } via @react-email/render
├── render-email.util.spec.ts
├── email.types.ts           # SendEmailOptions, EmailRecipient, EmailAttachment, SendEmailResult
├── errors/
│   └── email-send.error.ts  # EmailSendError(message, { cause, retryable }) — normalizes Brevo errors for callers
├── components/
│   └── email-layout.tsx     # shared <EmailLayout> (header/footer/branding) — every template wraps in this
└── templates/__fixtures__/
    └── test-notice.tsx      # demo/test-only template — explicitly NOT a precedent for where real domain
                              #   templates live (a comment marks this boundary clearly)

apps/api/scripts/
└── send-test-email.ts       # manual smoke-test script (see Verification) — outside src/, not compiled to dist/
```

Real domain templates (e.g. a future `src/modules/auth/emails/verify-email.tsx`) live inside the module that owns them, importing `EmailLayout` from `../../../email/components/email-layout` — `EmailModule` never gains auth-specific knowledge.

## `EmailModule` / `EmailService`

```ts
// email.module.ts
@Module({
  providers: [brevoClientProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {} // deliberately NOT @Global()
```

```ts
// email.types.ts
interface EmailRecipient { email: string; name?: string; }
interface EmailAttachment { name: string; content?: string; url?: string; } // base64 content OR url, per Brevo's API

interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  template: React.ReactElement;    // EmailService renders it — callers stay declarative
  from?: EmailRecipient;           // overrides module default sender (from env)
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[]; // future-proofing, cheap to add now
  tags?: string[];                 // Brevo categorization tags
}

interface SendEmailResult { messageId: string; }
```

```ts
// brevo-client.provider.ts
export const BREVO_CLIENT = Symbol('BREVO_CLIENT');

export const brevoClientProvider: Provider = {
  provide: BREVO_CLIENT,
  useFactory: (config: ConfigService<EnvConfig, true>) =>
    new BrevoClient({
      apiKey: config.get('BREVO_API_KEY', { infer: true }),
      maxRetries: config.get('EMAIL_MAX_RETRIES', { infer: true }),
    }),
  inject: [ConfigService],
};
```
Injecting via a DI token (`BREVO_CLIENT`) rather than importing `BrevoClient` directly into `EmailService`'s constructor keeps the service unit-testable (swap in a mock provider) and keeps a seam for a future provider swap.

```ts
// render-email.util.ts
interface RenderedEmail { html: string; text: string; }

async function renderEmail(element: ReactElement): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
```

```ts
// errors/email-send.error.ts
class EmailSendError extends Error {
  readonly retryable: boolean;
  constructor(message: string, options: { cause?: unknown; retryable: boolean }) {
    super(message, { cause: options.cause });
    this.name = 'EmailSendError';
    this.retryable = options.retryable;
  }
}
```
Normalizing to a provider-agnostic `EmailSendError` — rather than letting `BrevoError` subclasses leak to callers — is what keeps `EmailModule` reusable in the sense that matters: callers like a future `AuthService` can branch on `err.retryable` without knowing Brevo exists.

```ts
// email.service.ts
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultSender: EmailRecipient;

  constructor(
    @Inject(BREVO_CLIENT) private readonly brevo: BrevoClient,
    config: ConfigService<EnvConfig, true>,
  ) {
    this.defaultSender = {
      email: config.get('EMAIL_SENDER_ADDRESS', { infer: true }),
      name: config.get('EMAIL_SENDER_NAME', { infer: true }),
    };
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const { html, text } = await renderEmail(options.template);
    const to = Array.isArray(options.to) ? options.to : [options.to];

    try {
      const result = await this.brevo.transactionalEmails.sendTransacEmail({
        sender: options.from ?? this.defaultSender,
        to, cc: options.cc, bcc: options.bcc, replyTo: options.replyTo,
        subject: options.subject,
        htmlContent: html,
        textContent: text,
        attachment: options.attachments,
        tags: options.tags,
      });
      return { messageId: result.messageId };
    } catch (err) {
      // 4xx (bad recipient, bad payload, auth) — the SDK does NOT retry these
      // internally; we just classify + normalize + log.
      if (isNonRetryableBrevoError(err)) {
        this.logger.warn(`Email rejected by provider (non-retryable): ${err.message}`);
        throw new EmailSendError('Email rejected by provider', { cause: err, retryable: false });
      }
      // Everything else reaches here only after the SDK's own internal
      // retry/backoff (408/429/5xx) was already exhausted.
      this.logger.error(`Email delivery failed after retries: ${err.message}`);
      throw new EmailSendError('Email delivery failed', { cause: err, retryable: true });
    }
  }
}
```

**Retry policy: do not add a second retry loop around `send()`.** Configure `BrevoClient`'s built-in retry via `EMAIL_MAX_RETRIES` and let it handle transient failures — its policy already matches what's needed (retry 408/429/5xx, don't retry 4xx). `send()`'s job is only to classify whatever surfaces *after* the SDK's retries are exhausted. Stacking a hand-rolled outer retry on top would compound attempts multiplicatively during a provider outage (e.g. 3 outer × 3 inner = 9 attempts) — document this directly on the method.

## Env schema

```ts
// config/env.schema.ts
const envSchema = z.object({
  // pre-existing vars, validated for the first time
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3007),
  WEB_ORIGIN: z.string().url().default('http://localhost:3006'),

  // new: email module
  BREVO_API_KEY: z.string().min(1),
  EMAIL_SENDER_ADDRESS: z.string().email(),
  EMAIL_SENDER_NAME: z.string().min(1),
  EMAIL_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
});
```
Wired via `validate()` into `ConfigModule.forRoot({ isGlobal: true, validate })` in `app.module.ts`, replacing the current unvalidated `ConfigModule.forRoot({ isGlobal: true })`. `EmailModule` itself is **not** imported into `AppModule` — it's imported per-consumer (see below).

## How a future `AuthModule` would consume this

```
apps/api/src/modules/auth/
├── auth.module.ts
├── auth.service.ts
├── auth.controller.ts
├── dto/
└── emails/
    ├── verify-email.tsx
    └── reset-password.tsx
```

```ts
// auth.module.ts
@Module({
  imports: [EmailModule], // explicit import — EmailModule is not @Global()
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

```tsx
// modules/auth/emails/verify-email.tsx
interface VerifyEmailProps { userName: string; verifyUrl: string; }

export default function VerifyEmail({ userName, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout previewText="Verify your email address">
      <Text>Hi {userName}, confirm your email:</Text>
      <Button href={verifyUrl}>Verify email</Button>
    </EmailLayout>
  );
}
```

```ts
// auth.service.ts
constructor(private readonly emailService: EmailService) {}

private async sendVerificationEmail(user: { email: string; name: string }, token: string) {
  await this.emailService.send({
    to: { email: user.email, name: user.name },
    subject: 'Verify your email',
    template: <VerifyEmail userName={user.name} verifyUrl={`${webOrigin}/verify?token=${token}`} />,
  });
}
```

This is the concrete proof of the reusability contract: `AuthModule` owns 100% of its email *content* and *when-to-send* logic; `EmailModule` never has to know "verification" or "password reset" exist.

## Verification plan (no unauthenticated endpoint)

Deliberately avoids the reference implementation's flaw of an unauthenticated test controller that could be abused to spam arbitrary addresses.

1. **Jest unit tests** (`email.service.spec.ts`, `render-email.util.spec.ts`) — mock the `BREVO_CLIENT` provider, no network calls or API key needed, runs in CI. Covers render pipeline correctness and retryable-vs-not error classification.
2. **One-off manual smoke test**, gated outside `src/`:
   ```
   apps/api/scripts/send-test-email.ts
   ```
   Run manually via `pnpm --filter api exec ts-node -r tsconfig-paths/register scripts/send-test-email.ts you@example.com`. Requires an explicit CLI arg (no default recipient, so it can't fire accidentally), and lives outside `src/` so it's excluded from `tsconfig.build.json`'s compiled output — never wired to an HTTP route. This is what actually proves the real `BREVO_API_KEY`/sender config works against the live Brevo API, which the mocked unit test can't confirm.
3. No npm-`start`-reachable controller route for this module, ever.
4. Once implemented, run the build-config verification checklist above (confirm `.tsx` compiles to `dist/`, confirm Jest transforms `.tsx`).

## Risks to keep in mind at implementation time

- **SDK-internal retry + a future hand-rolled outer retry wrapper** would compound attempts multiplicatively under a provider outage — document this on `EmailService.send()` directly so it isn't reintroduced later.
- **Direct-send-in-request-path** (the locked no-queue decision) means a future `AuthModule` endpoint (e.g. register) blocks on Brevo's round-trip — plus up to ~7s worst-case internal SDK retry backoff on a transient failure — before responding. `AuthModule` will need to decide per-flow whether to await-and-surface-502 or fire-and-forget without blocking the response. This is `AuthModule`'s design problem when it's built, not `EmailModule`'s, but it follows directly from this already-locked decision.
- **`react-email`'s transitive dev-tooling weight** in `node_modules` (esbuild, chokidar, tailwindcss, etc.) — inert, but real install-size cost worth knowing about, especially before containerizing.
