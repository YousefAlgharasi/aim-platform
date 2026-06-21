import { Injectable, Logger } from '@nestjs/common';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationQueueService } from './notification-queue.service';

@Injectable()
export class DeadlineReminderIntegration {
  private readonly logger = new Logger(DeadlineReminderIntegration.name);

  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createDeadlineReminder(
    userId: string,
    deadlineId: string,
    deadlineDate: string,
    locale = 'en',
  ): Promise<void> {
    const deadline = new Date(deadlineDate);
    const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    const cronExpression = this.dateToCron(oneDayBefore);

    await this.scheduleService.createSchedule(
      userId,
      'deadline',
      cronExpression,
      deadlineId,
      oneDayBefore.toISOString(),
      deadline.toISOString(),
    );
    this.logger.log(`Deadline reminder created for user=${userId}, deadline=${deadlineId}`);
  }

  async fireDeadlineReminder(
    userId: string,
    deadlineName: string,
    locale = 'en',
  ): Promise<void> {
    await this.queueService.enqueue({
      userId,
      templateKey: 'deadline_reminder',
      channel: 'push',
      category: 'deadline_reminder',
      locale,
      variables: { deadline_name: deadlineName },
    });

    await this.queueService.enqueue({
      userId,
      templateKey: 'deadline_reminder',
      channel: 'in_app',
      category: 'deadline_reminder',
      locale,
      variables: { deadline_name: deadlineName },
    });
  }

  private dateToCron(date: Date): string {
    const m = date.getUTCMinutes();
    const h = date.getUTCHours();
    const d = date.getUTCDate();
    const mo = date.getUTCMonth() + 1;
    return `${m} ${h} ${d} ${mo} *`;
  }
}
