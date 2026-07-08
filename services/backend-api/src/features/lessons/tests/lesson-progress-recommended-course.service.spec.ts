// LessonProgressService.findRecommendedCourse — regression test.
//
// The fallback query ("lowest sort_order published course") takes no
// query parameters, but was previously called with [studentId] anyway —
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
  it('calls the fallback query with no bind parameters', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // primary placement-path query: no result
      .mockResolvedValueOnce({
        rows: [
          {
            course_id: 'course-1',
            course_title: 'General English',
            course_description: 'A course',
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
    expect(fallbackArgs).toBeUndefined();
    expect(result).toEqual({
      courseId: 'course-1',
      courseTitle: 'General English',
      courseDescription: 'A course',
      estimatedLevel: null,
    });
  });
});
