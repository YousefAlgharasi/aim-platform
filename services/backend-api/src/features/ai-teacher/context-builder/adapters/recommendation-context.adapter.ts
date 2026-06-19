// P8-035: Add Recommendation Context
// Wraps RecommendationReadService (P5-071) — exposes backend-approved,
// already-ranked AIM recommendations as read-only AI Teacher prompt context
// so AI Teacher can guide the student without computing recommendations itself.

import { Injectable } from '@nestjs/common';
import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';

export interface RecommendationContextEntry {
  readonly kind: string;
  readonly targetSkillId: string;
  readonly targetLessonId: string | null;
  readonly rank: number;
  readonly reason: string;
}

@Injectable()
export class RecommendationContextAdapter {
  constructor(private readonly recommendationRead: RecommendationReadService) {}

  async getRecommendationContext(studentId: string): Promise<RecommendationContextEntry[] | null> {
    const { recommendations } = await this.recommendationRead.getActiveForStudent(studentId);
    if (recommendations.length === 0) {
      return null;
    }
    return recommendations.map((entry) => ({
      kind: entry.kind,
      targetSkillId: entry.targetSkillId,
      targetLessonId: entry.targetLessonId,
      rank: entry.rank,
      reason: entry.reason,
    }));
  }
}
