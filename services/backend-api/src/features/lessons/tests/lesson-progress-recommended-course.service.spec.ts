// LessonProgressService.findRecommendedCourse — regression test.
//
// The fallback query ("lowest sort_order published course") takes only the
// locale parameter; it was previously called with [studentId] anyway —
// a mismatch that Postgres rejects at bind time ("bind message supplies
// 1 parameters, but prepared statement requires 0"), surfacing as a
// silent 500 on GET /lessons/recommended-course whenever a student has
// no placement result (i.e. every new student, since the fallback only
// runs when the primary placement-based query returns nothing).

import { LessonProgressService } from '../lesson-progress.service';
import { DatabaseService } from '../../../database/database.service';
import { CourseCompletionService } from '../course-completion.service';
import { ChapterCompletionService } from '../chapter-completion.service';

describe('LessonProgressService.findRecommendedCourse — fallback query', () => {
  it('calls the fallback query with only the locale as bind parameter', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // primary placement-path query: no result
      .mockResolvedValueOnce({
        rows: [
          {
            course_id: 'course-1',
            course_title: 'General English',
            course_description: 'A course',
            course_locale: 'en',
            estimated_level: null,
          },
        ],
      });
    const db = { query } as unknown as DatabaseService;
    const courseCompletionService = {
      handleLessonCompleted: jest.fn().mockResolvedValue(undefined),
    } as unknown as CourseCompletionService;
    const chapterCompletionService = {
      handleLessonNewlyCompleted: jest.fn().mockResolvedValue(undefined),
    } as unknown as ChapterCompletionService;
    const service = new LessonProgressService(db, courseCompletionService, chapterCompletionService);

    const result = await service.findRecommendedCourse('student-1');

    expect(query).toHaveBeenCalledTimes(2);
    const [, fallbackArgs] = query.mock.calls[1];
    expect(fallbackArgs).toEqual(['en']);
    expect(result).toEqual({
      courseId: 'course-1',
      courseTitle: 'General English',
      courseDescription: 'A course',
      locale: 'en',
      estimatedLevel: null,
    });
  });
});

describe('LessonProgressService.findRecommendedCourse — locale', () => {
  function makeService(query: jest.Mock) {
    return new LessonProgressService(
      { query } as unknown as DatabaseService,
      {} as unknown as CourseCompletionService,
      {} as unknown as ChapterCompletionService,
    );
  }

  const ctxRow = (over: Record<string, unknown> = {}) => ({
    rows: [{ estimated_level: 'advanced', max_unlocked: 14, source: 'placement', track_slug: 'english', ...over }],
  });

  it('recommends the course at the placed level (advanced -> rank 14), not the first course', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(ctxRow())
      .mockResolvedValueOnce({
        rows: [{ course_id: 'c1-1', course_title: 'Advanced 1', course_description: null, course_locale: 'en', estimated_level: null }],
      });
    const result = await makeService(query).findRecommendedCourse('student-1');
    const [sql, params] = query.mock.calls[1];
    expect(params).toEqual([14, 'en', 'english']);
    expect(sql).toContain('co.cefr_rank <= $1');
    expect(result).toMatchObject({ courseId: 'c1-1', estimatedLevel: 'advanced' });
  });

  it('start-from-scratch students stay on their ceiling even though the seeded result says beginner', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(ctxRow({ estimated_level: 'beginner', max_unlocked: 1, source: 'scratch' }))
      .mockResolvedValueOnce({
        rows: [{ course_id: 's', course_title: 'Starter', course_description: null, course_locale: 'en', estimated_level: null }],
      });
    await makeService(query).findRecommendedCourse('student-1');
    expect(query.mock.calls[1][1]).toEqual([1, 'en', 'english']);
  });

  it('advances the recommendation with the unlock ceiling after course completion', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(ctxRow({ estimated_level: 'intermediate', max_unlocked: 9 }))
      .mockResolvedValueOnce({
        rows: [{ course_id: 'x', course_title: 'X', course_description: null, course_locale: 'en', estimated_level: null }],
      });
    await makeService(query).findRecommendedCourse('student-1');
    expect(query.mock.calls[1][1][0]).toBe(9);
  });

  it('binds the locale to the level query, joins translations and returns the served locale', async () => {
    const query = jest.fn().mockResolvedValueOnce(ctxRow()).mockResolvedValueOnce({
      rows: [
        {
          course_id: 'course-1',
          course_title: 'الإنجليزية',
          course_description: 'وصف',
          course_locale: 'ar',
          estimated_level: 'A1',
        },
      ],
    });

    const result = await makeService(query).findRecommendedCourse('student-1', 'ar');

    const [sql, params] = query.mock.calls[1];
    expect(params).toEqual([14, 'ar', 'english']);
    expect(sql).toContain('course_translations co_ct_req');
    expect(sql).toContain("co_ct_en.locale = 'en'");
    expect(result).toMatchObject({ courseTitle: 'الإنجليزية', locale: 'ar' });
  });

  it('binds the locale to the fallback query and falls back to English joins', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ course_id: 'c', course_title: 'T', course_description: null, course_locale: 'en', estimated_level: null }],
      });

    const result = await makeService(query).findRecommendedCourse('student-1', 'ar');

    const [sql, params] = query.mock.calls[1];
    expect(params).toEqual(['ar']);
    expect(sql).toContain("co_ct_en.locale = 'en'");
    expect(result?.locale).toBe('en');
  });
});
