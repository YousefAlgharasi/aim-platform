import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../hooks/useAuth';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { FlameIcon } from '../../components/common/Icons';
import { getErrorMessage } from '../../api/client';
import { useLearnerLevel } from '../level/LevelContext';
import {
  fetchContinueLearning,
  fetchCurrentEnrollment,
  fetchDeadlines,
  fetchEngagementStats,
  fetchEngagementSummary,
  fetchLeaderboard,
  fetchQuickStartLesson,
  fetchRecommendedCourse,
  requestStreakFreeze,
  type ContinueLearningLesson,
  type CurrentEnrollment,
  type EngagementStats,
  type EngagementSummary,
  type Leaderboard,
  type QuickStartLesson,
  type RecommendedCourse,
  type StudentDeadlineItem,
  type StudentDeadlines,
} from './dashboardApi';
import {
  ActivityWidget,
  ChallengeWidget,
  CurrentCourseLessons,
  DeadlineWidget,
  LeaderboardWidget,
  RoadmapComplete,
  RoadmapEmpty,
  WordOfDayWidget,
} from './widgets';
import { GoalRing, StatTile, Unavailable } from './parts';
import { useCurrentChapter } from './widgets/CurrentCourseLessons';

interface DashboardData {
  summary: EngagementSummary | null;
  stats: EngagementStats | null;
  continueLesson: ContinueLearningLesson | null;
  quickStart: QuickStartLesson | null;
  recommendedCourse: RecommendedCourse | null;
  enrollment: CurrentEnrollment | null;
  /** Null when the request failed (so the card says "unavailable" instead of a misleading "none"). */
  deadlines: StudentDeadlineItem[] | null;
  /** This week's top 5; null when the request failed (the card is hidden). */
  leaderboard: Leaderboard | null;
}

/** Deadlines worth surfacing on Home: open/late first (soonest due first), then upcoming; capped. */
export function homeDeadlines(d: StudentDeadlines | null): StudentDeadlineItem[] | null {
  if (!d) return null;
  const due = (x: StudentDeadlineItem) => new Date(x.extendedClosesAt ?? x.closesAt).getTime();
  const open = [...(d.late ?? []), ...(d.active ?? [])].sort((a, b) => due(a) - due(b));
  const upcoming = [...(d.upcoming ?? [])].sort((a, b) => new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime());
  return [...open, ...upcoming].slice(0, 4);
}

/** "morning" | "afternoon" | "evening" from the viewer's local hour. */
export function partOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

export function DashboardHome() {
  const { user } = useAuth();
  const { t, plural, formatNumber, formatDate } = useI18n();
  const { hasPlacement, loading: levelLoading } = useLearnerLevel();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState('');
  const [failedSections, setFailedSections] = useState<string[]>([]);
  const [freezing, setFreezing] = useState(false);
  const [freezeError, setFreezeError] = useState('');

  async function applyFreeze() {
    setFreezing(true);
    setFreezeError('');
    try {
      const summary = await requestStreakFreeze();
      setData((d) => (d ? { ...d, summary } : d));
    } catch (e) {
      setFreezeError(getErrorMessage(e, t('Could not use a streak freeze.')));
    } finally {
      setFreezing(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setFatalError('');
    setFailedSections([]);

    // Every section is independent: one failing must not take down the page.
    const results = await Promise.allSettled([
      fetchEngagementSummary(),
      fetchEngagementStats(),
      fetchContinueLearning(),
      fetchQuickStartLesson(),
      fetchRecommendedCourse(),
      fetchCurrentEnrollment(),
      fetchDeadlines(),
      fetchLeaderboard('week', 5),
    ] as const);

    const labels = ['daily goal', 'stats', 'continue learning', 'quick start', 'recommended course', 'enrollment', 'deadlines', 'leaderboard'];
    const failed = results.map((r, i) => (r.status === 'rejected' ? labels[i] : null)).filter((x): x is string => x !== null);

    if (failed.length === results.length) {
      const first = results[0];
      setFatalError(getErrorMessage(first.status === 'rejected' ? first.reason : null, t('Could not load your dashboard.')));
      setData(null);
      setLoading(false);
      return;
    }

    const val = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null);
    const [summary, stats, cont, quick, course, enrollment, deadlines, board] = results;

    setData({
      summary: val(summary),
      stats: val(stats),
      continueLesson: val(cont),
      quickStart: val(quick),
      recommendedCourse: val(course),
      enrollment: val(enrollment),
      deadlines: deadlines.status === 'fulfilled' ? homeDeadlines(deadlines.value) ?? [] : null,
      leaderboard: val(board),
    });
    setFailedSections(failed);
    setLoading(false);
  }, [t]);

  useEffect(() => { load(); }, [load]);

  // The student's own course drives "what's next", so the panel and the lessons card always agree.
  const activeCourseId = data?.enrollment?.found ? data.enrollment.courseId : null;
  const current = useCurrentChapter(activeCourseId);

  const stats = data?.stats ?? null;
  const goal = data?.summary?.goal ?? null;
  const freeze = data?.summary?.streakFreeze;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName
    ? t(`Good ${partOfDay(new Date().getHours())}, {name}`, { name: firstName })
    : t(`Good ${partOfDay(new Date().getHours())}`);

  // The roadmap loads after the rest, so keep the one page skeleton up until it is ready (no second loading box).
  const roadmapPending = !!activeCourseId && (current.state === 'idle' || current.state === 'loading');

  const courseTitle = (data?.enrollment?.found ? data.enrollment.courseTitle : null) ?? data?.recommendedCourse?.courseTitle ?? null;
  const courseId = (data?.enrollment?.found ? data.enrollment.courseId : null) ?? data?.recommendedCourse?.courseId ?? null;
  // Older backends send one challenge; newer ones send today's three.
  const dailyChallenges = data?.summary?.challenges ?? (data?.summary?.challenge ? [data.summary.challenge] : []);

  const goalTarget = goal ? Math.max(goal.targetLessons, 1) : 1;
  const goalMet = !!goal && goal.completedToday >= goalTarget;

  return (
    <div className="stagger flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.75rem]">{greeting}</h1>
        <p className="m-0 text-base text-ink-muted">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {loading || (!fatalError && roadmapPending) ? (
        <DashboardSkeleton />
      ) : fatalError ? (
        <ErrorState message={fatalError} onRetry={load} />
      ) : data ? (
        <>
          {failedSections.length > 0 && (
            <Banner variant="warning">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{t("Some sections couldn't be loaded ({sections}).", { sections: failedSections.map((s) => t(s)).join(', ') })}</span>
                <Button size="sm" variant="secondary" onClick={load}>{t('Retry')}</Button>
              </div>
            </Banner>
          )}

          {freeze?.atRisk && (
            <Banner variant="warning">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  {freeze.canUseNow
                    ? t('You missed yesterday. Use a streak freeze to keep your streak. {n} left this month.', { n: freeze.remaining })
                    : t('You missed yesterday and have no streak freezes left this month. A new month brings {n} more.', { n: freeze.allowance })}
                </span>
                {freeze.canUseNow && <Button size="sm" onClick={applyFreeze} disabled={freezing}>{freezing ? t('Saving…') : t('Use streak freeze')}</Button>}
              </div>
              {freezeError && <p className="m-0 mt-2 font-bold">{freezeError}</p>}
            </Banner>
          )}

          {!hasPlacement && !levelLoading && (
            <Banner variant="info">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{t('Find your level so lessons, courses and practice match you.')}</span>
                <Link to="/placement" className="text-sm font-bold text-brand-ink">{t('Take the placement test')}</Link>
              </div>
            </Banner>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="contents lg:col-span-7 lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
              {activeCourseId && current.state === 'ready' && current.chapter ? (
                <CurrentCourseLessons courseId={activeCourseId} courseTitle={data.enrollment?.courseTitle ?? null} data={current.chapter} />
              ) : activeCourseId && current.state === 'finished' && current.finished ? (
                <RoadmapComplete finished={current.finished} />
              ) : (
                <RoadmapEmpty courseId={courseId} courseTitle={courseTitle} unavailable={!!activeCourseId} />
              )}
            <section aria-label={t('Your stats')} className="grid grid-cols-2 gap-5">
              {stats ? (
                <>
                  <StatTile
                    label={t('XP level')}
                    value={String(stats.level)}
                    hint={stats.nextLevel != null && stats.nextLevelMinXp != null
                      ? t('{xp} XP to level {level}', { xp: Math.max(0, stats.nextLevelMinXp - stats.totalXp), level: stats.nextLevel })
                      : t('Highest level reached')}
                    bar={stats.levelProgressPercent}
                  />
                  <StatTile label={t('Total XP')} value={formatNumber(stats.totalXp)} hint={stats.xpToday > 0 ? t('+{n} today', { n: stats.xpToday }) : undefined} hintTone="text-success-ink" />
                  <StatTile label={t('Badges')} value={String(stats.badgeCount)} to="/achievements" hint={t('View all')} />
                  <StatTile label={t('Rank')} value={stats.totalXp > 0 ? t('Top {pct}%', { pct: stats.rankPercentile }) : '—'} hint={stats.totalXp > 0 ? undefined : t('Earn XP to get ranked')} />
                </>
              ) : (
                <div className="col-span-2"><Unavailable label={t('stats')} onRetry={load} /></div>
              )}
            </section>
              {data.leaderboard && <LeaderboardWidget week={data.leaderboard} className="lg:flex-1" />}
            </div>
            <aside className="contents lg:col-span-5 lg:flex lg:min-w-0 lg:flex-col lg:gap-5" aria-label={t('Today')}>
              {/* First card on phones; on desktop it keeps its place at the top of the right column. */}
              <div className="order-first lg:order-none"><WordOfDayWidget /></div>
            <section aria-label={t('Today')} className="flex flex-col items-center gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
              {goal ? (
                <>
                  <GoalRing done={goal.completedToday} target={goalTarget} met={goalMet} label={t('Daily goal progress')} />
                  <div className="text-center">
                    <p className="m-0 text-lg font-semibold text-ink">{goalMet ? t('Goal met today') : t('{done}/{total} today', { done: goal.completedToday, total: goalTarget })}</p>
                    <p className="m-0 mt-0.5 text-sm text-ink-muted">
                      {t('Daily goal: {lessons}', {
                        lessons: plural(goalTarget, {
                          one: t('{n} lesson', { n: goalTarget }),
                          two: t('{n} lessons [two]', { n: goalTarget }),
                          few: t('{n} lessons [few]', { n: goalTarget }),
                          other: t('{n} lessons', { n: goalTarget }),
                        }),
                      })}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <FlameIcon className="size-5 text-ink" />
                      {plural(goal.streakDays, {
                        one: t('{n} Day', { n: goal.streakDays }),
                        two: t('{n} Days [two]', { n: goal.streakDays }),
                        few: t('{n} Days [few]', { n: goal.streakDays }),
                        other: t('{n} Days', { n: goal.streakDays }),
                      })}
                    </span>
                    {freeze && <span className="text-sm text-ink-muted" title={t('Streak freezes left this month')}>❄ {t('{n} freezes left', { n: freeze.remaining })}</span>}
                  </div>
                </>
              ) : (
                <Unavailable label={t('daily goal')} onRetry={load} />
              )}
            </section>
              <ChallengeWidget challenges={dailyChallenges} courseId={courseId} />
              <ActivityWidget days={stats?.weeklyActivity ?? []} weeklyDeltaPercent={stats?.weeklyDeltaPercent} unavailable={!stats} />
              <DeadlineWidget deadlines={data.deadlines} className="lg:flex-1" />
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
