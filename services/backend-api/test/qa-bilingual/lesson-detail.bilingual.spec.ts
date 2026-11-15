/**
 * QA (independent) contract tests for bilingual lesson detail.
 * Contract: GET lesson keeps every existing field and ADDS translations.ar{title,description,explanation?,assets?};
 * missing translation => no `translations` key, no error; requested-locale precedence is unchanged.
 * Mock-DB tests always run. The optional live block is READ-ONLY and runs only when TEST_DATABASE_URL is set
 * (e.g. postgres://supabase_admin:testpass@127.0.0.1:54330/aimtest2).
 */
import { Pool } from 'pg';
import { LessonsService } from '../../src/features/curriculum/lessons/lessons.service';
import { DatabaseService } from '../../src/database/database.service';

const baseRow = {
  id: 'l-1', chapter_id: 'c-1', title: 'Hello & Goodbye', description: 'Greetings', sort_order: 1, status: 'published',
  xp_value: 10, system_prompt: null, teaching_outline: ['a'], explanation: { overview: 'o', sections: [] },
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', locale: 'en', available_locales: ['en'],
};
const LEGACY_FIELDS = ['id', 'chapterId', 'title', 'description', 'sortOrder', 'status', 'xpValue', 'createdAt', 'updatedAt', 'locale', 'availableLocales'];

function svcWith(row: Record<string, unknown> | null) {
  const query = jest.fn().mockResolvedValue({ rows: row ? [row] : [] });
  return { svc: new LessonsService({ query } as unknown as DatabaseService), query };
}

describe('lesson detail bilingual contract (mock db)', () => {
  it('without translation rows: legacy fields intact, no translations key, no error', async () => {
    for (const other of [undefined, null, []]) {
      const { svc } = svcWith({ ...baseRow, other_translations: other });
      const r = (await svc.getLesson('l-1')) as unknown as Record<string, unknown>;
      for (const f of LEGACY_FIELDS) expect(r).toHaveProperty(f);
      expect(r.title).toBe('Hello & Goodbye');
      expect(r.translations).toBeUndefined();
    }
  });

  it('adds translations.ar with title/description/explanation/assets and keeps legacy fields', async () => {
    const content = {
      explanation: { overview: 'نظرة', sections: [{ heading: 'مرحبا', body: 'نص', examples: [{ text: 'مرحبا' }] }] },
      assets: { 'asset-1': { title: 'الأبجدية', description: 'وصف' } },
    };
    const { svc } = svcWith({ ...baseRow, other_translations: [{ locale: 'ar', title: 'مرحبا ووداعا', description: 'تحيات', content }] });
    const r = (await svc.getLesson('l-1')) as unknown as Record<string, any>;
    for (const f of LEGACY_FIELDS) expect(r).toHaveProperty(f);
    expect(r.title).toBe('Hello & Goodbye'); // English stays primary
    expect(r.translations.ar.title).toBe('مرحبا ووداعا');
    expect(r.translations.ar.description).toBe('تحيات');
    expect(r.translations.ar.explanation.sections[0].heading).toBe('مرحبا');
    expect(r.translations.ar.assets['asset-1'].title).toBe('الأبجدية');
  });

  it('ar row with null/garbage content: still ar title/description, no explanation/assets, never throws', async () => {
    for (const content of [null, 'x', 5, [], { explanation: 'bad', assets: 'bad' }]) {
      const { svc } = svcWith({ ...baseRow, other_translations: [{ locale: 'ar', title: 'ت', description: null, content }] });
      const r = (await svc.getLesson('l-1')) as unknown as Record<string, any>;
      expect(r.translations.ar.title).toBe('ت');
      expect(r.translations.ar.explanation).toBeUndefined();
      expect(r.translations.ar.assets).toBeUndefined();
    }
  });

  it('en rows are never echoed into translations', async () => {
    const { svc } = svcWith({ ...baseRow, other_translations: [{ locale: 'en', title: 'x', description: null, content: null }] });
    expect(((await svc.getLesson('l-1')) as unknown as Record<string, unknown>).translations).toBeUndefined();
  });

  it('handles very long Arabic strings', async () => {
    const long = 'مرحبا '.repeat(3000);
    const { svc } = svcWith({ ...baseRow, other_translations: [{ locale: 'ar', title: long, description: long, content: { explanation: { overview: long, sections: [] } } }] });
    const r = (await svc.getLesson('l-1')) as unknown as Record<string, any>;
    expect(r.translations.ar.title.length).toBe(long.length);
  });

  it('locale precedence unchanged: requested locale is passed as the SQL parameter and drives title/locale', async () => {
    const { svc, query } = svcWith({ ...baseRow, title: 'عنوان', locale: 'ar', available_locales: ['ar', 'en'], other_translations: [{ locale: 'ar', title: 'عنوان', description: null, content: null }] });
    const r = await svc.getLesson('l-1', 'ar');
    expect(query.mock.calls[0][1]).toEqual(['l-1', 'ar']);
    expect(r.title).toBe('عنوان');
    expect(r.locale).toBe('ar');
  });

  it('unknown lesson still 404s', async () => {
    const { svc } = svcWith(null);
    await expect(svc.getLesson('nope')).rejects.toMatchObject({ statusCode: 404 });
  });
});

const liveUrl = process.env.TEST_DATABASE_URL;
(liveUrl ? describe : describe.skip)('lesson detail bilingual (live dev DB, read-only)', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: liveUrl }); });
  afterAll(async () => { await pool.end(); });
  const db = { query: (t: string, v?: unknown[]) => pool.query(t, v as unknown[]) } as unknown as DatabaseService;

  it('every Starter lesson resolves for en and ar without error and keeps legacy fields', async () => {
    const svc = new LessonsService(db);
    const { rows } = await pool.query(
      `SELECT l.id FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id JOIN levels lv ON lv.id=ch.level_id WHERE lv.course_id='c2f2a93b-b4bb-4786-a381-c4e97932af08'`);
    expect(rows.length).toBe(12);
    for (const { id } of rows) {
      for (const loc of ['en', 'ar'] as const) {
        const r = (await svc.getLesson(id, loc)) as unknown as Record<string, unknown>;
        for (const f of LEGACY_FIELDS) expect(r).toHaveProperty(f);
      }
    }
  });
});
