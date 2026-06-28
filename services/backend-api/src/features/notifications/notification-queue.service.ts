import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationEventRow, NotificationTemplateRow } from './notification-repository.types';

export interface QueueNotificationRequest {
  userId: string;
  recipientType: string;
  templateKey: string;
  channel: string;
  category: string;
  locale: string;
  variables: Record<string, string>;
  scheduledAt?: string;
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly eligibility: NotificationEligibilityService,
    private readonly templateService: NotificationTemplateService,
  ) {}

  async enqueue(request: QueueNotificationRequest): Promise<NotificationEventRow | null> {
    const check = await this.eligibility.checkEligibility(
      request.userId,
      request.channel,
      request.category,
    );

    if (!check.eligible) {
      this.logger.log(
        `Notification skipped for user=${request.userId}: ${check.reason}`,
      );
      return null;
    }

    const template = await this.templateService.resolveTemplate(
      request.templateKey,
      request.channel,
      request.locale,
    );

    const { title, body } = this.templateService.renderTemplate(template, request.variables);

    const status = request.scheduledAt ? 'scheduled' : 'queued';

    return this.repo.createEvent(
      request.userId,
      request.recipientType,
      template.id,
      request.channel,
      request.category,
      status,
      { title, body, ...request.variables },
    );
  }

  async fetchQueued(limit = 50): Promise<NotificationEventRow[]> {
    return this.repo.findQueuedEvents(limit);
  }
}
