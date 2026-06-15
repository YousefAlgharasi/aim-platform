import { HttpStatus } from '@nestjs/common';
import { QuestionSkillsService } from './question-skills.service';
import { DatabaseService } from '../../../database/database.service';

const QUESTION_ID = 'question-uuid-1';
const SKILL_ID = 'skill-uuid-1';
const OTHER_SKILL_ID = 'skill-uuid-2';
const NOW = '2026-01-01T00:00:00Z';

const questionRow = { id: QUESTION_ID };
const skillRow = { id: SKILL_ID };

function createMockDb() {
  const query = jest.fn();
  const clientQuery = jest.fn();

  const db = {
    query,
    withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) => {
      return callback({ query: clientQuery });
    }),
  } as unknown as DatabaseService;

  return { db, query, clientQuery };
}

describe('QuestionSkillsService.listSkillsForQuestion', () => {
  it('returns links for a question, primary first', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] }) // question exists
      .mockResolvedValueOnce({
        rows: [
          { question_id: QUESTION_ID, skill_id: SKILL_ID, is_primary: true, created_at: NOW },
        ],
      });

    const service = new QuestionSkillsService(db);
    const result = await service.listSkillsForQuestion(QUESTION_ID);

    expect(result.total).toBe(1);
    expect(result.links[0]).toEqual({
      questionId: QUESTION_ID,
      skillId: SKILL_ID,
      isPrimary: true,
      createdAt: NOW,
    });
  });

  it('throws NOT_FOUND when question does not exist', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const service = new QuestionSkillsService(db);

    await expect(service.listSkillsForQuestion('missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});

describe('QuestionSkillsService.addSkillToQuestion', () => {
  it('links a skill to a question without changing primary by default', async () => {
    const { db, query, clientQuery } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] }) // question exists
      .mockResolvedValueOnce({ rows: [skillRow] }) // skill exists
      .mockResolvedValueOnce({ rows: [] }); // no duplicate

    (clientQuery as jest.Mock)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ question_id: QUESTION_ID, skill_id: SKILL_ID, is_primary: false, created_at: NOW }],
      }) // INSERT
      .mockResolvedValueOnce({}); // COMMIT

    const service = new QuestionSkillsService(db);
    const result = await service.addSkillToQuestion(QUESTION_ID, { skillId: SKILL_ID });

    expect(result.isPrimary).toBe(false);
    // Should not unset any existing primary when isPrimary is false/omitted.
    const calls = (clientQuery as jest.Mock).mock.calls.map((c) => c[0]);
    expect(calls.some((sql: string) => sql.includes('SET is_primary = false'))).toBe(false);
  });

  it('unsets any existing primary when linking a new primary skill', async () => {
    const { db, query, clientQuery } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] })
      .mockResolvedValueOnce({ rows: [{ id: OTHER_SKILL_ID }] })
      .mockResolvedValueOnce({ rows: [] });

    (clientQuery as jest.Mock)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // UPDATE unset existing primary
      .mockResolvedValueOnce({
        rows: [{ question_id: QUESTION_ID, skill_id: OTHER_SKILL_ID, is_primary: true, created_at: NOW }],
      }) // INSERT
      .mockResolvedValueOnce({}); // COMMIT

    const service = new QuestionSkillsService(db);
    const result = await service.addSkillToQuestion(QUESTION_ID, {
      skillId: OTHER_SKILL_ID,
      isPrimary: true,
    });

    expect(result.isPrimary).toBe(true);
    const calls = (clientQuery as jest.Mock).mock.calls.map((c) => c[0]);
    expect(calls.some((sql: string) => sql.includes('SET is_primary = false'))).toBe(true);
  });

  it('throws CONFLICT when the skill is already linked', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] })
      .mockResolvedValueOnce({ rows: [skillRow] })
      .mockResolvedValueOnce({ rows: [{ question_id: QUESTION_ID }] }); // duplicate

    const service = new QuestionSkillsService(db);

    await expect(
      service.addSkillToQuestion(QUESTION_ID, { skillId: SKILL_ID }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });
});

describe('QuestionSkillsService.setPrimarySkill', () => {
  it('unsets the previous primary and sets the new one', async () => {
    const { db, query, clientQuery } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] }) // question exists
      .mockResolvedValueOnce({ rows: [{ question_id: QUESTION_ID }] }); // link exists

    (clientQuery as jest.Mock)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // UPDATE unset existing primary
      .mockResolvedValueOnce({
        rows: [{ question_id: QUESTION_ID, skill_id: SKILL_ID, is_primary: true, created_at: NOW }],
      }) // UPDATE set new primary
      .mockResolvedValueOnce({}); // COMMIT

    const service = new QuestionSkillsService(db);
    const result = await service.setPrimarySkill(QUESTION_ID, SKILL_ID);

    expect(result).toEqual({
      questionId: QUESTION_ID,
      skillId: SKILL_ID,
      isPrimary: true,
      createdAt: NOW,
    });
  });

  it('throws NOT_FOUND when the skill is not linked to the question', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] })
      .mockResolvedValueOnce({ rows: [] }); // link missing

    const service = new QuestionSkillsService(db);

    await expect(service.setPrimarySkill(QUESTION_ID, SKILL_ID)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});

describe('QuestionSkillsService.removeSkillFromQuestion', () => {
  it('removes the link', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] })
      .mockResolvedValueOnce({ rows: [{ question_id: QUESTION_ID }] });

    const service = new QuestionSkillsService(db);
    await expect(service.removeSkillFromQuestion(QUESTION_ID, SKILL_ID)).resolves.toBeUndefined();
  });

  it('throws NOT_FOUND when the link does not exist', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [questionRow] })
      .mockResolvedValueOnce({ rows: [] });

    const service = new QuestionSkillsService(db);

    await expect(service.removeSkillFromQuestion(QUESTION_ID, SKILL_ID)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});

describe('QuestionSkillsService.hasPublishedPrimarySkill', () => {
  it('returns true when a published primary skill mapping exists', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const service = new QuestionSkillsService(db);
    await expect(service.hasPublishedPrimarySkill(QUESTION_ID)).resolves.toBe(true);
  });

  it('returns false when no published primary skill mapping exists', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const service = new QuestionSkillsService(db);
    await expect(service.hasPublishedPrimarySkill(QUESTION_ID)).resolves.toBe(false);
  });
});
