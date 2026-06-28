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
    const nextRunAt = new Date().toISOString();
    await this.scheduleService.createSchedule(
      userId,
      'student',
      'learning_plan',
      cronExpression,
      nextRunAt,
    );
    this.logger.log(`Learning plan reminder created for user=${userId}, plan=${learningPlanId}`);
  }

  async createReviewReminder(
    userId: string,
    reviewScheduleId: string,
    cronExpression: string,
    locale = 'en',
  ): Promise<void> {
    const nextRunAt = new Date().toISOString();
    await this.scheduleService.createSchedule(
      userId,
      'student',
      'review',
      cronExpression,
      nextRunAt,
    );
    this.logger.log(`Review reminder created for user=${userId}, schedule=${reviewScheduleId}`);
  }

  async fireLearningReminder(userId: string, locale = 'en'): Promise<void> {
    await this.queueService.enqueue({
      userId,
      recipientType: 'student',
      templateKey: 'learning_reminder_due',
      channel: 'push',
      category: 'learning_reminder',
      locale,
      variables: {},
    });

    await this.queueService.enqueue({
      userId,
      recipientType: 'student',
      templateKey: 'learning_reminder_due',
      channel: 'in_app',
      category: 'learning_reminder',
      locale,
      variables: {},
    });
  }
}
