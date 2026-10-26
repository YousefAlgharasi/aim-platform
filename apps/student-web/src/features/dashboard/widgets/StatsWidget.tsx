import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import type { EngagementStats } from '../dashboardApi';
import * as ui from './ui';

interface StatsWidgetProps {
  stats: EngagementStats | null;
}

const cell = 'flex flex-1 flex-col items-center gap-0.5 rounded-xl p-2 text-center no-underline';
const value = 'text-xl font-extrabold tracking-tight text-slate-900 dark:text-white';

/** XP, badges and rank from GET /student/engagement/stats (all backend-computed). */
export function StatsWidget({ stats }: StatsWidgetProps) {
  const { t, formatNumber } = useI18n();
  return (
    <Card>
      <div className="flex items-stretch gap-1 divide-x divide-slate-100 dark:divide-slate-700 rtl:divide-x-reverse">
        <div className={cell}>
          <span className={value}>{stats ? formatNumber(stats.totalXp) : '—'}</span>
          <span className={ui.label}>{t('Total XP')}</span>
          {stats && stats.xpToday > 0 && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t('+{n} today', { n: stats.xpToday })}</span>
          )}
        </div>
        <Link to="/achievements" className={`${cell} transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/40`}>
          <span className={value}>{stats ? stats.badgeCount : '—'}</span>
          <span className={ui.label}>{t('Badges')}</span>
        </Link>
        <div className={cell}>
          <span className={value}>{stats ? t('Top {pct}%', { pct: stats.rankPercentile }) : '—'}</span>
          <span className={ui.label}>{t('Rank')}</span>
        </div>
      </div>
    </Card>
  );
}
