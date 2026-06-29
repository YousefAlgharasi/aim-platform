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
