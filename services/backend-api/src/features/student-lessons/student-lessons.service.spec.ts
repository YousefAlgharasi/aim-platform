import { StudentLessonsRepository } from './student-lessons.repository';
import { StudentLessonsService } from './student-lessons.service';

describe('StudentLessonsService', () => {
  const makeRepository = (rows: unknown[], quiz: unknown = null, hasPassingResult = false) =>
    ({
      findLessonsWithProgress: jest.fn().mockResolvedValue(rows),
      findQuizForChapter: jest.fn().mockResolvedValue(quiz),
      hasPassingResult: jest.fn().mockResolvedValue(hasPassingResult),
    }) as unknown as StudentLessonsRepository;

  it('returns an empty list when there are no published lessons', async () => {
    const service = new StudentLessonsService(makeRepository([]));

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.lessons).toEqual([]);
  });

  it('passes studentId and chapterId through to the repository', async () => {
    const repository = makeRepository([]);
    const service = new StudentLessonsService(repository);

    await service.getLessons('student-1', 'chapter-1');

    expect(repository.findLessonsWithProgress).toHaveBeenCalledWith('student-1', 'chapter-1');
  });

  it('marks the first incomplete lesson (in sort_order) as current, and no others', async () => {
    const service = new StudentLessonsService(
      makeRepository([
        {
          lesson_id: 'lesson-1',
          title: 'Say Hello',
          description: 'Greet someone.',
          xp_value: 10,
          sort_order: 1,
          completed: true,
        },
        {
          lesson_id: 'lesson-2',
          title: 'Say Goodbye',
          description: 'Farewell phrases.',
          xp_value: 10,
          sort_order: 2,
          completed: false,
        },
        {
          lesson_id: 'lesson-3',
          title: 'Introduce Yourself',
          description: 'Say your name.',
          xp_value: 15,
          sort_order: 3,
          completed: false,
        },
      ]),
    );

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.lessons).toEqual([
      {
        id: 'lesson-1',
        title: 'Say Hello',
        description: 'Greet someone.',
        xpValue: 10,
        completed: true,
        current: false,
      },
      {
        id: 'lesson-2',
        title: 'Say Goodbye',
        description: 'Farewell phrases.',
        xpValue: 10,
        completed: false,
        current: true,
      },
      {
        id: 'lesson-3',
        title: 'Introduce Yourself',
        description: 'Say your name.',
        xpValue: 15,
        completed: false,
        current: false,
      },
    ]);
  });

  it('marks the first lesson as current when no lessons are complete yet', async () => {
    const service = new StudentLessonsService(
      makeRepository([
        {
          lesson_id: 'lesson-1',
          title: 'Say Hello',
          description: 'Greet someone.',
          xp_value: 10,
          sort_order: 1,
          completed: false,
        },
        {
          lesson_id: 'lesson-2',
          title: 'Say Goodbye',
          description: 'Farewell phrases.',
          xp_value: 10,
          sort_order: 2,
          completed: false,
        },
      ]),
    );

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.lessons[0].current).toBe(true);
    expect(result.lessons[1].current).toBe(false);
  });

  it('marks no lesson as current when every lesson is already complete', async () => {
    const service = new StudentLessonsService(
      makeRepository([
        {
          lesson_id: 'lesson-1',
          title: 'Say Hello',
          description: 'Greet someone.',
          xp_value: 10,
          sort_order: 1,
          completed: true,
        },
        {
          lesson_id: 'lesson-2',
          title: 'Say Goodbye',
          description: 'Farewell phrases.',
          xp_value: 10,
          sort_order: 2,
          completed: true,
        },
      ]),
    );

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.lessons.every((l) => !l.current)).toBe(true);
    expect(result.lessons.every((l) => l.completed)).toBe(true);
  });

  it('returns null quiz when the chapter has no linked quiz', async () => {
    const service = new StudentLessonsService(makeRepository([]));

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.quiz).toBeNull();
  });

  it('returns the chapter quiz locked when lessons are not all complete yet', async () => {
    const service = new StudentLessonsService(
      makeRepository(
        [
          {
            lesson_id: 'lesson-1',
            title: 'Say Hello',
            description: 'Greet someone.',
            xp_value: 10,
            sort_order: 1,
            completed: false,
          },
        ],
        { assessment_id: 'quiz-1', title: 'Chapter 1 Quiz' },
      ),
    );

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.quiz).toEqual({
      assessmentId: 'quiz-1',
      title: 'Chapter 1 Quiz',
      completed: false,
      locked: true,
    });
  });

  it('returns the chapter quiz unlocked and completed once all lessons are done and the quiz is passed', async () => {
    const service = new StudentLessonsService(
      makeRepository(
        [
          {
            lesson_id: 'lesson-1',
            title: 'Say Hello',
            description: 'Greet someone.',
            xp_value: 10,
            sort_order: 1,
            completed: true,
          },
        ],
        { assessment_id: 'quiz-1', title: 'Chapter 1 Quiz' },
        true,
      ),
    );

    const result = await service.getLessons('student-1', 'chapter-1');

    expect(result.quiz).toEqual({
      assessmentId: 'quiz-1',
      title: 'Chapter 1 Quiz',
      completed: true,
      locked: false,
    });
  });
});
