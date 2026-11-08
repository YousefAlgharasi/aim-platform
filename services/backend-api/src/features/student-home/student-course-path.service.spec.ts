import { pickActiveChapterIndex, StudentCoursePathService } from './student-course-path.service';

const ch = (chapterId: string, status: 'not_started' | 'in_progress' | 'completed') => ({ chapterId, status });

describe('pickActiveChapterIndex', () => {
  it('prefers an unlocked in-progress chapter', () => {
    expect(pickActiveChapterIndex([ch('a', 'completed'), ch('b', 'in_progress'), ch('c', 'not_started')])).toBe(1);
  });

  it('falls back to the first unlocked not-completed chapter', () => {
    expect(pickActiveChapterIndex([ch('a', 'completed'), ch('b', 'not_started'), ch('c', 'not_started')])).toBe(1);
  });

  it('never picks a chapter locked behind an incomplete one', () => {
    expect(pickActiveChapterIndex([ch('a', 'not_started'), ch('b', 'in_progress')])).toBe(0);
  });

  it('returns -1 when everything is completed or there are no chapters', () => {
    expect(pickActiveChapterIndex([ch('a', 'completed')])).toBe(-1);
    expect(pickActiveChapterIndex([])).toBe(-1);
  });
});

describe('StudentCoursePathService', () => {
  const level = (id: string, sortOrder: number) => ({ id, title: id, code: null, sortOrder });

  function build(finalExamOn?: string) {
    const levels = {
      listLevels: jest.fn().mockResolvedValue({ levels: [level('l1', 1), level('l2', 2)], total: 2 }),
    };
    const chapters = {
      getChapters: jest.fn().mockImplementation(async (_s: string, levelId: string) =>
        levelId === 'l1'
          ? { chapters: [ch('c1', 'completed')], finalExam: null }
          : {
              chapters: [ch('c2', 'in_progress'), ch('c3', 'not_started')],
              finalExam: finalExamOn === 'l2' ? { assessmentId: 'exam' } : null,
            },
      ),
    };
    const lessons = {
      getLessons: jest.fn().mockResolvedValue({ lessons: [{ id: 'les1' }], quiz: null }),
    };
    const service = new StudentCoursePathService(levels as never, chapters as never, lessons as never);
    return { service, levels, chapters, lessons };
  }

  it('spans all levels and loads lessons for the active chapter only', async () => {
    const { service, levels, chapters, lessons } = build('l2');

    const result = await service.getPath('student-1', 'course-1', 'en');

    expect(levels.listLevels).toHaveBeenCalledWith('course-1', 1, 100, 'published');
    expect(chapters.getChapters).toHaveBeenCalledTimes(2);
    expect(result.levels.map((l) => l.levelId)).toEqual(['l1', 'l2']);
    expect(result.activeChapter).toEqual({ chapterId: 'c2', chapterNumber: 2, lessons: [{ id: 'les1' }], quiz: null });
    expect(lessons.getLessons).toHaveBeenCalledTimes(1);
    expect(lessons.getLessons).toHaveBeenCalledWith('student-1', 'c2', 'en');
    expect(result.finalExam).toEqual({ assessmentId: 'exam' });
  });

  it('has no active chapter and skips lessons when every chapter is completed', async () => {
    const { service, chapters, lessons } = build();
    chapters.getChapters.mockResolvedValue({ chapters: [ch('c1', 'completed')], finalExam: null });

    const result = await service.getPath('student-1', 'course-1', 'en');

    expect(result.activeChapter).toBeNull();
    expect(lessons.getLessons).not.toHaveBeenCalled();
  });
});
