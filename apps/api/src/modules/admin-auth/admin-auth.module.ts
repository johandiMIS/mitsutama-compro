import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    // Brute-force protection for the single shared password. Only the login route opts
    // in (see AdminAuthController), so nothing else in the API is rate limited.
    // In-memory storage: per process, reset on restart — fine for one instance; swap in
    // a shared store (e.g. Redis) if the API is ever scaled out horizontally.
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'admin-login',
          ttl: 15 * 60_000,
          limit: 10,
          // Once the limit is hit, lock that IP out for the full window rather than
          // letting it resume as soon as the oldest attempt ages out.
          blockDuration: 15 * 60_000,
        },
      ],
      errorMessage: 'Too many sign-in attempts. Try again in 15 minutes.',
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminGuard],
  exports: [AdminAuthService, AdminGuard],
})
export class AdminAuthModule {}
