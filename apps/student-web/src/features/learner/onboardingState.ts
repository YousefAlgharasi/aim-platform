import { useEffect, useState } from 'react';
import { studyPlanApi } from './learnerApi';

const key = (userId?: string) => `aim_onboarding_done:${userId ?? 'anon'}`;

export function isOnboardingDone(userId?: string): boolean {
  try { return localStorage.getItem(key(userId)) === '1'; } catch { return false; }
}
export function markOnboardingDone(userId?: string) {
  try { localStorage.setItem(key(userId), '1'); } catch { /* the plan check just runs again next visit */ }
}

/**
 * true when a signed-in student has no study plan and has not skipped onboarding.
 * Errors and the flag both mean "do not interrupt": onboarding must never block the app.
 */
export function useNeedsOnboarding(enabled: boolean, userId?: string): boolean {
  const [needs, setNeeds] = useState(false);
  useEffect(() => {
    if (!enabled || !userId || isOnboardingDone(userId)) { setNeeds(false); return; }
    let alive = true;
    studyPlanApi.get()
      .then(({ plan }) => {
        if (!alive) return;
        if (plan) markOnboardingDone(userId);
        setNeeds(!plan);
      })
      .catch(() => alive && setNeeds(false));
    return () => { alive = false; };
  }, [enabled, userId]);
  return needs;
}
