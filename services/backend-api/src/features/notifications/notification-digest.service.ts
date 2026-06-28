import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationDigestRow } from './notification-repository.types';

@Injectable()
export class NotificationDigestService {
  private readonly logger = new Logger(NotificationDigestService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly eligibility: NotificationEligibilityService,
  ) {}

  async createDailyDigest(userId: string, recipientType: string): Promise<NotificationDigestRow | null> {
    return this.createDigest(userId, recipientType, 'daily', 1);
  }

  async createWeeklyDigest(userId: string, recipientType: string): Promise<NotificationDigestRow | null> {
    return this.createDigest(userId, recipientType, 'weekly', 7);
  }

  private async createDigest(
    userId: string,
    recipientType: string,
    period: string,
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
      recipientType,
      period,
      periodStart.toISOString(),
      periodEnd.toISOString(),
      eligibleEvents.map((e) => e.id),
    );
  }

  async markDigestSent(digestId: string): Promise<void> {
    await this.repo.updateDigestState(digestId, 'sent');
  }

  async markDigestFailed(digestId: string): Promise<void> {
    this.logger.warn(`Digest ${digestId} failed to send; leaving state as pending for retry`);
  }
}
