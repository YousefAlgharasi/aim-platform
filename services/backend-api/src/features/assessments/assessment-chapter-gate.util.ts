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
