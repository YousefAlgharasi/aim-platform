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
import { fetchAimResults } from '../progress/aimApi';
import { buildWeakSpots, type WeakSpot } from '../improve/ImprovePage';
import { useLearnerLevel } from '../level/LevelContext';
import {
  fetchContinueLearning,
  fetchCurrentEnrollment,
  fetchDeadlines,
  fetchEngagementStats,
  fetchEngagementSummary,
  fetchQuickStartLesson,
  fetchRecommendedCourse,
  requestStreakFreeze,
  type ContinueLearningLesson,
  type CurrentEnrollment,
  type EngagementStats,
  type EngagementSummary,
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
  ImproveWidget,
  RoadmapEmpty,
} from './widgets';
import { GoalRing, StatTile, Unavailable } from './parts';
import { nextLesson, useCurrentChapter } from './widgets/CurrentCourseLessons';

interface DashboardData {
  summary: EngagementSummary | null;
  stats: EngagementStats | null;
  continueLesson: ContinueLearningLesson | null;
  quickStart: QuickStartLesson | null;
  recommendedCourse: RecommendedCourse | null;
  enrollment: CurrentEnrollment | null;
  /** Null when the request failed (so the card says "unavailable" instead of a misleading "none"). */
  deadlines: StudentDeadlineItem[] | null;
  weakSpots: WeakSpot[] | null;
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
  const studentId = user?.id;
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
      studentId ? fetchAimResults(studentId).then(buildWeakSpots) : Promise.resolve<WeakSpot[]>([]),
    ] as const);

    const labels = ['daily goal', 'stats', 'continue learning', 'quick start', 'recommended course', 'enrollment', 'deadlines', 'weak spots'];
    const failed = results.map((r, i) => (r.status === 'rejected' ? labels[i] : null)).filter((x): x is string => x !== null);

    if (failed.length === results.length) {
      const first = results[0];
      setFatalError(getErrorMessage(first.status === 'rejected' ? first.reason : null, t('Could not load your dashboard.')));
      setData(null);
      setLoading(false);
      return;
    }

    const val = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null);
    const [summary, stats, cont, quick, course, enrollment, deadlines, weak] = results;

    setData({
      summary: val(summary),
      stats: val(stats),
      continueLesson: val(cont),
      quickStart: val(quick),
      recommendedCourse: val(course),
      enrollment: val(enrollment),
      deadlines: deadlines.status === 'fulfilled' ? homeDeadlines(deadlines.value) ?? [] : null,
      weakSpots: weak.status === 'fulfilled' ? weak.value : null,
    });
    setFailedSections(failed);
    setLoading(false);
  }, [studentId, t]);

  useEffect(() => { load(); }, [load]);

  // The student's own course drives "what's next", so the panel and the lessons card always agree.
  const activeCourseId = data?.enrollment?.found ? data.enrollment.courseId : null;
  const current = useCurrentChapter(activeCourseId);
  const courseNext = current.chapter ? nextLesson(current.chapter.lessons) : null;

  const stats = data?.stats ?? null;
  const goal = data?.summary?.goal ?? null;
  const freeze = data?.summary?.streakFreeze;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName
    ? t(`Good ${partOfDay(new Date().getHours())}, {name}`, { name: firstName })
    : t(`Good ${partOfDay(new Date().getHours())}`);

  const courseTitle = (data?.enrollment?.found ? data.enrollment.courseTitle : null) ?? data?.recommendedCourse?.courseTitle ?? null;
  const courseId = (data?.enrollment?.found ? data.enrollment.courseId : null) ?? data?.recommendedCourse?.courseId ?? null;
  const next: { eyebrow: string; title: string; to: string; cta: string; percent: number | null } | null = data?.continueLesson?.lessonId
    ? { eyebrow: t('Continue learning'), title: data.continueLesson.lessonTitle, to: `/lessons/${data.continueLesson.lessonId}`, cta: t('Resume lesson'), percent: Number.isFinite(data.continueLesson.percent) ? Math.min(100, Math.max(0, Math.round(data.continueLesson.percent))) : null }
    : courseNext
      ? { eyebrow: t('Next in your course'), title: courseNext.title, to: `/lessons/${courseNext.id}`, cta: t('Start lesson'), percent: null }
      : data?.quickStart?.lessonId
        ? { eyebrow: t('Start here'), title: data.quickStart.lessonTitle, to: `/lessons/${data.quickStart.lessonId}`, cta: t('Start lesson'), percent: null }
        : courseId && courseTitle
          ? { eyebrow: t('Your course'), title: courseTitle, to: `/curriculum/${courseId}`, cta: t('Open course'), percent: null }
          : null;

  const goalTarget = goal ? Math.max(goal.targetLessons, 1) : 1;
  const goalMet = !!goal && goal.completedToday >= goalTarget;

  return (
    <div className="stagger flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.75rem]">{greeting}</h1>
        <p className="m-0 text-base text-ink-muted">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {loading ? (
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
            <section aria-label={t('Continue learning')} className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white dark:bg-white dark:text-ink-inverse sm:p-8 lg:col-span-8">
              <div className="flex h-full flex-col justify-between gap-8">
                {next ? (
                  <>
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-medium text-white dark:text-ink-inverse/70">{next.eyebrow}</p>
                      <p className="lp-display m-0 mt-2 text-[2rem] font-semibold [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-[2.75rem]">{next.title}</p>
                      {courseTitle && next.title !== courseTitle && <p className="m-0 mt-2 text-base text-white dark:text-ink-inverse/70 [unicode-bidi:plaintext]">{courseTitle}</p>}
                    </div>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                      {next.percent !== null ? (
                        <div className="flex-1 sm:max-w-xs">
                          <div className="mb-2 flex justify-between text-sm text-white dark:text-ink-inverse/70"><span>{t('Lesson progress')}</span><span className="lp-num font-semibold">{next.percent}%</span></div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/30 dark:bg-ink-inverse/10" role="progressbar" aria-label={t('Lesson progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={next.percent}>
                            <div className="h-full rounded-full bg-white dark:bg-brand transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${next.percent}%` }} />
                          </div>
                        </div>
                      ) : <span />}
                      <Link to={next.to} className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-brand no-underline transition hover:bg-white/90 dark:bg-ink-inverse dark:text-ink dark:hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand dark:focus-visible:ring-ink-inverse dark:focus-visible:ring-offset-white">
                        {next.cta}
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="lp-display m-0 text-[2rem] font-semibold sm:text-[2.75rem]">{t('Find your starting point')}</p>
                      <p className="m-0 mt-3 max-w-md text-base leading-relaxed text-white dark:text-ink-inverse/70">{t('Take the placement test so we can recommend a course and your first lesson.')}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/placement" className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-brand no-underline transition hover:bg-white/90 dark:bg-ink-inverse dark:text-ink dark:hover:opacity-90">{t('Take the placement test')}</Link>
                      <Link to="/curriculum" className="inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-semibold text-white no-underline ring-1 ring-white/50 transition hover:bg-white/10 dark:text-ink-inverse dark:ring-ink-inverse/30 dark:hover:bg-ink-inverse/5">{t('Browse courses')}</Link>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section aria-label={t('Today')} className="flex flex-col items-center gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6 lg:col-span-4">
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
          </div>

          <section aria-label={t('Your stats')} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
              <div className="col-span-2 lg:col-span-4"><Unavailable label={t('stats')} onRetry={load} /></div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
              {activeCourseId && current.state === 'ready' && current.chapter ? (
                <CurrentCourseLessons courseId={activeCourseId} courseTitle={data.enrollment?.courseTitle ?? null} data={current.chapter} />
              ) : activeCourseId && current.state === 'loading' ? (
                <div className="h-56 animate-pulse rounded-2xl bg-surface-muted" role="status" aria-label={t('Loading')} />
              ) : (
                <RoadmapEmpty courseId={courseId} courseTitle={courseTitle} unavailable={!!activeCourseId} />
              )}
              <DeadlineWidget deadlines={data.deadlines} />
            </div>
            <aside className="flex min-w-0 flex-col gap-5 lg:col-span-5" aria-label={t('Activity and deadlines')}>
              {data.summary?.challenge && <ChallengeWidget challenge={data.summary.challenge} courseId={courseId} />}
              <ActivityWidget days={stats?.weeklyActivity ?? []} weeklyDeltaPercent={stats?.weeklyDeltaPercent} unavailable={!stats} />
              <ImproveWidget spots={data.weakSpots} />
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
