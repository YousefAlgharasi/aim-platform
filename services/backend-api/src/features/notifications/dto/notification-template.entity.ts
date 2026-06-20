import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationLocale,
  NotificationCategory,
  NotificationTemplateStatus,
} from './notification-enums';

export class NotificationTemplateEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty({ enum: ['in_app', 'push', 'email'] })
  channel!: NotificationChannel;

  @ApiProperty({ enum: ['en', 'ar'] })
  locale!: NotificationLocale;

  @ApiProperty()
  category!: NotificationCategory;

  @ApiProperty({ enum: ['active', 'disabled'] })
  status!: NotificationTemplateStatus;

  @ApiProperty()
  titleTemplate!: string;

  @ApiProperty()
  bodyTemplate!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
