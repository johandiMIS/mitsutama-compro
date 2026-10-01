import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const ADMIN_COOKIE_NAME = 'compro_admin';

/**
 * Interim single-password admin auth.
 *
 * Deliberately minimal and stateless: one shared password from the environment, and a
 * signed cookie carrying nothing but an expiry. There are no users, roles or refresh
 * tokens here — that is `docs/auth-passportjs-google.md`, which is a design doc and not
 * yet built. When that module lands, replace `AdminGuard` and delete this file; nothing
 * else in the hero-image feature depends on how the caller was authenticated.
 */
@Injectable()
export class AdminAuthService {
  private readonly password: string;
  private readonly secret: string;
  private readonly ttlMs: number;

  constructor(config: ConfigService) {
    this.password = config.get<string>('ADMIN_PASSWORD') ?? '';
    this.secret = config.get<string>('ADMIN_SESSION_SECRET') ?? '';
    const ttlHours = Number(
      config.get<string>('ADMIN_SESSION_TTL_HOURS') ?? 12,
    );
    this.ttlMs = (Number.isFinite(ttlHours) ? ttlHours : 12) * 60 * 60 * 1000;
  }

  /** False when the admin panel has not been configured — used to fail closed. */
  get isConfigured(): boolean {
    return this.password.length > 0 && this.secret.length > 0;
  }

  get sessionTtlMs(): number {
    return this.ttlMs;
  }

  /**
   * Constant-time password comparison. Both sides are hashed first so the comparison
   * runs over equal-length buffers — `timingSafeEqual` throws on a length mismatch, and
   * raw lengths would leak the password length anyway.
   */
  verifyPassword(candidate: string): boolean {
    if (!this.isConfigured) return false;
    const a = createHmac('sha256', this.secret).update(candidate).digest();
    const b = createHmac('sha256', this.secret).update(this.password).digest();
    return timingSafeEqual(a, b);
  }

  /** `<base64url(payload)>.<base64url(hmac)>`, where payload is just an expiry. */
  issueToken(now = Date.now()): string {
    const payload = Buffer.from(
      JSON.stringify({ exp: now + this.ttlMs }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  verifyToken(token: string | undefined, now = Date.now()): boolean {
    if (!this.isConfigured || !token) return false;

    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expected = this.sign(payload);
    // Compare as fixed-length buffers; a forged signature of a different length
    // would otherwise throw rather than simply failing.
    const given = Buffer.from(signature);
    const want = Buffer.from(expected);
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
      return false;
    }

    try {
      const { exp } = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as { exp?: number };
      return typeof exp === 'number' && exp > now;
    } catch {
      return false;
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');
  }
}
