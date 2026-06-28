import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEventRow, DeliveryAttemptRow } from './notification-repository.types';

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 60_000,
  maxDelayMs: 3_600_000,
};

@Injectable()
export class NotificationRetryService {
  private readonly logger = new Logger(NotificationRetryService.name);
  private readonly policy: RetryPolicy = DEFAULT_RETRY_POLICY;

  constructor(private readonly repo: NotificationRepository) {}

  async shouldRetry(eventId: string): Promise<boolean> {
    const attempts = await this.repo.findAttemptsByEventId(eventId);
    const failedCount = attempts.filter((a) => a.status === 'failed').length;
    return failedCount < this.policy.maxAttempts;
  }

  getNextRetryDelayMs(attemptNumber: number): number {
    const delay = this.policy.baseDelayMs * Math.pow(2, attemptNumber - 1);
    return Math.min(delay, this.policy.maxDelayMs);
  }

  async requeueForRetry(event: NotificationEventRow): Promise<boolean> {
    const attempts = await this.repo.findAttemptsByEventId(event.id);
    const failedCount = attempts.filter((a) => a.status === 'failed').length;

    if (failedCount >= this.policy.maxAttempts) {
      this.logger.warn(`Max retries reached for event=${event.id}`);
      return false;
    }

    const delayMs = this.getNextRetryDelayMs(failedCount);
    const scheduledAt = new Date(Date.now() + delayMs).toISOString();

    await this.repo.updateEventStatus(event.id, event.recipient_id, 'queued');
    this.logger.log(`Requeued event=${event.id}, next attempt in ${delayMs}ms`);
    return true;
  }
}
