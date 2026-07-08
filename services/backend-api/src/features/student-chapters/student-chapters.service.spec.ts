import { StudentChaptersRepository } from './student-chapters.repository';
import { StudentChaptersService } from './student-chapters.service';

describe('StudentChaptersService', () => {
  const makeRepository = (rows: unknown[], finalExam: unknown = null) =>
    ({
      findChaptersWithProgress: jest.fn().mockResolvedValue(rows),
      findFinalExamForLevel: jest.fn().mockResolvedValue(finalExam),
    }) as unknown as StudentChaptersRepository;

  it('returns an empty list when there are no published chapters', async () => {
    const service = new StudentChaptersService(makeRepository([]));

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters).toEqual([]);
    expect(result.finalExam).toBeNull();
  });

  it('passes studentId and levelId through to the repository', async () => {
    const repository = makeRepository([]);
    const service = new StudentChaptersService(repository);

    await service.getChapters('student-1', 'level-1');

    expect(repository.findChaptersWithProgress).toHaveBeenCalledWith('student-1', 'level-1');
  });

  it('marks a chapter completed when completedLessonCount equals lessonCount and it has no quiz', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-1',
          title: 'Greetings',
          description: 'Say hello and goodbye.',
          sort_order: 1,
          level_code: 'A1',
          lesson_count: '6',
          completed_lesson_count: '6',
          quiz_count: '0',
          quizzes_passed: true,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters).toEqual([
      {
        chapterId: 'chapter-1',
        title: 'Greetings',
        description: 'Say hello and goodbye.',
        levelCode: 'A1',
        lessonCount: 6,
        completedLessonCount: 6,
        quizCount: 0,
        percent: 100,
        status: 'completed',
      },
    ]);
  });

  it('marks a chapter in_progress (not completed) when lessons are done but the quiz is not yet passed', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-1b',
          title: 'Greetings',
          description: null,
          sort_order: 1,
          level_code: 'A1',
          lesson_count: '6',
          completed_lesson_count: '6',
          quiz_count: '1',
          quizzes_passed: false,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters[0].status).toBe('in_progress');
    expect(result.chapters[0].percent).toBe(86); // round(6/7*100) = 85.7 -> 86
  });

  it('marks a chapter completed only once lessons are done AND its quiz is passed', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-1c',
          title: 'Greetings',
          description: null,
          sort_order: 1,
          level_code: 'A1',
          lesson_count: '6',
          completed_lesson_count: '6',
          quiz_count: '1',
          quizzes_passed: true,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters[0].status).toBe('completed');
    expect(result.chapters[0].percent).toBe(100);
  });

  it('marks a chapter in_progress when some but not all lessons are complete', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-2',
          title: 'Numbers',
          description: null,
          sort_order: 2,
          level_code: 'A1',
          lesson_count: '9',
          completed_lesson_count: '2',
          quiz_count: '0',
          quizzes_passed: true,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters[0]).toEqual({
      chapterId: 'chapter-2',
      title: 'Numbers',
      description: null,
      levelCode: 'A1',
      lessonCount: 9,
      completedLessonCount: 2,
      quizCount: 0,
      percent: 22, // round(2/9*100) = 22.22 -> 22
      status: 'in_progress',
    });
  });

  it('marks a chapter not_started when no lessons are complete', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-3',
          title: 'Family',
          description: null,
          sort_order: 3,
          level_code: 'A1',
          lesson_count: '5',
          completed_lesson_count: '0',
          quiz_count: '0',
          quizzes_passed: true,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters[0].status).toBe('not_started');
    expect(result.chapters[0].percent).toBe(0);
  });

  it('treats a chapter with zero published lessons as not_started with 0 percent (no divide-by-zero)', async () => {
    const service = new StudentChaptersService(
      makeRepository([
        {
          chapter_id: 'chapter-4',
          title: 'Empty Chapter',
          description: null,
          sort_order: 4,
          level_code: null,
          lesson_count: '0',
          completed_lesson_count: '0',
          quiz_count: '0',
          quizzes_passed: true,
        },
      ]),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.chapters[0]).toEqual({
      chapterId: 'chapter-4',
      title: 'Empty Chapter',
      description: null,
      levelCode: null,
      lessonCount: 0,
      completedLessonCount: 0,
      quizCount: 0,
      percent: 0,
      status: 'not_started',
    });
  });

  it('returns finalExam unlocked=true only when every chapter is fully complete', async () => {
    const service = new StudentChaptersService(
      makeRepository(
        [
          {
            chapter_id: 'chapter-1',
            title: 'Greetings',
            description: null,
            sort_order: 1,
            level_code: 'A1',
            lesson_count: '3',
            completed_lesson_count: '3',
            quiz_count: '1',
            quizzes_passed: true,
          },
        ],
        { assessment_id: 'exam-1', title: 'A1.1 Final Exam', course_id: 'course-1' },
      ),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.finalExam).toEqual({
      assessmentId: 'exam-1',
      title: 'A1.1 Final Exam',
      unlocked: true,
    });
  });

  it('returns finalExam unlocked=false when any chapter is not fully complete', async () => {
    const service = new StudentChaptersService(
      makeRepository(
        [
          {
            chapter_id: 'chapter-1',
            title: 'Greetings',
            description: null,
            sort_order: 1,
            level_code: 'A1',
            lesson_count: '3',
            completed_lesson_count: '3',
            quiz_count: '1',
            quizzes_passed: false,
          },
        ],
        { assessment_id: 'exam-1', title: 'A1.1 Final Exam', course_id: 'course-1' },
      ),
    );

    const result = await service.getChapters('student-1', 'level-1');

    expect(result.finalExam?.unlocked).toBe(false);
  });
});
