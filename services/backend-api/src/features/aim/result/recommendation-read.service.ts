// Phase 5 — P5-071
// RecommendationReadService.
//
// Scope: Read-only backend service exposing active AIM-persisted recommendations
//        from the recommendations table (P5-038/P5-060).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned value may be written through this path.
//   - Only status='active' recommendations are returned by default — superseded,
//     expired, and dismissed entries are internal history, not surfaced here.
//   - This service never proxies a live AIM Engine call; it returns only
//     last-validated-persisted values.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface RecommendationEntry {
  readonly id: string;
  readonly kind: string;
  readonly targetSkillId: string;
  readonly targetLessonId: string | null;
  readonly rank: number;
  readonly reason: string;
  readonly basedOnWeaknessId: string | null;
  readonly generatedAt: string;
  readonly expiresAt: string | null;
  readonly status: string;
  readonly updatedAt: string;
}

export interface RecommendationReadResponse {
  readonly studentId: string;
  readonly recommendations: RecommendationEntry[];
}

// ---------------------------------------------------------------------------
// Internal DB row
// ---------------------------------------------------------------------------

interface RecommendationRow {
  readonly id: string;
  readonly kind: string;
  readonly target_skill_id: string;
  readonly target_lesson_id: string | null;
  readonly rank: number;
  readonly reason: string;
  readonly based_on_weakness_id: string | null;
  readonly generated_at: string;
  readonly expires_at: string | null;
  readonly status: string;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class RecommendationReadService {
  private readonly logger = new Logger(RecommendationReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return active AIM recommendations for a student, ordered by rank ASC.
   *
   * Only status='active' rows are returned. Superseded, expired, and
   * dismissed entries are not surfaced to clients.
   *
   * Returns only backend-validated, AIM-persisted values. No AIM Engine
   * call is made. If no active recommendations exist, returns an empty array.
   *
   * studentId must be JWT-resolved by the controller — never client-supplied.
   */
  async getActiveForStudent(
    studentId: string,
  ): Promise<RecommendationReadResponse> {
    const result = await this.db.query<RecommendationRow>(
      `SELECT
         id,
         kind,
         target_skill_id,
         target_lesson_id,
         rank,
         reason,
         based_on_weakness_id,
         generated_at,
         expires_at,
         status,
         updated_at
       FROM recommendations
       WHERE student_id = $1
         AND status = 'active'
       ORDER BY rank ASC`,
      [studentId],
    );

    const recommendations: RecommendationEntry[] = result.rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      targetSkillId: row.target_skill_id,
      targetLessonId: row.target_lesson_id,
      rank: row.rank,
      reason: row.reason,
      basedOnWeaknessId: row.based_on_weakness_id,
      generatedAt: row.generated_at,
      expiresAt: row.expires_at,
      status: row.status,
      updatedAt: row.updated_at,
    }));

    this.logger.debug('recommendations_read', {
      studentId,
      count: recommendations.length,
    });

    return { studentId, recommendations };
  }
}
