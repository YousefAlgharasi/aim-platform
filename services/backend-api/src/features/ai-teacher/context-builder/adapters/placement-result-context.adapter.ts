// P8-032: Add Placement Result Context
// Backend-approved, read-only adapter that maps the student's most recent
// completed placement result into the shape the Context Builder (Group D)
// embeds in AI Teacher prompt context — so AI Teacher can understand the
// student's starting level without calculating it itself.
//
// Source: services/backend-api/src/features/placement/placement-result-read.service.ts
// (PlacementResultReadService.getLatestResultForStudent), the same
// student-safe shape already exposed to clients via
// GET /placement/attempts/:id/result (P4-048).
//
// Authority boundary:
//   - estimatedLevel is the backend-assigned CEFR level computed by P4-045
//     placement scoring — this adapter only reads it, never recomputes it.
//   - skillSummary signals (strong/developing/emerging) are pre-computed by
//     PlacementResultReadService — no raw scores, ratios, or internal skill
//     keys are surfaced here.
//   - Returns null when the student has no completed placement attempt —
//     placement context is optional for an AI Teacher turn, so this never
//     throws.

import { Injectable } from '@nestjs/common';

import { PlacementResultReadService } from '../../../placement/placement-result-read.service';

export interface PlacementResultContextSkill {
  readonly skillCode: string;
  readonly skillName: string;
  readonly signal: 'strong' | 'developing' | 'emerging';
}

export interface PlacementResultContext {
  readonly estimatedLevel: string;
  readonly skillSummary: PlacementResultContextSkill[];
  readonly completedAt: string;
}

@Injectable()
export class PlacementResultContextAdapter {
  constructor(private readonly placementResultRead: PlacementResultReadService) {}

  async getPlacementResultContext(studentId: string): Promise<PlacementResultContext | null> {
    const result = await this.placementResultRead.getLatestResultForStudent(studentId);

    if (!result) {
      return null;
    }

    return {
      estimatedLevel: result.estimatedLevel,
      skillSummary: result.skillSummary,
      completedAt: result.completedAt,
    };
  }
}
