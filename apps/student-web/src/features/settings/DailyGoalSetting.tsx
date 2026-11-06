import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { fetchEngagementSummary } from '../dashboard/dashboardApi';
import { studyPlanApi } from '../learner/learnerApi';

const CHOICES = [1, 2, 3, 4, 5];

/** How many lessons the student wants to finish each day. Starts at 1; saved as soon as a number is picked. */
export function DailyGoalSetting() {
  const { t } = useI18n();
  const [goal, setGoal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEngagementSummary()
      .then((s) => { if (!cancelled && s?.goal?.targetLessons) setGoal(s.goal.targetLessons); })
      .catch(() => undefined); // keep the default of 1
    return () => { cancelled = true; };
  }, []);

  async function choose(n: number) {
    if (n === goal || saving) return;
    const previous = goal;
    setGoal(n);
    setSaving(true);
    setStatus(null);
    try {
      await studyPlanApi.setDailyGoal(n);
      setStatus({ variant: 'success', message: t('Daily goal saved.') });
    } catch (e) {
      setGoal(previous);
      setStatus({ variant: 'error', message: getErrorMessage(e, t('Could not save your daily goal.')) });
    } finally {
      setSaving(false);
    }
  }

  // A goal set elsewhere (for example 8) still shows as the selected choice.
  const choices = CHOICES.includes(goal) ? CHOICES : [...CHOICES, goal].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-base font-semibold text-ink">{t('Daily goal')}</h2>
        <p className="m-0 text-sm text-ink-muted">{t('How many lessons do you want to finish each day? Your daily ring and challenge follow this.')}</p>
      </div>
      {status && <Banner variant={status.variant}>{status.message}</Banner>}
      <div role="radiogroup" aria-label={t('Lessons per day')} className="flex flex-wrap gap-2">
        {choices.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={goal === n}
            disabled={saving}
            onClick={() => void choose(n)}
            className={`lp-num h-11 min-w-11 cursor-pointer rounded-full border-0 px-4 text-base font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-wait ${
              goal === n ? 'bg-brand text-white ring-brand' : 'bg-transparent text-ink-soft ring-line-strong hover:bg-surface-muted hover:text-ink'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="self-center text-sm text-ink-muted">{t('Lessons per day')}</span>
      </div>
    </div>
  );
}
