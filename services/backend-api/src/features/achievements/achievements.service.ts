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
    const [definitions, unlockState, completedLessons, passedAssessments] = await Promise.all([
      this.repository.findActiveDefinitions(),
      this.repository.findUnlockStateForStudent(studentId),
      this.repository.countCompletedLessons(studentId),
      this.repository.countPassedAssessments(studentId),
    ]);

    const unlockedByAchievementId = new Map(
      unlockState.map((row) => [row.achievement_id, row.unlocked_at]),
    );

    for (const def of definitions) {
      if (unlockedByAchievementId.has(def.id)) continue;

      let shouldUnlock = false;
      const key = def.key.toLowerCase();
      if ((key.includes('first') || key.includes('lesson') || key.includes('step')) && completedLessons >= 1) {
        shouldUnlock = true;
      } else if ((key.includes('getting') || key.includes('started') || key.includes('5')) && completedLessons >= 5) {
        shouldUnlock = true;
      } else if ((key.includes('quiz') || key.includes('whiz') || key.includes('assessment')) && passedAssessments >= 1) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const now = new Date();
        unlockedByAchievementId.set(def.id, now);
        this.repository.unlockAchievement(studentId, def.id).catch(() => {});
      }
    }

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
