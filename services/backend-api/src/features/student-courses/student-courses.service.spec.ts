import { StudentCoursesRepository } from './student-courses.repository';
import { StudentCoursesService } from './student-courses.service';

describe('StudentCoursesService', () => {
  const makeRepository = (rows: unknown[]) =>
    ({
      findCoursesWithProgress: jest.fn().mockResolvedValue(rows),
    }) as unknown as StudentCoursesRepository;

  it('returns an empty list when there are no published courses', async () => {
    const service = new StudentCoursesService(makeRepository([]));

    const result = await service.getCourses('student-1');

    expect(result.courses).toEqual([]);
  });

  it('marks a course completed when completedLessonCount equals lessonCount', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-1',
          title: 'English for Beginners (A1)',
          description: 'Start your journey.',
          sort_order: 1,
          level_code: 'A1',
          lesson_count: '24',
          completed_lesson_count: '24',
          track_slug: null,
          cefr_rank: null,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses).toEqual([
      {
        courseId: 'course-1',
        title: 'English for Beginners (A1)',
        description: 'Start your journey.',
        levelCode: 'A1',
        lessonCount: 24,
        completedLessonCount: 24,
        quizCount: 0,
        examCount: 0,
        percent: 100,
        status: 'completed',
        locked: false,
      },
    ]);
  });

  it('marks a course in_progress when some but not all lessons are complete', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-2',
          title: 'Elementary English (A2)',
          description: null,
          sort_order: 2,
          level_code: 'A2',
          lesson_count: '18',
          completed_lesson_count: '4',
          track_slug: null,
          cefr_rank: null,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0]).toEqual({
      courseId: 'course-2',
      title: 'Elementary English (A2)',
      description: null,
      levelCode: 'A2',
      lessonCount: 18,
      completedLessonCount: 4,
      quizCount: 0,
      examCount: 0,
      percent: 22, // round(4/18*100) = 22.22 -> 22
      status: 'in_progress',
      locked: false,
    });
  });

  it('marks a course not_started when no lessons are complete', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-3',
          title: 'Pre-Intermediate English (A3)',
          description: null,
          sort_order: 3,
          level_code: 'A3',
          lesson_count: '18',
          completed_lesson_count: '0',
          track_slug: null,
          cefr_rank: null,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0].status).toBe('not_started');
    expect(result.courses[0].percent).toBe(0);
  });

  it('treats a course with zero published lessons as not_started with 0 percent (no divide-by-zero)', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-4',
          title: 'Empty Course',
          description: null,
          sort_order: 4,
          level_code: null,
          lesson_count: '0',
          completed_lesson_count: '0',
          track_slug: null,
          cefr_rank: null,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0]).toEqual({
      courseId: 'course-4',
      title: 'Empty Course',
      description: null,
      levelCode: null,
      lessonCount: 0,
      completedLessonCount: 0,
      quizCount: 0,
      examCount: 0,
      percent: 0,
      status: 'not_started',
      locked: false,
    });
  });

  it('locks a course whose cefr_rank exceeds the student max_unlocked_cefr_rank for its track', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-a3',
          title: 'Pre-Intermediate English (A3)',
          description: null,
          sort_order: 3,
          level_code: 'A3',
          lesson_count: '18',
          completed_lesson_count: '0',
          track_slug: 'general-english',
          cefr_rank: 3,
          max_unlocked_cefr_rank: 2,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0].locked).toBe(true);
  });

  it('unlocks a course whose cefr_rank is within the student max_unlocked_cefr_rank for its track', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-a2',
          title: 'Elementary English (A2)',
          description: null,
          sort_order: 2,
          level_code: 'A2',
          lesson_count: '18',
          completed_lesson_count: '0',
          track_slug: 'general-english',
          cefr_rank: 2,
          max_unlocked_cefr_rank: 2,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0].locked).toBe(false);
  });

  it('falls back to only rank-1 courses unlocked when the student has no student_level_state row yet', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-a1',
          title: 'English for Beginners (A1)',
          description: null,
          sort_order: 1,
          level_code: 'A1',
          lesson_count: '18',
          completed_lesson_count: '0',
          track_slug: 'general-english',
          cefr_rank: 1,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
        {
          course_id: 'course-a2',
          title: 'Elementary English (A2)',
          description: null,
          sort_order: 2,
          level_code: 'A2',
          lesson_count: '18',
          completed_lesson_count: '0',
          track_slug: 'general-english',
          cefr_rank: 2,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0].locked).toBe(false);
    expect(result.courses[1].locked).toBe(true);
  });

  it('never locks a course with no track_slug/cefr_rank mapping, regardless of level state', async () => {
    const service = new StudentCoursesService(
      makeRepository([
        {
          course_id: 'course-unmapped',
          title: 'Unmapped Course',
          description: null,
          sort_order: 1,
          level_code: null,
          lesson_count: '5',
          completed_lesson_count: '0',
          track_slug: null,
          cefr_rank: null,
          max_unlocked_cefr_rank: null,
          quiz_count: '0',
          quizzes_passed: true,
          exam_count: '0',
          exam_passed: true,
        },
      ]),
    );

    const result = await service.getCourses('student-1');

    expect(result.courses[0].locked).toBe(false);
  });
});
