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

  // P20-021: nextRunAt must be the review's actual dueAt, not "now" — the
  // reminder scheduler's due-check (NotificationRepository.findDueSchedules)
  // gates strictly on next_run_at <= now(), so passing "now" here fired
  // every review reminder immediately at creation time instead of on the
  // real spaced-repetition due date.
  async createReviewReminder(
    userId: string,
    reviewScheduleId: string,
    dueAt: string,
    locale = 'en',
  ): Promise<void> {
    await this.scheduleService.createSchedule(
      userId,
      'student',
      'review',
      toOneShotCronExpression(dueAt),
      dueAt,
    );
    this.logger.log(
      `Review reminder created for user=${userId}, schedule=${reviewScheduleId}, dueAt=${dueAt}`,
    );
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

// One-shot cron expression (minute hour day month *) firing at dueAt's
// minute/hour/day/month each year; the reminder scheduler cancels the
// schedule after it fires once (NotificationReminderScheduler.fireDueReminders),
// so the yearly recurrence never matters.
function toOneShotCronExpression(dueAt: string): string {
  const date = new Date(dueAt);
  return `${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
}
