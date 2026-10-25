import { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { getErrorMessage } from '../../../api/client';
import { DAILY_GOAL_MAX, DAILY_GOAL_MIN, type DailyGoalSummary } from '../dashboardApi';
import { FlameIcon } from '../../../components/common/Icons';
import * as ui from './ui';

interface StreakWidgetProps {
  /** Backend-computed goal + streak (GET /student/engagement/summary). Null when unavailable. */
  goal: DailyGoalSummary | null;
  /** Persists a new daily lesson target (PUT /student/engagement/goal). */
  onUpdateGoal?: (target: number) => Promise<void>;
}

export function StreakWidget({ goal, onUpdateGoal }: StreakWidgetProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal?.targetLessons ?? DAILY_GOAL_MIN);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!goal) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <span className={ui.iconPill} aria-hidden="true"><FlameIcon className="size-5" /></span>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">—</span>
            <span className={ui.label}>Streak unavailable</span>
          </div>
        </div>
      </Card>
    );
  }

  const target = Math.max(goal.targetLessons, 0);
  const pct = target === 0 ? 0 : Math.min(100, Math.round((goal.completedToday / target) * 100));
  const goalMet = target > 0 && goal.completedToday >= target;

  async function save() {
    if (!onUpdateGoal) return;
    setSaving(true);
    setError('');
    try {
      await onUpdateGoal(draft);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update your daily goal.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/40" aria-hidden="true">
            <FlameIcon className="size-5 fill-amber-400" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-2xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">{goal.streakDays}</span>
            <span className={ui.label}>Day streak</span>
          </div>
          <span className={goalMet ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : ui.meta}>
            {goalMet ? 'Goal met today' : `${goal.completedToday}/${target} today`}
          </span>
        </div>

        <div
          className={ui.barTrack}
          role="progressbar"
          aria-label="Daily goal progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={goalMet ? 'h-full rounded-full bg-emerald-500' : ui.barFill} style={{ width: `${pct}%` }} />
        </div>

        {editing ? (
          <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
            <span className={ui.label}>Lessons per day</span>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Decrease daily goal"
                disabled={saving || draft <= DAILY_GOAL_MIN}
                onClick={() => setDraft((d) => Math.max(DAILY_GOAL_MIN, d - 1))}
              >
                −
              </Button>
              <span className="min-w-8 text-center text-lg font-extrabold text-slate-900 dark:text-white" aria-live="polite">{draft}</span>
              <Button
                variant="secondary"
                size="sm"
                aria-label="Increase daily goal"
                disabled={saving || draft >= DAILY_GOAL_MAX}
                onClick={() => setDraft((d) => Math.min(DAILY_GOAL_MAX, d + 1))}
              >
                +
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button size="sm" onClick={save} disabled={saving || draft === goal.targetLessons}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setError('');
                }}
              >
                Cancel
              </Button>
            </div>
            {error && <p className="m-0 text-xs font-semibold text-red-600 dark:text-red-400" role="alert">{error}</p>}
          </div>
        ) : (
          onUpdateGoal && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={ui.label}>Daily goal: {target} lesson{target === 1 ? '' : 's'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(goal.targetLessons || DAILY_GOAL_MIN);
                  setEditing(true);
                }}
              >
                Change
              </Button>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
