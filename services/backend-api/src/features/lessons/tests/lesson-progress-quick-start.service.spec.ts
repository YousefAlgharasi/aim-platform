// LessonProgressService.findQuickStartLesson: the lesson must come from the student's own course,
// not from a placement-skill match in some other (e.g. beginner) course.

import { LessonProgressService } from '../lesson-progress.service';
import { DatabaseService } from '../../../database/database.service';
import { CourseCompletionService } from '../course-completion.service';
import { ChapterCompletionService } from '../chapter-completion.service';

const lessonRow = { lesson_id: 'L-c1-1', lesson_title: 'Never Have I Seen...', lesson_description: 'd', lesson_locale: 'en', skill_name: null };

function make(query: jest.Mock) {
  return new LessonProgressService(
    { query } as unknown as DatabaseService,
    { handleLessonCompleted: jest.fn() } as unknown as CourseCompletionService,
    { handleLessonNewlyCompleted: jest.fn() } as unknown as ChapterCompletionService,
  );
}

describe('LessonProgressService.findQuickStartLesson', () => {
  it('returns the first unfinished lesson of the active enrollment, ignoring placement skills elsewhere', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [{ course_id: 'course-c1' }] }) // active enrollment
      .mockResolvedValueOnce({ rows: [lessonRow] }); // lesson in that course
    const result = await make(query).findQuickStartLesson('student-1', 'en');

    expect(result).toEqual({ lessonId: 'L-c1-1', lessonTitle: 'Never Have I Seen...', lessonDescription: 'd', locale: 'en', skillName: null });
    expect(query).toHaveBeenCalledTimes(2); // never reached the cross-course placement query
    const [sql, params] = query.mock.calls[1];
    expect(sql).toContain('lv.course_id = $3');
    expect(sql).toMatch(/ORDER BY lv\.sort_order ASC, c\.sort_order ASC, l\.sort_order ASC/);
    expect(params).toEqual(['student-1', 'en', 'course-c1']);
  });

  it('with no enrollment, uses the course that matches the placement level', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // no active enrollment
      .mockResolvedValueOnce({ rows: [{ estimated_level: 'advanced', max_unlocked: 5, source: 'placement', track_slug: 'english' }] }) // level context
      .mockResolvedValueOnce({ rows: [{ course_id: 'course-c1', course_title: 'C1.1', course_description: null, course_locale: 'en', estimated_level: null }] }) // recommended course
      .mockResolvedValueOnce({ rows: [lessonRow] });
    const result = await make(query).findQuickStartLesson('student-1', 'en');
    expect(result?.lessonId).toBe('L-c1-1');
    expect(query.mock.calls[3][1][2]).toBe('course-c1');
  });

  it('falls back to the old placement-path logic only when the course has nothing left', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [{ course_id: 'course-c1' }] })
      .mockResolvedValueOnce({ rows: [] }) // course finished
      .mockResolvedValueOnce({ rows: [{ ...lessonRow, lesson_id: 'L-path', skill_name: 'Grammar' }] }); // placement path
    const result = await make(query).findQuickStartLesson('student-1', 'en');
    expect(result?.lessonId).toBe('L-path');
  });
});
