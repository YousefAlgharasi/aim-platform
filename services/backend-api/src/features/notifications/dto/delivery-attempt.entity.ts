import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel, DeliveryAttemptStatus } from './notification-enums';

export class DeliveryAttemptEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  notificationEventId!: string;

  @ApiProperty({ enum: ['in_app', 'push', 'email'] })
  channel!: NotificationChannel;

  @ApiProperty({ enum: ['pending', 'success', 'failed'] })
  status!: DeliveryAttemptStatus;

  @ApiProperty()
  attemptNumber!: number;

  @ApiProperty({ nullable: true })
  errorCode!: string | null;

  @ApiProperty({ nullable: true })
  errorMessage!: string | null;

  @ApiProperty()
  attemptedAt!: string;

  @ApiProperty()
  createdAt!: string;
}
