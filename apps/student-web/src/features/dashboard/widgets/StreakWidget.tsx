import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { type DailyGoalSummary } from '../dashboardApi';
import { FlameIcon } from '../../../components/common/Icons';
import * as ui from './ui';

interface StreakWidgetProps {
  /** Backend-computed goal + streak (GET /student/engagement/summary). Null when unavailable. */
  goal: DailyGoalSummary | null;
}

// Read-only on purpose: the streak and the daily goal are computed by the backend and the
// student can never change them from the app.
export function StreakWidget({ goal }: StreakWidgetProps) {
  const { t, plural } = useI18n();
  if (!goal) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <span className={ui.iconPill} aria-hidden="true"><FlameIcon className="size-5" /></span>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">—</span>
            <span className={ui.label}>{t('Streak unavailable')}</span>
          </div>
        </div>
      </Card>
    );
  }

  const target = Math.max(goal.targetLessons, 0);
  const pct = target === 0 ? 0 : Math.min(100, Math.round((goal.completedToday / target) * 100));
  const goalMet = target > 0 && goal.completedToday >= target;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/40" aria-hidden="true">
            <FlameIcon className="size-5 fill-amber-400" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-2xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">{goal.streakDays}</span>
            <span className={ui.label}>{t('Day streak')}</span>
          </div>
          <span className={goalMet ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : ui.meta}>
            {goalMet ? t('Goal met today') : t('{done}/{total} today', { done: goal.completedToday, total: target })}
          </span>
        </div>

        <div
          className={ui.barTrack}
          role="progressbar"
          aria-label={t('Daily goal progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={goalMet ? 'h-full rounded-full bg-emerald-500' : ui.barFill} style={{ width: `${pct}%` }} />
        </div>

        <span className={ui.label}>
          {t('Daily goal: {lessons}', {
            lessons: plural(target, {
              one: t('{n} lesson', { n: target }),
              two: t('{n} lessons [two]', { n: target }),
              few: t('{n} lessons [few]', { n: target }),
              other: t('{n} lessons', { n: target }),
            }),
          })}
        </span>
      </div>
    </Card>
  );
}
