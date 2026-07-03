// CourseCompletionService (P20-011).
//
// Course completion gates the next unlock, independent of what was
// recommended: finishing a course only advances max_unlocked_cefr_rank when
// that course sits at the frontier of the student's current ceiling.

import { CourseCompletionService } from '../course-completion.service';
import { DatabaseService } from '../../../database/database.service';

describe('CourseCompletionService', () => {
  describe('isCourseComplete', () => {
    it('is false when there are zero published lessons in the course', async () => {
      const query = jest.fn().mockResolvedValue({ rows: [{ total: '0', completed_count: '0' }] });
      const service = new CourseCompletionService({ query } as unknown as DatabaseService);

      await expect(service.isCourseComplete('student-1', 'course-1')).resolves.toBe(false);
    });

    it('is false when some lessons are still incomplete', async () => {
      const query = jest.fn().mockResolvedValue({ rows: [{ total: '5', completed_count: '4' }] });
      const service = new CourseCompletionService({ query } as unknown as DatabaseService);

      await expect(service.isCourseComplete('student-1', 'course-1')).resolves.toBe(false);
    });

    it('is true when every lesson is completed', async () => {
      const query = jest.fn().mockResolvedValue({ rows: [{ total: '5', completed_count: '5' }] });
      const service = new CourseCompletionService({ query } as unknown as DatabaseService);

      await expect(service.isCourseComplete('student-1', 'course-1')).resolves.toBe(true);
    });
  });

  describe('handleLessonCompleted', () => {
    const makeService = (
      lessonCourseRows: unknown[],
      completionCountRows: unknown[],
      levelStateRows: unknown[],
      nextCourseRows: unknown[] = [],
    ) => {
      const query = jest
        .fn()
        .mockResolvedValueOnce({ rows: lessonCourseRows }) // lesson -> course lookup
        .mockResolvedValueOnce({ rows: completionCountRows }) // isCourseComplete count
        .mockResolvedValueOnce({ rows: levelStateRows }) // student_level_state lookup
        .mockResolvedValueOnce({ rows: nextCourseRows, rowCount: nextCourseRows.length }) // next-rank course existence check
        .mockResolvedValueOnce({ rows: [] }); // UPDATE student_level_state (if reached)
      return { query, service: new CourseCompletionService({ query } as unknown as DatabaseService) };
    };

    it('advances the ceiling by exactly one rank when the frontier course is fully completed', async () => {
      const { query, service } = makeService(
        [{ course_id: 'course-a2', track_slug: 'general-english', cefr_rank: 2 }],
        [{ total: '5', completed_count: '5' }],
        [{ max_unlocked_cefr_rank: 2 }],
        [{ '?column?': 1 }], // a published course exists at rank 3
      );

      await service.handleLessonCompleted('student-1', 'lesson-1');

      expect(query).toHaveBeenCalledTimes(5);
      const updateCall = query.mock.calls[4];
      expect(updateCall[0]).toMatch(/UPDATE student_level_state/);
      expect(updateCall[1]).toEqual(['student-1', 'general-english', 3]);
    });

    it('does not advance the ceiling when a lower, already-unlocked course is completed', async () => {
      const { query, service } = makeService(
        [{ course_id: 'course-a1', track_slug: 'general-english', cefr_rank: 1 }],
        [{ total: '5', completed_count: '5' }],
        [{ max_unlocked_cefr_rank: 2 }], // ceiling is already 2; completed course is rank 1, not the frontier
      );

      await service.handleLessonCompleted('student-1', 'lesson-1');

      // Only 3 queries: lesson->course lookup, completion count, level state lookup.
      // No next-rank check and no UPDATE — the ceiling must be left untouched.
      expect(query).toHaveBeenCalledTimes(3);
    });

    it('does not advance and does not error when no course exists yet at the next rank', async () => {
      const { query, service } = makeService(
        [{ course_id: 'course-a2', track_slug: 'general-english', cefr_rank: 2 }],
        [{ total: '5', completed_count: '5' }],
        [{ max_unlocked_cefr_rank: 2 }],
        [], // no published course at rank 3
      );

      await expect(service.handleLessonCompleted('student-1', 'lesson-1')).resolves.toBeUndefined();

      // 4 queries: lesson->course, completion count, level state, next-rank check.
      // No UPDATE issued.
      expect(query).toHaveBeenCalledTimes(4);
    });

    it('does not advance when the course is not yet 100% complete', async () => {
      const { query, service } = makeService(
        [{ course_id: 'course-a2', track_slug: 'general-english', cefr_rank: 2 }],
        [{ total: '5', completed_count: '4' }],
        [],
      );

      await service.handleLessonCompleted('student-1', 'lesson-1');

      // Only 2 queries: lesson->course lookup, completion count — stops there.
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('does nothing for a lesson whose course has no track_slug/cefr_rank mapping', async () => {
      const query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ course_id: 'course-x', track_slug: null, cefr_rank: null }] });
      const service = new CourseCompletionService({ query } as unknown as DatabaseService);

      await service.handleLessonCompleted('student-1', 'lesson-1');

      expect(query).toHaveBeenCalledTimes(1);
    });

    it('does not crash and does not advance when the student has no student_level_state row at all', async () => {
      const { query, service } = makeService(
        [{ course_id: 'course-a1', track_slug: 'general-english', cefr_rank: 1 }],
        [{ total: '5', completed_count: '5' }],
        [], // no row for this student/track
      );

      await expect(service.handleLessonCompleted('student-1', 'lesson-1')).resolves.toBeUndefined();

      // Stops after the level-state lookup — no fabricated insert.
      expect(query).toHaveBeenCalledTimes(3);
    });
  });
});
