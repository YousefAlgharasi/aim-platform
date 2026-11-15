import { MistakesService } from './mistakes.service';
import { RecoveryService } from './recovery.service';
import { SkillPracticeService } from './skill-practice.service';

const AR_Q = { ar: { stem: 'اختر', hint: 'تلميح', explanation: 'لأن' } };
const AR_OPT = { ar: { text: 'ذهب' } };

function bare<T>(cls: new (...a: any[]) => T, db: unknown): any {
  const o = Object.create(cls.prototype);
  o.db = db;
  return o;
}

describe('MistakesService translations', () => {
  const row = (over: Record<string, unknown> = {}) => ({
    id: 'q1', type: 'multiple_choice', stem: 'Pick', q_translations: AR_Q, listening_script: null,
    answer_value: 'c1', submitted_at: '2026-11-05T10:00:00Z', skill_ids: [],
    options: [{ id: 'c1', text: 'went', translations: AR_OPT }, { id: 'c2', text: 'goed' }], ...over,
  });
  const listDb = (rows: any[]) => ({
    query: jest.fn(async (sql: string) => (sql.includes('count(*)') ? { rows: [{ n: '1' }] } : { rows })),
  }) as any;

  it('list adds stem/hint and option translations but never the explanation', async () => {
    const out = await new MistakesService(listDb([row()])).list('s');
    expect(out.items[0].translations).toEqual({ ar: { stem: 'اختر', hint: 'تلميح' } });
    expect(JSON.stringify(out)).not.toContain('لأن');
    expect(out.items[0].options[0].translations).toEqual(AR_OPT);
    expect(out.items[0].options[1]).toEqual({ id: 'c2', text: 'goed' });
  });
  it('list omits translations when absent or malformed and never throws', async () => {
    const out = await new MistakesService(listDb([row({ q_translations: 'bad', options: [{ id: 'c1', text: 'a', translations: [1] }] })])).list('s');
    expect(out.items[0]).not.toHaveProperty('translations');
    expect(out.items[0].options[0]).not.toHaveProperty('translations');
  });
  it('list never translates true/false options', async () => {
    const out = await new MistakesService(listDb([row({ type: 'true_false', options: [{ id: 'c1', text: 'True', translations: AR_OPT }] })])).list('s');
    expect(out.items[0].options[0]).not.toHaveProperty('translations');
  });

  const checkDb = (qt: unknown) => ({
    query: jest.fn(async (sql: string) => {
      if (sql.includes('FROM lesson_attempts')) return { rows: [], rowCount: 1 };
      if (sql.includes('FROM question_bank')) {
        return { rows: [{ explanation: 'because', q_translations: qt, id: 'c1', text: 'went', is_correct: true }], rowCount: 1 };
      }
      return { rows: [], rowCount: 1 };
    }),
  }) as any;
  it('check returns the Arabic explanation alongside the English one', async () => {
    const out = await new MistakesService(checkDb(AR_Q)).check('s', 'q', 'c1');
    expect(out.explanation).toBe('because');
    expect(out.translations).toEqual({ ar: { explanation: 'لأن' } });
  });
  it('check omits translations when there is no Arabic explanation', async () => {
    const out = await new MistakesService(checkDb({ ar: { stem: 'x' } })).check('s', 'q', 'c1');
    expect(out).not.toHaveProperty('translations');
  });
});

describe('RecoveryService / SkillPracticeService withOptions translations', () => {
  const rows = [{ id: 'q1', type: 'multiple_choice', stem: 'Pick', translations: AR_Q }, { id: 'q2', type: 'true_false', stem: 'T?', translations: null }];
  const choices = [
    { question_id: 'q1', id: 'a', text: 'went', translations: AR_OPT }, { question_id: 'q1', id: 'b', text: 'goed', translations: 'junk' },
    { question_id: 'q2', id: 'c', text: 'True', translations: AR_OPT }, { question_id: 'q2', id: 'd', text: 'False' },
  ];
  const db = { query: jest.fn(async () => ({ rows: choices })) };

  it('recovery adds additive translations and keeps true/false English-only', async () => {
    const out = await bare(RecoveryService, db).withOptions(rows, 'bank');
    expect(out[0].translations).toEqual({ ar: { stem: 'اختر', hint: 'تلميح' } });
    expect(JSON.stringify(out[0])).not.toContain('لأن');
    expect(out[0].options[0]).toEqual({ id: 'a', text: 'went', translations: AR_OPT });
    expect(out[0].options[1]).toEqual({ id: 'b', text: 'goed' });
    expect(out[1]).not.toHaveProperty('translations');
    expect(out[1].options[0]).toEqual({ id: 'c', text: 'True' });
    expect(out[0].source).toBe('bank');
  });
  it('skill practice adds additive translations and keeps true/false English-only', async () => {
    const out = await bare(SkillPracticeService, db).withOptions(rows, 'bank');
    const q1 = out.find((q: any) => q.itemId === 'q1');
    const q2 = out.find((q: any) => q.itemId === 'q2');
    expect(q1.translations).toEqual({ ar: { stem: 'اختر', hint: 'تلميح' } });
    expect(q1.options.find((o: any) => o.id === 'a').translations).toEqual(AR_OPT);
    expect(q1.options.find((o: any) => o.id === 'b')).toEqual({ id: 'b', text: 'goed' });
    expect(q2).not.toHaveProperty('translations');
    expect(q2.options[0]).toEqual({ id: 'c', text: 'True' });
  });
});
