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

export interface EngagementSummary {
  goal: DailyGoalSummary;
  challenge: DailyChallengeSummary | null;
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

export function fetchEngagementStats(): Promise<EngagementStats | null> {
  return apiClient.get<EngagementStats | null>('/student/engagement/stats');
}

/** PUT /student/engagement/goal — body is exactly `{ dailyGoalLessons }`; backend clamps to 1..20. */
export function updateDailyGoal(dailyGoalLessons: number): Promise<DailyGoalSummary> {
  return apiClient.put<DailyGoalSummary>('/student/engagement/goal', { dailyGoalLessons });
}

export const DAILY_GOAL_MIN = 1;
export const DAILY_GOAL_MAX = 20;

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
  enrolledAt: string | null;
}

export function fetchCurrentEnrollment(): Promise<CurrentEnrollment | null> {
  return apiClient.get<CurrentEnrollment | null>('/enrollment/current');
}

// ── Deadlines (services/backend-api/src/features/assessments/assessment.service.ts) ──

export type DeadlineStatus = 'upcoming' | 'active' | 'late' | 'missed' | 'closed';

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
