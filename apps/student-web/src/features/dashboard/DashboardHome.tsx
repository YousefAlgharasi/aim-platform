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
import styles from './DashboardHome.module.css';

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

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock}>
        <h1 className={styles.heading}>
          {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
        </h1>
        {data && (stats || courseTitle) && (
          <p className={styles.subheading}>
            {stats ? `Level ${stats.level}` : ''}
            {stats && courseTitle ? ' · ' : ''}
            {courseTitle ?? ''}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : fatalError ? (
        <ErrorState message={fatalError} onRetry={load} />
      ) : data ? (
        <>
          {failedSections.length > 0 && (
            <Banner variant="warning">
              <div className={styles.bannerRow}>
                <span>Some sections couldn't be loaded ({failedSections.join(', ')}).</span>
                <Button size="sm" variant="secondary" onClick={load}>
                  Retry
                </Button>
              </div>
            </Banner>
          )}

          <section aria-label="Your stats" className={styles.statsGrid}>
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

          <section aria-label="Learning" className={styles.twoCol}>
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

          <section aria-label="Activity and deadlines" className={styles.autoGrid}>
            {data.summary?.challenge && (
              <ActivityWidget days={stats?.weeklyActivity ?? []} weeklyDeltaPercent={stats?.weeklyDeltaPercent} />
            )}
            <DeadlineWidget deadlines={data.deadlines} />
            <RecommendationWidget recommendations={data.recommendations} />
          </section>
        </>
      ) : null}

      <section>
        <h2 className={styles.sectionTitle}>Quick links</h2>
        <div className={styles.statsGrid}>
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.recLink}>
              <Card>
                <span className={styles.recType}>{link.type}</span>
                <p className={styles.recTitle}>{link.title}</p>
                <p className={styles.dueDate}>{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
