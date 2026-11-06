import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MistakesService } from './mistakes.service';
import { StudyPlanService, lessonsForMinutes } from './study-plan.service';
import { SearchService, likePattern } from './search.service';
import { MAX_BOX, VocabularyService, nextSchedule } from './vocabulary.service';

const NOW = new Date('2026-11-05T10:00:00Z');
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString();
const db = (rows: any[] = [], rowCount = rows.length) => ({ query: jest.fn(async () => ({ rows, rowCount })) }) as any;

describe('flashcard scheduling (Leitner)', () => {
  it('moves up one box and waits longer each time', () => {
    expect(nextSchedule(1, true, NOW)).toEqual({ box: 2, nextReviewAt: new Date(day(1)) });
    expect(nextSchedule(2, true, NOW)).toEqual({ box: 3, nextReviewAt: new Date(day(3)) });
    expect(nextSchedule(5, true, NOW)).toEqual({ box: 6, nextReviewAt: new Date(day(30)) });
  });
  it('never goes past the last box', () => expect(nextSchedule(MAX_BOX, true, NOW).box).toBe(MAX_BOX));
  it('a miss returns to box 1 and comes back in ten minutes', () => {
    const n = nextSchedule(4, false, NOW);
    expect(n.box).toBe(1);
    expect(n.nextReviewAt.getTime() - NOW.getTime()).toBe(10 * 60_000);
  });
});

describe('VocabularyService validation', () => {
  it('requires a word, rejects bad source and non-boolean review answers', async () => {
    const svc = new VocabularyService(db());
    await expect(svc.save('s', { word: '   ' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.save('s', { word: 'hello', source: 'hack' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.review('s', 'id', 'yes')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('404s when deleting or reviewing a word that is not the student’s', async () => {
    await expect(new VocabularyService(db([], 0)).remove('s', 'id')).rejects.toBeInstanceOf(NotFoundException);
    await expect(new VocabularyService(db([])).review('s', 'id', true)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('StudyPlanService', () => {
  it('maps minutes to a lesson goal between 1 and 6', () => {
    expect([5, 10, 25, 30, 60, 180].map(lessonsForMinutes)).toEqual([1, 1, 3, 3, 6, 6]);
  });
  it('validates goal, minutes and reminder time', async () => {
    const svc = new StudyPlanService(db());
    await expect(svc.save('s', { goal: 'x', dailyMinutes: 20 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.save('s', { goal: 'work', dailyMinutes: 2 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.save('s', { goal: 'work', dailyMinutes: 20, reminderTime: '25:99' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('MistakesService.check', () => {
  const choices = [
    { explanation: 'because', id: 'c1', text: 'went', is_correct: true },
    { explanation: 'because', id: 'c2', text: 'goed', is_correct: false },
  ];
  const mk = (attempted: boolean) => {
    let n = 0;
    return { query: jest.fn(async (sql: string) => {
      if (sql.includes('FROM lesson_attempts')) return { rows: [], rowCount: attempted ? 1 : 0 };
      if (sql.includes('FROM question_bank')) return { rows: choices, rowCount: 2 };
      n += 1; return { rows: [], rowCount: 1 };
    }) } as any;
  };
  it('only checks questions the student has attempted (no answer lookup by id)', async () => {
    await expect(new MistakesService(mk(false)).check('s', 'q', 'c1')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('resolves the mistake on a correct retry and not on a wrong one', async () => {
    const good = mk(true);
    expect(await new MistakesService(good).check('s', 'q', 'c1')).toMatchObject({ correct: true, correctText: 'went' });
    expect(good.query.mock.calls.some(([sql]: [string]) => sql.includes('mistake_resolutions'))).toBe(true);
    const bad = mk(true);
    expect(await new MistakesService(bad).check('s', 'q', 'c2')).toMatchObject({ correct: false, correctChoiceId: 'c1' });
    expect(bad.query.mock.calls.some(([sql]: [string]) => sql.includes('mistake_resolutions'))).toBe(false);
  });
});

describe('search', () => {
  it('escapes LIKE wildcards', () => expect(likePattern('50%_a\\')).toBe('%50\\%\\_a\\\\%'));
  it('returns nothing for queries shorter than 2 characters without hitting the database', async () => {
    const d = db();
    expect(await new SearchService(d).search('s', ' a ', 'en')).toEqual({ courses: [], lessons: [], words: [] });
    expect(d.query).not.toHaveBeenCalled();
  });
});
