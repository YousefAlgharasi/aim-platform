import { apiClient } from '../../api/client';

// Typed fetchers for the Home dashboard. Mirrors Flutter features/home
// (home_remote_datasource_impl.dart) plus deadlines/enrollment.
// Kept local on purpose so the dashboard does not depend on other features' API modules.

// ── Engagement (services/backend-api/src/features/engagement) ──────────────

export interface DailyGoalSummary {
  targetLessons: number;
  completedToday: number;
  streakDays: number;
}

export interface DailyChallengeSummary {
  key: string;
  title: string;
  description: string;
  targetCount: number;
  progressCount: number;
  completed: boolean;
}

export interface StreakFreezeSummary {
  allowance: number;
  usedThisMonth: number;
  remaining: number;
  /** Yesterday was missed and the streak before it can still be saved. */
  atRisk: boolean;
  canUseNow: boolean;
}

export interface EngagementSummary {
  goal: DailyGoalSummary;
  challenge: DailyChallengeSummary | null;
  /** Today's three challenges: lessons/streak, speaking practice, writing practice. Absent on older backends: use `challenge`. */
  challenges?: DailyChallengeSummary[];
  /** Absent on older backends: the freeze UI stays hidden. */
  streakFreeze?: StreakFreezeSummary;
}

export interface WeeklyActivityDay {
  /** yyyy-mm-dd (UTC) */
  date: string;
  xp: number;
}

export interface EngagementStats {
  totalXp: number;
  xpToday: number;
  level: number;
  nextLevel: number | null;
  currentLevelMinXp: number;
  nextLevelMinXp: number | null;
  levelProgressPercent: number;
  badgeCount: number;
  /** 1-100, lower is better (1 = top 1%). */
  rankPercentile: number;
  weeklyActivity: WeeklyActivityDay[];
  weeklyDeltaPercent: number | null;
}

export function fetchEngagementSummary(): Promise<EngagementSummary | null> {
  return apiClient.get<EngagementSummary | null>('/student/engagement/summary');
}

/** Cover yesterday so the streak survives (limited per month). Returns the fresh summary. */
export function requestStreakFreeze(): Promise<EngagementSummary> {
  return apiClient.post<EngagementSummary>('/student/engagement/streak-freeze');
}

export function fetchEngagementStats(): Promise<EngagementStats | null> {
  return apiClient.get<EngagementStats | null>('/student/engagement/stats');
}

export type LeaderboardPeriod = 'week' | 'all';

export interface LeaderboardEntry {
  rank: number;
  /** First name and last initial; never the email. */
  name: string;
  xp: number;
  isYou: boolean;
}

export interface Leaderboard {
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  /** The caller's own place; present even when outside `entries`. Null until they earn XP in the period. */
  you: LeaderboardEntry | null;
}

/** Top students by XP, this week (resets Monday) or all time. */
export function fetchLeaderboard(period: LeaderboardPeriod, limit = 5): Promise<Leaderboard> {
  return apiClient.get<Leaderboard>(`/student/engagement/leaderboard?period=${period}&limit=${limit}`);
}



// ── Lessons (services/backend-api/src/features/lessons/lesson-progress.types.ts) ──

export interface ContinueLearningLesson {
  lessonId: string;
  lessonTitle: string;
  percent: number;
  lastActiveAt: string;
}

export interface QuickStartLesson {
  lessonId: string;
  lessonTitle: string;
  lessonDescription: string;
  skillName: string | null;
}

export interface RecommendedCourse {
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  locale?: string;
  estimatedLevel: string | null;
}

export function fetchContinueLearning(): Promise<ContinueLearningLesson | null> {
  return apiClient.get<ContinueLearningLesson | null>('/lessons/continue');
}

export function fetchQuickStartLesson(): Promise<QuickStartLesson | null> {
  return apiClient.get<QuickStartLesson | null>('/lessons/quick-start');
}

export function fetchRecommendedCourse(): Promise<RecommendedCourse | null> {
  return apiClient.get<RecommendedCourse | null>('/lessons/recommended-course');
}

// ── Enrollment (services/backend-api/src/features/enrollment/enrollment.types.ts) ──

export interface CurrentEnrollment {
  found: boolean;
  courseId: string | null;
  courseTitle: string | null;
  locale?: string | null;
  enrolledAt: string | null;
}

export function fetchCurrentEnrollment(): Promise<CurrentEnrollment | null> {
  return apiClient.get<CurrentEnrollment | null>('/enrollment/current');
}

// ── Deadlines (services/backend-api/src/features/assessments/assessment.service.ts) ──

/** The API groups deadlines into upcoming/active/late/missed/closed, but each item's own status is the raw one. */
export type DeadlineStatus = 'upcoming' | 'open' | 'extended' | 'active' | 'late' | 'missed' | 'closed' | 'expired';

export interface StudentDeadlineItem {
  assessmentId: string;
  assessmentTitle: string;
  deadlineId: string;
  opensAt: string;
  closesAt: string;
  extendedClosesAt: string | null;
  status: DeadlineStatus;
}

export interface StudentDeadlines {
  upcoming: StudentDeadlineItem[];
  active: StudentDeadlineItem[];
  late: StudentDeadlineItem[];
  missed: StudentDeadlineItem[];
  closed: StudentDeadlineItem[];
}

export function fetchDeadlines(): Promise<StudentDeadlines | null> {
  return apiClient.get<StudentDeadlines | null>('/student/assessments/deadlines');
}
