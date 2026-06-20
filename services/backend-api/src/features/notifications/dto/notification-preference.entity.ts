import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationCategory,
  NotificationUserType,
} from './notification-enums';

export class NotificationPreferenceEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['student', 'parent'] })
  userType!: NotificationUserType;

  @ApiProperty({ enum: ['in_app', 'push', 'email'] })
  channel!: NotificationChannel;

  @ApiProperty()
  category!: NotificationCategory;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
