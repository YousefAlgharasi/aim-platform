import { Injectable, Logger } from '@nestjs/common';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationQueueService } from './notification-queue.service';

@Injectable()
export class LearningReminderIntegration {
  private readonly logger = new Logger(LearningReminderIntegration.name);

  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createLearningPlanReminder(
    userId: string,
    learningPlanId: string,
    cronExpression: string,
    locale = 'en',
  ): Promise<void> {
    await this.scheduleService.createSchedule(
      userId,
      'learning_plan',
      cronExpression,
      learningPlanId,
      null,
      null,
    );
    this.logger.log(`Learning plan reminder created for user=${userId}, plan=${learningPlanId}`);
  }

  async createReviewReminder(
    userId: string,
    reviewScheduleId: string,
    cronExpression: string,
    locale = 'en',
  ): Promise<void> {
    await this.scheduleService.createSchedule(
      userId,
      'review_schedule',
      cronExpression,
      reviewScheduleId,
      null,
      null,
    );
    this.logger.log(`Review reminder created for user=${userId}, schedule=${reviewScheduleId}`);
  }

  async fireLearningReminder(userId: string, locale = 'en'): Promise<void> {
    await this.queueService.enqueue({
      userId,
      templateKey: 'learning_reminder_due',
      channel: 'push',
      category: 'learning_reminder',
      locale,
      variables: {},
    });

    await this.queueService.enqueue({
      userId,
      templateKey: 'learning_reminder_due',
      channel: 'in_app',
      category: 'learning_reminder',
      locale,
      variables: {},
    });
  }
}
