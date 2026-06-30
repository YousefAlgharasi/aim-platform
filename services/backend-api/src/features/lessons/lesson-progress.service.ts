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

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
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
  constructor(private readonly db: DatabaseService) {}

  async recordProgress(input: RecordLessonProgressInput): Promise<LessonProgressAckResponse> {
    await this.assertLessonExists(input.lessonId);

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

    // Fallback: lowest sort_order published course.
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
      [studentId],
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

  private toAck(row: LessonProgressRow): LessonProgressAckResponse {
    return {
      lessonId: row.lesson_id,
      percent: row.percent,
      completed: row.completed,
      updatedAt: row.updated_at,
    };
  }
}
