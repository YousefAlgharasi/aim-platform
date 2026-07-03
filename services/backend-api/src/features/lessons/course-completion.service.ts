// CourseCompletionService (P20-011).
//
// Scope: Course completion gates the *next* unlock, independent of what was
// recommended. A course only counts as "done" once every published lesson
// in it is completed for that student. Finishing a course only advances
// student_level_state.max_unlocked_cefr_rank when that course sits at the
// frontier of the student's current unlock ceiling (cefr_rank ===
// max_unlocked_cefr_rank) — finishing a lower course the student chose to
// start below their recommendation must never re-advance the ceiling.
//
// Placement-time exception: on first placement, max_unlocked_cefr_rank is
// seeded to the recommended course's rank without a completion having
// happened (see PlacementLevelStateService). That is a deliberate one-time
// exception to this file's "only completion advances the ceiling" rule —
// this file must never replicate that shortcut.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface CourseCompletionCountRow {
  readonly total: string;
  readonly completed_count: string;
}

interface LessonCourseRow {
  readonly course_id: string;
  readonly track_slug: string | null;
  readonly cefr_rank: number | null;
}

interface LevelStateRow {
  readonly max_unlocked_cefr_rank: number;
}

@Injectable()
export class CourseCompletionService {
  private readonly logger = new Logger(CourseCompletionService.name);

  constructor(private readonly db: DatabaseService) {}

  /** True when every published lesson (under every published chapter/level) in the course is completed for this student. */
  async isCourseComplete(studentId: string, courseId: string): Promise<boolean> {
    const result = await this.db.query<CourseCompletionCountRow>(
      `WITH course_lessons AS (
         SELECT l.id
         FROM lessons l
         JOIN chapters c ON c.id = l.chapter_id
         JOIN levels lv ON lv.id = c.level_id
         WHERE lv.course_id = $2
           AND l.status = 'published'
           AND c.status = 'published'
           AND lv.status = 'published'
       )
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE lp.completed) AS completed_count
       FROM course_lessons cl
       LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.student_id = $1`,
      [studentId, courseId],
    );

    const row = result.rows[0];
    const total = parseInt(row?.total ?? '0', 10);
    const completedCount = parseInt(row?.completed_count ?? '0', 10);
    return total > 0 && completedCount === total;
  }

  /**
   * Call after a lesson is marked complete. If the just-completed lesson's
   * course is now 100% complete AND that course is at the frontier of the
   * student's current unlock ceiling, advances max_unlocked_cefr_rank to the
   * next rank in that track — only if a published course exists there yet.
   */
  async handleLessonCompleted(studentId: string, lessonId: string): Promise<void> {
    const courseResult = await this.db.query<LessonCourseRow>(
      `SELECT lv.course_id, co.track_slug, co.cefr_rank
       FROM lessons l
       JOIN chapters c ON c.id = l.chapter_id
       JOIN levels lv ON lv.id = c.level_id
       JOIN courses co ON co.id = lv.course_id
       WHERE l.id = $1`,
      [lessonId],
    );

    const course = courseResult.rows[0];
    if (!course || course.track_slug === null || course.cefr_rank === null) {
      return;
    }

    const complete = await this.isCourseComplete(studentId, course.course_id);
    if (!complete) {
      return;
    }

    const stateResult = await this.db.query<LevelStateRow>(
      `SELECT max_unlocked_cefr_rank FROM student_level_state WHERE student_id = $1 AND track_slug = $2`,
      [studentId, course.track_slug],
    );

    const maxUnlockedCefrRank = stateResult.rows[0]?.max_unlocked_cefr_rank;
    if (maxUnlockedCefrRank === undefined) {
      // No student_level_state row yet. Gating (P20-010) treats this as
      // "only rank 1 unlocked" so completing a rank-1 course here is a real
      // frontier completion — but we don't fabricate a current_cefr_rank to
      // satisfy the NOT NULL column via an insert; that value belongs to
      // placement/AIM-engine computation, not this file. Log and skip.
      this.logger.warn('course_completion_no_level_state_row', {
        studentId,
        trackSlug: course.track_slug,
      });
      return;
    }

    if (course.cefr_rank !== maxUnlockedCefrRank) {
      // Not the frontier course — either already below the ceiling (student
      // started lower than recommended) or, impossible under P20-010's
      // gating, above it. Either way, do not touch the ceiling.
      return;
    }

    const nextRank = course.cefr_rank + 1;
    const nextCourseResult = await this.db.query(
      `SELECT 1 FROM courses WHERE track_slug = $1 AND cefr_rank = $2 AND status = 'published' LIMIT 1`,
      [course.track_slug, nextRank],
    );

    if ((nextCourseResult.rowCount ?? 0) === 0) {
      // No course exists yet at the next rank — leave the ceiling as the
      // highest currently available; this is not an error.
      return;
    }

    await this.db.query(
      `UPDATE student_level_state
       SET max_unlocked_cefr_rank = $3,
           source = 'aim_engine',
           last_computed_at = now(),
           updated_at = now()
       WHERE student_id = $1 AND track_slug = $2`,
      [studentId, course.track_slug, nextRank],
    );

    this.logger.log('course_completion_advanced_unlock_ceiling', {
      studentId,
      trackSlug: course.track_slug,
      newMaxUnlockedCefrRank: nextRank,
    });
  }
}
