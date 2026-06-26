// Phase 4 — P4-048
// PlacementResultReadService.
//
// Scope: Placement result read API only.
//
// Responsibility:
//   Fetch the completed placement result for a given attempt and return the
//   response shape expected by Flutter PlacementResultModel.fromJson().
//
//   Fields returned:
//     - id, placement_attempt_id, estimated_level, created_at
//     - skill_mastery_map: { [skill]: { total_questions, correct_answers, mastery_score, signal } }
//     - weakness_map: { weaknesses: [{ skill_code, mastery_score, priority }] }
//     - initial_path_id: UUID or null
//
// Security rules:
//   - Requires a valid Supabase JWT (student must own the attempt).
//   - Attempt ownership is enforced: student_id from JWT must match the attempt.
//   - Result is only available after attempt.status = 'completed'.
//   - No scoring computation here — reads only, from placement_results.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';

// ---------------------------------------------------------------------------
// Internal DB row types
// ---------------------------------------------------------------------------

interface AttemptStatusRow {
  readonly id: string;
  readonly student_id: string;
  readonly status: string;
  readonly completed_at: string | null;
}

interface ResultRow {
  readonly id: string;
  readonly placement_attempt_id: string;
  readonly estimated_level: string;
  readonly skill_mastery_map: Record<
    string,
    { total_questions: number; correct_answers: number; mastery_score: number }
  >;
  readonly weakness_map: {
    weaknesses: Array<{ skill_code: string; mastery_score: number; priority: number; signal: string }>;
  };
  readonly initial_path_id: string | null;
  readonly created_at: string;
}

// ---------------------------------------------------------------------------
// Flutter-safe response shape (matches PlacementResultModel.fromJson())
// ---------------------------------------------------------------------------

export interface PlacementResultResponse {
  readonly id: string;
  readonly placement_attempt_id: string;
  readonly estimated_level: string;
  readonly skill_mastery_map: Record<string, {
    total_questions: number;
    correct_answers: number;
    mastery_score: number;
    signal: string;
  }>;
  readonly weakness_map: {
    weaknesses: Array<{
      skill_code: string;
      mastery_score: number;
      priority: number;
      signal: string;
    }>;
  };
  readonly initial_path_id: string | null;
  readonly created_at: string;
}

// Signal thresholds — must match P4-045 constants (backend config, never exposed)
const STRONG = 0.75;
const DEVELOPING = 0.40;

@Injectable()
export class PlacementResultReadService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * P8-032: Fetch the student-safe placement result for the student's most
   * recently completed placement attempt, without requiring the caller to
   * already know an attemptId.
   *
   * P18-031: No longer consumed by the AI Teacher context builder — the
   * Phase 18 AI Authority Rule forbids AI Teacher from reading placement
   * results. This method remains for other student-safe callers (e.g.
   * the placement results API).
   *
   * @param studentId  Internal student ID — never from client input.
   * @returns          The same student-safe shape as getResult, or null when
   *                    the student has no completed placement attempt yet.
   */
  async getLatestResultForStudent(studentId: string): Promise<PlacementResultResponse | null> {
    const latestAttempt = await this.db.query<{ id: string }>(
      `SELECT id
       FROM placement_attempts
       WHERE student_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [studentId],
    );

    if ((latestAttempt.rowCount ?? 0) === 0) {
      return null;
    }

    return this.getResult(latestAttempt.rows[0].id, studentId);
  }

  /**
   * Fetch the student-safe placement result for a given attempt.
   *
   * @param attemptId  UUID of the placement_attempt (from URL path).
   * @param studentId  Internal student ID from the verified JWT.
   */
  async getResult(
    attemptId: string,
    studentId: string,
  ): Promise<PlacementResultResponse> {
    // -----------------------------------------------------------------------
    // 1. Verify the attempt exists and belongs to the requesting student.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<AttemptStatusRow>(
      `SELECT id, student_id, status, completed_at
       FROM placement_attempts
       WHERE id = $1 AND student_id = $2
       LIMIT 1`,
      [attemptId, studentId],
    );

    if ((attemptResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Placement attempt not found or does not belong to you.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempt = attemptResult.rows[0];

    // -----------------------------------------------------------------------
    // 2. Verify the attempt is completed — result only available after completion.
    // -----------------------------------------------------------------------
    if (attempt.status !== 'completed') {
      throw new AppError({
        code: 'ATTEMPT_NOT_COMPLETED',
        message: `Placement result is not available yet (attempt status: ${attempt.status}).`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // -----------------------------------------------------------------------
    // 3. Fetch the placement result row.
    // -----------------------------------------------------------------------
    const resultQuery = await this.db.query<ResultRow>(
      `SELECT id, placement_attempt_id, estimated_level,
              skill_mastery_map, weakness_map, initial_path_id, created_at
       FROM placement_results
       WHERE placement_attempt_id = $1
       LIMIT 1`,
      [attemptId],
    );

    if ((resultQuery.rowCount ?? 0) === 0) {
      throw new AppError({
        code: 'RESULT_NOT_FOUND',
        message: 'Placement result not found for this attempt.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const result = resultQuery.rows[0];

    // -----------------------------------------------------------------------
    // 4. Return response shape matching Flutter PlacementResultModel.fromJson().
    // -----------------------------------------------------------------------
    return {
      id: result.id,
      placement_attempt_id: result.placement_attempt_id,
      estimated_level: result.estimated_level,
      skill_mastery_map: this.enrichSkillMasteryWithSignal(result.skill_mastery_map),
      weakness_map: result.weakness_map as any,
      initial_path_id: result.initial_path_id,
      created_at: result.created_at,
    };
  }

  // -------------------------------------------------------------------------
  // Private: enrich skill_mastery_map entries with computed signal
  // -------------------------------------------------------------------------

  private enrichSkillMasteryWithSignal(
    map: Record<string, { total_questions: number; correct_answers: number; mastery_score: number }>,
  ): Record<string, { total_questions: number; correct_answers: number; mastery_score: number; signal: string }> {
    if (!map) return {};
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(map)) {
      result[key] = {
        ...value,
        signal: this.masteryToSignal(value.mastery_score),
      };
    }
    return result;
  }

  private masteryToSignal(mastery: number): 'strong' | 'developing' | 'emerging' {
    if (mastery >= STRONG) return 'strong';
    if (mastery >= DEVELOPING) return 'developing';
    return 'emerging';
  }
}
