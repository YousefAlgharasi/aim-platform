import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

/** Flags managed in Admin → Operations → Feature Flags, evaluated for the signed-in user. */
export type FeatureFlags = Record<string, boolean>;

const TTL_MS = 60_000;
let cache: { at: number; flags: FeatureFlags } | null = null;
let inflight: Promise<FeatureFlags> | null = null;

export function fetchFeatureFlags(force = false): Promise<FeatureFlags> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.flags);
  if (!inflight) {
    inflight = apiClient
      .get<{ flags: FeatureFlags }>('/feature-flags')
      .then((r) => {
        cache = { at: Date.now(), flags: r?.flags ?? {} };
        return cache.flags;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** For tests / sign-out. */
export function resetFeatureFlagCache() {
  cache = null;
  inflight = null;
}

/**
 * true unless an admin has defined the flag AND it evaluates to off for this user.
 * Undefined flags, loading and network errors all mean "feature on", so a flags outage
 * can never take features away from students.
 */
export function isFlagOn(flags: FeatureFlags | null, key: string): boolean {
  return flags?.[key] !== false;
}

export function useFeatureFlag(key: string): boolean {
  const [flags, setFlags] = useState<FeatureFlags | null>(cache?.flags ?? null);
  useEffect(() => {
    let alive = true;
    const load = () => fetchFeatureFlags().then((f) => alive && setFlags(f)).catch(() => undefined);
    load();
    const id = window.setInterval(load, TTL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);
  return isFlagOn(flags, key);
}
