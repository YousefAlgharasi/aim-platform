// LessonProgressService.
//
// Scope: Backend-owned per-student lesson progress tracking only.
//
// Security rules:
//   - studentId always JWT-resolved by the caller — never trusted from a
//     client body.
//   - percent is clamped to 0-100 server-side.
//   - completed is only ever set TRUE via markComplete; recordProgress can
//     never set it.
//   - Course/level gating (P20-010): recordProgress and markComplete are the
//     server-side mutation entry points for "starting"/advancing a lesson.
//     Both re-check that the lesson's course is unlocked for this student
//     (cefr_rank <= max_unlocked_cefr_rank for its track, defaulting to rank
//     1 when the student has no student_level_state row yet) and reject with
//     403 otherwise — a client showing a locked course as open must not be
//     able to write progress by guessing/hardcoding a lesson id.
//   - Course completion unlock (P20-011): markComplete is the only place
//     lesson_progress.completed is ever set to true, so it is the single
//     hook point for CourseCompletionService — see that file for the
//     frontier-only advancement rule.
//   - Sequential lesson ordering (P20-012): recordProgress and markComplete
//     reject a lesson unless the immediately preceding lesson in the course
//     (by levels.sort_order, chapters.sort_order, lessons.sort_order — the
//     first lesson in a chapter's predecessor being the last lesson of the
//     previous chapter) is already completed. A recommendation's
//     targetLessonId (P20-009) is read-only AI Teacher prompt context
//     (see CurrentLessonContextAdapter) and is never a path that starts or
//     unlocks a lesson — this check is the only gate on that.

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CourseCompletionService } from './course-completion.service';
import {
  ContinueLearningLesson,
  LessonProgressAckResponse,
  QuickStartLesson,
  RecommendedCourse,
  RecordLessonProgressInput,
} from './lesson-progress.types';

interface LessonProgressRow {
  readonly lesson_id: string;
  readonly percent: number;
  readonly completed: boolean;
  readonly updated_at: string;
}

interface LessonRow {
  readonly id: string;
}

interface LessonCourseGatingRow {
  readonly track_slug: string | null;
  readonly cefr_rank: number | null;
}

interface LevelStateRow {
  readonly max_unlocked_cefr_rank: number;
}

interface PreviousLessonRow {
  readonly prev_lesson_id: string | null;
}

interface LessonCompletedRow {
  readonly completed: boolean;
}

interface ContinueLearningRow {
  readonly lesson_id: string;
  readonly lesson_title: string;
  readonly percent: number;
  readonly last_active_at: string;
}

interface QuickStartLessonRow {
  readonly lesson_id: string;
  readonly lesson_title: string;
  readonly lesson_description: string;
  readonly skill_name: string | null;
}

interface RecommendedCourseRow {
  readonly course_id: string;
  readonly course_title: string;
  readonly course_description: string | null;
  readonly estimated_level: string | null;
}

@Injectable()
export class LessonProgressService {
  constructor(
    private readonly db: DatabaseService,
    private readonly courseCompletionService: CourseCompletionService,
  ) {}

  async recordProgress(input: RecordLessonProgressInput): Promise<LessonProgressAckResponse> {
    await this.assertLessonExists(input.lessonId);
    await this.assertCourseUnlockedForLesson(input.studentId, input.lessonId);
    await this.assertPreviousLessonCompleted(input.studentId, input.lessonId);

    const safePercent = Math.min(Math.max(Math.round(input.percent), 0), 100);

    const result = await this.db.query<LessonProgressRow>(
      `INSERT INTO lesson_progress (student_id, lesson_id, percent, last_active_at)
            VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, lesson_id)
         DO UPDATE SET
            percent = GREATEST(lesson_progress.percent, EXCLUDED.percent),
            last_active_at = NOW(),
            updated_at = NOW()
       RETURNING lesson_id, percent, completed, updated_at`,
      [input.studentId, input.lessonId, safePercent],
    );

    return this.toAck(result.rows[0]);
  }

  async markComplete(studentId: string, lessonId: string): Promise<LessonProgressAckResponse> {
    await this.assertLessonExists(lessonId);
    await this.assertCourseUnlockedForLesson(studentId, lessonId);
    await this.assertPreviousLessonCompleted(studentId, lessonId);

    const result = await this.db.query<LessonProgressRow>(
      `INSERT INTO lesson_progress (student_id, lesson_id, percent, completed, completed_at, last_active_at)
            VALUES ($1, $2, 100, TRUE, NOW(), NOW())
       ON CONFLICT (student_id, lesson_id)
         DO UPDATE SET
            percent = 100,
            completed = TRUE,
            completed_at = COALESCE(lesson_progress.completed_at, NOW()),
            last_active_at = NOW(),
            updated_at = NOW()
       RETURNING lesson_id, percent, completed, updated_at`,
      [studentId, lessonId],
    );

    await this.courseCompletionService.handleLessonCompleted(studentId, lessonId);

    return this.toAck(result.rows[0]);
  }

  async findContinueLearningLesson(studentId: string): Promise<ContinueLearningLesson | null> {
    const result = await this.db.query<ContinueLearningRow>(
      `SELECT lp.lesson_id, l.title AS lesson_title, lp.percent, lp.last_active_at
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.student_id = $1 AND lp.completed = false
       ORDER BY lp.last_active_at DESC
       LIMIT 1`,
      [studentId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      lessonId: row.lesson_id,
      lessonTitle: row.lesson_title,
      percent: row.percent,
      lastActiveAt: row.last_active_at,
    };
  }

  /**
   * Returns the next unpublished lesson the student should start, derived from
   * their latest placement result's initial_learning_path. Falls back to the
   * first published lesson (by course/level/chapter/lesson sort_order) if no
   * placement data exists or all path-linked lessons are already completed.
   */
  async findQuickStartLesson(studentId: string): Promise<QuickStartLesson | null> {
    // Placement-path derived: top-priority skill from student's latest placement
    // -> lesson_skills -> first published incomplete lesson for that skill.
    const pathResult = await this.db.query<QuickStartLessonRow>(
      `WITH latest_result AS (
         SELECT pr.id AS placement_result_id
         FROM placement_results pr
         WHERE pr.student_id = $1
         ORDER BY pr.created_at DESC
         LIMIT 1
       ),
       path_skills AS (
         SELECT ilp.skill_id, ilp.skill_name, ilp.priority
         FROM initial_learning_path ilp
         JOIN latest_result lr ON lr.placement_result_id = ilp.placement_result_id
         WHERE ilp.skill_id IS NOT NULL
         ORDER BY ilp.priority ASC
       )
       SELECT
         l.id   AS lesson_id,
         l.title AS lesson_title,
         l.description AS lesson_description,
         ps.skill_name AS skill_name
       FROM path_skills ps
       JOIN lesson_skills ls ON ls.skill_id = ps.skill_id
       JOIN lessons l ON l.id = ls.lesson_id AND l.status = 'published'
       JOIN chapters c ON c.id = l.chapter_id
       JOIN levels lv ON lv.id = c.level_id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1
       WHERE (lp.completed IS NULL OR lp.completed = false)
       ORDER BY ps.priority ASC, lv.sort_order ASC, c.sort_order ASC, l.sort_order ASC
       LIMIT 1`,
      [studentId],
    );

    if (pathResult.rows.length > 0) {
      const row = pathResult.rows[0];
      return {
        lessonId: row.lesson_id,
        lessonTitle: row.lesson_title,
        lessonDescription: row.lesson_description,
        skillName: row.skill_name,
      };
    }

    // Fallback: first published lesson with no completed progress, ordered by hierarchy.
    const fallbackResult = await this.db.query<QuickStartLessonRow>(
      `SELECT
         l.id AS lesson_id,
         l.title AS lesson_title,
         l.description AS lesson_description,
         NULL::text AS skill_name
       FROM lessons l
       JOIN chapters c ON c.id = l.chapter_id
       JOIN levels lv ON lv.id = c.level_id
       JOIN courses co ON co.id = lv.course_id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1
       WHERE l.status = 'published'
         AND (lp.completed IS NULL OR lp.completed = false)
       ORDER BY co.sort_order ASC, lv.sort_order ASC, c.sort_order ASC, l.sort_order ASC
       LIMIT 1`,
      [studentId],
    );

    const fallback = fallbackResult.rows[0];
    if (!fallback) return null;

    return {
      lessonId: fallback.lesson_id,
      lessonTitle: fallback.lesson_title,
      lessonDescription: fallback.lesson_description,
      skillName: null,
    };
  }

  /**
   * Returns the course most strongly recommended for this student based on
   * their latest placement result's initial_learning_path. Falls back to the
   * first published course by sort_order when no placement data exists.
   */
  async findRecommendedCourse(studentId: string): Promise<RecommendedCourse | null> {
    const pathResult = await this.db.query<RecommendedCourseRow>(
      `WITH latest_result AS (
         SELECT pr.id AS placement_result_id
         FROM placement_results pr
         WHERE pr.student_id = $1
         ORDER BY pr.created_at DESC
         LIMIT 1
       ),
       path_courses AS (
         SELECT
           co.id   AS course_id,
           co.title AS course_title,
           co.description AS course_description,
           MIN(ilp.priority) AS min_priority,
           MIN(ilp.estimated_level) AS estimated_level
         FROM initial_learning_path ilp
         JOIN latest_result lr ON lr.placement_result_id = ilp.placement_result_id
         JOIN lesson_skills ls ON ls.skill_id = ilp.skill_id
         JOIN lessons l ON l.id = ls.lesson_id AND l.status = 'published'
         JOIN chapters c ON c.id = l.chapter_id
         JOIN levels lv ON lv.id = c.level_id
         JOIN courses co ON co.id = lv.course_id AND co.status = 'published'
         WHERE ilp.skill_id IS NOT NULL
         GROUP BY co.id, co.title, co.description
       )
       SELECT course_id, course_title, course_description, estimated_level
       FROM path_courses
       ORDER BY min_priority ASC
       LIMIT 1`,
      [studentId],
    );

    if (pathResult.rows.length > 0) {
      const row = pathResult.rows[0];
      return {
        courseId: row.course_id,
        courseTitle: row.course_title,
        courseDescription: row.course_description,
        estimatedLevel: row.estimated_level,
      };
    }

    // Fallback: lowest sort_order published course. Not filtered by
    // student — takes no query parameters.
    const fallbackResult = await this.db.query<RecommendedCourseRow>(
      `SELECT
         id   AS course_id,
         title AS course_title,
         description AS course_description,
         NULL::text AS estimated_level
       FROM courses
       WHERE status = 'published'
       ORDER BY sort_order ASC, created_at ASC
       LIMIT 1`,
    );

    const fallback = fallbackResult.rows[0];
    if (!fallback) return null;

    return {
      courseId: fallback.course_id,
      courseTitle: fallback.course_title,
      courseDescription: fallback.course_description,
      estimatedLevel: null,
    };
  }

  private async assertLessonExists(lessonId: string): Promise<void> {
    const result = await this.db.query<LessonRow>(
      `SELECT id FROM lessons WHERE id = $1`,
      [lessonId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Lesson not found');
    }
  }

  /**
   * P20-010 course gating check, shared with other student-facing features
   * (e.g. the sessions feature's lesson question delivery) so the CEFR
   * unlock ceiling is enforced by one implementation, not duplicated.
   * Throws 403 when the lesson's course is above the student's unlocked
   * CEFR rank for its track (default rank 1 when no state row exists).
   */
  async assertCourseUnlockedForLesson(studentId: string, lessonId: string): Promise<void> {
    const courseResult = await this.db.query<LessonCourseGatingRow>(
      `SELECT co.track_slug, co.cefr_rank
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

    const stateResult = await this.db.query<LevelStateRow>(
      `SELECT max_unlocked_cefr_rank FROM student_level_state WHERE student_id = $1 AND track_slug = $2`,
      [studentId, course.track_slug],
    );

    const maxUnlockedCefrRank = stateResult.rows[0]?.max_unlocked_cefr_rank ?? 1;
    if (course.cefr_rank > maxUnlockedCefrRank) {
      throw new ForbiddenException('This course is locked for this student');
    }
  }

  private async assertPreviousLessonCompleted(studentId: string, lessonId: string): Promise<void> {
    const previousResult = await this.db.query<PreviousLessonRow>(
      `WITH target AS (
         SELECT lv.course_id
         FROM lessons l
         JOIN chapters c ON c.id = l.chapter_id
         JOIN levels lv ON lv.id = c.level_id
         WHERE l.id = $1
       ),
       ordered_lessons AS (
         SELECT
           l.id AS lesson_id,
           LAG(l.id) OVER (ORDER BY lv.sort_order ASC, c.sort_order ASC, l.sort_order ASC) AS prev_lesson_id
         FROM lessons l
         JOIN chapters c ON c.id = l.chapter_id AND c.status = 'published'
         JOIN levels lv ON lv.id = c.level_id AND lv.status = 'published'
         JOIN target t ON t.course_id = lv.course_id
         WHERE l.status = 'published'
       )
       SELECT prev_lesson_id FROM ordered_lessons WHERE lesson_id = $1`,
      [lessonId],
    );

    const prevLessonId = previousResult.rows[0]?.prev_lesson_id ?? null;
    if (prevLessonId === null) {
      // First lesson in the course (by level/chapter/lesson sort_order) — no prerequisite.
      return;
    }

    const progressResult = await this.db.query<LessonCompletedRow>(
      `SELECT completed FROM lesson_progress WHERE student_id = $1 AND lesson_id = $2`,
      [studentId, prevLessonId],
    );

    if (!progressResult.rows[0]?.completed) {
      throw new ForbiddenException('Complete the previous lesson before starting this one');
    }
  }

  private toAck(row: LessonProgressRow): LessonProgressAckResponse {
    return {
      lessonId: row.lesson_id,
      percent: row.percent,
      completed: row.completed,
      updatedAt: row.updated_at,
    };
  }
}
