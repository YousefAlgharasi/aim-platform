import { ApiProperty } from '@nestjs/swagger';
import { DeviceTokenPlatform, DeviceTokenStatus } from './notification-enums';

export class DeviceTokenEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  platform!: DeviceTokenPlatform;

  @ApiProperty()
  token!: string;

  @ApiProperty({ enum: ['active', 'disabled', 'expired'] })
  status!: DeviceTokenStatus;

  @ApiProperty({ nullable: true })
  deviceName!: string | null;

  @ApiProperty()
  lastSeenAt!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
