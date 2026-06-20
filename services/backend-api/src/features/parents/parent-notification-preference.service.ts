// P12-039: Create Parent Notification Preferences API
// Backend authority for reading and updating a parent's notification
// preferences. This service never sends a notification and never reads
// or computes any Phase 13 notification-sending logic — it only persists
// per-channel/category opt-in state for later use by Phase 13.

import { Injectable } from '@nestjs/common';

import { ParentNotificationPreferenceEntity } from './dto/parent-notification-preference.entity';
import { ParentNotificationCategory, ParentNotificationChannel } from './dto/parent-notification-enums';
import { ParentNotificationPreferenceRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';

@Injectable()
export class ParentNotificationPreferenceService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async listPreferencesForParent(parentId: string): Promise<ParentNotificationPreferenceEntity[]> {
    const rows = await this.parentRepository.findNotificationPreferencesByParent(parentId);

    return rows.map((row) => this.toEntity(row));
  }

  async updatePreference(
    parentId: string,
    channel: ParentNotificationChannel,
    category: ParentNotificationCategory,
    enabled: boolean,
  ): Promise<ParentNotificationPreferenceEntity> {
    const row = await this.parentRepository.upsertNotificationPreference(
      parentId,
      channel,
      category,
      enabled,
    );

    return this.toEntity(row);
  }

  private toEntity(row: ParentNotificationPreferenceRow): ParentNotificationPreferenceEntity {
    const entity = new ParentNotificationPreferenceEntity();

    entity.id = row.id;
    entity.parentId = row.parent_id;
    entity.channel = row.channel as ParentNotificationChannel;
    entity.category = row.category as ParentNotificationCategory;
    entity.enabled = row.enabled;
    entity.createdAt = row.created_at.toISOString();
    entity.updatedAt = row.updated_at.toISOString();

    return entity;
  }
}
