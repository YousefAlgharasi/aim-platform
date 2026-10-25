import { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { getErrorMessage } from '../../../api/client';
import { DAILY_GOAL_MAX, DAILY_GOAL_MIN, type DailyGoalSummary } from '../dashboardApi';
import styles from './Widgets.module.css';

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
        <div className={styles.widget}>
          <span className={styles.widgetIcon} aria-hidden="true">🔥</span>
          <div className={styles.widgetContent}>
            <span className={styles.widgetValue}>—</span>
            <span className={styles.widgetLabel}>Streak unavailable</span>
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
      <div className={styles.listWidget}>
        <div className={styles.widget}>
          <span className={styles.widgetIcon} aria-hidden="true">🔥</span>
          <div className={styles.widgetContent}>
            <span className={styles.widgetValue}>{goal.streakDays}</span>
            <span className={styles.widgetLabel}>Day streak</span>
          </div>
          <span className={styles.widgetMeta}>
            {goalMet ? 'Goal met today' : `${goal.completedToday}/${target} today`}
          </span>
        </div>

        <div
          className={styles.bar}
          role="progressbar"
          aria-label="Daily goal progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>

        {editing ? (
          <div className={styles.goalEditor}>
            <span className={styles.widgetLabel}>Lessons per day</span>
            <div className={styles.stepper}>
              <Button
                variant="secondary"
                size="sm"
                aria-label="Decrease daily goal"
                disabled={saving || draft <= DAILY_GOAL_MIN}
                onClick={() => setDraft((d) => Math.max(DAILY_GOAL_MIN, d - 1))}
              >
                −
              </Button>
              <span className={styles.stepperValue} aria-live="polite">{draft}</span>
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
            <div className={styles.actionsRow}>
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
            {error && <p className={styles.errorText} role="alert">{error}</p>}
          </div>
        ) : (
          onUpdateGoal && (
            <div className={styles.actionsRow}>
              <span className={styles.widgetLabel}>Daily goal: {target} lesson{target === 1 ? '' : 's'}</span>
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
