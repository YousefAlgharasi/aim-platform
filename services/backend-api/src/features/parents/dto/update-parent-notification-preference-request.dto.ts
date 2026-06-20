// P12-039: Create Parent Notification Preferences API
// Request payload to set a parent's enabled/disabled preference for one
// channel + category. The backend never sends a notification as a result
// of this request — it only persists the preference.

import { IsBoolean, IsEnum } from 'class-validator';

import {
  PARENT_NOTIFICATION_CATEGORIES,
  PARENT_NOTIFICATION_CHANNELS,
  ParentNotificationCategory,
  ParentNotificationChannel,
} from './parent-notification-enums';

export class UpdateParentNotificationPreferenceRequestDto {
  @IsEnum(PARENT_NOTIFICATION_CHANNELS)
  readonly channel!: ParentNotificationChannel;

  @IsEnum(PARENT_NOTIFICATION_CATEGORIES)
  readonly category!: ParentNotificationCategory;

  @IsBoolean()
  readonly enabled!: boolean;
}
