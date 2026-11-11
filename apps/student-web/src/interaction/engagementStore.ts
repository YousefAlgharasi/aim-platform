// One shared copy of the engagement summary (streak, daily goal) plus the streak-celebration trigger.
// The top bar reads the streak from here, and learning screens call `reportLearningCompleted()` after the
// server confirms a completion. Nothing here computes progress: every number comes from the backend.
import { fetchEngagementSummary, type EngagementSummary } from '../features/dashboard/dashboardApi';
import {
  decideCelebration,
  readCelebrationRecord,
  streakDay,
  writeCelebrationRecord,
  type StreakCelebration,
  type SummarySnapshot,
} from './streak';

export interface EngagementState {
  summary: EngagementSummary | null;
  celebration: StreakCelebration | null;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let state: EngagementState = { summary: null, celebration: null };
let snapshot: SummarySnapshot | null = null;
let userId: string | null = null;
let reporting: Promise<void> | null = null;
/** Bumped on sign-out/user change so late responses from the previous learner are ignored. */
let generation = 0;

function set(next: Partial<EngagementState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribeEngagement(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getEngagementState(): EngagementState { return state; }

/** Bind the store to the signed-in learner; a different learner starts from a clean slate. */
export function setEngagementUser(uid: string | null) {
  if (uid === userId) return;
  const hadUser = userId !== null;
  userId = uid;
  // First bind after page load keeps whatever the top bar already fetched; a real change of learner starts clean.
  if (!hadUser) return;
  generation += 1;
  snapshot = null;
  reporting = null;
  set({ summary: null, celebration: null });
}

function accept(summary: EngagementSummary | null) {
  if (summary) snapshot = { summary, day: streakDay() };
  set({ summary });
}

/** Reload the summary (top bar, on navigation). Errors are swallowed: the streak is a convenience. */
export function refreshEngagement(): Promise<void> {
  const gen = generation;
  return fetchEngagementSummary()
    .then((s) => { if (gen === generation) accept(s); })
    .catch(() => undefined);
}

/**
 * Call after the server has confirmed a finished learning activity (lesson practice, speaking, writing).
 * Reloads the summary and, if this is the learner's first finished activity of the day, raises the streak
 * celebration exactly once. Safe to call repeatedly: duplicates, retries and refreshes are ignored.
 */
export function reportLearningCompleted(): Promise<void> {
  if (reporting) return reporting;
  const gen = generation;
  const uid = userId;
  const before = snapshot;
  reporting = fetchEngagementSummary()
    .then((after) => {
      if (gen !== generation || !after) return;
      const celebration = uid ? decideCelebration(after, before, readCelebrationRecord(uid)) : null;
      if (uid && after.goal.streakDays >= 1) {
        // Recorded before anything is shown, so a refresh mid-animation can never replay it.
        writeCelebrationRecord(uid, { day: streakDay(), streak: after.goal.streakDays });
      }
      snapshot = { summary: after, day: streakDay() };
      set(celebration ? { summary: after, celebration } : { summary: after });
    })
    .catch(() => undefined)
    .finally(() => { reporting = null; });
  return reporting;
}

export function dismissCelebration() {
  if (state.celebration) set({ celebration: null });
}

/** Test hook. */
export function __resetEngagementForTests() {
  listeners.clear();
  state = { summary: null, celebration: null };
  snapshot = null; userId = null; reporting = null; generation += 1;
}
