import { Injectable, ForbiddenException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationPreferenceRow } from './notification-repository.types';
import { isValidChannel, isValidCategory } from './notification-validation.helpers';

@Injectable()
export class NotificationPreferenceService {
  constructor(private readonly repo: NotificationRepository) {}

  async getPreferences(userId: string): Promise<NotificationPreferenceRow[]> {
    return this.repo.findPreferencesByUserId(userId);
  }

  async updatePreference(
    userId: string,
    userType: string,
    channel: string,
    category: string,
    enabled: boolean,
  ): Promise<NotificationPreferenceRow> {
    if (!isValidChannel(channel)) {
      throw new ForbiddenException(`Invalid channel: ${channel}`);
    }
    if (!isValidCategory(category)) {
      throw new ForbiddenException(`Invalid category: ${category}`);
    }
    return this.repo.upsertPreference(userId, userType, channel, category, enabled);
  }

  async isEnabled(userId: string, channel: string, category: string): Promise<boolean> {
    const prefs = await this.repo.findPreferencesByUserId(userId);
    const match = prefs.find((p) => p.channel === channel && p.category === category);
    return match ? match.enabled : true;
  }
}
