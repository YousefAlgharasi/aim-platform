import { HttpStatus } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { DatabaseService } from '../../../database/database.service';

const clientQuery = jest.fn();
const mockDb = {
  query: jest.fn(),
  withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) =>
    callback({ query: clientQuery }),
  ),
} as unknown as DatabaseService;

const service = new LessonsService(mockDb);

const lessonRow = {
  id: 'new-uuid',
  chapter_id: 'chapter-uuid',
  title: 'Lesson B',
  description: 'Lesson B description',
  sort_order: 3,
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

describe('LessonsService.listLessons', () => {
  it('returns paginated result with no filters', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'uuid-1',
            chapter_id: 'chapter-uuid',
            title: 'Lesson A',
            description: 'Intro to lesson A',
            sort_order: 0,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.listLessons(1, 20);

    expect(result.total).toBe(3);
    expect(result.lessons).toHaveLength(1);
    expect(result.lessons[0].title).toBe('Lesson A');
    expect(result.lessons[0].chapterId).toBe('chapter-uuid');
  });

  it('rejects invalid status value', async () => {
    await expect(service.listLessons(1, 20, undefined, 'invalid')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('clamps limit to MAX_LIMIT', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listLessons(1, 9999);

    const secondCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(secondCall[1]).toContain(100);
  });

  it('filters by chapterId', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listLessons(1, 20, 'chapter-uuid');

    const countCall = (mockDb.query as jest.Mock).mock.calls[0];
    expect(countCall[0]).toContain('chapter_id');
    expect(countCall[1]).toContain('chapter-uuid');
  });
});

describe('LessonsService.getLesson', () => {
  it('throws NOT_FOUND when lesson is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getLesson('missing-id')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns lesson summary on success', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          chapter_id: 'chapter-uuid',
          title: 'Lesson A',
          description: 'Intro',
          sort_order: 0,
          status: 'draft',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    const result = await service.getLesson('uuid-1');
    expect(result.id).toBe('uuid-1');
    expect(result.title).toBe('Lesson A');
    expect(result.description).toBe('Intro');
  });
});

describe('LessonsService.createLesson', () => {
  const baseInput = {
    chapterId: 'chapter-uuid',
    title: 'Lesson B',
    description: 'Lesson B description',
  };

  it('throws BAD_REQUEST when title is empty', async () => {
    await expect(
      service.createLesson({ ...baseInput, title: '  ' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST when description is empty', async () => {
    await expect(
      service.createLesson({ ...baseInput, description: '' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws NOT_FOUND when chapter does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.createLesson(baseInput)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('creates the lesson and its English translation in one transaction', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'chapter-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ max_order: '2' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const result = await service.createLesson(baseInput);

    expect(result.status).toBe('draft');
    expect(result.sortOrder).toBe(3);
    expect(result.availableLocales).toEqual(['en']);
    const sql = statements();
    expect(sql[0]).toBe('BEGIN');
    expect(sql[1]).toContain('INSERT INTO lessons');
    expect(sql[2]).toContain('INSERT INTO lesson_translations');
    expect(sql[3]).toBe('COMMIT');
  });

  it('uses provided sortOrder if given', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'chapter-uuid' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...lessonRow, sort_order: 10 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const result = await service.createLesson({ ...baseInput, sortOrder: 10 });
    expect(result.sortOrder).toBe(10);
  });

  it('rolls back when the English translation cannot be written', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'chapter-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ max_order: '2' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockRejectedValueOnce(new Error('translation insert failed'))
      .mockResolvedValueOnce({});

    await expect(service.createLesson(baseInput)).rejects.toThrow('translation insert failed');
    expect(statements()).toContain('ROLLBACK');
    expect(statements()).not.toContain('COMMIT');
  });
});

describe('LessonsService.updateLesson', () => {
  const draftLesson = {
    id: 'uuid-1',
    chapter_id: 'chapter-uuid',
    title: 'Old Title',
    description: 'Old description',
    sort_order: 0,
    status: 'draft',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('throws FORBIDDEN when lesson is not draft', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ ...draftLesson, status: 'published' }],
    });

    await expect(
      service.updateLesson('uuid-1', { title: 'New Title' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.FORBIDDEN });
  });

  it('throws BAD_REQUEST when title set to empty', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });

    await expect(
      service.updateLesson('uuid-1', { title: '' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST when description set to empty', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });

    await expect(
      service.updateLesson('uuid-1', { description: '  ' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST when sortOrder is negative', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });

    await expect(
      service.updateLesson('uuid-1', { sortOrder: -1 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('returns existing lesson when no fields provided', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });

    const result = await service.updateLesson('uuid-1', {});
    expect(result.title).toBe('Old Title');
    // No second query should be made (no SET clauses)
    expect((mockDb.query as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('updates title and keeps the English translation in sync', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...draftLesson, title: 'New Title', locale: 'en', available_locales: ['en'] }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ locale: 'ar' }, { locale: 'en' }] })
      .mockResolvedValueOnce({});

    const result = await service.updateLesson('uuid-1', { title: 'New Title' });

    expect(result.title).toBe('New Title');
    expect(result.availableLocales).toEqual(['ar', 'en']);
    const sql = statements();
    expect(sql[1]).toContain('UPDATE lessons');
    expect(sql[2]).toContain('INSERT INTO lesson_translations');
    expect(sql[sql.length - 1]).toBe('COMMIT');
  });

  it('does not touch translations when only the sort order changes', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [draftLesson] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...draftLesson, sort_order: 5 }] })
      .mockResolvedValueOnce({ rows: [{ locale: 'en' }] })
      .mockResolvedValueOnce({});

    await service.updateLesson('uuid-1', { sortOrder: 5 });

    expect(statements().some((q) => q.includes('INSERT INTO lesson_translations'))).toBe(false);
  });
});

describe('LessonsService locale-aware reads', () => {
  const row = { ...lessonRow, locale: 'ar', available_locales: ['ar', 'en'] };

  it('getLesson resolves text with the requested locale in one query', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [row] });

    const result = await service.getLesson('new-uuid', 'ar');

    const call = (mockDb.query as jest.Mock).mock.calls[0];
    expect(call[0]).toContain('lesson_translations');
    expect(call[0]).toContain("l_lt_en.locale = 'en'");
    expect(call[1]).toEqual(['new-uuid', 'ar']);
    expect(result.locale).toBe('ar');
    expect(result.availableLocales).toEqual(['ar', 'en']);
  });

  it('getLesson defaults to English', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...lessonRow }] });
    await service.getLesson('new-uuid');
    expect((mockDb.query as jest.Mock).mock.calls[0][1]).toEqual(['new-uuid', 'en']);
  });

  it('listLessons passes the locale after the filters and searches translated text', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [row] });

    await service.listLessons(1, 20, 'chapter-uuid', 'published', 'letters', 'ar');

    const countCall = (mockDb.query as jest.Mock).mock.calls[0];
    expect(countCall[0]).toContain('lesson_translations');
    const dataCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(dataCall[1]).toEqual(['chapter-uuid', 'published', '%letters%', 'ar', 20, 0]);
    expect(dataCall[0]).toContain('available_locales');
  });

  it('listLessons defaults to English', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });
    await service.listLessons(1, 20);
    expect((mockDb.query as jest.Mock).mock.calls[1][1]).toEqual(['en', 20, 0]);
  });
});
