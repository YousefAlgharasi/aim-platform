// ChapterCompletionService.
//
// Scope: Detects when a student has just finished every published lesson
// in a chapter, and — if that chapter has a gated assessment
// (assessments.chapter_id) — fires the "assessment unlocked" notification.
//
// This intentionally queries the `assessments` table directly with raw SQL
// (via DatabaseService) rather than importing AssessmentsModule: Assessments
// already depends on SessionsModule, which depends on LessonsModule, so a
// LessonsModule -> AssessmentsModule edge would form a module import cycle.
// A local read-only query is the same pattern CourseCompletionService in
// this file's sibling already uses for its own cross-table joins.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NotificationQueueService } from '../notifications/notification-queue.service';

interface ChapterLessonCountRow {
  readonly total: string;
  readonly completed_count: string;
}

interface LessonChapterRow {
  readonly chapter_id: string | null;
}

interface ChapterAssessmentRow {
  readonly id: string;
  readonly title: string;
}

interface ChapterRow {
  readonly title: string;
}

@Injectable()
export class ChapterCompletionService {
  private readonly logger = new Logger(ChapterCompletionService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  /** True when every published lesson in the chapter is completed for this student. */
  async isChapterComplete(studentId: string, chapterId: string): Promise<boolean> {
    const result = await this.db.query<ChapterLessonCountRow>(
      `WITH chapter_lessons AS (
         SELECT l.id FROM lessons l
         WHERE l.chapter_id = $2 AND l.status = 'published'
       )
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE lp.completed) AS completed_count
       FROM chapter_lessons cl
       LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.student_id = $1`,
      [studentId, chapterId],
    );
    const row = result.rows[0];
    const total = parseInt(row?.total ?? '0', 10);
    const completedCount = parseInt(row?.completed_count ?? '0', 10);
    return total > 0 && completedCount === total;
  }

  /**
   * Call only when a lesson transitions from not-completed to completed
   * (never on a repeat markComplete call for an already-completed lesson —
   * the caller is responsible for that check, so this never re-notifies).
   * If the lesson's chapter is now fully complete and has a published
   * chapter-linked assessment, enqueues the unlock notification.
   */
  async handleLessonNewlyCompleted(studentId: string, lessonId: string): Promise<void> {
    const lessonResult = await this.db.query<LessonChapterRow>(
      `SELECT chapter_id FROM lessons WHERE id = $1`,
      [lessonId],
    );
    const chapterId = lessonResult.rows[0]?.chapter_id;
    if (!chapterId) return;

    const complete = await this.isChapterComplete(studentId, chapterId);
    if (!complete) return;

    const assessments = await this.db.query<ChapterAssessmentRow>(
      `SELECT id, title FROM assessments WHERE chapter_id = $1 AND status = 'published'`,
      [chapterId],
    );
    if (assessments.rows.length === 0) return;

    const chapterResult = await this.db.query<ChapterRow>(
      `SELECT title FROM chapters WHERE id = $1`,
      [chapterId],
    );
    const chapterTitle = chapterResult.rows[0]?.title ?? '';

    for (const assessment of assessments.rows) {
      const variables = { assessment_title: assessment.title, chapter_title: chapterTitle };
      await this.notificationQueue.enqueue({
        userId: studentId,
        recipientType: 'student',
        templateKey: 'assessment_unlocked',
        channel: 'in_app',
        category: 'assessment_result',
        locale: 'en',
        variables,
      });
      await this.notificationQueue.enqueue({
        userId: studentId,
        recipientType: 'student',
        templateKey: 'assessment_unlocked',
        channel: 'push',
        category: 'assessment_result',
        locale: 'en',
        variables,
      });
    }

    this.logger.log('chapter_assessment_unlocked', { studentId, chapterId });
  }
}
