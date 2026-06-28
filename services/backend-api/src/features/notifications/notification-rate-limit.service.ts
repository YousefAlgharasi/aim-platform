import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface RateLimitConfig {
  maxPerHour: number;
  maxPerDay: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  push: { maxPerHour: 10, maxPerDay: 50 },
  in_app: { maxPerHour: 20, maxPerDay: 100 },
  email: { maxPerHour: 5, maxPerDay: 20 },
};

@Injectable()
export class NotificationRateLimitService {
  private readonly logger = new Logger(NotificationRateLimitService.name);

  constructor(private readonly db: DatabaseService) {}

  async isRateLimited(userId: string, channel: string): Promise<boolean> {
    const limits = DEFAULT_LIMITS[channel];
    if (!limits) return false;

    const hourCount = await this.getCountSince(userId, channel, '1 hour');
    if (hourCount >= limits.maxPerHour) {
      this.logger.warn(`Rate limit (hourly) hit for user=${userId}, channel=${channel}`);
      return true;
    }

    const dayCount = await this.getCountSince(userId, channel, '1 day');
    if (dayCount >= limits.maxPerDay) {
      this.logger.warn(`Rate limit (daily) hit for user=${userId}, channel=${channel}`);
      return true;
    }

    return false;
  }

  private async getCountSince(userId: string, channel: string, interval: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notification_events
       WHERE recipient_id = $1 AND channel = $2 AND state IN ('sent', 'queued')
       AND created_at >= now() - INTERVAL '${interval}'`,
      [userId, channel],
    );
    return parseInt(result.rows[0].count, 10);
  }
}
