import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { ReminderScheduleRow } from './notification-repository.types';
import { isValidReminderType, isValidCronExpression } from './notification-validation.helpers';

@Injectable()
export class ReminderScheduleService {
  constructor(private readonly repo: NotificationRepository) {}

  async createSchedule(
    userId: string,
    reminderType: string,
    cronExpression: string,
    referenceId: string | null,
    nextFireAt: string | null,
    endsAt: string | null,
  ): Promise<ReminderScheduleRow> {
    if (!isValidReminderType(reminderType)) {
      throw new BadRequestException(`Invalid reminder type: ${reminderType}`);
    }
    if (!isValidCronExpression(cronExpression)) {
      throw new BadRequestException('Invalid cron expression');
    }
    return this.repo.createReminderSchedule(userId, reminderType, cronExpression, referenceId, nextFireAt, endsAt);
  }

  async getActiveSchedules(userId: string): Promise<ReminderScheduleRow[]> {
    return this.repo.findActiveSchedulesByUserId(userId);
  }

  async pauseSchedule(scheduleId: string, userId: string): Promise<ReminderScheduleRow> {
    const updated = await this.repo.updateScheduleStatus(scheduleId, userId, 'paused');
    if (!updated) throw new NotFoundException('Schedule not found');
    return updated;
  }

  async cancelSchedule(scheduleId: string, userId: string): Promise<ReminderScheduleRow> {
    const updated = await this.repo.updateScheduleStatus(scheduleId, userId, 'cancelled');
    if (!updated) throw new NotFoundException('Schedule not found');
    return updated;
  }

  async resumeSchedule(scheduleId: string, userId: string): Promise<ReminderScheduleRow> {
    const updated = await this.repo.updateScheduleStatus(scheduleId, userId, 'active');
    if (!updated) throw new NotFoundException('Schedule not found');
    return updated;
  }

  async getDueSchedules(limit = 100): Promise<ReminderScheduleRow[]> {
    return this.repo.findDueSchedules(limit);
  }

  async advanceSchedule(scheduleId: string, nextFireAt: string): Promise<void> {
    await this.repo.updateScheduleNextFire(scheduleId, nextFireAt, new Date().toISOString());
  }
}
