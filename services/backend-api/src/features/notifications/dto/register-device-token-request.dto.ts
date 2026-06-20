import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DEVICE_TOKEN_PLATFORMS, DeviceTokenPlatform } from './notification-enums';

export class RegisterDeviceTokenRequestDto {
  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  @IsEnum(DEVICE_TOKEN_PLATFORMS)
  platform!: DeviceTokenPlatform;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceName?: string;
}
