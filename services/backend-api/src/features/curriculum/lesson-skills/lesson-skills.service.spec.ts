import { HttpStatus } from '@nestjs/common';
import { LessonSkillsService } from './lesson-skills.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = {
  query: jest.fn(),
} as unknown as DatabaseService;

const service = new LessonSkillsService(mockDb);

beforeEach(() => jest.clearAllMocks());

const LESSON_ID = 'lesson-uuid-1';
const SKILL_ID = 'skill-uuid-1';
const NOW = '2026-01-01T00:00:00Z';

const lessonRow = { id: LESSON_ID };
const skillRow = { id: SKILL_ID };

describe('LessonSkillsService.listSkillsForLesson', () => {
  it('returns links for a lesson', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] }) // lesson exists
      .mockResolvedValueOnce({
        rows: [{ lesson_id: LESSON_ID, skill_id: SKILL_ID, created_at: NOW }],
      });

    const result = await service.listSkillsForLesson(LESSON_ID);
    expect(result.total).toBe(1);
    expect(result.links[0].lessonId).toBe(LESSON_ID);
    expect(result.links[0].skillId).toBe(SKILL_ID);
  });

  it('throws NOT_FOUND when lesson does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.listSkillsForLesson('missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns empty list when lesson has no skills', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.listSkillsForLesson(LESSON_ID);
    expect(result.total).toBe(0);
    expect(result.links).toHaveLength(0);
  });
});

describe('LessonSkillsService.addSkillToLesson', () => {
  it('links a skill to a lesson', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })  // lesson exists
      .mockResolvedValueOnce({ rows: [skillRow] })   // skill exists
      .mockResolvedValueOnce({ rows: [] })           // no duplicate
      .mockResolvedValueOnce({
        rows: [{ lesson_id: LESSON_ID, skill_id: SKILL_ID, created_at: NOW }],
      });

    const result = await service.addSkillToLesson(LESSON_ID, { skillId: SKILL_ID });
    expect(result.lessonId).toBe(LESSON_ID);
    expect(result.skillId).toBe(SKILL_ID);
  });

  it('throws NOT_FOUND when lesson is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.addSkillToLesson('missing', { skillId: SKILL_ID }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws NOT_FOUND when skill is missing', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({ rows: [] }); // skill not found

    await expect(
      service.addSkillToLesson(LESSON_ID, { skillId: 'missing' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws CONFLICT when link already exists', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({ rows: [skillRow] })
      .mockResolvedValueOnce({ rows: [{ lesson_id: LESSON_ID }] }); // duplicate

    await expect(
      service.addSkillToLesson(LESSON_ID, { skillId: SKILL_ID }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });
});

describe('LessonSkillsService.removeSkillFromLesson', () => {
  it('removes a skill link', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({ rows: [{ lesson_id: LESSON_ID }] }); // deleted

    await expect(
      service.removeSkillFromLesson(LESSON_ID, SKILL_ID),
    ).resolves.toBeUndefined();
  });

  it('throws NOT_FOUND when lesson is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.removeSkillFromLesson('missing', SKILL_ID),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('throws NOT_FOUND when link does not exist', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [lessonRow] })
      .mockResolvedValueOnce({ rows: [] }); // nothing deleted

    await expect(
      service.removeSkillFromLesson(LESSON_ID, 'unlinked-skill'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });
});

describe('LessonSkillsService.countPublishedSkillsForLesson', () => {
  it('returns count of published skills', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const count = await service.countPublishedSkillsForLesson(LESSON_ID);
    expect(count).toBe(2);
  });

  it('returns 0 when no published skills are linked', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const count = await service.countPublishedSkillsForLesson(LESSON_ID);
    expect(count).toBe(0);
  });
});
