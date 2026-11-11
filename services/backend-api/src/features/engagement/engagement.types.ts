export interface DailyGoalSummary {
  readonly targetLessons: number;
  readonly completedToday: number;
  readonly streakDays: number;
}

export interface DailyChallengeSummary {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly targetCount: number;
  readonly progressCount: number;
  readonly completed: boolean;
}

export interface StreakFreezeSummary {
  /** Freezes a student gets each UTC month. */
  readonly allowance: number;
  readonly usedThisMonth: number;
  readonly remaining: number;
  /** Yesterday was missed and the streak before it can still be saved. */
  readonly atRisk: boolean;
  /** atRisk and at least one freeze remains. */
  readonly canUseNow: boolean;
}

export type StreakDayStatus = 'active' | 'frozen' | 'none';

export interface StreakDay {
  /** ISO date (yyyy-mm-dd), UTC. */
  readonly date: string;
  /** active = learned that day; frozen = covered by a streak freeze; none = nothing (yet, when it is today). */
  readonly status: StreakDayStatus;
}

export interface EngagementSummaryResponse {
  readonly goal: DailyGoalSummary;
  /** The lesson/streak challenge picked for today. Kept for older clients; newer ones read `challenges`. */
  readonly challenge: DailyChallengeSummary | null;
  /** Every challenge for today: the lesson/streak one, then Speaking practice and Write a paragraph. */
  readonly challenges: readonly DailyChallengeSummary[];
  readonly streakFreeze: StreakFreezeSummary;
  /** The last 7 UTC days, oldest first, ending today: the same days the streak is counted from. */
  readonly recentDays: readonly StreakDay[];
}

export type LeaderboardPeriod = 'week' | 'all';

export interface LeaderboardEntry {
  /** 1 = most XP. Ties go to whoever reached that XP first. */
  readonly rank: number;
  /** First name and last initial ("Yousef A."): never the email or the full name. */
  readonly name: string;
  readonly xp: number;
  readonly isYou: boolean;
}

export interface LeaderboardResponse {
  readonly period: LeaderboardPeriod;
  /** The top students, best first. Only students who earned XP in the period are ranked. */
  readonly entries: readonly LeaderboardEntry[];
  /** The caller's own place, when ranked (also present when they are outside the top list). */
  readonly you: LeaderboardEntry | null;
}

export interface UpdateDailyGoalInput {
  readonly studentId: string;
  readonly dailyGoalLessons: number;
}

export interface WeeklyActivityDay {
  /** ISO date (yyyy-mm-dd), UTC. */
  readonly date: string;
  /** XP earned from lessons completed on this date. */
  readonly xp: number;
}

export interface EngagementStatsResponse {
  /** Lifetime XP: sum of xp_value across all completed lesson_progress rows. */
  readonly totalXp: number;
  /** XP earned today (UTC). */
  readonly xpToday: number;

  readonly level: number;
  /** Null when the student is already at the highest seeded level. */
  readonly nextLevel: number | null;
  readonly currentLevelMinXp: number;
  /** Null when nextLevel is null. */
  readonly nextLevelMinXp: number | null;
  /** round((totalXp - currentLevelMinXp) / (nextLevelMinXp - currentLevelMinXp) * 100), 100 at max level. */
  readonly levelProgressPercent: number;

  /** Count of unlocked (unlocked_at IS NOT NULL) student_achievements rows. */
  readonly badgeCount: number;

  /** 1-100. Lower is better (1 = top 1%). Computed via PERCENT_RANK over all students' total XP. */
  readonly rankPercentile: number;

  /** Monday through Sunday of the current UTC week. */
  readonly weeklyActivity: readonly WeeklyActivityDay[];
  /** round((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100). Null when lastWeekTotal is 0 (no meaningful percent). */
  readonly weeklyDeltaPercent: number | null;
}
