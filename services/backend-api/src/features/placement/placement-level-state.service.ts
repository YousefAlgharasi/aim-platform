// P20-006: PlacementLevelStateService.
//
// Scope: Seed student_level_state (P20-002) from a freshly completed
// placement result only. Does not compute mastery/level itself — it derives
// a course rank from the backend's already-computed estimated_level via the
// same LEVEL_TO_CEFR mapping PlacementInitialLearningPathService uses
// (P4-047), joined against courses.cefr_code/cefr_rank (P20-001).
//
// Placement-time exception (P20-011): max_unlocked_cefr_rank is set equal to
// current_cefr_rank here — the ONLY place in the codebase this is correct,
// because the student hasn't completed a course yet, so there is nothing to
// have "unlocked" via completion. Every other write path (P20-011's course
// completion gating) must never copy current_cefr_rank into
// max_unlocked_cefr_rank this way — that would silently re-grant access
// beyond what course completion has actually earned. Do not "fix" this
// exception into consistency with P20-011's rule; it is deliberate.
//
// Security rules:
//   - studentId is always the placement attempt's own student_id, resolved by
//     the caller — never accepted from client input.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LEVEL_TO_CEFR } from './placement-initial-learning-path.service';

interface MatchedCourseRow {
  readonly cefr_rank: number;
  readonly track_slug: string;
}

@Injectable()
export class PlacementLevelStateService {
  private readonly logger = new Logger(PlacementLevelStateService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Upsert student_level_state from a just-completed placement result.
   *
   * If no course exists yet for the derived CEFR code (e.g. estimated_level
   * maps to 'B1' but no B1 course has been created), this logs a warning and
   * skips the upsert rather than fabricating a rank or guessing a fallback —
   * a human needs to add that course/track data first.
   */
  async upsertFromPlacement(studentId: string, estimatedLevel: string): Promise<void> {
    const cefrCode = LEVEL_TO_CEFR[estimatedLevel];
    if (!cefrCode) {
      this.logger.warn('placement_level_state_unmapped_estimated_level', {
        studentId,
        estimatedLevel,
      });
      return;
    }

    // track_slug is read from the matched course row, not hardcoded — only
    // one track ('english') exists today, but this must not assume that.
    const courseResult = await this.db.query<MatchedCourseRow>(
      `SELECT cefr_rank, track_slug
       FROM courses
       WHERE cefr_code = $1 AND cefr_rank IS NOT NULL
       ORDER BY cefr_rank ASC
       LIMIT 1`,
      [cefrCode],
    );

    if ((courseResult.rowCount ?? 0) === 0) {
      this.logger.warn('placement_level_state_no_matching_course', {
        studentId,
        estimatedLevel,
        cefrCode,
      });
      return;
    }

    const { cefr_rank: cefrRank, track_slug: trackSlug } = courseResult.rows[0];

    // On first placement (no existing row) max_unlocked_cefr_rank is seeded
    // equal to current_cefr_rank — the P20-011 exception. On a retake
    // (row already exists), only current_cefr_rank/source/last_computed_at
    // are refreshed; max_unlocked_cefr_rank is left untouched so a retake
    // can never strip a ceiling the student already earned via completion
    // (P20-011 owns all further advancement of that field).
    await this.db.query(
      `INSERT INTO student_level_state
         (student_id, track_slug, current_cefr_rank, max_unlocked_cefr_rank, source, last_computed_at)
       VALUES ($1, $2, $3, $3, 'placement', now())
       ON CONFLICT (student_id, track_slug)
       DO UPDATE SET
         current_cefr_rank = EXCLUDED.current_cefr_rank,
         source = 'placement',
         last_computed_at = now(),
         updated_at = now()`,
      [studentId, trackSlug, cefrRank],
    );

    this.logger.log('placement_level_state_upserted', {
      studentId,
      trackSlug,
      cefrRank,
    });
  }
}
