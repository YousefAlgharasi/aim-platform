// LessonProgressService — course/level gating (P20-010).
//
// recordProgress and markComplete must reject writes into a lesson whose
// course is locked for the student (cefr_rank > max_unlocked_cefr_rank for
// its track), independent of what the client shows.

import { ForbiddenException } from '@nestjs/common';
import { LessonProgressService } from '../lesson-progress.service';
import { DatabaseService } from '../../../database/database.service';

describe('LessonProgressService — course/level gating', () => {
  const makeDb = (
    lessonExistsRows: unknown[],
    courseGatingRows: unknown[],
    levelStateRows: unknown[],
    finalRows: unknown[] = [],
  ) => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: lessonExistsRows })
      .mockResolvedValueOnce({ rows: courseGatingRows })
      .mockResolvedValueOnce({ rows: levelStateRows })
      .mockResolvedValueOnce({ rows: finalRows });
    return { query, db: { query } as unknown as DatabaseService };
  };

  describe('recordProgress', () => {
    it('rejects when the lesson course cefr_rank exceeds the student max_unlocked_cefr_rank', async () => {
      const { db } = makeDb(
        [{ id: 'lesson-1' }],
        [{ track_slug: 'general-english', cefr_rank: 3 }],
        [{ max_unlocked_cefr_rank: 2 }],
      );
      const service = new LessonProgressService(db);

      await expect(
        service.recordProgress({ studentId: 'student-1', lessonId: 'lesson-1', percent: 50 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects using the rank-1-only fallback when the student has no student_level_state row yet', async () => {
      const { db } = makeDb(
        [{ id: 'lesson-1' }],
        [{ track_slug: 'general-english', cefr_rank: 2 }],
        [],
      );
      const service = new LessonProgressService(db);

      await expect(
        service.recordProgress({ studentId: 'student-1', lessonId: 'lesson-1', percent: 50 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows progress when cefr_rank is within the unlocked range', async () => {
      const { db, query } = makeDb(
        [{ id: 'lesson-1' }],
        [{ track_slug: 'general-english', cefr_rank: 2 }],
        [{ max_unlocked_cefr_rank: 2 }],
        [{ lesson_id: 'lesson-1', percent: 50, completed: false, updated_at: '2026-06-01T00:00:00Z' }],
      );
      const service = new LessonProgressService(db);

      const result = await service.recordProgress({
        studentId: 'student-1',
        lessonId: 'lesson-1',
        percent: 50,
      });

      expect(result.lessonId).toBe('lesson-1');
      expect(query).toHaveBeenCalledTimes(4);
    });

    it('allows progress when the course has no track_slug/cefr_rank mapping', async () => {
      // No student_level_state lookup happens when the course itself has no
      // track_slug/cefr_rank mapping, so only 3 queries are issued (lesson
      // existence, course gating lookup, the progress INSERT) — not 4.
      const query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: 'lesson-1' }] })
        .mockResolvedValueOnce({ rows: [{ track_slug: null, cefr_rank: null }] })
        .mockResolvedValueOnce({
          rows: [{ lesson_id: 'lesson-1', percent: 50, completed: false, updated_at: '2026-06-01T00:00:00Z' }],
        });
      const db = { query } as unknown as DatabaseService;
      const service = new LessonProgressService(db);

      const result = await service.recordProgress({
        studentId: 'student-1',
        lessonId: 'lesson-1',
        percent: 50,
      });

      expect(result.lessonId).toBe('lesson-1');
    });
  });

  describe('markComplete', () => {
    it('rejects when the lesson course is locked for the student', async () => {
      const { db } = makeDb(
        [{ id: 'lesson-1' }],
        [{ track_slug: 'general-english', cefr_rank: 3 }],
        [{ max_unlocked_cefr_rank: 1 }],
      );
      const service = new LessonProgressService(db);

      await expect(service.markComplete('student-1', 'lesson-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('allows completion when cefr_rank is within the unlocked range', async () => {
      const { db } = makeDb(
        [{ id: 'lesson-1' }],
        [{ track_slug: 'general-english', cefr_rank: 1 }],
        [{ max_unlocked_cefr_rank: 2 }],
        [{ lesson_id: 'lesson-1', percent: 100, completed: true, updated_at: '2026-06-01T00:00:00Z' }],
      );
      const service = new LessonProgressService(db);

      const result = await service.markComplete('student-1', 'lesson-1');

      expect(result.completed).toBe(true);
    });
  });
});
