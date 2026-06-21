import {
  NotificationCategory,
  NotificationChannel,
  NotificationRecipientType,
} from './notification-enums';

export class NotificationPreferenceEntity {
  id!: string;
  userId!: string;
  userType!: NotificationRecipientType;
  channel!: NotificationChannel;
  category!: NotificationCategory;
  enabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

// Request DTO for updating a single preference. The backend resolves
// `userId`/`userType` from the authenticated caller -- never from this body.
export class UpdateNotificationPreferenceRequestDto {
  channel!: NotificationChannel;
  category!: NotificationCategory;
  enabled!: boolean;
}
