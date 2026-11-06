import { useI18n } from '../../i18n/I18nContext';
import type { Leaderboard, LeaderboardEntry } from '../dashboard/dashboardApi';

function Row({ entry }: { entry: LeaderboardEntry }) {
  const { t, formatNumber } = useI18n();
  const initial = Array.from(entry.name.trim())[0] ?? '?';
  return (
    <li
      aria-current={entry.isYou ? 'true' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${entry.isYou ? 'bg-brand-soft' : ''}`}
    >
      <span className={`lp-num w-7 shrink-0 text-center text-base ${entry.rank <= 3 ? 'font-bold text-ink' : 'font-medium text-ink-muted'}`}>{formatNumber(entry.rank)}</span>
      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${entry.isYou ? 'bg-brand text-white' : 'bg-surface-strong text-ink-soft'}`}>{initial}</span>
      <span className="min-w-0 flex-1 truncate text-base font-semibold text-ink [unicode-bidi:plaintext]">
        {entry.name}
        {entry.isYou && <span className="ms-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{t('You')}</span>}
      </span>
      <span className="lp-num shrink-0 text-sm font-semibold text-ink">{t('{xp} XP', { xp: formatNumber(entry.xp) })}</span>
    </li>
  );
}

/**
 * The ranked students. When the caller is ranked below the list, their own place follows under a divider so they
 * always see where they stand.
 */
export function LeaderboardList({ board, emptyText }: { board: Leaderboard; emptyText: string }) {
  const { t } = useI18n();
  if (board.entries.length === 0) return <p className="m-0 py-4 text-sm leading-relaxed text-ink-muted">{emptyText}</p>;
  const outside = board.you && !board.entries.some((e) => e.isYou) ? board.you : null;
  return (
    <ol className="m-0 flex list-none flex-col gap-0.5 p-0" aria-label={t('Top learners')}>
      {board.entries.map((e) => <Row key={`${e.rank}-${e.name}`} entry={e} />)}
      {outside && (
        <>
          <li aria-hidden="true" className="px-3 py-1 text-center text-ink-muted">···</li>
          <Row entry={outside} />
        </>
      )}
    </ol>
  );
}

/** What to say when nobody is ranked yet (or the caller is not, below a populated board). */
export function emptyBoardText(period: 'week' | 'all', t: (s: string) => string): string {
  return period === 'week'
    ? t('No one has earned XP this week yet. Finish a lesson to take the first spot.')
    : t('No one has earned XP yet. Finish a lesson to take the first spot.');
}
