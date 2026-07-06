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
//     - recommended_course_id, unlocked_course_ids, note (P20-014, see below)
//
// P20-014 — course recommendation, ties placement + gating (P20-001/002/010)
// together:
//   - recommended_course_id: resolved from the SAME LEVEL_TO_CEFR mapping
//     PlacementLevelStateService (P20-006) uses, by finding a course whose
//     cefr_code matches (any status, to learn its intended cefr_rank/track
//     even if archived/unpublished). If a PUBLISHED course exists at that
//     exact cefr_rank, that is the recommendation, note is null.
//   - If no published course exists at that exact rank (a real, currently
//     live gap: LEVEL_TO_CEFR maps upper_intermediate/advanced -> 'B1', but
//     this platform's live courses only define cefr_code A1/A2/A3 — no B1
//     course exists yet), fall back to the highest-ranked published course
//     below that rank in the same track, and explain via `note`. If the
//     cefr_code has no course row at all (today's real B1 case), there is
//     no rank to compare against, so fall back to the single most helpful
//     answer: the highest-ranked published course that exists, in the
//     track resolved from the student's own student_level_state row (or
//     the highest-ranked published course sitewide if that row doesn't
//     exist either) — never a course that doesn't exist, per the task.
//   - unlocked_course_ids: every published course in that same track with
//     cefr_rank <= the student's max_unlocked_cefr_rank (student_level_state,
//     P20-002/006), defaulting to rank 1 when no state row exists yet
//     (same fallback convention as P20-010's course gating).
//   - Both fields, and note, are null/empty (never fabricated) if the
//     estimated_level is unmapped or no courses exist at all yet.
//
// Security rules:
//   - Requires a valid Supabase JWT (student must own the attempt).
//   - Attempt ownership is enforced: student_id from JWT must match the attempt.
//   - Result is only available after attempt.status = 'completed'.
//   - No scoring computation here — reads only, from placement_results. The
//     P20-014 course recommendation is a read-only lookup against already
//     backend-computed estimated_level/student_level_state, not a new
//     scoring computation.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import { LEVEL_TO_CEFR } from './placement-initial-learning-path.service';

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

interface CefrCodeCourseRow {
  readonly track_slug: string;
  readonly cefr_rank: number;
}

interface PublishedCourseRow {
  readonly id: string;
  readonly cefr_rank: number;
}

interface StudentTrackRow {
  readonly track_slug: string;
}

interface LevelStateRankRow {
  readonly max_unlocked_cefr_rank: number;
}

// ---------------------------------------------------------------------------
// Flutter-safe response shape (matches PlacementResultModel.fromJson())
// ---------------------------------------------------------------------------

export interface PlacementLatestStatusResponse {
  readonly status: 'none' | 'active' | 'submitted' | 'completed';
  readonly attemptId: string | null;
  readonly result: PlacementResultResponse | null;
}

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
  readonly recommended_course_id: string | null;
  readonly unlocked_course_ids: string[];
  readonly note: string | null;
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
   * P25-XXX: Fetch the student's overall placement status — used by the
   * mobile app's "Placement Test" menu entry to decide whether to show a
   * completed result + retake option, an in-progress resume prompt, or the
   * fresh start flow. Never requires the caller to already know an
   * attemptId; the backend is the sole authority on which attempt (if any)
   * is the student's latest.
   *
   * @param studentId  Internal student ID — never from client input.
   */
  async getLatestAttemptStatus(studentId: string): Promise<PlacementLatestStatusResponse> {
    const latestAttempt = await this.db.query<{ id: string; status: string }>(
      `SELECT id, status
       FROM placement_attempts
       WHERE student_id = $1
       ORDER BY started_at DESC
       LIMIT 1`,
      [studentId],
    );

    if ((latestAttempt.rowCount ?? 0) === 0) {
      return { status: 'none', attemptId: null, result: null };
    }

    const attempt = latestAttempt.rows[0];

    if (attempt.status !== 'completed') {
      return {
        status: attempt.status === 'submitted' ? 'submitted' : 'active',
        attemptId: attempt.id,
        result: null,
      };
    }

    const result = await this.getResult(attempt.id, studentId);
    return { status: 'completed', attemptId: attempt.id, result };
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
        code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
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
        code: PlacementErrorCode.ATTEMPT_NOT_COMPLETED,
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
        code: PlacementErrorCode.RESULT_NOT_FOUND,
        message: 'Placement result not found for this attempt.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const result = resultQuery.rows[0];

    // -----------------------------------------------------------------------
    // 4. Resolve the course recommendation (P20-014).
    // -----------------------------------------------------------------------
    const { recommendedCourseId, note, trackSlug } = await this.resolveRecommendedCourse(
      result.estimated_level,
      studentId,
    );
    const unlockedCourseIds = await this.resolveUnlockedCourseIds(studentId, trackSlug);

    // -----------------------------------------------------------------------
    // 5. Return response shape matching Flutter PlacementResultModel.fromJson().
    // -----------------------------------------------------------------------
    return {
      id: result.id,
      placement_attempt_id: result.placement_attempt_id,
      estimated_level: result.estimated_level,
      skill_mastery_map: this.enrichSkillMasteryWithSignal(result.skill_mastery_map),
      weakness_map: result.weakness_map as any,
      initial_path_id: result.initial_path_id,
      created_at: result.created_at,
      recommended_course_id: recommendedCourseId,
      unlocked_course_ids: unlockedCourseIds,
      note,
    };
  }

  // -------------------------------------------------------------------------
  // Private: P20-014 course recommendation
  // -------------------------------------------------------------------------

  /**
   * Resolves the recommended course id for an estimated_level, plus the
   * track it belongs to (needed for resolveUnlockedCourseIds) and an
   * optional explanatory note when an exact-rank course doesn't exist.
   */
  private async resolveRecommendedCourse(
    estimatedLevel: string,
    studentId: string,
  ): Promise<{ recommendedCourseId: string | null; note: string | null; trackSlug: string | null }> {
    const cefrCode = LEVEL_TO_CEFR[estimatedLevel];
    if (!cefrCode) {
      return { recommendedCourseId: null, note: null, trackSlug: null };
    }

    // Match by cefr_code regardless of status — this tells us the intended
    // cefr_rank/track even if the exact-level course is archived/unpublished,
    // without fabricating a rank ourselves (cefr_rank is always author-set).
    const anchorResult = await this.db.query<CefrCodeCourseRow>(
      `SELECT track_slug, cefr_rank FROM courses WHERE cefr_code = $1 AND cefr_rank IS NOT NULL ORDER BY cefr_rank ASC LIMIT 1`,
      [cefrCode],
    );
    const anchor = anchorResult.rows[0];

    if (!anchor) {
      // No course has ever been authored for this cefr_code (e.g. this
      // platform's live courses only define A1/A2/A3 — LEVEL_TO_CEFR's 'B1'
      // has no matching course yet). Fall back to the most advanced course
      // that exists, in the track resolved from the student's own level
      // state (or sitewide if no state row exists either).
      const trackSlug = await this.resolveStudentTrackSlug(studentId);
      const fallback = await this.highestRankedPublishedCourse(trackSlug);
      if (!fallback) {
        return { recommendedCourseId: null, note: 'No course is available for this level yet.', trackSlug };
      }
      return {
        recommendedCourseId: fallback.id,
        note: 'No course exists yet for the recommended level; showing the most advanced course currently available.',
        trackSlug: trackSlug ?? null,
      };
    }

    const exactResult = await this.db.query<PublishedCourseRow>(
      `SELECT id, cefr_rank FROM courses WHERE track_slug = $1 AND cefr_rank = $2 AND status = 'published' LIMIT 1`,
      [anchor.track_slug, anchor.cefr_rank],
    );
    const exact = exactResult.rows[0];
    if (exact) {
      return { recommendedCourseId: exact.id, note: null, trackSlug: anchor.track_slug };
    }

    // Exact-rank course exists in content but isn't published (e.g. archived)
    // — fall back to the closest lower published rank in the same track.
    const lowerResult = await this.db.query<PublishedCourseRow>(
      `SELECT id, cefr_rank FROM courses
       WHERE track_slug = $1 AND cefr_rank IS NOT NULL AND cefr_rank < $2 AND status = 'published'
       ORDER BY cefr_rank DESC LIMIT 1`,
      [anchor.track_slug, anchor.cefr_rank],
    );
    const lower = lowerResult.rows[0];
    if (lower) {
      return {
        recommendedCourseId: lower.id,
        note: 'No course exists yet for the recommended level; showing the closest lower-level course instead.',
        trackSlug: anchor.track_slug,
      };
    }

    return {
      recommendedCourseId: null,
      note: 'No course is available for this level yet.',
      trackSlug: anchor.track_slug,
    };
  }

  /** Every published course in trackSlug with cefr_rank <= the student's max_unlocked_cefr_rank. */
  private async resolveUnlockedCourseIds(studentId: string, trackSlug: string | null): Promise<string[]> {
    if (!trackSlug) {
      return [];
    }

    const stateResult = await this.db.query<LevelStateRankRow>(
      `SELECT max_unlocked_cefr_rank FROM student_level_state WHERE student_id = $1 AND track_slug = $2`,
      [studentId, trackSlug],
    );
    // No student_level_state row yet -> only rank-1 courses unlocked, same
    // fallback convention as P20-010's course-list/lesson-start gating.
    const maxUnlockedCefrRank = stateResult.rows[0]?.max_unlocked_cefr_rank ?? 1;

    const coursesResult = await this.db.query<PublishedCourseRow>(
      `SELECT id, cefr_rank FROM courses
       WHERE track_slug = $1 AND cefr_rank IS NOT NULL AND cefr_rank <= $2 AND status = 'published'
       ORDER BY cefr_rank ASC`,
      [trackSlug, maxUnlockedCefrRank],
    );

    return coursesResult.rows.map((row) => row.id);
  }

  private async resolveStudentTrackSlug(studentId: string): Promise<string | null> {
    const result = await this.db.query<StudentTrackRow>(
      `SELECT track_slug FROM student_level_state WHERE student_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [studentId],
    );
    return result.rows[0]?.track_slug ?? null;
  }

  private async highestRankedPublishedCourse(trackSlug: string | null): Promise<PublishedCourseRow | null> {
    const result = trackSlug
      ? await this.db.query<PublishedCourseRow>(
          `SELECT id, cefr_rank FROM courses
           WHERE track_slug = $1 AND cefr_rank IS NOT NULL AND status = 'published'
           ORDER BY cefr_rank DESC LIMIT 1`,
          [trackSlug],
        )
      : await this.db.query<PublishedCourseRow>(
          `SELECT id, cefr_rank FROM courses
           WHERE cefr_rank IS NOT NULL AND status = 'published'
           ORDER BY cefr_rank DESC LIMIT 1`,
        );
    return result.rows[0] ?? null;
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
