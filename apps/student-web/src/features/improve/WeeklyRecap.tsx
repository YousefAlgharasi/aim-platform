import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { fetchEngagementStats, type EngagementStats } from '../dashboard/dashboardApi';
import type { WeaknessRecordEntry } from '../progress/aimApi';
import * as ui from '../progress/ui';

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Pure: numbers for the "your week" card. */
export function weekFacts(stats: EngagementStats | null, records: WeaknessRecordEntry[], now = Date.now()) {
  const days = stats?.weeklyActivity ?? [];
  return {
    xp: days.reduce((n, d) => n + d.xp, 0),
    activeDays: days.filter((d) => d.xp > 0).length,
    delta: stats?.weeklyDeltaPercent ?? null,
    fixed: records.filter((r) => r.resolvedAt && now - new Date(r.resolvedAt).getTime() <= WEEK_MS).length,
  };
}

/** Last 7 days at a glance. Shown in-app; it uses the same numbers a weekly summary message would. */
export function WeeklyRecap({ records }: { records: WeaknessRecordEntry[] }) {
  const { t, formatNumber } = useI18n();
  const [stats, setStats] = useState<EngagementStats | null>(null);
  useEffect(() => { fetchEngagementStats().then(setStats).catch(() => setStats(null)); }, []);
  const f = weekFacts(stats, records);
  const cell = (value: string, label: string) => (
    <div className="flex flex-col gap-0.5"><span className="text-2xl font-extrabold tracking-tight tabular-nums text-ink">{value}</span><span className="text-xs font-semibold text-ink-muted">{label}</span></div>
  );
  return (
    <section className="flex flex-col gap-3" aria-label={t('Your week')}>
      <h2 className={`${ui.sectionTitle} px-1`}>{t('Your week')}</h2>
      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cell(formatNumber(f.xp), t('XP this week'))}
          {cell(`${f.activeDays}/7`, t('Active days'))}
          {cell(String(f.fixed), t('Weak spots fixed'))}
          {cell(f.delta == null ? '—' : `${f.delta > 0 ? '+' : ''}${f.delta}%`, t('vs last week'))}
        </div>
      </Card>
    </section>
  );
}
