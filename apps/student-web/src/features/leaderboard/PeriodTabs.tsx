import { useI18n } from '../../i18n/I18nContext';
import type { LeaderboardPeriod } from '../dashboard/dashboardApi';

/** "This week | All time" switch, small enough for a dashboard card and reused on the full page. */
export function PeriodTabs({ value, onChange }: { value: LeaderboardPeriod; onChange: (p: LeaderboardPeriod) => void }) {
  const { t } = useI18n();
  const options: Array<{ key: LeaderboardPeriod; label: string }> = [
    { key: 'week', label: t('This week') },
    { key: 'all', label: t('All time') },
  ];
  return (
    <div role="tablist" aria-label={t('Leaderboard period')} className="inline-flex shrink-0 gap-1 rounded-full bg-surface-muted p-1">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={`h-8 cursor-pointer rounded-full border-0 px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              active ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'bg-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
