import { drawAttemptQuestions, orderOptionsForAttempt } from './attempt-question-selection';
import { resolveQuestionsPerAttempt, resolveRandomization } from './assessment-policy';

function makeDb(pool: number, settings: Record<string, unknown> | undefined, seen: Array<{ link_id: string; last_seen: string }> = []) {
  const rows = Array.from({ length: pool }, (_, i) => ({ id: `link-${i}`, order: i + 1 }));
  const query = jest.fn(async (sql: string) => {
    if (sql.includes('FROM assessment_questions')) return { rows };
    if (sql.includes('FROM assessments a')) return { rows: settings ? [settings] : [] };
    if (sql.includes('FROM assessment_attempt_questions')) return { rows: seen };
    return { rows: [] };
  });
  return { query };
}

const insertedIds = (db: { query: jest.Mock }): string[] => {
  const call = db.query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO assessment_attempt_questions'));
  return call ? (call[1][1] as string[]) : [];
};

describe('drawAttemptQuestions', () => {
  it('draws the default quiz size (10) from a larger pool without duplicates', async () => {
    const db = makeDb(40, { type: 'quiz', questions_per_attempt: null, randomize_questions: null });
    await drawAttemptQuestions(db as any, 'att-1', 'a-1', 'stu-1');
    const ids = insertedIds(db);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });

  it('uses the whole pool when it is smaller than the draw size', async () => {
    const db = makeDb(4, { type: 'quiz', questions_per_attempt: null, randomize_questions: true });
    await drawAttemptQuestions(db as any, 'att-1', 'a-1', 'stu-1');
    expect(insertedIds(db)).toHaveLength(4);
  });

  it('honours questions_per_attempt from settings', async () => {
    const db = makeDb(40, { type: 'exam', questions_per_attempt: 15, randomize_questions: true });
    await drawAttemptQuestions(db as any, 'att-1', 'a-1', 'stu-1');
    expect(insertedIds(db)).toHaveLength(15);
  });

  it('prefers questions the student has not seen in earlier attempts', async () => {
    const seen = Array.from({ length: 30 }, (_, i) => ({ link_id: `link-${i}`, last_seen: '2026-11-01T00:00:00Z' }));
    const db = makeDb(40, { type: 'quiz', questions_per_attempt: 10, randomize_questions: true }, seen);
    await drawAttemptQuestions(db as any, 'att-2', 'a-1', 'stu-1');
    const ids = insertedIds(db);
    expect(ids.every((id) => Number(id.split('-')[1]) >= 30)).toBe(true); // all 10 unseen ones
  });

  it('keeps the authored order when randomize_questions is explicitly off', async () => {
    const db = makeDb(6, { type: 'quiz', questions_per_attempt: 6, randomize_questions: false });
    await drawAttemptQuestions(db as any, 'att-1', 'a-1', 'stu-1');
    expect(insertedIds(db)).toEqual(['link-0', 'link-1', 'link-2', 'link-3', 'link-4', 'link-5']);
  });

  it('does nothing for an empty pool', async () => {
    const db = makeDb(0, { type: 'quiz' });
    await drawAttemptQuestions(db as any, 'att-1', 'a-1', 'stu-1');
    expect(insertedIds(db)).toEqual([]);
  });
});

describe('orderOptionsForAttempt', () => {
  const opts = ['a', 'b', 'c', 'd'];
  it('is stable for the same attempt + question and keeps all options', () => {
    const one = orderOptionsForAttempt('att', 'q', opts, true);
    expect(one).toEqual(orderOptionsForAttempt('att', 'q', opts, true));
    expect(one.slice().sort()).toEqual(opts);
  });
  it('differs across attempts for at least some attempts', () => {
    const variants = new Set(['1', '2', '3', '4', '5', '6'].map((a) => orderOptionsForAttempt(a, 'q', opts, true).join('')));
    expect(variants.size).toBeGreaterThan(1);
  });
  it('keeps the order when randomisation is off or the question must keep its order', () => {
    expect(orderOptionsForAttempt('att', 'q', opts, false)).toEqual(opts);
    expect(orderOptionsForAttempt('att', 'q', opts, true, true)).toEqual(opts);
  });
});

describe('assessment policy defaults', () => {
  it('resolves per-type draw sizes and randomisation defaults', () => {
    expect(resolveQuestionsPerAttempt('quiz', null)).toBe(10);
    expect(resolveQuestionsPerAttempt('exam', undefined)).toBe(25);
    expect(resolveQuestionsPerAttempt('exam', 12)).toBe(12);
    expect(resolveRandomization(undefined)).toEqual({ questions: true, options: true });
    expect(resolveRandomization({ randomize_questions: false, randomize_options: false })).toEqual({ questions: false, options: false });
  });
});
