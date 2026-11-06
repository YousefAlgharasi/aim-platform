import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { fetchLeaderboard, type Leaderboard, type LeaderboardPeriod } from '../dashboardApi';
import { PeriodTabs } from '../../leaderboard/PeriodTabs';
import { LeaderboardList, emptyBoardText } from '../../leaderboard/LeaderboardList';
import * as ui from './ui';

/** The top 5 by XP. Starts on this week (loaded with the dashboard); "All time" is fetched when picked. */
export function LeaderboardWidget({ week, className = '' }: { week: Leaderboard | null; className?: string }) {
  const { t } = useI18n();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [boards, setBoards] = useState<Partial<Record<LeaderboardPeriod, Leaderboard>>>(week ? { week } : {});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // The dashboard reloads (for example after "Retry"): start again from the fresh week board instead of showing old data.
  useEffect(() => {
    setPeriod('week');
    setBoards(week ? { week } : {});
    setFailed(false);
  }, [week]);

  async function pick(next: LeaderboardPeriod) {
    setPeriod(next);
    setFailed(false);
    if (boards[next]) return;
    setLoading(true);
    try {
      const board = await fetchLeaderboard(next, 5);
      setBoards((b) => ({ ...b, [next]: board }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const board = boards[period];
  return (
    <section aria-label={t('Top learners')} className={`${ui.panel} flex flex-col ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={ui.cardTitle}>{t('Top learners')}</h3>
        <PeriodTabs value={period} onChange={(p) => void pick(p)} />
      </div>
      <div className="my-3" aria-busy={loading}>
        {board ? (
          <LeaderboardList board={board} emptyText={emptyBoardText(period, t)} />
        ) : (
          <p className="m-0 py-4 text-sm text-ink-muted" role={failed ? 'alert' : 'status'}>
            {failed ? t('Could not load {what}.', { what: t('the leaderboard') }) : t('Loading')}
          </p>
        )}
      </div>
      <div className="mt-auto flex justify-end border-t border-line pt-3">
        <Link to="/leaderboard" className={ui.link}>{t('View all')}</Link>
      </div>
    </section>
  );
}
