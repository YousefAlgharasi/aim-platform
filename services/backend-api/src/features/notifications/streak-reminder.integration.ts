import { Injectable, Logger } from '@nestjs/common';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationQueueService } from './notification-queue.service';

@Injectable()
export class StreakReminderIntegration {
  private readonly logger = new Logger(StreakReminderIntegration.name);

  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createStreakReminder(
    userId: string,
    cronExpression = '0 18 * * *',
    locale = 'en',
  ): Promise<void> {
    const nextRunAt = new Date().toISOString();
    await this.scheduleService.createSchedule(
      userId,
      'student',
      'streak',
      cronExpression,
      nextRunAt,
    );
    this.logger.log(`Streak reminder created for user=${userId}`);
  }

  async fireStreakReminder(
    userId: string,
    currentStreak: number,
    locale = 'en',
  ): Promise<void> {
    await this.queueService.enqueue({
      userId,
      recipientType: 'student',
      templateKey: 'streak_reminder',
      channel: 'push',
      category: 'learning_reminder',
      locale,
      variables: { streak_count: String(currentStreak) },
    });

    await this.queueService.enqueue({
      userId,
      recipientType: 'student',
      templateKey: 'streak_reminder',
      channel: 'in_app',
      category: 'learning_reminder',
      locale,
      variables: { streak_count: String(currentStreak) },
    });
  }
}
