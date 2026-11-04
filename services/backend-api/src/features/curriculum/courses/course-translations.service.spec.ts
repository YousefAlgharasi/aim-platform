import { HttpStatus } from '@nestjs/common';
import { CourseTranslationsService } from './course-translations.service';
import { DatabaseService } from '../../../database/database.service';

const clientQuery = jest.fn();
const mockDb = {
  query: jest.fn(),
  withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) =>
    callback({ query: clientQuery }),
  ),
} as unknown as DatabaseService;

const service = new CourseTranslationsService(mockDb);

const savedRow = {
  locale: 'ar',
  title: 'أساسيات',
  description: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function statements(): string[] {
  return clientQuery.mock.calls.map((c) => c[0] as string);
}

beforeEach(() => {
  jest.clearAllMocks();
  clientQuery.mockReset();
});

describe('CourseTranslationsService.listTranslations', () => {
  it('returns all translations with supported and missing locales', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
      .mockResolvedValueOnce({ rows: [{ ...savedRow, locale: 'en', title: 'Basics' }] });

    const result = await service.listTranslations('c1');

    expect(result.courseId).toBe('c1');
    expect(result.supportedLocales).toEqual(['en', 'ar']);
    expect(result.missingLocales).toEqual(['ar']);
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].title).toBe('Basics');
  });

  it('throws NOT_FOUND for an unknown course', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    await expect(service.listTranslations('nope')).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });
});

describe('CourseTranslationsService.upsertTranslation', () => {
  it('rejects unsupported locales', async () => {
    await expect(service.upsertTranslation('c1', 'fr', { title: 'x' })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
    expect(mockDb.withClient).not.toHaveBeenCalled();
  });

  it('rejects an empty or oversized title and an oversized description', async () => {
    await expect(service.upsertTranslation('c1', 'ar', { title: '   ' })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
    await expect(service.upsertTranslation('c1', 'ar', { title: 'x'.repeat(256) })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
    await expect(
      service.upsertTranslation('c1', 'ar', { title: 'ok', description: 'x'.repeat(2001) }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('writes a non-English translation without touching the legacy columns', async () => {
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }] })
      .mockResolvedValueOnce({ rows: [savedRow] })
      .mockResolvedValueOnce({});

    const saved = await service.upsertTranslation('c1', 'ar', { title: ' أساسيات ' });

    expect(saved.locale).toBe('ar');
    const sql = statements();
    expect(sql[0]).toBe('BEGIN');
    expect(sql.some((s) => s.includes('UPDATE courses'))).toBe(false);
    expect(sql[sql.length - 1]).toBe('COMMIT');
    expect(clientQuery.mock.calls[2][1]).toEqual(['c1', 'ar', 'أساسيات', null]);
  });

  it('syncs courses.title and courses.description in the same transaction for English', async () => {
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }] })
      .mockResolvedValueOnce({ rows: [{ ...savedRow, locale: 'en', title: 'Basics' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await service.upsertTranslation('c1', 'en', { title: 'Basics', description: 'About' });

    const sql = statements();
    expect(sql[3]).toContain('UPDATE courses SET title');
    expect(clientQuery.mock.calls[3][1]).toEqual(['c1', 'Basics', 'About']);
    expect(sql[sql.length - 1]).toBe('COMMIT');
  });

  it('rolls back everything when the legacy sync fails', async () => {
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }] })
      .mockResolvedValueOnce({ rows: [{ ...savedRow, locale: 'en' }] })
      .mockRejectedValueOnce(new Error('sync failed'))
      .mockResolvedValueOnce({});

    await expect(service.upsertTranslation('c1', 'en', { title: 'Basics' })).rejects.toThrow('sync failed');
    expect(statements()).toContain('ROLLBACK');
    expect(statements()).not.toContain('COMMIT');
  });

  it('throws NOT_FOUND and rolls back when the course does not exist', async () => {
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});

    await expect(service.upsertTranslation('nope', 'ar', { title: 'x' })).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
    expect(statements()).toContain('ROLLBACK');
  });
});

describe('CourseTranslationsService.deleteTranslation', () => {
  it('never deletes the English translation', async () => {
    await expect(service.deleteTranslation('c1', 'en')).rejects.toMatchObject({
      statusCode: HttpStatus.CONFLICT,
    });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('deletes a non-English translation', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
      .mockResolvedValueOnce({ rowCount: 1 });

    await expect(service.deleteTranslation('c1', 'ar')).resolves.toEqual({
      courseId: 'c1',
      locale: 'ar',
      deleted: true,
    });
  });

  it('throws NOT_FOUND when that translation does not exist', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
      .mockResolvedValueOnce({ rowCount: 0 });

    await expect(service.deleteTranslation('c1', 'ar')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('rejects unsupported locales', async () => {
    await expect(service.deleteTranslation('c1', 'xx')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});
