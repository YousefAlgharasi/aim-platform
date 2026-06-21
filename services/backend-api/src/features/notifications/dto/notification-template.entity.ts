import {
  NotificationCategory,
  NotificationChannel,
  NotificationLocale,
  NotificationTemplateStatus,
} from './notification-enums';

export class NotificationTemplateEntity {
  id!: string;
  key!: string;
  channel!: NotificationChannel;
  locale!: NotificationLocale;
  category!: NotificationCategory;
  status!: NotificationTemplateStatus;
  titleTemplate!: string;
  bodyTemplate!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
