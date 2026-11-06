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
import { PLACEMENT_BUCKET_TO_CEFR_RANK } from './placement-result-read.service';

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
    // Use the exact starting-course rank for the placement bucket (the same
    // map the result page uses). LEVEL_TO_CEFR is a coarse A1/A2/B1 set for
    // initial_learning_path and caps at B1, which silently demoted
    // upper_intermediate/advanced students to rank 7.
    const targetRank = PLACEMENT_BUCKET_TO_CEFR_RANK[estimatedLevel];
    if (targetRank === undefined) {
      this.logger.warn('placement_level_state_unmapped_estimated_level', {
        studentId,
        estimatedLevel,
      });
      return;
    }

    // track_slug is read from the matched course row, not hardcoded.
    const courseResult = await this.db.query<MatchedCourseRow>(
      `SELECT cefr_rank, track_slug
       FROM courses
       WHERE cefr_rank = $1 AND status = 'published'
       ORDER BY (track_slug = 'english') DESC, track_slug
       LIMIT 1`,
      [targetRank],
    );

    if ((courseResult.rowCount ?? 0) === 0) {
      this.logger.warn('placement_level_state_no_matching_course', {
        studentId,
        estimatedLevel,
        targetRank,
      });
      return;
    }

    const { cefr_rank: cefrRank, track_slug: trackSlug } = courseResult.rows[0];

    // Resolve student_profiles.id (student_level_state.student_id references student_profiles.id, not users.id)
    const profileResult = await this.db.query<{ id: string }>(
      `SELECT id FROM student_profiles WHERE id = $1 OR user_id = $1 LIMIT 1`,
      [studentId],
    );
    const targetStudentId = profileResult.rows[0]?.id ?? studentId;

    // On first placement (no existing row) max_unlocked_cefr_rank is seeded
    // equal to current_cefr_rank — the P20-011 exception. On a later
    // placement (row already exists, e.g. a "start from scratch" student who
    // now takes the test, or a retake after the cooldown) the ceiling can only
    // go UP: GREATEST keeps any ceiling already earned via completion, while a
    // better placement result raises it.
    await this.db.query(
      `INSERT INTO student_level_state
         (student_id, track_slug, current_cefr_rank, max_unlocked_cefr_rank, source, last_computed_at)
       VALUES ($1, $2, $3, $3, 'placement', now())
       ON CONFLICT (student_id, track_slug)
       DO UPDATE SET
         current_cefr_rank = EXCLUDED.current_cefr_rank,
         max_unlocked_cefr_rank = GREATEST(student_level_state.max_unlocked_cefr_rank, EXCLUDED.max_unlocked_cefr_rank),
         source = 'placement',
         last_computed_at = now(),
         updated_at = now()`,
      [targetStudentId, trackSlug, cefrRank],
    );

    this.logger.log('placement_level_state_upserted', {
      studentId,
      trackSlug,
      cefrRank,
    });
  }
}
