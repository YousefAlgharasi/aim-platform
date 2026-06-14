import { HttpStatus } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = { query: jest.fn() } as unknown as DatabaseService;
const service = new LevelsService(mockDb);

beforeEach(() => jest.clearAllMocks());

const courseId = 'course-uuid-1';
const levelRow = {
  id: 'level-uuid-1',
  course_id: courseId,
  title: 'Level A',
  code: 'A1',
  slug: null,
  description: null,
  sort_order: 0,
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('LevelsService.listLevels', () => {
  it('returns paginated result scoped to courseId', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({ rows: [levelRow] });

    const result = await service.listLevels(courseId, 1, 20);

    expect(result.total).toBe(2);
    expect(result.levels[0].courseId).toBe(courseId);
    expect(result.levels[0].code).toBe('A1');
  });

  it('rejects invalid status', async () => {
    await expect(service.listLevels(courseId, 1, 20, 'bad')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});

describe('LevelsService.getLevel', () => {
  it('throws NOT_FOUND when missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getLevel('missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns level summary', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [levelRow] });

    const level = await service.getLevel('level-uuid-1');

    expect(level.id).toBe('level-uuid-1');
    expect(level.sortOrder).toBe(0);
  });
});

describe('LevelsService.createLevel', () => {
  it('throws VALIDATION_ERROR when title is empty', async () => {
    await expect(
      service.createLevel({ courseId, title: '  ' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws NOT_FOUND when parent course missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.createLevel({ courseId: 'no-course', title: 'L1' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws CONFLICT when slug exists within course', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: courseId }] })
      .mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

    await expect(
      service.createLevel({ courseId, title: 'L1', slug: 'taken' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('creates level with draft status', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: courseId }] })
      .mockResolvedValueOnce({ rows: [{ max_order: '1' }] })
      .mockResolvedValueOnce({ rows: [{ ...levelRow, id: 'new-level', sort_order: 2 }] });

    const level = await service.createLevel({ courseId, title: 'Level B' });

    expect(level.status).toBe('draft');
  });
});

describe('LevelsService.updateLevel', () => {
  it('throws NOT_FOUND when level missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.updateLevel('missing', { title: 'X' })).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns existing level when no fields to update', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [levelRow] });

    const level = await service.updateLevel('level-uuid-1', {});

    expect(level.title).toBe('Level A');
  });

  it('throws VALIDATION_ERROR on empty title', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [levelRow] });

    await expect(service.updateLevel('level-uuid-1', { title: '' })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});
