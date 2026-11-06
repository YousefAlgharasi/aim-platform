import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderScheduleService } from './reminder-schedule.service';
import { LearningReminderIntegration } from './learning-reminder.integration';
import { ParentSummaryReminderIntegration } from './parent-summary-reminder.integration';
import { ParentRepository } from '../parents/parent.repository';
import { AdminBroadcastService } from './admin-broadcast.service';
import { JobLockService } from '../../database/job-lock.service';

@Injectable()
export class NotificationReminderScheduler {
  private readonly logger = new Logger(NotificationReminderScheduler.name);

  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly learningReminderIntegration: LearningReminderIntegration,
    private readonly parentSummaryReminderIntegration: ParentSummaryReminderIntegration,
    private readonly parentRepo: ParentRepository,
    private readonly broadcastService: AdminBroadcastService,
    private readonly jobLock: JobLockService,
  ) {}

  // Deadline and streak schedules aren't created by anything yet (no
  // upstream deadline/streak tracking exists), so only review/learning_plan
  // schedules are fired here. Cancel-after-fire is one-shot semantics.
  @Cron(CronExpression.EVERY_MINUTE)
  async fireDueReminders(): Promise<void> {
    await this.jobLock.runExclusive('reminders.fire-due', async () => {
      const dueSchedules = await this.scheduleService.getDueSchedules(100);

      for (const schedule of dueSchedules) {
        try {
          if (schedule.kind === 'review' || schedule.kind === 'learning_plan') {
            await this.learningReminderIntegration.fireLearningReminder(schedule.owner_id);
            await this.scheduleService.cancelSchedule(schedule.id, schedule.owner_id);
          }
        } catch (error) {
          this.logger.error(`Failed to fire reminder schedule=${schedule.id}`, error as Error);
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async fireDailyParentSummaries(): Promise<void> {
    await this.jobLock.runExclusive('reminders.parent-daily', async () => {
      const parentIds = await this.parentRepo.findActiveParentIds();

      for (const parentId of parentIds) {
        try {
          await this.parentSummaryReminderIntegration.createDailyParentSummary(parentId);
        } catch (error) {
          this.logger.error(`Failed to create daily parent summary for parent=${parentId}`, error as Error);
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async fireWeeklyParentSummaries(): Promise<void> {
    await this.jobLock.runExclusive('reminders.parent-weekly', async () => {
      const parentIds = await this.parentRepo.findActiveParentIds();

      for (const parentId of parentIds) {
        try {
          await this.parentSummaryReminderIntegration.createWeeklyParentSummary(parentId);
        } catch (error) {
          this.logger.error(`Failed to create weekly parent summary for parent=${parentId}`, error as Error);
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async fireDueBroadcasts(): Promise<void> {
    await this.jobLock.runExclusive('reminders.broadcasts', async () => {
      try {
        await this.broadcastService.processDue();
      } catch (error) {
        this.logger.error('Failed to process due admin broadcasts', error as Error);
      }
    });
  }
}
