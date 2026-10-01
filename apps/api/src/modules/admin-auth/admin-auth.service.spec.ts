import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';

function makeService(
  env: Record<string, string | undefined> = {
    ADMIN_PASSWORD: 'correct-horse',
    ADMIN_SESSION_SECRET: 'test-secret',
    ADMIN_SESSION_TTL_HOURS: '12',
  },
): AdminAuthService {
  const config = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  return new AdminAuthService(config);
}

describe('AdminAuthService', () => {
  describe('configuration', () => {
    it('is configured when both password and secret are set', () => {
      expect(makeService().isConfigured).toBe(true);
    });

    // Fail closed: a half-configured deploy must authenticate nobody rather than
    // accepting an empty password.
    it.each([
      ['no password', { ADMIN_SESSION_SECRET: 's' }],
      ['no secret', { ADMIN_PASSWORD: 'p' }],
      ['neither', {}],
    ])('is not configured with %s', (_label, env) => {
      const service = makeService(env);
      expect(service.isConfigured).toBe(false);
      expect(service.verifyPassword('')).toBe(false);
      expect(service.verifyPassword('p')).toBe(false);
      expect(service.verifyToken(service.issueToken())).toBe(false);
    });
  });

  describe('verifyPassword', () => {
    it('accepts the configured password', () => {
      expect(makeService().verifyPassword('correct-horse')).toBe(true);
    });

    it.each(['wrong', '', 'correct-hors', 'correct-horse '])(
      'rejects %p',
      (candidate) => {
        expect(makeService().verifyPassword(candidate)).toBe(false);
      },
    );
  });

  describe('tokens', () => {
    it('accepts a token it just issued', () => {
      const service = makeService();
      expect(service.verifyToken(service.issueToken())).toBe(true);
    });

    it('rejects a token past its expiry', () => {
      const service = makeService();
      const issuedAt = Date.now();
      const token = service.issueToken(issuedAt);
      const justInside = issuedAt + service.sessionTtlMs - 1000;
      const justOutside = issuedAt + service.sessionTtlMs + 1000;

      expect(service.verifyToken(token, justInside)).toBe(true);
      expect(service.verifyToken(token, justOutside)).toBe(false);
    });

    it('rejects a tampered expiry', () => {
      const service = makeService();
      const [, signature] = service.issueToken().split('.');
      // Same signature, but a payload claiming a far-future expiry.
      const forgedPayload = Buffer.from(
        JSON.stringify({ exp: Date.now() + 10 ** 12 }),
      ).toString('base64url');

      expect(service.verifyToken(`${forgedPayload}.${signature}`)).toBe(false);
    });

    it('rejects a token signed with a different secret', () => {
      const other = makeService({
        ADMIN_PASSWORD: 'correct-horse',
        ADMIN_SESSION_SECRET: 'a-different-secret',
      });
      expect(makeService().verifyToken(other.issueToken())).toBe(false);
    });

    it.each([
      ['undefined', undefined],
      ['empty', ''],
      ['no separator', 'abcdef'],
      ['empty signature', 'abcdef.'],
      ['garbage payload', 'not-base64!.sig'],
      ['short signature', 'abc.x'],
    ])('rejects a malformed token (%s)', (_label, token) => {
      expect(makeService().verifyToken(token)).toBe(false);
    });
  });
});
