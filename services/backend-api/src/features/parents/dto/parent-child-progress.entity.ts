// P12-027: Create Parent Child Progress Service
// Read-only parent-facing shapes for a child's skill states, weakness
// records, recommendations, and review schedule. Every field is a
// pass-through of values already computed and persisted by the AIM
// pipeline (Phase 5) — no mastery, weakness, score, correctness, or
// recommendation is computed in the parent dashboard layer.

import { ApiProperty } from '@nestjs/swagger';

export class ParentChildSkillStateEntity {
  @ApiProperty()
  skillId!: string;

  @ApiProperty()
  masteryScore!: number;

  @ApiProperty()
  masteryConfidence!: number;

  @ApiProperty()
  masteryTrend!: string;

  @ApiProperty()
  lastEvaluatedAt!: string;
}

export class ParentChildWeaknessEntity {
  @ApiProperty()
  weaknessId!: string;

  @ApiProperty()
  skillId!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  detectedAt!: string;

  @ApiProperty({ nullable: true })
  resolvedAt!: string | null;
}

export class ParentChildRecommendationEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  kind!: string;

  @ApiProperty()
  targetSkillId!: string;

  @ApiProperty()
  rank!: number;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty()
  status!: string;
}

export class ParentChildReviewScheduleEntity {
  @ApiProperty()
  scheduleId!: string;

  @ApiProperty()
  skillId!: string;

  @ApiProperty()
  dueAt!: string;

  @ApiProperty()
  status!: string;
}

export class ParentChildProgressEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty({ type: [ParentChildSkillStateEntity] })
  skillStates!: ParentChildSkillStateEntity[];

  @ApiProperty({ type: [ParentChildWeaknessEntity] })
  weaknesses!: ParentChildWeaknessEntity[];

  @ApiProperty({ type: [ParentChildRecommendationEntity] })
  recommendations!: ParentChildRecommendationEntity[];

  @ApiProperty({ type: [ParentChildReviewScheduleEntity] })
  reviewSchedules!: ParentChildReviewScheduleEntity[];

  @ApiProperty()
  retrievedAt!: string;
}
