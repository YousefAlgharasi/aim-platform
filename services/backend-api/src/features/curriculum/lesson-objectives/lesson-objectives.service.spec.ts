import { HttpStatus } from '@nestjs/common';
import { LessonObjectivesService } from './lesson-objectives.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = { query: jest.fn() } as unknown as DatabaseService;
const service = new LessonObjectivesService(mockDb);

const baseLink = {
  lesson_id: 'lesson-uuid',
  objective_id: 'objective-uuid',
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

describe('LessonObjectivesService.listObjectivesForLesson', () => {
  it('throws NOT_FOUND when lesson does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.listObjectivesForLesson('missing-lesson'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('returns empty list when no objectives are linked', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] }) // assertLessonExists
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.listObjectivesForLesson('lesson-uuid');
    expect(result.links).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('returns links in created_at order', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] })
      .mockResolvedValueOnce({ rows: [baseLink, { ...baseLink, objective_id: 'obj-2' }] });

    const result = await service.listObjectivesForLesson('lesson-uuid');
    expect(result.total).toBe(2);
    expect(result.links[0].objectiveId).toBe('objective-uuid');
    expect(result.links[1].objectiveId).toBe('obj-2');
  });
});

describe('LessonObjectivesService.addObjectiveToLesson', () => {
  it('throws NOT_FOUND when lesson does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.addObjectiveToLesson('missing-lesson', { objectiveId: 'obj-uuid' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws NOT_FOUND when objective does not exist', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] }) // lesson exists
      .mockResolvedValueOnce({ rows: [] }); // objective missing

    await expect(
      service.addObjectiveToLesson('lesson-uuid', { objectiveId: 'missing-obj' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws CONFLICT when link already exists', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] })   // lesson exists
      .mockResolvedValueOnce({ rows: [{ id: 'obj-uuid' }] })      // objective exists
      .mockResolvedValueOnce({ rows: [{ lesson_id: 'lesson-uuid' }] }); // duplicate

    await expect(
      service.addObjectiveToLesson('lesson-uuid', { objectiveId: 'obj-uuid' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('inserts and returns the new link', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] })  // lesson exists
      .mockResolvedValueOnce({ rows: [{ id: 'obj-uuid' }] })     // objective exists
      .mockResolvedValueOnce({ rows: [] })                        // no duplicate
      .mockResolvedValueOnce({ rows: [baseLink] });               // insert result

    const result = await service.addObjectiveToLesson('lesson-uuid', { objectiveId: 'objective-uuid' });
    expect(result.lessonId).toBe('lesson-uuid');
    expect(result.objectiveId).toBe('objective-uuid');
    expect(result.createdAt).toBe('2026-01-01T00:00:00Z');
  });
});

describe('LessonObjectivesService.removeObjectiveFromLesson', () => {
  it('throws NOT_FOUND when lesson does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.removeObjectiveFromLesson('missing-lesson', 'obj-uuid'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws NOT_FOUND when link does not exist', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] }) // lesson exists
      .mockResolvedValueOnce({ rows: [] }); // delete returns nothing

    await expect(
      service.removeObjectiveFromLesson('lesson-uuid', 'obj-uuid'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('deletes the link successfully', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] })          // lesson exists
      .mockResolvedValueOnce({ rows: [{ lesson_id: 'lesson-uuid' }] });  // delete succeeded

    await expect(
      service.removeObjectiveFromLesson('lesson-uuid', 'obj-uuid'),
    ).resolves.toBeUndefined();
  });
});
