/**
 * AttemptSkillContextService tests — P5-055.
 *
 * Covers:
 *   resolveForLesson    — happy path, empty result
 *   resolveForQuestion  — happy path, empty result, primary-first ordering
 *   resolveForItem      — dispatches to correct resolver by itemType
 */
import { AttemptSkillContextService } from './attempt-skill-context.service';
import { AimItemType } from './aim-request-mapper.types';

// ---------------------------------------------------------------------------
// Minimal DatabaseService mock
// ---------------------------------------------------------------------------

type QueryFn = (sql: string, params: unknown[]) => Promise<{ rows: unknown[] }>;

function makeMockDb(queryFn: QueryFn) {
  return { query: queryFn } as unknown as import('../../../database/database.service').DatabaseService;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lessonRows(...skillIds: string[]) {
  return skillIds.map((skill_id) => ({ skill_id }));
}

function questionRows(...entries: { skill_id: string; is_primary: boolean }[]) {
  return entries;
}

// ---------------------------------------------------------------------------
// resolveForLesson
// ---------------------------------------------------------------------------

describe('AttemptSkillContextService.resolveForLesson', () => {
  it('returns skill IDs in the order returned by the DB', async () => {
    const db = makeMockDb(async () => ({
      rows: lessonRows('skill-a', 'skill-b', 'skill-c'),
    }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForLesson('lesson-1');

    expect(result.skillIds).toEqual(['skill-a', 'skill-b', 'skill-c']);
  });

  it('returns empty skillIds when lesson has no skill mappings', async () => {
    const db = makeMockDb(async () => ({ rows: [] }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForLesson('lesson-no-skills');

    expect(result.skillIds).toEqual([]);
  });

  it('queries lesson_skills with the correct lessonId parameter', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (_sql, params) => {
      captured.push(params);
      return { rows: lessonRows('skill-x') };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForLesson('lesson-xyz');

    expect(captured[0]).toEqual(['lesson-xyz']);
  });

  it('queries the lesson_skills table (SQL contains lesson_skills)', async () => {
    const capturedSql: string[] = [];
    const db = makeMockDb(async (sql) => {
      capturedSql.push(sql);
      return { rows: [] };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForLesson('lesson-1');

    expect(capturedSql[0]).toContain('lesson_skills');
  });

  it('returns a single skill ID correctly', async () => {
    const db = makeMockDb(async () => ({ rows: lessonRows('only-skill') }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForLesson('lesson-single');

    expect(result.skillIds).toEqual(['only-skill']);
  });
});

// ---------------------------------------------------------------------------
// resolveForQuestion
// ---------------------------------------------------------------------------

describe('AttemptSkillContextService.resolveForQuestion', () => {
  it('returns skill IDs in the order returned by the DB', async () => {
    const db = makeMockDb(async () => ({
      rows: questionRows(
        { skill_id: 'skill-primary', is_primary: true },
        { skill_id: 'skill-secondary', is_primary: false },
      ),
    }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForQuestion('question-1');

    expect(result.skillIds).toEqual(['skill-primary', 'skill-secondary']);
  });

  it('returns empty skillIds when question has no skill mappings', async () => {
    const db = makeMockDb(async () => ({ rows: [] }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForQuestion('question-no-skills');

    expect(result.skillIds).toEqual([]);
  });

  it('queries question_skills with the correct itemId parameter', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (_sql, params) => {
      captured.push(params);
      return { rows: [] };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForQuestion('question-abc');

    expect(captured[0]).toEqual(['question-abc']);
  });

  it('queries the question_skills table (SQL contains question_skills)', async () => {
    const capturedSql: string[] = [];
    const db = makeMockDb(async (sql) => {
      capturedSql.push(sql);
      return { rows: [] };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForQuestion('question-1');

    expect(capturedSql[0]).toContain('question_skills');
  });

  it('SQL orders by is_primary DESC so primary skills appear first', async () => {
    const capturedSql: string[] = [];
    const db = makeMockDb(async (sql) => {
      capturedSql.push(sql);
      return { rows: [] };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForQuestion('question-1');

    expect(capturedSql[0]).toMatch(/is_primary\s+DESC/i);
  });

  it('returns a single non-primary skill correctly', async () => {
    const db = makeMockDb(async () => ({
      rows: questionRows({ skill_id: 'single-skill', is_primary: false }),
    }));
    const svc = new AttemptSkillContextService(db);

    const result = await svc.resolveForQuestion('question-single');

    expect(result.skillIds).toEqual(['single-skill']);
  });
});

// ---------------------------------------------------------------------------
// resolveForItem — dispatch routing
// ---------------------------------------------------------------------------

describe('AttemptSkillContextService.resolveForItem', () => {
  const lessonSkills = ['lesson-skill-1', 'lesson-skill-2'];
  const questionSkills = ['question-skill-1'];

  function makeDispatchDb() {
    return makeMockDb(async (sql) => {
      if (sql.includes('lesson_skills')) {
        return { rows: lessonRows(...lessonSkills) };
      }
      return { rows: questionRows({ skill_id: questionSkills[0], is_primary: true }) };
    });
  }

  it('routes lesson_question to resolveForLesson', async () => {
    const svc = new AttemptSkillContextService(makeDispatchDb());

    const result = await svc.resolveForItem('item-1', 'lesson_question');

    expect(result.skillIds).toEqual(lessonSkills);
  });

  it('routes practice_question to resolveForQuestion', async () => {
    const svc = new AttemptSkillContextService(makeDispatchDb());

    const result = await svc.resolveForItem('item-2', 'practice_question');

    expect(result.skillIds).toEqual(questionSkills);
  });

  it('routes review_question to resolveForQuestion', async () => {
    const svc = new AttemptSkillContextService(makeDispatchDb());

    const result = await svc.resolveForItem('item-3', 'review_question');

    expect(result.skillIds).toEqual(questionSkills);
  });

  it('routes drill_question to resolveForQuestion', async () => {
    const svc = new AttemptSkillContextService(makeDispatchDb());

    const result = await svc.resolveForItem('item-4', 'drill_question');

    expect(result.skillIds).toEqual(questionSkills);
  });

  it('passes the itemId through to the resolver unchanged', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (_sql, params) => {
      captured.push(params);
      return { rows: [] };
    });
    const svc = new AttemptSkillContextService(db);

    await svc.resolveForItem('my-item-uuid', 'practice_question');

    expect(captured[0][0]).toBe('my-item-uuid');
  });

  it('returns empty skillIds from resolveForItem when DB has no rows', async () => {
    const db = makeMockDb(async () => ({ rows: [] }));
    const svc = new AttemptSkillContextService(db);

    const itemTypes: AimItemType[] = [
      'lesson_question',
      'practice_question',
      'review_question',
      'drill_question',
    ];

    for (const itemType of itemTypes) {
      const result = await svc.resolveForItem('item-x', itemType);
      expect(result.skillIds).toEqual([]);
    }
  });
});
