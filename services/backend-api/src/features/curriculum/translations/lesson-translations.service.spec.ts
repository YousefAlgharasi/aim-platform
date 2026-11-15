import { DatabaseService } from '../../../database/database.service';
import { LessonTranslationsService } from '../lessons/lesson-translations.service';

const clientQuery = jest.fn();
const mockDb = {
  query: jest.fn(),
  withClient: jest.fn(async (cb: (c: { query: jest.Mock }) => Promise<unknown>) => cb({ query: clientQuery })),
} as unknown as DatabaseService;

const service = new LessonTranslationsService(mockDb);
const ID = '3f3971ed-f207-45af-bdd0-0e3736ac694d';
const saved = { locale: 'ar', title: 'ت', description: 'و', content: null, created_at: 'c', updated_at: 'u' };

beforeEach(() => {
  jest.resetAllMocks();
  (mockDb.withClient as jest.Mock).mockImplementation(async (cb: (c: { query: jest.Mock }) => Promise<unknown>) =>
    cb({ query: clientQuery }),
  );
  clientQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('FOR UPDATE')) return { rows: [{ status: 'published' }] };
    if (sql.includes('INSERT INTO lesson_translations')) return { rows: [{ ...saved, content: { teachingOutline: ['x'] } }] };
    return { rows: [] };
  });
});

function insertCall() {
  return clientQuery.mock.calls.find((c) => (c[0] as string).includes('INSERT INTO lesson_translations'))!;
}

describe('LessonTranslationsService.upsertTranslation content', () => {
  it('stores validated content and returns it', async () => {
    const result = await service.upsertTranslation(ID, 'ar', { title: 'ت', description: 'و', content: { teachingOutline: ['x'] } });
    const [, params] = insertCall();
    expect(params).toEqual([ID, 'ar', 'ت', 'و', JSON.stringify({ teachingOutline: ['x'] }), true]);
    expect(result.content).toEqual({ teachingOutline: ['x'] });
  });

  it('keeps stored content when content is omitted (title/description behaviour unchanged)', async () => {
    await service.upsertTranslation(ID, 'ar', { title: 'ت', description: 'و' });
    const [sql, params] = insertCall();
    expect(params).toEqual([ID, 'ar', 'ت', 'و', null, false]);
    expect(sql).toContain('ELSE lesson_translations.content END');
  });

  it('clears content with null', async () => {
    await service.upsertTranslation(ID, 'ar', { title: 'ت', content: null });
    expect(insertCall()[1]).toEqual([ID, 'ar', 'ت', null, null, true]);
  });

  it('rejects invalid content before touching the database', async () => {
    await expect(
      service.upsertTranslation(ID, 'ar', { title: 'ت', content: { bogus: 1 } as never }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(clientQuery).not.toHaveBeenCalled();
  });
});
