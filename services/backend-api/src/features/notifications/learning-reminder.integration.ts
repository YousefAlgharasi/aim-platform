import { Injectable, Logger } from '@nestjs/common';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationQueueService } from './notification-queue.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LearningReminderIntegration {
  private readonly logger = new Logger(LearningReminderIntegration.name);

  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly queueService: NotificationQueueService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Every caller into this integration (the AIM pipeline's review-schedule
   * persistence, in particular) identifies a student by the raw Supabase
   * Auth UID — the id convention used throughout learning_sessions,
   * lesson_attempts, and review_schedules. reminder_schedules.owner_id,
   * however, has a real FK to users(id) (the internal id), so inserting the
   * auth UID directly violates fk_reminder_schedules_owner. Resolve here,
   * once, at the boundary where a student id crosses into the
   * notifications domain's id space.
   *
   * Returns null (logged, not thrown) if no matching user row exists —
   * a missing reminder must never block or roll back the AIM-owned
   * skill-state/difficulty/recommendation/review-schedule writes that
   * already happened in the same transaction.
   */
  private async resolveOwnerId(authUid: string): Promise<string | null> {
    const user = await this.usersService.findBySupabaseUid(authUid);
    if (user === null) {
      this.logger.warn(`No user found for supabase auth uid=${authUid}; skipping reminder`);
      return null;
    }
    return user.id;
  }

  async createLearningPlanReminder(
    userId: string,
    learningPlanId: string,
    cronExpression: string,
    locale = 'en',
  ): Promise<void> {
    const ownerId = await this.resolveOwnerId(userId);
    if (ownerId === null) return;

    const nextRunAt = new Date().toISOString();
    await this.scheduleService.createSchedule(
      ownerId,
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
    const ownerId = await this.resolveOwnerId(userId);
    if (ownerId === null) return;

    await this.scheduleService.createSchedule(
      ownerId,
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
