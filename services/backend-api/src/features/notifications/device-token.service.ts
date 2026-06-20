import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { DeviceTokenRow } from './notification-repository.types';
import { isValidPlatform, isValidDeviceToken } from './notification-validation.helpers';

@Injectable()
export class DeviceTokenService {
  constructor(private readonly repo: NotificationRepository) {}

  async registerToken(
    userId: string,
    platform: string,
    token: string,
    deviceName: string | null,
  ): Promise<DeviceTokenRow> {
    if (!isValidPlatform(platform)) {
      throw new BadRequestException(`Invalid platform: ${platform}`);
    }
    if (!isValidDeviceToken(token)) {
      throw new BadRequestException('Invalid device token');
    }
    return this.repo.upsertDeviceToken(userId, platform, token, deviceName);
  }

  async getActiveTokens(userId: string): Promise<DeviceTokenRow[]> {
    return this.repo.findActiveTokensByUserId(userId);
  }

  async disableToken(tokenId: string, userId: string): Promise<void> {
    await this.repo.disableDeviceToken(tokenId, userId);
  }

  async rotateToken(
    userId: string,
    oldTokenId: string,
    platform: string,
    newToken: string,
    deviceName: string | null,
  ): Promise<DeviceTokenRow> {
    await this.repo.disableDeviceToken(oldTokenId, userId);
    return this.registerToken(userId, platform, newToken, deviceName);
  }

  async cleanupExpired(daysOld = 90): Promise<number> {
    return this.repo.cleanupExpiredTokens(daysOld);
  }
}
