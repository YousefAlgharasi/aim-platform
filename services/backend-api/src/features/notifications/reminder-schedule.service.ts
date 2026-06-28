import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { ReminderScheduleRow } from './notification-repository.types';
import { isValidReminderType, isValidCronExpression } from './notification-validation.helpers';

@Injectable()
export class ReminderScheduleService {
  constructor(private readonly repo: NotificationRepository) {}

  async createSchedule(
    ownerId: string,
    ownerType: string,
    kind: string,
    cadence: string,
    nextRunAt: string,
  ): Promise<ReminderScheduleRow> {
    if (!isValidReminderType(kind)) {
      throw new BadRequestException(`Invalid reminder type: ${kind}`);
    }
    if (!isValidCronExpression(cadence)) {
      throw new BadRequestException('Invalid cron expression');
    }
    return this.repo.createReminderSchedule(ownerId, ownerType, kind, cadence, nextRunAt);
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

  async advanceSchedule(scheduleId: string, nextRunAt: string): Promise<void> {
    await this.repo.updateScheduleNextRun(scheduleId, nextRunAt);
  }
}
