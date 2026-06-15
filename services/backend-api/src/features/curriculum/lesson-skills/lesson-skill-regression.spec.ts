/**
 * P3-049 — Lesson-Skill & Question-Skill Regression Tests
 *
 * Protects the critical AIM-readiness requirement:
 *   - A lesson CANNOT be published without at least one published skill linked.
 *   - A question bank item CAN be linked to a skill (primary and non-primary).
 *
 * These tests guard against future regressions in:
 *   - LessonPublishValidationService (P3-039 / P3-044)
 *   - QuestionSkillsService (P3-042)
 *
 * No secrets, no out-of-scope code, no learner/delivery/session/AI Teacher work.
 */

import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { LessonPublishValidationService } from './lesson-publish-validation.service';
import { LessonSkillsService } from './lesson-skills.service';
import { QuestionSkillsService } from '../question-skills/question-skills.service';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Shared test constants — stable skill identifiers, never display labels
// ---------------------------------------------------------------------------

const LESSON_ID = 'lesson-regression-uuid-1';
const QUESTION_ID = 'question-regression-uuid-1';
const SKILL_ID = 'skill-regression-uuid-1'; // represents e.g. grammar.past_simple.forms
const SKILL_ID_2 = 'skill-regression-uuid-2'; // represents e.g. grammar.present_simple.forms
const NOW = '2026-01-01T00:00:00Z';

// ---------------------------------------------------------------------------
// REGRESSION BLOCK 1:
//   A lesson CANNOT be published without at least one published skill linked.
// ---------------------------------------------------------------------------

describe('[P3-049 Regression] Lesson publish gate — skill requirement', () => {
  let service: LessonPublishValidationService;
  let mockCountPublishedSkills: jest.Mock;

  beforeEach(() => {
    mockCountPublishedSkills = jest.fn();
    const lessonSkillsServiceMock = {
      countPublishedSkillsForLesson: mockCountPublishedSkills,
    } as unknown as LessonSkillsService;

    service = new LessonPublishValidationService(lessonSkillsServiceMock);
  });

  it('CRITICAL: blocks publish when lesson has zero published skills', async () => {
    // Arrange — no published skills linked
    mockCountPublishedSkills.mockResolvedValue(0);

    // Act
    const promise = service.validateLessonReadyForPublish(LESSON_ID);

    // Assert — must reject with a validation error, not silently pass
    await expect(promise).rejects.toMatchObject({
      code: ApiErrorCode.VALIDATION_ERROR,
      statusCode: HttpStatus.BAD_REQUEST,
    });
    expect(mockCountPublishedSkills).toHaveBeenCalledWith(LESSON_ID);
  });

  it('CRITICAL: blocks publish when skills are linked but none are published (draft skills)', async () => {
    // Arrange — skills are linked but still in draft status (status != 'published')
    mockCountPublishedSkills.mockResolvedValue(0);

    const promise = service.validateLessonReadyForPublish(LESSON_ID);

    await expect(promise).rejects.toMatchObject({
      code: ApiErrorCode.VALIDATION_ERROR,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('allows publish when lesson has exactly one published skill', async () => {
    // Arrange — minimum valid case: one published skill
    mockCountPublishedSkills.mockResolvedValue(1);

    // Act & Assert — must resolve without error
    await expect(service.validateLessonReadyForPublish(LESSON_ID)).resolves.toBeUndefined();
    expect(mockCountPublishedSkills).toHaveBeenCalledWith(LESSON_ID);
  });

  it('allows publish when lesson has multiple published skills', async () => {
    // Arrange — typical well-structured lesson
    mockCountPublishedSkills.mockResolvedValue(3);

    await expect(service.validateLessonReadyForPublish(LESSON_ID)).resolves.toBeUndefined();
  });

  it('reports not-ready with correct message via checkLessonPublishReadiness', async () => {
    // This method is used by UI checks / status reporting (non-throwing variant)
    mockCountPublishedSkills.mockResolvedValue(0);

    const result = await service.checkLessonPublishReadiness(LESSON_ID);

    expect(result.isReady).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Verify error message is meaningful and does not expose internal IDs as the primary message
    expect(result.errors[0]).toMatch(/skill/i);
  });

  it('reports ready when at least one published skill is linked', async () => {
    mockCountPublishedSkills.mockResolvedValue(1);

    const result = await service.checkLessonPublishReadiness(LESSON_ID);

    expect(result.isReady).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// REGRESSION BLOCK 2:
//   The countPublishedSkillsForLesson gate only counts PUBLISHED skills.
//   Draft/archived skills on the lesson_skills table must NOT count.
// ---------------------------------------------------------------------------

describe('[P3-049 Regression] countPublishedSkillsForLesson — published-only filter', () => {
  let mockDb: { query: jest.Mock };
  let lessonSkillsService: LessonSkillsService;

  const mockAuditLog = { log: jest.fn() };

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    lessonSkillsService = new LessonSkillsService(
      mockDb as unknown as DatabaseService,
      mockAuditLog as any,
    );
    jest.clearAllMocks();
  });

  it('returns 0 when no published skills are linked (only draft skills exist)', async () => {
    // The SQL query JOINs skills and filters by s.status = 'published';
    // if no rows match that filter, COUNT returns 0.
    mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const count = await lessonSkillsService.countPublishedSkillsForLesson(LESSON_ID);

    expect(count).toBe(0);
    // Verify the query was called (SQL filtering is the DB's job;
    // we assert the service passes the lessonId to the DB correctly)
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('published'),
      [LESSON_ID],
    );
  });

  it('returns the correct count when published skills exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const count = await lessonSkillsService.countPublishedSkillsForLesson(LESSON_ID);

    expect(count).toBe(2);
  });

  it('handles missing count row gracefully (returns 0, does not throw)', async () => {
    // Edge case: DB returns an empty result set instead of a count row
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const count = await lessonSkillsService.countPublishedSkillsForLesson(LESSON_ID);

    expect(count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// REGRESSION BLOCK 3:
//   A question bank item CAN be linked to one or more skills.
//   Exactly one skill may be marked is_primary per question.
// ---------------------------------------------------------------------------

describe('[P3-049 Regression] Question-skill linking — items can be linked to skills', () => {
  function createMockDb() {
    const query = jest.fn();
    const clientQuery = jest.fn();
    const db = {
      query,
      withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) =>
        callback({ query: clientQuery }),
      ),
    } as unknown as DatabaseService;
    return { db, query, clientQuery };
  }

  it('successfully links a skill to a question (non-primary)', async () => {
    const { db, query, clientQuery } = createMockDb();
    // assertQuestionExists → question found
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] })
      // assertSkillExists → skill found
      .mockResolvedValueOnce({ rows: [{ id: SKILL_ID }] })
      // duplicate check → no duplicate
      .mockResolvedValueOnce({ rows: [] });
    // withClient: BEGIN, INSERT, COMMIT
    (clientQuery as jest.Mock)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{
          question_id: QUESTION_ID,
          skill_id: SKILL_ID,
          is_primary: false,
          created_at: NOW,
        }],
      }) // INSERT
      .mockResolvedValueOnce({}); // COMMIT

    const service = new QuestionSkillsService(db);
    const link = await service.addSkillToQuestion(QUESTION_ID, { skillId: SKILL_ID });

    expect(link.questionId).toBe(QUESTION_ID);
    expect(link.skillId).toBe(SKILL_ID);
    expect(link.isPrimary).toBe(false);
  });

  it('successfully links a skill to a question as primary', async () => {
    const { db, query, clientQuery } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] })
      .mockResolvedValueOnce({ rows: [{ id: SKILL_ID }] })
      .mockResolvedValueOnce({ rows: [] }); // no duplicate
    (clientQuery as jest.Mock)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // unset previous primary
      .mockResolvedValueOnce({
        rows: [{
          question_id: QUESTION_ID,
          skill_id: SKILL_ID,
          is_primary: true,
          created_at: NOW,
        }],
      }) // INSERT
      .mockResolvedValueOnce({}); // COMMIT

    const service = new QuestionSkillsService(db);
    const link = await service.addSkillToQuestion(QUESTION_ID, {
      skillId: SKILL_ID,
      isPrimary: true,
    });

    expect(link.isPrimary).toBe(true);
  });

  it('rejects duplicate skill link for same question (409 CONFLICT)', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] }) // question exists
      .mockResolvedValueOnce({ rows: [{ id: SKILL_ID }] })   // skill exists
      .mockResolvedValueOnce({ rows: [{ question_id: QUESTION_ID }] }); // already linked

    const service = new QuestionSkillsService(db);

    await expect(
      service.addSkillToQuestion(QUESTION_ID, { skillId: SKILL_ID }),
    ).rejects.toMatchObject({
      code: ApiErrorCode.CONFLICT,
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('rejects skill link when question does not exist (404 NOT_FOUND)', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // question not found

    const service = new QuestionSkillsService(db);

    await expect(
      service.addSkillToQuestion('nonexistent-question', { skillId: SKILL_ID }),
    ).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('rejects skill link when skill does not exist (404 NOT_FOUND)', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] }) // question exists
      .mockResolvedValueOnce({ rows: [] }); // skill not found

    const service = new QuestionSkillsService(db);

    await expect(
      service.addSkillToQuestion(QUESTION_ID, { skillId: 'nonexistent-skill' }),
    ).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('lists skills linked to a question', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] }) // question exists
      .mockResolvedValueOnce({
        rows: [
          { question_id: QUESTION_ID, skill_id: SKILL_ID, is_primary: true, created_at: NOW },
          { question_id: QUESTION_ID, skill_id: SKILL_ID_2, is_primary: false, created_at: NOW },
        ],
      });

    const service = new QuestionSkillsService(db);
    const result = await service.listSkillsForQuestion(QUESTION_ID);

    expect(result.total).toBe(2);
    expect(result.links[0].isPrimary).toBe(true);
    expect(result.links[1].isPrimary).toBe(false);
  });

  it('removes a skill link from a question', async () => {
    const { db, query } = createMockDb();
    (query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: QUESTION_ID }] }) // question exists
      .mockResolvedValueOnce({ rows: [{ question_id: QUESTION_ID }] }); // DELETE succeeded

    const service = new QuestionSkillsService(db);

    await expect(
      service.removeSkillFromQuestion(QUESTION_ID, SKILL_ID),
    ).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// REGRESSION BLOCK 4:
//   hasPublishedPrimarySkill — the question-level publish gate.
//   A question cannot be considered publish-ready without a published primary skill.
// ---------------------------------------------------------------------------

describe('[P3-049 Regression] hasPublishedPrimarySkill — question publish gate', () => {
  function createMockDb() {
    const query = jest.fn();
    return {
      db: { query, withClient: jest.fn() } as unknown as DatabaseService,
      query,
    };
  }

  it('returns false when question has no primary skill mapping', async () => {
    const { db, query } = createMockDb();
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const service = new QuestionSkillsService(db);
    const result = await service.hasPublishedPrimarySkill(QUESTION_ID);

    expect(result).toBe(false);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('is_primary = true'),
      [QUESTION_ID],
    );
  });

  it('returns false when primary skill exists but is not published (e.g. draft)', async () => {
    const { db, query } = createMockDb();
    // SQL filters s.status = 'published'; draft primary skill → count = 0
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const service = new QuestionSkillsService(db);
    const result = await service.hasPublishedPrimarySkill(QUESTION_ID);

    expect(result).toBe(false);
  });

  it('returns true when a published primary skill is linked', async () => {
    const { db, query } = createMockDb();
    query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const service = new QuestionSkillsService(db);
    const result = await service.hasPublishedPrimarySkill(QUESTION_ID);

    expect(result).toBe(true);
  });

  it('handles empty DB result row gracefully (returns false)', async () => {
    const { db, query } = createMockDb();
    query.mockResolvedValueOnce({ rows: [] });

    const service = new QuestionSkillsService(db);
    const result = await service.hasPublishedPrimarySkill(QUESTION_ID);

    expect(result).toBe(false);
  });
});
