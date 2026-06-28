import { Injectable, Logger } from '@nestjs/common';
import { NotificationDigestService } from './notification-digest.service';
import { NotificationQueueService } from './notification-queue.service';

@Injectable()
export class ParentSummaryReminderIntegration {
  private readonly logger = new Logger(ParentSummaryReminderIntegration.name);

  constructor(
    private readonly digestService: NotificationDigestService,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createWeeklyParentSummary(parentId: string, locale = 'en'): Promise<void> {
    const digest = await this.digestService.createWeeklyDigest(parentId, 'parent');
    if (!digest) {
      this.logger.log(`No digest created for parent=${parentId}`);
      return;
    }

    await this.queueService.enqueue({
      userId: parentId,
      recipientType: 'parent',
      templateKey: 'parent_weekly_summary',
      channel: 'in_app',
      category: 'parent_summary',
      locale,
      variables: { event_count: String(digest.event_ids.length) },
    });

    await this.queueService.enqueue({
      userId: parentId,
      recipientType: 'parent',
      templateKey: 'parent_weekly_summary',
      channel: 'push',
      category: 'parent_summary',
      locale,
      variables: { event_count: String(digest.event_ids.length) },
    });

    await this.digestService.markDigestSent(digest.id);
    this.logger.log(`Parent summary sent for parent=${parentId}, events=${digest.event_ids.length}`);
  }

  async createDailyParentSummary(parentId: string, locale = 'en'): Promise<void> {
    const digest = await this.digestService.createDailyDigest(parentId, 'parent');
    if (!digest) return;

    await this.queueService.enqueue({
      userId: parentId,
      recipientType: 'parent',
      templateKey: 'parent_daily_summary',
      channel: 'in_app',
      category: 'parent_summary',
      locale,
      variables: { event_count: String(digest.event_ids.length) },
    });

    await this.digestService.markDigestSent(digest.id);
  }
}
