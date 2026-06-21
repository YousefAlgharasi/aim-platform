// Phase 4 — P4-048
// PlacementResultReadService.
//
// Scope: Placement result read API only.
//
// Responsibility:
//   Fetch the completed placement result for a given attempt and return a
//   student-safe response shape per P4-014 §5–6 and the API map endpoint #7.
//
//   Student-safe fields returned:
//     - resultId, attemptId, estimatedLevel, completedAt, initialPathReady
//     - skillSummary: [{ skillCode, skillName, signal }] — derived from
//       skill_mastery_map stored in placement_results
//
//   Fields NEVER returned to Flutter:
//     - student_id (internal)
//     - overallScore / raw mastery numbers (internal scoring)
//     - correct_count, correctnessRatio, lowCoverage (internal)
//     - skill_key, skill_id from weakness map (internal)
//     - raw weakness_map structure (students see initialPathReady only)
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
// Flutter-safe response shape (P4-014 §5–6, API map endpoint #7)
// ---------------------------------------------------------------------------

export interface SkillSummaryEntry {
  /** Section skill code used as stable identifier: grammar | vocabulary | reading | listening */
  readonly skillCode: string;
  readonly skillName: string;
  /** strong / developing / emerging — computed from mastery_score. Never raw ratio. */
  readonly signal: 'strong' | 'developing' | 'emerging';
}

export interface PlacementResultResponse {
  readonly resultId: string;
  readonly attemptId: string;
  /** Backend-assigned CEFR level. Flutter displays as-is — never recalculates. */
  readonly estimatedLevel: string;
  /** Per-section skill summary. No raw scores, no correctness ratios, no internal keys. */
  readonly skillSummary: SkillSummaryEntry[];
  /** True when initial_path_id is set (i.e. P4-047 ran successfully). */
  readonly initialPathReady: boolean;
  readonly completedAt: string;
}

// Section display names for student-facing skill summary
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
};

// Signal thresholds — must match P4-045 constants (backend config, never exposed)
const STRONG = 0.75;
const DEVELOPING = 0.40;

@Injectable()
export class PlacementResultReadService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * P8-032: Fetch the student-safe placement result for the student's most
   * recently completed placement attempt, without requiring the caller to
   * already know an attemptId. Used by the AI Teacher context builder
   * (CurriculumSkillContextAdapter's sibling, PlacementResultContextAdapter)
   * to surface the student's starting level without recalculating it.
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
    // 4. Build student-safe skill summary from skill_mastery_map.
    //    Only signal (not ratio, count, or coverage) is returned to Flutter.
    // -----------------------------------------------------------------------
    const skillSummary = this.buildSkillSummary(result.skill_mastery_map);

    // -----------------------------------------------------------------------
    // 5. Return student-safe response shape.
    //    student_id, overallScore, raw mastery numbers, skill_key, and
    //    raw weakness_map internals are intentionally excluded.
    // -----------------------------------------------------------------------
    return {
      resultId: result.id,
      attemptId: result.placement_attempt_id,
      estimatedLevel: result.estimated_level,
      skillSummary,
      initialPathReady: result.initial_path_id !== null,
      completedAt: attempt.completed_at as string,
    };
  }

  // -------------------------------------------------------------------------
  // Private: build skill summary from skill_mastery_map JSONB
  // -------------------------------------------------------------------------

  private buildSkillSummary(
    skillMasteryMap: Record<
      string,
      { total_questions: number; correct_answers: number; mastery_score: number }
    >,
  ): SkillSummaryEntry[] {
    if (!skillMasteryMap) return [];

    const order = ['grammar', 'vocabulary', 'reading', 'listening'];

    return order
      .filter((code) => code in skillMasteryMap)
      .map((code) => {
        const section = skillMasteryMap[code];
        const signal = this.masteryToSignal(section.mastery_score);
        return {
          skillCode: code,
          skillName: SECTION_DISPLAY_NAMES[code] ?? code,
          signal,
        };
      });
  }

  private masteryToSignal(mastery: number): 'strong' | 'developing' | 'emerging' {
    if (mastery >= STRONG) return 'strong';
    if (mastery >= DEVELOPING) return 'developing';
    return 'emerging';
  }
}
