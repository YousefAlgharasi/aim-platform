import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchRecommendations, type RecommendationEntry } from '../progress/aimApi';
import {
  fetchContinueLearning,
  fetchCurrentEnrollment,
  fetchDeadlines,
  fetchEngagementStats,
  fetchEngagementSummary,
  fetchQuickStartLesson,
  fetchRecommendedCourse,
  updateDailyGoal,
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
  ContinueWidget,
  DeadlineWidget,
  ProgressWidget,
  RecommendationWidget,
  StatsWidget,
  StreakWidget,
} from './widgets';
import { FlameIcon } from '../../components/common/Icons';

interface QuickLink {
  to: string;
  type: string;
  title: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    to: '/placement',
    type: 'Get started',
    title: 'Take the placement test',
    description: 'Find your starting level so your lessons match your skills.',
  },
  {
    to: '/curriculum',
    type: 'Learn',
    title: 'Browse courses',
    description: 'Explore subjects and pick up where you left off.',
  },
  {
    to: '/progress',
    type: 'Track',
    title: 'View your progress',
    description: 'See how your skills are developing over time.',
  },
  {
    to: '/assessments',
    type: 'Practice',
    title: 'Assessments',
    description: 'Check your understanding with graded assessments.',
  },
  {
    to: '/ai-teacher',
    type: 'Help',
    title: 'Ask the AI Teacher',
    description: 'Get explanations and hints whenever you are stuck.',
  },
  {
    to: '/achievements',
    type: 'Celebrate',
    title: 'Achievements',
    description: 'See the badges you have unlocked and what is next.',
  },
  {
    to: '/certificates',
    type: 'Show off',
    title: 'Certificates',
    description: 'View the certificates you have earned for completed courses.',
  },
  {
    to: '/reports',
    type: 'Review',
    title: 'My reports',
    description: 'Review the reports available to you.',
  },
];

interface DashboardData {
  summary: EngagementSummary | null;
  stats: EngagementStats | null;
  continueLesson: ContinueLearningLesson | null;
  quickStart: QuickStartLesson | null;
  recommendedCourse: RecommendedCourse | null;
  enrollment: CurrentEnrollment | null;
  deadlines: StudentDeadlineItem[];
  recommendations: RecommendationEntry[];
}

/** Deadlines worth surfacing on Home: open/late first, then upcoming; capped. */
function homeDeadlines(d: StudentDeadlines | null): StudentDeadlineItem[] {
  if (!d) return [];
  const due = (x: StudentDeadlineItem) => new Date(x.extendedClosesAt ?? x.closesAt).getTime();
  const open = [...(d.late ?? []), ...(d.active ?? [])].sort((a, b) => due(a) - due(b));
  const upcoming = [...(d.upcoming ?? [])].sort(
    (a, b) => new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime(),
  );
  return [...open, ...upcoming].slice(0, 5);
}

export function DashboardHome() {
  const { user } = useAuth();
  const studentId = user?.id;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState('');
  const [failedSections, setFailedSections] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setFatalError('');
    setFailedSections([]);

    // Every section is independent: one failing must not take down the page
    // (Flutter HomeNotifier treats engagement/lesson calls as supplementary).
    const results = await Promise.allSettled([
      fetchEngagementSummary(),
      fetchEngagementStats(),
      fetchContinueLearning(),
      fetchQuickStartLesson(),
      fetchRecommendedCourse(),
      fetchCurrentEnrollment(),
      fetchDeadlines(),
      studentId ? fetchRecommendations(studentId) : Promise.resolve<RecommendationEntry[]>([]),
    ] as const);

    const labels = [
      'daily goal',
      'stats',
      'continue learning',
      'quick start',
      'recommended course',
      'enrollment',
      'deadlines',
      'recommendations',
    ];
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? labels[i] : null))
      .filter((x): x is string => x !== null);

    if (failed.length === results.length) {
      const first = results[0];
      setFatalError(
        getErrorMessage(first.status === 'rejected' ? first.reason : null, 'Could not load your dashboard.'),
      );
      setData(null);
      setLoading(false);
      return;
    }

    const val = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null);
    const [summary, stats, cont, quick, course, enrollment, deadlines, recs] = results;

    setData({
      summary: val(summary),
      stats: val(stats),
      continueLesson: val(cont),
      quickStart: val(quick),
      recommendedCourse: val(course),
      enrollment: val(enrollment),
      deadlines: homeDeadlines(val(deadlines)),
      recommendations: val(recs) ?? [],
    });
    setFailedSections(failed);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateGoal = useCallback(async (target: number) => {
    const goal = await updateDailyGoal(target);
    setData((prev) =>
      prev ? { ...prev, summary: { goal, challenge: prev.summary?.challenge ?? null } } : prev,
    );
  }, []);

  const stats = data?.stats ?? null;
  const courseTitle =
    (data?.enrollment?.found ? data.enrollment.courseTitle : null) ?? data?.recommendedCourse?.courseTitle ?? null;

  const streakDays = data?.summary?.goal.streakDays;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-5 sm:p-6 text-white shadow-xl shadow-indigo-500/25">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -start-10 size-32 rounded-full bg-violet-400/20 blur-xl" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="m-0 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
            </h1>
            {data && (stats || courseTitle) && (
              <p className="m-0 mt-1 text-xs sm:text-sm font-medium text-indigo-100/90">
                {stats ? `Level ${stats.level}` : ''}
                {stats && courseTitle ? ' · ' : ''}
                {courseTitle ?? ''}
              </p>
            )}
          </div>
          {streakDays != null && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-xs font-extrabold shadow-sm backdrop-blur-md">
              <FlameIcon className="size-4 text-amber-300 fill-amber-300" />
              <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : fatalError ? (
        <ErrorState message={fatalError} onRetry={load} />
      ) : data ? (
        <>
          {failedSections.length > 0 && (
            <Banner variant="warning">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span>Some sections couldn't be loaded ({failedSections.join(', ')}).</span>
                <Button size="sm" variant="secondary" onClick={load}>
                  Retry
                </Button>
              </div>
            </Banner>
          )}

          <section aria-label="Your stats" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <StreakWidget
              key={data.summary?.goal.targetLessons ?? 'none'}
              goal={data.summary?.goal ?? null}
              onUpdateGoal={data.summary ? handleUpdateGoal : undefined}
            />
            <ProgressWidget
              completionPercent={stats?.levelProgressPercent ?? 0}
              label={stats ? `Level ${stats.level}` : 'Level unavailable'}
              meta={
                stats
                  ? stats.nextLevel != null && stats.nextLevelMinXp != null
                    ? `${Math.max(0, stats.nextLevelMinXp - stats.totalXp)} XP to level ${stats.nextLevel}`
                    : 'Highest level reached'
                  : undefined
              }
            />
            <StatsWidget stats={stats} />
          </section>

          <section aria-label="Learning" className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ContinueWidget
              continueLesson={data.continueLesson}
              quickStart={data.quickStart}
              recommendedCourse={data.recommendedCourse}
              enrollment={data.enrollment}
            />
            {data.summary?.challenge ? (
              <ChallengeWidget challenge={data.summary.challenge} />
            ) : (
              <ActivityWidget
                days={stats?.weeklyActivity ?? []}
                weeklyDeltaPercent={stats?.weeklyDeltaPercent}
              />
            )}
          </section>

          <section aria-label="Activity and deadlines" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.summary?.challenge && (
              <ActivityWidget days={stats?.weeklyActivity ?? []} weeklyDeltaPercent={stats?.weeklyDeltaPercent} />
            )}
            <DeadlineWidget deadlines={data.deadlines} />
            <RecommendationWidget recommendations={data.recommendations} />
          </section>
        </>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Quick links</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block rounded-2xl no-underline transition-all duration-200 hover:-translate-y-0.5 [&>div]:h-full [&>div]:hover:ring-indigo-300 dark:[&>div]:hover:ring-indigo-500/60"
            >
              <Card>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{link.type}</span>
                <p className="m-0 mt-1 text-sm font-bold text-slate-900 dark:text-white">{link.title}</p>
                <p className="m-0 mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
