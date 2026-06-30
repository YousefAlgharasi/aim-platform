// AchievementsService.
//
// Scope: Merge the backend-seeded achievement catalog with a student's
// unlock state into the locked/unlocked badge gallery shape surfaced on
// the mobile Achievements screen.

import { Injectable } from '@nestjs/common';
import { AchievementsRepository } from './achievements.repository';
import { AchievementSummary, AchievementsResponse } from './achievements.types';

@Injectable()
export class AchievementsService {
  constructor(private readonly repository: AchievementsRepository) {}

  async getAchievements(studentId: string): Promise<AchievementsResponse> {
    const [definitions, unlockState] = await Promise.all([
      this.repository.findActiveDefinitions(),
      this.repository.findUnlockStateForStudent(studentId),
    ]);

    const unlockedByAchievementId = new Map(
      unlockState.map((row) => [row.achievement_id, row.unlocked_at]),
    );

    const achievements: AchievementSummary[] = definitions.map((definition) => {
      const unlockedAt = unlockedByAchievementId.get(definition.id) ?? null;

      return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        category: definition.category,
        unlocked: unlockedAt !== null,
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
      };
    });

    return { achievements };
  }
}
