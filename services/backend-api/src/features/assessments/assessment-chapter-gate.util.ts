// Chapter-completion gate for chapter-linked assessments.
//
// An assessment with a non-null chapter_id is only visible/attemptable once
// every published lesson in that chapter is completed for the student.
// Assessments with chapter_id === null are not gated by this check at all.

import { DatabaseService } from '../../database/database.service';

interface ChapterLessonCountRow {
  readonly total: string;
  readonly completed_count: string;
}

/** True when every published lesson in the given chapter is completed for this student. */
export async function isChapterLessonsComplete(
  db: DatabaseService,
  studentId: string,
  chapterId: string,
): Promise<boolean> {
  const result = await db.query<ChapterLessonCountRow>(
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

interface CourseChapterCompletionRow {
  readonly chapter_id: string;
  readonly lessons_complete: boolean;
  readonly quizzes_passed: boolean;
}

/**
 * True when every published chapter in the course has all its published
 * lessons completed AND every published quiz assessment linked to that
 * chapter (assessments.chapter_id) has a passing result for the student.
 * A chapter with no quiz is vacuously "quizzes_passed". Used to gate a
 * course-level final exam (assessments.course_id).
 */
export async function isCourseChaptersComplete(
  db: DatabaseService,
  studentId: string,
  courseId: string,
): Promise<boolean> {
  const result = await db.query<CourseChapterCompletionRow>(
    `SELECT
       ch.id AS chapter_id,
       (
         (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id AND l.status = 'published') > 0
         AND
         (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id AND l.status = 'published')
         =
         (SELECT COUNT(*) FROM lessons l
            JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1 AND lp.completed
          WHERE l.chapter_id = ch.id AND l.status = 'published')
       ) AS lessons_complete,
       NOT EXISTS (
         SELECT 1 FROM assessments a
         WHERE a.chapter_id = ch.id AND a.type = 'quiz' AND a.status = 'published'
           AND NOT EXISTS (
             SELECT 1 FROM assessment_results ar
             WHERE ar.assessment_id = a.id AND ar.student_id = $1 AND ar.passed = true
           )
       ) AS quizzes_passed
     FROM chapters ch
     JOIN levels lv ON lv.id = ch.level_id
     WHERE lv.course_id = $2 AND ch.status = 'published' AND lv.status = 'published'`,
    [studentId, courseId],
  );

  if (result.rows.length === 0) return false;
  return result.rows.every((row) => row.lessons_complete && row.quizzes_passed);
}
