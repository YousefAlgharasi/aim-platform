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

export interface EngagementSummaryResponse {
  readonly goal: DailyGoalSummary;
  readonly challenge: DailyChallengeSummary | null;
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
