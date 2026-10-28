export const APP_PLATFORMS = ['android', 'ios'] as const;

export type AppPlatform = (typeof APP_PLATFORMS)[number];

export interface AppVersionPolicy {
  readonly platform: AppPlatform;
  readonly minSupportedVersion: string;
  readonly latestVersion: string;
  readonly storeUrl: string | null;
}
