import { studyPlanApi } from '../learner/learnerApi';
import { fetchLatestPlacementStatus, fetchPlacementGate } from '../placement/placementApi';

/**
 * What a signed-in student still has to do before the dashboard. Both answers come from the
 * server (study plan exists / placement decision recorded), so the flow follows the account
 * across browsers. A failed check never blocks the app: it counts as "nothing to do".
 */
export interface SetupStatus {
  needsPlan: boolean;
  needsChoice: boolean;
  /** Chose "take the placement test" but has not completed one: the dashboard stays locked. */
  needsPlacement: boolean;
}

export const setupPending = (s: SetupStatus) => s.needsPlan || s.needsChoice || s.needsPlacement;

const doneKey = (userId: string) => `aim_setup_done:${userId}`;

/** Both server facts only ever go from missing to present, so "done" is safe to remember per user. */
export function isSetupDoneCached(userId: string): boolean {
  try { return localStorage.getItem(doneKey(userId)) === '1'; } catch { return false; }
}
export function cacheSetupDone(userId: string) {
  try { localStorage.setItem(doneKey(userId), '1'); } catch { /* the server check just runs again */ }
}

export async function fetchSetupStatus(): Promise<SetupStatus> {
  const [plan, gate] = await Promise.allSettled([studyPlanApi.get(), fetchPlacementGate()]);
  const needsPlan = plan.status === 'fulfilled' && !plan.value.plan;
  const g = gate.status === 'fulfilled' ? gate.value : null;
  const needsChoice = !!g?.should_show_gate;
  let needsPlacement = false;
  if (!needsChoice && g?.decision === 'take_placement') {
    // 'completed' is the only state that unlocks the dashboard (active/submitted/none keep it locked).
    // If this check itself fails we do not lock the student out.
    needsPlacement = await fetchLatestPlacementStatus().then((l) => l.status !== 'completed', () => false);
  }
  return { needsPlan, needsChoice, needsPlacement };
}
