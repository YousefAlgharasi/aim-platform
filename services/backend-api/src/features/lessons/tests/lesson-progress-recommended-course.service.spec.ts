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

  it('binds the locale to the placement-path query, joins translations and returns the served locale', async () => {
    const query = jest.fn().mockResolvedValueOnce({
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

    const [sql, params] = query.mock.calls[0];
    expect(params).toEqual(['student-1', 'ar']);
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
