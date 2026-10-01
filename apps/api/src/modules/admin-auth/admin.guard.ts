import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ADMIN_COOKIE_NAME, AdminAuthService } from './admin-auth.service';

/**
 * Gates every mutating hero-image endpoint. Fails closed: if ADMIN_PASSWORD or
 * ADMIN_SESSION_SECRET is missing, `isConfigured` is false and nothing authenticates,
 * so a misconfigured deploy is locked rather than wide open.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminAuth: AdminAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = (request.cookies as Record<string, string> | undefined)?.[
      ADMIN_COOKIE_NAME
    ];

    if (!this.adminAuth.verifyToken(token)) {
      throw new UnauthorizedException('Admin session required');
    }
    return true;
  }
}
