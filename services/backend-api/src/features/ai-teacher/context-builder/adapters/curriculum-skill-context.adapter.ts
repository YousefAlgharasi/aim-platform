// P8-031: Add Curriculum Skill Context
// Backend-approved, read-only adapter that resolves the curriculum skill
// the student is currently focused on, for AI Teacher prompt context.
//
// Like P8-030's current-lesson context, there is no dedicated "current
// skill" pointer in the schema. The closest backend-approved signal is the
// same AIM-Engine-chosen top-ranked active recommendation already used for
// current lesson (RecommendationReadService.getActiveForStudent), which
// carries a non-null targetSkillId. This adapter resolves that skill id via
// SkillsService.getSkill and surfaces only safe, skill-identity fields.
//
// Authority boundary:
//   - This adapter only reads the AIM-Engine-chosen targetSkillId; it does
//     not pick a skill itself and does not compute mastery/level/weakness/
//     difficulty/recommendation/review-schedule values.
//   - Recommendation-adjacent fields (reason, kind, basedOnWeaknessId, rank,
//     status) are deliberately discarded — only skill identity fields are
//     surfaced.
//   - Returns null when the student has no active recommendation or the
//     referenced skill no longer exists (stale id) — current-skill context
//     is optional for an AI Teacher turn, so this never throws.

import { Injectable } from '@nestjs/common';

import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { SkillsService } from '../../../curriculum/skills/skills.service';

export interface CurriculumSkillContext {
  readonly skillId: string;
  readonly key: string;
  readonly title: string;
  readonly domain: string;
}

@Injectable()
export class CurriculumSkillContextAdapter {
  constructor(
    private readonly recommendations: RecommendationReadService,
    private readonly skills: SkillsService,
  ) {}

  async getSkillContext(studentId: string): Promise<CurriculumSkillContext | null> {
    const { recommendations } = await this.recommendations.getActiveForStudent(studentId);
    const targetSkillId = recommendations[0]?.targetSkillId;

    if (!targetSkillId) {
      return null;
    }

    try {
      const skill = await this.skills.getSkill(targetSkillId);
      return {
        skillId: skill.id,
        key: skill.key,
        title: skill.title,
        domain: skill.domain,
      };
    } catch {
      return null;
    }
  }
}
