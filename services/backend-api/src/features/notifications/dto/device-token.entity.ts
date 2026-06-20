import { DeviceTokenPlatform, DeviceTokenStatus } from './notification-enums';

export class DeviceTokenEntity {
  id: string;
  userId: string;
  platform: DeviceTokenPlatform;
  token: string;
  status: DeviceTokenStatus;
  deviceLabel: string | null;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTO for registering a device token. `status` is never accepted
// from the client -- the backend assigns it after validating ownership.
export class RegisterDeviceTokenRequestDto {
  platform: DeviceTokenPlatform;
  token: string;
  deviceLabel?: string;
}
