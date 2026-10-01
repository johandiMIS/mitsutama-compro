import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { CookieOptions, Request, Response } from 'express';
import type { AdminSessionStatus } from '@compro/types';
import { ADMIN_COOKIE_NAME, AdminAuthService } from './admin-auth.service';

class LoginDto {
  @IsString()
  @MinLength(1)
  // Bounded so a huge body can't be pushed through the HMAC.
  @MaxLength(256)
  password!: string;
}

@Controller('admin/session')
export class AdminAuthController {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions(): CookieOptions {
    // `sameSite: 'lax'` is enough in both environments: localhost:3006 -> localhost:3007
    // and compro.example.com -> api.compro.example.com are both same-site (ports and
    // subdomains don't affect SameSite; only the registrable domain does).
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
    };
  }

  @Get()
  status(@Req() request: Request): AdminSessionStatus {
    const token = (request.cookies as Record<string, string> | undefined)?.[
      ADMIN_COOKIE_NAME
    ];
    return { authenticated: this.adminAuth.verifyToken(token) };
  }

  @Post()
  @HttpCode(200)
  // Counts every attempt, successful or not, per client IP. Behind a reverse proxy the
  // IP is only real if TRUST_PROXY is set (see main.ts), or every visitor shares one bucket.
  @UseGuards(ThrottlerGuard)
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): AdminSessionStatus {
    if (!this.adminAuth.isConfigured) {
      throw new ServiceUnavailableException(
        'Admin panel is not configured: set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
      );
    }
    if (!this.adminAuth.verifyPassword(body.password)) {
      throw new UnauthorizedException('Incorrect password');
    }

    response.cookie(ADMIN_COOKIE_NAME, this.adminAuth.issueToken(), {
      ...this.cookieOptions(),
      maxAge: this.adminAuth.sessionTtlMs,
    });
    return { authenticated: true };
  }

  @Delete()
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response): AdminSessionStatus {
    response.clearCookie(ADMIN_COOKIE_NAME, this.cookieOptions());
    return { authenticated: false };
  }
}
