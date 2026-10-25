import { apiClient } from '../../api/client';

// GET /student/achievements — services/backend-api/src/features/achievements/achievements.types.ts

export interface Achievement {
  key: string;
  title: string;
  description: string;
  /** Material icon name from achievement_definitions.icon (e.g. "emoji_events"). */
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const data = await apiClient.get<{ achievements?: Achievement[] } | null>('/student/achievements');
  return data?.achievements ?? [];
}
