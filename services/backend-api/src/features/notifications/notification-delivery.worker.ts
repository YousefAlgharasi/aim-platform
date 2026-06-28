import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationQueueService } from './notification-queue.service';
import { InAppNotificationService } from './in-app-notification.service';
import {
  PushProviderAdapter,
  PUSH_PROVIDER_ADAPTER,
  PushDeliveryResult,
} from './push-provider-adapter.interface';
import {
  EmailProviderAdapter,
  EMAIL_PROVIDER_ADAPTER,
} from './email-provider-adapter.interface';
import { NotificationEventRow } from './notification-repository.types';

@Injectable()
export class NotificationDeliveryWorker {
  private readonly logger = new Logger(NotificationDeliveryWorker.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly queueService: NotificationQueueService,
    @Inject(PUSH_PROVIDER_ADAPTER) private readonly pushProvider: PushProviderAdapter,
    @Inject(EMAIL_PROVIDER_ADAPTER) private readonly emailProvider: EmailProviderAdapter,
  ) {}

  async processQueue(batchSize = 50): Promise<number> {
    const queued = await this.queueService.fetchQueued(batchSize);
    let processed = 0;

    for (const event of queued) {
      try {
        await this.deliverEvent(event);
        processed++;
      } catch (err) {
        this.logger.error(`Delivery failed for event=${event.id}: ${(err as Error).message}`);
      }
    }

    return processed;
  }

  private async deliverEvent(event: NotificationEventRow): Promise<void> {
    const attemptNumber = 1;
    const title = String(event.payload.title ?? '');
    const body = String(event.payload.body ?? '');

    if (event.channel === 'in_app') {
      await this.repo.updateEventStatus(event.id, event.recipient_id, 'sent');
      await this.repo.createDeliveryAttempt(event.id, 'in_app', 'internal', 'success', attemptNumber, null);
      return;
    }

    if (event.channel === 'push') {
      const tokens = await this.repo.findActiveTokensByUserId(event.recipient_id);
      if (tokens.length === 0) {
        await this.repo.createDeliveryAttempt(event.id, 'push', 'fcm', 'failed', attemptNumber, 'NO_TOKENS');
        await this.repo.updateEventStatus(event.id, event.recipient_id, 'failed');
        return;
      }

      let anySuccess = false;
      for (const token of tokens) {
        const result: PushDeliveryResult = await this.pushProvider.send({
          token: token.token,
          title,
          body,
        });

        if (result.success) {
          anySuccess = true;
        } else {
          await this.repo.createDeliveryAttempt(
            event.id,
            'push',
            'fcm',
            'failed',
            attemptNumber,
            result.errorCode ?? null,
          );
        }
      }

      if (anySuccess) {
        await this.repo.createDeliveryAttempt(event.id, 'push', 'fcm', 'success', attemptNumber, null);
        await this.repo.updateEventStatus(event.id, event.recipient_id, 'sent');
      } else {
        await this.repo.updateEventStatus(event.id, event.recipient_id, 'failed');
      }
      return;
    }

    if (event.channel === 'email') {
      const result = await this.emailProvider.send({
        to: event.recipient_id,
        subject: title,
        bodyHtml: body,
        bodyText: body,
      });

      if (result.success) {
        await this.repo.createDeliveryAttempt(event.id, 'email', 'smtp', 'success', attemptNumber, null);
        await this.repo.updateEventStatus(event.id, event.recipient_id, 'sent');
      } else {
        await this.repo.createDeliveryAttempt(
          event.id,
          'email',
          'smtp',
          'failed',
          attemptNumber,
          result.errorCode ?? null,
        );
        await this.repo.updateEventStatus(event.id, event.recipient_id, 'failed');
      }
    }
  }
}
