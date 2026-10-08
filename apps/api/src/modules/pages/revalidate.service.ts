import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Tells the web app to drop its cached copies after a publish/unpublish/rename, so the
 * live page and menu change immediately instead of waiting out a time-based refresh.
 *
 * Best-effort by design: the DB write has already succeeded, so a web app that is down
 * or misconfigured must not turn a successful publish into an error. The web app's
 * fetches also carry a short time-based revalidate as the safety net.
 */
@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);
  private readonly webUrl?: string;
  private readonly secret?: string;

  constructor(config: ConfigService) {
    this.webUrl = config.get<string>('WEB_URL')?.replace(/\/+$/, '') || undefined;
    this.secret = config.get<string>('REVALIDATE_SECRET') || undefined;
    if (!this.webUrl || !this.secret) {
      this.logger.warn(
        'WEB_URL / REVALIDATE_SECRET not set: published changes will reach the site only when its cache expires (a few minutes).',
      );
    }
  }

  async revalidate(tags: string[]): Promise<void> {
    if (!this.webUrl || !this.secret || tags.length === 0) return;
    try {
      const response = await fetch(`${this.webUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': this.secret,
        },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) {
        this.logger.warn(`Revalidate responded ${response.status} for ${tags.join(', ')}`);
      }
    } catch (error) {
      this.logger.warn(`Revalidate failed for ${tags.join(', ')}: ${String(error)}`);
    }
  }
}
