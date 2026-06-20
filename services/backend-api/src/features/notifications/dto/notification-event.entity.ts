import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationCategory,
  NotificationEventStatus,
} from './notification-enums';

export class NotificationEventEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  templateId!: string;

  @ApiProperty({ enum: ['in_app', 'push', 'email'] })
  channel!: NotificationChannel;

  @ApiProperty()
  category!: NotificationCategory;

  @ApiProperty({ enum: ['scheduled', 'queued', 'sent', 'failed', 'dismissed', 'read'] })
  status!: NotificationEventStatus;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ nullable: true })
  scheduledAt!: string | null;

  @ApiProperty({ nullable: true })
  sentAt!: string | null;

  @ApiProperty({ nullable: true })
  readAt!: string | null;

  @ApiProperty({ nullable: true })
  dismissedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
