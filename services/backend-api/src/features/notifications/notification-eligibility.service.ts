import { Injectable } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationRepository } from './notification.repository';

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

@Injectable()
export class NotificationEligibilityService {
  constructor(
    private readonly preferenceService: NotificationPreferenceService,
    private readonly repo: NotificationRepository,
  ) {}

  async checkEligibility(
    userId: string,
    channel: string,
    category: string,
  ): Promise<EligibilityResult> {
    const prefEnabled = await this.preferenceService.isEnabled(userId, channel, category);
    if (!prefEnabled) {
      return { eligible: false, reason: 'preference_disabled' };
    }

    const inQuietHours = await this.isInQuietHours(userId);
    if (inQuietHours) {
      return { eligible: false, reason: 'quiet_hours' };
    }

    return { eligible: true };
  }

  async isInQuietHours(userId: string): Promise<boolean> {
    const quietHours = await this.repo.findQuietHoursByUserId(userId);
    if (!quietHours) return false;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: quietHours.timezone,
    });
    const currentTime = formatter.format(now);

    const start = quietHours.start_time;
    const end = quietHours.end_time;

    if (start <= end) {
      return currentTime >= start && currentTime < end;
    }
    return currentTime >= start || currentTime < end;
  }
}
