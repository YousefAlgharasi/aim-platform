import { HttpStatus } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = {
  query: jest.fn(),
} as unknown as DatabaseService;

const service = new LessonsService(mockDb);

beforeEach(() => jest.clearAllMocks());

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

  it('creates lesson in draft status with auto sort_order', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'chapter-uuid' }] }) // chapter check
      .mockResolvedValueOnce({ rows: [{ max_order: '2' }] })     // nextSortOrder
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'new-uuid',
            chapter_id: 'chapter-uuid',
            title: 'Lesson B',
            description: 'Lesson B description',
            sort_order: 3,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.createLesson(baseInput);
    expect(result.status).toBe('draft');
    expect(result.sortOrder).toBe(3);
  });

  it('uses provided sortOrder if given', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'chapter-uuid' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'new-uuid',
            chapter_id: 'chapter-uuid',
            title: 'Lesson B',
            description: 'Lesson B description',
            sort_order: 10,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.createLesson({ ...baseInput, sortOrder: 10 });
    expect(result.sortOrder).toBe(10);
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

  it('updates title successfully', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [draftLesson] })
      .mockResolvedValueOnce({
        rows: [{ ...draftLesson, title: 'New Title' }],
      });

    const result = await service.updateLesson('uuid-1', { title: 'New Title' });
    expect(result.title).toBe('New Title');
  });
});
