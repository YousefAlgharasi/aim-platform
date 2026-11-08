import { formatDate as formatLocaleDate } from '../../../i18n';
import { useI18n } from '../../../i18n/I18nContext';
import { EmptyState } from '../../../components/common/EmptyState';
import type { WeeklyActivityDay } from '../dashboardApi';
import * as ui from './ui';

interface ActivityWidgetProps {
  /** Mon–Sun of the current UTC week, from GET /student/engagement/stats. */
  days: WeeklyActivityDay[];
  weeklyDeltaPercent?: number | null;
  /** The stats request failed: say so instead of showing an empty week. */
  unavailable?: boolean;
}

function dayLabel(date: string): string {
  // date is yyyy-mm-dd (UTC); render the weekday without shifting time zones.
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? date
    : formatLocaleDate(d, { weekday: 'short', timeZone: 'UTC' });
}

export function ActivityWidget({ days, weeklyDeltaPercent, unavailable = false }: ActivityWidgetProps) {
  const { t } = useI18n();
  if (unavailable) {
    return <section className={ui.panel}><p className="m-0 text-sm text-ink-muted">{t('Could not load {what}.', { what: t('this week') })}</p></section>;
  }
  const total = days.reduce((sum, d) => sum + d.xp, 0);

  if (days.length === 0 || total === 0) {
    return (
      <section className={ui.panel}>
        <EmptyState title={t('No activity this week')} message={t('Complete a lesson to earn XP and fill your week.')} />
      </section>
    );
  }

  const max = Math.max(...days.map((d) => d.xp), 1);
  // The API's week is UTC, so "today" is compared in UTC too.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className={ui.panel}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('This week')}</h3>
          <span className="lp-num text-sm text-ink-muted">
            <span className="font-semibold text-ink">{t('{n} XP', { n: total })}</span>
            {weeklyDeltaPercent != null && (
              <span className={weeklyDeltaPercent >= 0 ? 'text-success-ink' : 'text-danger-ink'}>
                {'  '}{t('{pct}% vs last week', { pct: `${weeklyDeltaPercent >= 0 ? '+' : ''}${weeklyDeltaPercent}` })}
              </span>
            )}
          </span>
        </div>
        <ul className="m-0 flex h-36 list-none items-end gap-2 p-0" aria-label={t('XP earned per day this week')}>
          {days.map((d) => {
            const isToday = d.date === today;
            const h = d.xp > 0 ? Math.max(8, Math.round((d.xp / max) * 100)) : 0;
            return (
              <li key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="lp-num h-4 text-xs font-medium text-ink-muted">{d.xp > 0 ? d.xp : ''}</span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div className="flex h-full w-6 max-w-full items-end overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className={`w-full rounded-full transition-all duration-300 ${isToday ? 'bg-brand' : 'bg-brand/50'}`}
                      style={{ height: `${h}%` }}
                      role="img"
                      aria-label={t('{day}: {n} XP', { day: dayLabel(d.date), n: d.xp })}
                    />
                  </div>
                </div>
                <span className={`text-xs ${isToday ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}>{dayLabel(d.date)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
