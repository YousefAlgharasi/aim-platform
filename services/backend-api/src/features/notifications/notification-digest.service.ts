import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationDigestRow, NotificationEventRow } from './notification-repository.types';

@Injectable()
export class NotificationDigestService {
  private readonly logger = new Logger(NotificationDigestService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly eligibility: NotificationEligibilityService,
  ) {}

  async createDailyDigest(userId: string): Promise<NotificationDigestRow | null> {
    return this.createDigest(userId, 'daily', 1);
  }

  async createWeeklyDigest(userId: string): Promise<NotificationDigestRow | null> {
    return this.createDigest(userId, 'weekly', 7);
  }

  private async createDigest(
    userId: string,
    frequency: string,
    daysBack: number,
  ): Promise<NotificationDigestRow | null> {
    const check = await this.eligibility.checkEligibility(userId, 'in_app', 'parent_summary');
    if (!check.eligible) {
      this.logger.log(`Digest skipped for user=${userId}: ${check.reason}`);
      return null;
    }

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const events = await this.repo.findEventsByUserId(userId, 'in_app', 100, 0);
    const eligibleEvents = events.filter(
      (e) => new Date(e.created_at) >= periodStart && new Date(e.created_at) <= periodEnd,
    );

    if (eligibleEvents.length === 0) {
      this.logger.log(`No events for digest, user=${userId}`);
      return null;
    }

    return this.repo.createDigest(
      userId,
      frequency,
      periodStart.toISOString(),
      periodEnd.toISOString(),
      eligibleEvents.length,
    );
  }

  async markDigestSent(digestId: string): Promise<void> {
    await this.repo.updateDigestStatus(digestId, 'sent');
  }

  async markDigestFailed(digestId: string): Promise<void> {
    await this.repo.updateDigestStatus(digestId, 'failed');
  }
}
