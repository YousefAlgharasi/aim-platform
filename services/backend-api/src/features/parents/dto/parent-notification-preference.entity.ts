// P12-039: Create Parent Notification Preferences API
// Read-only mirror of a row in parent_notification_preferences. Stores a
// parent's opt-in/opt-out preference for one channel + category. No
// notification is ever sent from this entity or the service that
// produces it — this is preference storage only, in readiness for
// Phase 13.

import { ApiProperty } from '@nestjs/swagger';

import { ParentNotificationChannel, ParentNotificationCategory } from './parent-notification-enums';

export class ParentNotificationPreferenceEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parentId!: string;

  @ApiProperty()
  channel!: ParentNotificationChannel;

  @ApiProperty()
  category!: ParentNotificationCategory;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
