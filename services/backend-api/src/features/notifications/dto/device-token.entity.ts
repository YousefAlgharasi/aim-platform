import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DEVICE_TOKEN_PLATFORMS, DeviceTokenPlatform, DeviceTokenStatus } from './notification-enums';

export class DeviceTokenEntity {
  id!: string;
  userId!: string;
  platform!: DeviceTokenPlatform;
  token!: string;
  status!: DeviceTokenStatus;
  deviceLabel!: string | null;
  lastSeenAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class RegisterDeviceTokenRequestDto {
  @IsIn([...DEVICE_TOKEN_PLATFORMS])
  platform!: DeviceTokenPlatform;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}
