import { formatDate as formatLocaleDate } from '../../../i18n';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type { WeeklyActivityDay } from '../dashboardApi';
import * as ui from './ui';

interface ActivityWidgetProps {
  /** Mon–Sun of the current UTC week, from GET /student/engagement/stats. */
  days: WeeklyActivityDay[];
  weeklyDeltaPercent?: number | null;
}

function dayLabel(date: string): string {
  // date is yyyy-mm-dd (UTC); render the weekday without shifting time zones.
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? date
    : formatLocaleDate(d, { weekday: 'short', timeZone: 'UTC' });
}

export function ActivityWidget({ days, weeklyDeltaPercent }: ActivityWidgetProps) {
  const { t } = useI18n();
  const total = days.reduce((sum, d) => sum + d.xp, 0);

  if (days.length === 0 || total === 0) {
    return (
      <Card>
        <EmptyState title={t('No activity this week')} message={t('Complete a lesson to earn XP and fill your week.')} />
      </Card>
    );
  }

  const max = Math.max(...days.map((d) => d.xp), 1);

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('This week')}</h3>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400">
            {t('{n} XP', { n: total })}
            {weeklyDeltaPercent != null &&
              ` · ${t('{pct}% vs last week', { pct: `${weeklyDeltaPercent >= 0 ? '+' : ''}${weeklyDeltaPercent}` })}`}
          </span>
        </div>
        <ul className="m-0 flex h-36 list-none items-end gap-2 p-0" aria-label={t('XP earned per day this week')}>
          {days.map((d) => (
            <li key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="h-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">{d.xp > 0 ? d.xp : ''}</span>
              <div className="flex w-full flex-1 items-end overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-300"
                  style={{ height: `${Math.round((d.xp / max) * 100)}%` }}
                  role="img"
                  aria-label={t('{day}: {n} XP', { day: dayLabel(d.date), n: d.xp })}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{dayLabel(d.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
