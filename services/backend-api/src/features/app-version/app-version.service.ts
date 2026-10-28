import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppPlatform, AppVersionPolicy } from './app-version.types';

interface AppVersionPolicyRow {
  platform: AppPlatform;
  min_supported_version: string;
  latest_version: string;
  store_url: string | null;
}

/** Returned when no row exists for a platform, so the client never blocks. */
const NO_UPDATE_VERSION = '0.0.0';

@Injectable()
export class AppVersionService {
  constructor(private readonly db: DatabaseService) {}

  async getPolicy(platform: AppPlatform): Promise<AppVersionPolicy> {
    const result = await this.db.query<AppVersionPolicyRow>(
      `SELECT platform, min_supported_version, latest_version, store_url
       FROM app_version_policies
       WHERE platform = $1`,
      [platform],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        platform,
        minSupportedVersion: NO_UPDATE_VERSION,
        latestVersion: NO_UPDATE_VERSION,
        storeUrl: null,
      };
    }

    return {
      platform: row.platform,
      minSupportedVersion: row.min_supported_version,
      latestVersion: row.latest_version,
      storeUrl: row.store_url,
    };
  }
}
