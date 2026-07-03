// LessonProgressService — sequential lesson ordering (P20-012).
//
// Investigation found no prior server-side check preventing a student from
// starting lesson N+1 while lesson N (by levels.sort_order,
// chapters.sort_order, lessons.sort_order) is incomplete — only P20-010's
// course-level cefr_rank gating existed. This is the regression coverage for
// the fix: recordProgress/markComplete now reject unless the immediately
// preceding lesson in the course is already completed.

import { ForbiddenException } from '@nestjs/common';
import { LessonProgressService } from '../lesson-progress.service';
import { DatabaseService } from '../../../database/database.service';
import { CourseCompletionService } from '../course-completion.service';

describe('LessonProgressService — sequential lesson ordering', () => {
  const makeCourseCompletionService = () =>
    ({ handleLessonCompleted: jest.fn().mockResolvedValue(undefined) }) as unknown as CourseCompletionService;

  // Full query sequence for a course-unlocked lesson with no track/cefr
  // mapping (so P20-010's gating short-circuits after one query), isolating
  // the sequential-ordering check:
  // 1. assertLessonExists
  // 2. assertCourseUnlockedForLesson (course has no track_slug/cefr_rank -> returns early)
  // 3. assertPreviousLessonCompleted — ordered_lessons lookup
  // 4. assertPreviousLessonCompleted — previous lesson's lesson_progress lookup (only if prev_lesson_id is not null)
  // 5. the INSERT itself (only if the previous lesson is completed)
  const makeDb = (prevLessonId: string | null, prevLessonCompleted: boolean, finalRows: unknown[] = []) => {
    const query = jest.fn().mockResolvedValueOnce({ rows: [{ id: 'lesson-2' }] }).mockResolvedValueOnce({
      rows: [{ track_slug: null, cefr_rank: null }],
    });

    if (prevLessonId === null) {
      query.mockResolvedValueOnce({ rows: [{ prev_lesson_id: null }] });
    } else {
      query
        .mockResolvedValueOnce({ rows: [{ prev_lesson_id: prevLessonId }] })
        .mockResolvedValueOnce({ rows: [{ completed: prevLessonCompleted }] });
    }

    query.mockResolvedValueOnce({ rows: finalRows });
    return { query, db: { query } as unknown as DatabaseService };
  };

  describe('recordProgress', () => {
    it('rejects lesson N+1 while the immediately preceding lesson is incomplete', async () => {
      const { db } = makeDb('lesson-1', false);
      const service = new LessonProgressService(db, makeCourseCompletionService());

      await expect(
        service.recordProgress({ studentId: 'student-1', lessonId: 'lesson-2', percent: 10 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects lesson N+1 when the preceding lesson has no progress row at all', async () => {
      const query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: 'lesson-2' }] })
        .mockResolvedValueOnce({ rows: [{ track_slug: null, cefr_rank: null }] })
        .mockResolvedValueOnce({ rows: [{ prev_lesson_id: 'lesson-1' }] })
        .mockResolvedValueOnce({ rows: [] }); // no lesson_progress row for the previous lesson
      const db = { query } as unknown as DatabaseService;
      const service = new LessonProgressService(db, makeCourseCompletionService());

      await expect(
        service.recordProgress({ studentId: 'student-1', lessonId: 'lesson-2', percent: 10 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows lesson N+1 once the immediately preceding lesson is completed', async () => {
      const { db } = makeDb('lesson-1', true, [
        { lesson_id: 'lesson-2', percent: 10, completed: false, updated_at: '2026-06-01T00:00:00Z' },
      ]);
      const service = new LessonProgressService(db, makeCourseCompletionService());

      const result = await service.recordProgress({
        studentId: 'student-1',
        lessonId: 'lesson-2',
        percent: 10,
      });

      expect(result.lessonId).toBe('lesson-2');
    });

    it('allows the first lesson in a course (no preceding lesson) unconditionally', async () => {
      const { db } = makeDb(null, false, [
        { lesson_id: 'lesson-2', percent: 10, completed: false, updated_at: '2026-06-01T00:00:00Z' },
      ]);
      const service = new LessonProgressService(db, makeCourseCompletionService());

      const result = await service.recordProgress({
        studentId: 'student-1',
        lessonId: 'lesson-2',
        percent: 10,
      });

      expect(result.lessonId).toBe('lesson-2');
    });
  });

  describe('markComplete', () => {
    it('rejects completing lesson N+1 while lesson N is incomplete', async () => {
      const { db } = makeDb('lesson-1', false);
      const service = new LessonProgressService(db, makeCourseCompletionService());

      await expect(service.markComplete('student-1', 'lesson-2')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('allows completing lesson N+1 once lesson N is completed', async () => {
      const { db } = makeDb('lesson-1', true, [
        { lesson_id: 'lesson-2', percent: 100, completed: true, updated_at: '2026-06-01T00:00:00Z' },
      ]);
      const service = new LessonProgressService(db, makeCourseCompletionService());

      const result = await service.markComplete('student-1', 'lesson-2');

      expect(result.completed).toBe(true);
    });
  });
});
