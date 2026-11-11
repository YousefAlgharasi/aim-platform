import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover } from '../components/common/Popover';
import { CheckIcon, FlameIcon } from '../components/common/Icons';
import { fetchEngagementStats, type EngagementSummary } from '../features/dashboard/dashboardApi';
import { getLocale, plural } from '../i18n';
import { useI18n } from '../i18n/I18nContext';
import { StreakFlame } from './StreakCelebration';
import { streakDay } from './streak';

export type WeekDayState = 'active' | 'frozen' | 'missed' | 'today' | 'future';
export interface WeekDay { date: string; state: WeekDayState }

/** Pure: the 7 days to draw. Uses the backend's own streak days when present; `today` is the UTC day. */
export function weekFromSummary(summary: EngagementSummary | null, today: string = streakDay()): WeekDay[] | null {
  const days = summary?.recentDays;
  if (!days || days.length === 0) return null;
  return days.map((d) => ({
    date: d.date,
    state: d.status === 'active' ? 'active' : d.status === 'frozen' ? 'frozen' : d.date === today ? 'today' : 'missed',
  }));
}

/** Pure fallback for older backends: this week's XP days (Monday to Sunday, UTC). A day with XP is a day learned. */
export function weekFromActivity(activity: ReadonlyArray<{ date: string; xp: number }>, today: string = streakDay()): WeekDay[] {
  return activity.map((d) => ({
    date: d.date,
    state: d.xp > 0 ? 'active' : d.date === today ? 'today' : d.date > today ? 'future' : 'missed',
  }));
}

const DOT: Record<WeekDayState, string> = {
  active: 'bg-success text-white',
  frozen: 'bg-info-soft text-info-ink ring-1 ring-info-line',
  missed: 'ring-1 ring-line-strong',
  today: 'ring-2 ring-dashed ring-brand',
  future: 'ring-1 ring-line opacity-50',
};
const STATE_TEXT: Record<WeekDayState, string> = {
  active: 'Learned',
  frozen: 'Streak freeze used',
  missed: 'No activity',
  today: 'Today, not done yet',
  future: 'Not here yet',
};

function WeekStrip({ days }: { days: WeekDay[] }) {
  const { t } = useI18n();
  const locale = getLocale() === 'ar' ? 'ar' : 'en-US';
  const today = streakDay();
  // Arabic has no short weekday names, so the column heads use the single-letter form there.
  const name = (date: string, weekday: 'short' | 'long') =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString(locale, { weekday: weekday === 'short' && locale === 'ar' ? 'narrow' : weekday, timeZone: 'UTC' });
  return (
    <ol className="ix-week m-0 grid list-none grid-cols-7 gap-1.5 p-0">
      {days.map((d) => (
        <li key={d.date} className="flex flex-col items-center gap-1.5" aria-label={`${name(d.date, 'long')}: ${t(STATE_TEXT[d.state])}`}>
          <span aria-hidden="true" className={`text-[11px] font-semibold ${d.date === today ? 'text-ink' : 'text-ink-muted'}`}>{name(d.date, 'short')}</span>
          <span aria-hidden="true" className={`grid size-9 place-items-center rounded-full ${d.state === 'today' ? 'border-2 border-dashed border-brand' : DOT[d.state]}`}>
            {d.state === 'active' && <CheckIcon className="size-4 text-white" />}
            {d.state === 'frozen' && <span className="text-sm leading-none">❄</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** What the popover shows: the week strip, a one-line summary, and a nudge when today is still open. */
function WeekPanel({ summary }: { summary: EngagementSummary | null }) {
  const { t, formatNumber } = useI18n();
  const fromSummary = weekFromSummary(summary);
  const [fallback, setFallback] = useState<WeekDay[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (fromSummary) return undefined;
    let cancelled = false;
    fetchEngagementStats()
      .then((s) => { if (!cancelled) setFallback(weekFromActivity(s?.weeklyActivity ?? [])); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [fromSummary === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = fromSummary ?? fallback;
  const streak = summary?.goal.streakDays ?? 0;
  const learned = days?.filter((d) => d.state === 'active').length ?? 0;
  const todayOpen = days?.some((d) => d.state === 'today') ?? false;

  return (
    <div className="flex w-[19rem] max-w-full flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <StreakFlame className="size-9" live={streak > 0} />
        <div className="min-w-0">
          <p className="lp-num m-0 text-lg font-bold leading-tight text-ink">
            {streak < 1 ? t('No streak yet') : plural(streak, {
              one: t('1-day streak'),
              two: t('2-day streak'),
              few: t('{n}-day streak [few]', { n: formatNumber(streak) }),
              other: t('{n}-day streak', { n: formatNumber(streak) }),
            })}
          </p>
          {days && (
            <p className="m-0 text-xs text-ink-muted">
              {fromSummary
                ? t('You learned on {n} of the last 7 days.', { n: formatNumber(learned) })
                : t('Days learned this week: {n}', { n: formatNumber(learned) })}
            </p>
          )}
        </div>
      </div>

      {days && days.length > 0 && <WeekStrip days={days} />}
      {!days && !failed && <div className="h-16 animate-pulse rounded-xl bg-surface-strong motion-reduce:animate-none" role="status" aria-label={t('Loading…')} />}
      {failed && <p className="m-0 text-sm text-ink-muted">{t('Could not load your week right now.')}</p>}

      {todayOpen && (
        <p className="m-0 text-sm text-ink-soft">
          {streak > 0 ? t('Finish a lesson or a practice today to keep your streak.') : t('Finish a lesson or a practice today to start a streak.')}{' '}
          <Link to="/curriculum" className="font-semibold text-brand-ink underline underline-offset-4">{t('Go to lessons')}</Link>
        </p>
      )}
      <p className="m-0 text-[11px] text-ink-muted">{t('Days change at midnight UTC.')}</p>
    </div>
  );
}

/**
 * The top-bar streak: a flame and the day count. The flame is lit and gently moving while the streak is above 0,
 * and livelier on hover/focus. Pressing it opens the learner's week.
 */
export function StreakBadge({ summary }: { summary: EngagementSummary | null }) {
  const { t, formatNumber } = useI18n();
  const days = summary?.goal?.streakDays ?? null;
  const prev = useRef<number | null>(null);
  const [bump, setBump] = useState(0);

  // Animate the number once when it goes up while the page is open.
  useEffect(() => {
    if (days != null && prev.current != null && days > prev.current) setBump((n) => n + 1);
    prev.current = days;
  }, [days]);

  if (days == null) return null;
  const label = `${formatNumber(days)} ${t('Day streak')}. ${t('Show your week')}`;
  return (
    <Popover
      title={t('Your streak')}
      renderTrigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={label}
          title={t('Day streak')}
          className="ix-streak inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-2.5 text-sm font-semibold text-ink transition-colors lp-num hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {days > 0 ? <StreakFlame className="size-5" live /> : <FlameIcon className="ix-unlit size-[18px] text-ink-muted" />}
          <span aria-hidden="true" key={bump} className={bump > 0 ? 'ix-bump inline-block' : 'inline-block'}>{formatNumber(days)}</span>
        </button>
      )}
    >
      <WeekPanel summary={summary} />
    </Popover>
  );
}
