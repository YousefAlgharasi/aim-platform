import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { APP_PLATFORMS, AppPlatform, AppVersionPolicy } from './app-version.types';

interface AppVersionPolicyRow {
  platform: AppPlatform;
  min_supported_version: string;
  latest_version: string;
  store_url: string | null;
}

export interface AppVersionPolicyUpdate {
  minSupportedVersion?: string;
  latestVersion?: string;
  storeUrl?: string | null;
}

/** Returned when no row exists for a platform, so the client never blocks. */
const NO_UPDATE_VERSION = '0.0.0';

function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function toPolicy(row: AppVersionPolicyRow): AppVersionPolicy {
  return {
    platform: row.platform,
    minSupportedVersion: row.min_supported_version,
    latestVersion: row.latest_version,
    storeUrl: row.store_url,
  };
}

function emptyPolicy(platform: AppPlatform): AppVersionPolicy {
  return {
    platform,
    minSupportedVersion: NO_UPDATE_VERSION,
    latestVersion: NO_UPDATE_VERSION,
    storeUrl: null,
  };
}

@Injectable()
export class AppVersionService {
  private readonly logger = new Logger(AppVersionService.name);

  constructor(private readonly db: DatabaseService) {}

  async getPolicy(platform: AppPlatform): Promise<AppVersionPolicy> {
    const result = await this.db.query<AppVersionPolicyRow>(
      `SELECT platform, min_supported_version, latest_version, store_url
       FROM app_version_policies
       WHERE platform = $1`,
      [platform],
    );

    const row = result.rows[0];
    return row ? toPolicy(row) : emptyPolicy(platform);
  }

  async listPolicies(): Promise<AppVersionPolicy[]> {
    const result = await this.db.query<AppVersionPolicyRow>(
      `SELECT platform, min_supported_version, latest_version, store_url
       FROM app_version_policies`,
    );

    const byPlatform = new Map(result.rows.map((row) => [row.platform, toPolicy(row)]));
    return APP_PLATFORMS.map((platform) => byPlatform.get(platform) ?? emptyPolicy(platform));
  }

  async updatePolicy(
    platform: AppPlatform,
    update: AppVersionPolicyUpdate,
    adminId: string,
  ): Promise<AppVersionPolicy> {
    const current = await this.getPolicy(platform);
    const next: AppVersionPolicy = {
      platform,
      minSupportedVersion: update.minSupportedVersion ?? current.minSupportedVersion,
      latestVersion: update.latestVersion ?? current.latestVersion,
      storeUrl: update.storeUrl === undefined ? current.storeUrl : update.storeUrl,
    };

    if (compareVersions(next.minSupportedVersion, next.latestVersion) > 0) {
      throw new BadRequestException('minSupportedVersion cannot be higher than latestVersion');
    }

    const result = await this.db.query<AppVersionPolicyRow>(
      `INSERT INTO app_version_policies (platform, min_supported_version, latest_version, store_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (platform) DO UPDATE
       SET min_supported_version = EXCLUDED.min_supported_version,
           latest_version = EXCLUDED.latest_version,
           store_url = EXCLUDED.store_url
       RETURNING platform, min_supported_version, latest_version, store_url`,
      [platform, next.minSupportedVersion, next.latestVersion, next.storeUrl],
    );

    this.logger.log(
      `App version policy for ${platform} set to min=${next.minSupportedVersion} latest=${next.latestVersion} by admin ${adminId}`,
    );

    return toPolicy(result.rows[0]);
  }
}
