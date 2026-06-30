export interface AchievementSummary {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: string;
  readonly unlocked: boolean;
  readonly unlockedAt: string | null;
}

export interface AchievementsResponse {
  readonly achievements: AchievementSummary[];
}
