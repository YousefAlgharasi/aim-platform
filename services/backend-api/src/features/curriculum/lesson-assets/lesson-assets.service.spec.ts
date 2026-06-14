import { HttpStatus } from '@nestjs/common';
import { LessonAssetsService } from './lesson-assets.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = { query: jest.fn() } as unknown as DatabaseService;
const service = new LessonAssetsService(mockDb);

const baseRow = {
  id: 'asset-uuid',
  lesson_id: 'lesson-uuid',
  type: 'image',
  title: 'Hero Image',
  description: null,
  url: 'https://example.com/image.png',
  mime_type: 'image/png',
  size_bytes: '204800',
  duration_seconds: null,
  alt_text: null,
  thumbnail_url: null,
  order: 1,
  status: 'draft',
  metadata: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

describe('LessonAssetsService.listAssets', () => {
  it('returns paginated result with no filters', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.listAssets(1, 20);

    expect(result.total).toBe(1);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].lessonId).toBe('lesson-uuid');
    expect(result.assets[0].sizeBytes).toBe(204800);
  });

  it('rejects invalid status', async () => {
    await expect(service.listAssets(1, 20, undefined, 'pending')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('clamps limit to MAX_LIMIT', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listAssets(1, 9999);

    const secondCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(secondCall[1]).toContain(100);
  });
});

describe('LessonAssetsService.getAsset', () => {
  it('throws NOT_FOUND when asset is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getAsset('missing-id')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns asset summary on success', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.getAsset('asset-uuid');
    expect(result.id).toBe('asset-uuid');
    expect(result.type).toBe('image');
    expect(result.sizeBytes).toBe(204800);
  });
});

describe('LessonAssetsService.createAsset', () => {
  it('rejects invalid type', async () => {
    await expect(
      service.createAsset({
        lessonId: 'lesson-uuid',
        type: 'gif' as never,
        title: 'Bad',
        order: 1,
      }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects empty title', async () => {
    await expect(
      service.createAsset({ lessonId: 'lesson-uuid', type: 'image', title: '  ', order: 1 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects order < 1', async () => {
    await expect(
      service.createAsset({ lessonId: 'lesson-uuid', type: 'image', title: 'X', order: 0 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws NOT_FOUND when lesson does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // lesson check

    await expect(
      service.createAsset({ lessonId: 'missing', type: 'image', title: 'X', order: 1 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws CONFLICT when order is already used in the lesson', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] }) // lesson exists
      .mockResolvedValueOnce({ rows: [{ id: 'other-asset' }] }); // order conflict

    await expect(
      service.createAsset({ lessonId: 'lesson-uuid', type: 'image', title: 'X', order: 1 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('creates asset in draft status', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] }) // lesson exists
      .mockResolvedValueOnce({ rows: [] }) // no order conflict
      .mockResolvedValueOnce({ rows: [{ ...baseRow, status: 'draft' }] });

    const result = await service.createAsset({
      lessonId: 'lesson-uuid',
      type: 'image',
      title: 'Hero Image',
      order: 1,
    });

    expect(result.status).toBe('draft');
    expect(result.order).toBe(1);
  });
});

describe('LessonAssetsService.updateAsset', () => {
  it('throws FORBIDDEN when asset is not draft', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ ...baseRow, status: 'published' }],
    });

    await expect(
      service.updateAsset('asset-uuid', { title: 'New Title' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.FORBIDDEN });
  });

  it('returns existing asset when no fields provided', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.updateAsset('asset-uuid', {});
    expect(result.title).toBe('Hero Image');
  });

  it('rejects order < 1 on update', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    await expect(
      service.updateAsset('asset-uuid', { order: 0 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects order conflict on update', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [baseRow] }) // getAsset
      .mockResolvedValueOnce({ rows: [{ id: 'other-asset' }] }); // order conflict

    await expect(
      service.updateAsset('asset-uuid', { order: 2 }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });
});

describe('LessonAssetsService.archiveAsset', () => {
  it('is a no-op when already archived', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ ...baseRow, status: 'archived' }],
    });

    const result = await service.archiveAsset('asset-uuid');
    expect(result.status).toBe('archived');
    // Only one db call (getAsset) — no UPDATE issued
    expect((mockDb.query as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('archives a draft asset', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [baseRow] }) // getAsset (draft)
      .mockResolvedValueOnce({ rows: [{ ...baseRow, status: 'archived' }] }); // update

    const result = await service.archiveAsset('asset-uuid');
    expect(result.status).toBe('archived');
  });
});
