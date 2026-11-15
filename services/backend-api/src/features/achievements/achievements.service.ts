// AchievementsService.
//
// Scope: Merge the backend-seeded achievement catalog with a student's
// unlock state into the locked/unlocked badge gallery shape surfaced on
// the mobile Achievements screen.

import { Injectable } from '@nestjs/common';
import { AchievementsRepository } from './achievements.repository';
import { isRuleType } from './achievement-rules';
import { AchievementSummary, AchievementsResponse } from './achievements.types';

@Injectable()
export class AchievementsService {
  constructor(private readonly repository: AchievementsRepository) {}

  async getAchievements(studentId: string): Promise<AchievementsResponse> {
    const [definitions, unlockState, counters] = await Promise.all([
      this.repository.findActiveDefinitions(),
      this.repository.findUnlockStateForStudent(studentId),
      this.repository.getCounters(studentId),
    ]);

    const unlockedByAchievementId = new Map(
      unlockState.map((row) => [row.achievement_id, row.unlocked_at]),
    );

    // Data-driven rules: an achievement unlocks when its counter reaches its threshold.
    // Definitions without a rule are never auto-unlocked.
    for (const def of definitions) {
      if (unlockedByAchievementId.has(def.id)) continue;
      if (!isRuleType(def.rule_type) || def.rule_threshold === null || def.rule_threshold === undefined) continue;
      if ((counters[def.rule_type] ?? 0) >= def.rule_threshold) {
        unlockedByAchievementId.set(def.id, new Date());
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
