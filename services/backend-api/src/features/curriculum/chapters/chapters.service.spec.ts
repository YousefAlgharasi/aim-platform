import { HttpStatus } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = {
  query: jest.fn(),
} as unknown as DatabaseService;

const service = new ChaptersService(mockDb);

beforeEach(() => jest.clearAllMocks());

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

  it('creates chapter in draft status with auto sort_order', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'level-uuid' }] }) // level exists
      .mockResolvedValueOnce({ rows: [{ max_order: '1' }] }) // nextSortOrder
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'new-uuid',
            level_id: 'level-uuid',
            title: 'Chapter X',
            slug: null,
            description: null,
            sort_order: 2,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.createChapter({ levelId: 'level-uuid', title: 'Chapter X' });
    expect(result.status).toBe('draft');
    expect(result.sortOrder).toBe(2);
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
