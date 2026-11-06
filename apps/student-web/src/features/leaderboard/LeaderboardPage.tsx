import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { fetchLeaderboard, type Leaderboard, type LeaderboardPeriod } from '../dashboard/dashboardApi';
import { PeriodTabs } from './PeriodTabs';
import { LeaderboardList, emptyBoardText } from './LeaderboardList';

const FULL_LIST = 50;

/** The full leaderboard: top 50 by XP, this week or all time, with the student's own place. */
export function LeaderboardPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchLeaderboard(period, FULL_LIST)
      .then((b) => { if (!cancelled) setBoard(b); })
      .catch((e) => { if (!cancelled) setError(getErrorMessage(e, t('Could not load the leaderboard.'))); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, t]);
  useEffect(() => load(), [load]);

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageTitleBar title={t('Leaderboard')} fallback="/" action={<PeriodTabs value={period} onChange={setPeriod} />} />
      {loading ? (
        <ListSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : board ? (
        <section className="rounded-2xl bg-surface p-3 ring-1 ring-line sm:p-4">
          <LeaderboardList board={board} emptyText={emptyBoardText(period, t)} />
        </section>
      ) : null}
    </div>
  );
}
