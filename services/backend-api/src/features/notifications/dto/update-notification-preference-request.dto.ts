import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CATEGORIES,
  NotificationChannel,
  NotificationCategory,
} from './notification-enums';

export class UpdateNotificationPreferenceRequestDto {
  @ApiProperty({ enum: ['in_app', 'push', 'email'] })
  @IsEnum(NOTIFICATION_CHANNELS)
  channel!: NotificationChannel;

  @ApiProperty()
  @IsEnum(NOTIFICATION_CATEGORIES)
  category!: NotificationCategory;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}
