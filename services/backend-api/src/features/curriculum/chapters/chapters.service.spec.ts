import { HttpStatus } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { DatabaseService } from '../../../database/database.service';

const clientQuery = jest.fn();
const mockDb = {
  query: jest.fn(),
  withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) =>
    callback({ query: clientQuery }),
  ),
} as unknown as DatabaseService;

const service = new ChaptersService(mockDb);

const draftRow = {
  id: 'uuid-1',
  level_id: 'level-uuid',
  title: 'Chapter A',
  slug: null,
  description: null,
  sort_order: 0,
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  locale: 'en',
  available_locales: ['en'],
};

function statements(): string[] {
  return clientQuery.mock.calls.map((c) => c[0] as string);
}

beforeEach(() => {
  jest.resetAllMocks();
  (mockDb.withClient as jest.Mock).mockImplementation(
    async (callback: (client: { query: jest.Mock }) => Promise<unknown>) => callback({ query: clientQuery }),
  );
});

describe('ChaptersService.listChapters', () => {
  it('returns paginated result with no filters', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'uuid-1',
            level_id: 'level-uuid',
            title: 'Chapter A',
            slug: 'chapter-a',
            description: null,
            sort_order: 0,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.listChapters(1, 20);

    expect(result.total).toBe(2);
    expect(result.chapters).toHaveLength(1);
    expect(result.chapters[0].title).toBe('Chapter A');
    expect(result.chapters[0].levelId).toBe('level-uuid');
  });

  it('rejects invalid status value', async () => {
    await expect(service.listChapters(1, 20, undefined, 'invalid')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('clamps limit to MAX_LIMIT', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listChapters(1, 9999);

    const secondCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(secondCall[1]).toContain(100);
  });
});

describe('ChaptersService.getChapter', () => {
  it('throws NOT_FOUND when chapter is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getChapter('missing-id')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns chapter summary on success', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          level_id: 'level-uuid',
          title: 'Chapter A',
          slug: null,
          description: null,
          sort_order: 0,
          status: 'draft',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    const result = await service.getChapter('uuid-1');
    expect(result.id).toBe('uuid-1');
    expect(result.levelId).toBe('level-uuid');
  });
});

describe('ChaptersService.createChapter', () => {
  it('throws VALIDATION_ERROR when title is empty', async () => {
    await expect(
      service.createChapter({ levelId: 'level-uuid', title: '  ' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws NOT_FOUND when parent level does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // level check

    await expect(
      service.createChapter({ levelId: 'missing-level', title: 'Chapter X' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws CONFLICT when slug is already in use within the level', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'level-uuid' }] }) // level exists
      .mockResolvedValueOnce({ rows: [{ id: 'other-chapter' }] }); // slug conflict

    await expect(
      service.createChapter({ levelId: 'level-uuid', title: 'Chapter X', slug: 'dup-slug' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('creates the chapter and its English translation in one transaction', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'level-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ max_order: '1' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...draftRow, id: 'new-uuid', title: 'Chapter X', sort_order: 2 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const result = await service.createChapter({ levelId: 'level-uuid', title: 'Chapter X' });

    expect(result.status).toBe('draft');
    expect(result.sortOrder).toBe(2);
    expect(result.availableLocales).toEqual(['en']);
    const sql = statements();
    expect(sql[0]).toBe('BEGIN');
    expect(sql[1]).toContain('INSERT INTO chapters');
    expect(sql[2]).toContain('INSERT INTO chapter_translations');
    expect(sql[3]).toBe('COMMIT');
  });

  it('rolls back when the English translation cannot be written', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'level-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ max_order: '1' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [draftRow] })
      .mockRejectedValueOnce(new Error('translation insert failed'))
      .mockResolvedValueOnce({});

    await expect(service.createChapter({ levelId: 'level-uuid', title: 'Chapter X' })).rejects.toThrow(
      'translation insert failed',
    );
    expect(statements()).toContain('ROLLBACK');
    expect(statements()).not.toContain('COMMIT');
  });
});

describe('ChaptersService.updateChapter', () => {
  it('throws FORBIDDEN when chapter is not draft', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          level_id: 'level-uuid',
          title: 'Chapter A',
          slug: null,
          description: null,
          sort_order: 0,
          status: 'published',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    await expect(
      service.updateChapter('uuid-1', { title: 'New Title' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.FORBIDDEN });
  });

  it('returns existing chapter when no fields provided', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          level_id: 'level-uuid',
          title: 'Chapter A',
          slug: null,
          description: null,
          sort_order: 0,
          status: 'draft',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    const result = await service.updateChapter('uuid-1', {});
    expect(result.title).toBe('Chapter A');
  });

  it('rejects negative sortOrder', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          level_id: 'level-uuid',
          title: 'Chapter A',
          slug: null,
          description: null,
          sort_order: 0,
          status: 'draft',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    await expect(
      service.updateChapter('uuid-1', { sortOrder: -1 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });
});

describe('ChaptersService.updateChapter English sync', () => {
  it('keeps the English translation in sync when the title or description changes', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftRow] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...draftRow, title: 'Renamed' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ locale: 'ar' }, { locale: 'en' }] })
      .mockResolvedValueOnce({});

    const result = await service.updateChapter('uuid-1', { title: 'Renamed' });

    expect(result.title).toBe('Renamed');
    expect(result.availableLocales).toEqual(['ar', 'en']);
    const sql = statements();
    expect(sql[1]).toContain('UPDATE chapters');
    expect(sql[2]).toContain('INSERT INTO chapter_translations');
    expect(sql[sql.length - 1]).toBe('COMMIT');
  });

  it('does not touch translations when only the sort order changes', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftRow] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...draftRow, sort_order: 4 }] })
      .mockResolvedValueOnce({ rows: [{ locale: 'en' }] })
      .mockResolvedValueOnce({});

    await service.updateChapter('uuid-1', { sortOrder: 4 });

    expect(statements().some((q) => q.includes('INSERT INTO chapter_translations'))).toBe(false);
  });
});

describe('ChaptersService locale-aware reads', () => {
  const row = { ...draftRow, locale: 'ar', available_locales: ['ar', 'en'] };

  it('getChapter resolves text with the requested locale in one query', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [row] });

    const result = await service.getChapter('uuid-1', 'ar');

    const call = (mockDb.query as jest.Mock).mock.calls[0];
    expect(call[0]).toContain('chapter_translations');
    expect(call[1]).toEqual(['uuid-1', 'ar']);
    expect(result.locale).toBe('ar');
    expect(result.availableLocales).toEqual(['ar', 'en']);
  });

  it('listChapters passes the locale after the filters and searches translated text', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [row] });

    await service.listChapters(1, 20, 'level-uuid', 'published', 'alphabet', 'ar');

    expect((mockDb.query as jest.Mock).mock.calls[0][0]).toContain('chapter_translations');
    expect((mockDb.query as jest.Mock).mock.calls[1][1]).toEqual(['level-uuid', 'published', '%alphabet%', 'ar', 20, 0]);
  });

  it('listChapters defaults to English', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });
    await service.listChapters(1, 20);
    expect((mockDb.query as jest.Mock).mock.calls[1][1]).toEqual(['en', 20, 0]);
  });
});
