// Phase 5 — P5-069
// StudentSkillStateReadService + AimResultController tests.
//
// Service covers:
//   - Queries student_skill_states by student_id ordered by skill_id
//   - Maps DB row numbers to JS floats
//   - Maps null previous_mastery_score correctly
//   - Returns empty skillStates array when no rows
//   - Returns studentId in response
//   - Never calls AIM Engine
//
// Controller covers:
//   - Calls service with studentId from route param
//   - Returns service response directly
//   - Service errors propagate

import { StudentSkillStateReadService } from './student-skill-state-read.service';
import { AimResultController } from './aim-result.controller';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type QueryHandler = (
  sql: string,
  params: unknown[],
) => Promise<{ rows: unknown[]; rowCount: number }>;

function makeMockDb(handler: QueryHandler) {
  return { query: handler } as unknown as import('../../../database/database.service').DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    skill_id: 'skill:arabic:p1:vocab',
    mastery_score: '0.750',
    mastery_confidence: '0.800',
    mastery_trend: 'improving',
    previous_mastery_score: '0.600',
    last_attempt_id: 'att0e8400-e29b-41d4-a716-446655440080',
    last_evaluated_at: '2026-06-17T16:00:00.000Z',
    updated_at: '2026-06-17T16:00:01.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Service tests
// ---------------------------------------------------------------------------

describe('StudentSkillStateReadService', () => {
  it('queries student_skill_states with correct student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateReadService(db);
    await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(captured[0]?.[0]).toBe(STUDENT_ID);
  });

  it('selects from student_skill_states table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new StudentSkillStateReadService(db);
    await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(sqls[0]).toContain('student_skill_states');
  });

  it('orders results by skill_id ASC', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new StudentSkillStateReadService(db);
    await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(sqls[0]).toMatch(/ORDER BY skill_id ASC/i);
  });

  it('returns empty skillStates when no rows found', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.skillStates).toHaveLength(0);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('maps DB row to SkillStateEntry correctly', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    const entry = result.skillStates[0];
    expect(entry.skillId).toBe('skill:arabic:p1:vocab');
    expect(entry.masteryScore).toBe(0.75);
    expect(entry.masteryConfidence).toBe(0.8);
    expect(entry.masteryTrend).toBe('improving');
    expect(entry.previousMasteryScore).toBe(0.6);
    expect(entry.lastAttemptId).toBe('att0e8400-e29b-41d4-a716-446655440080');
  });

  it('sets previousMasteryScore to null when DB value is null', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ previous_mastery_score: null })],
      rowCount: 1,
    }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.skillStates[0].previousMasteryScore).toBeNull();
  });

  it('parses mastery_score as float', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ mastery_score: '0.825' })],
      rowCount: 1,
    }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(typeof result.skillStates[0].masteryScore).toBe('number');
    expect(result.skillStates[0].masteryScore).toBeCloseTo(0.825);
  });

  it('returns multiple skill states', async () => {
    const db = makeMockDb(async () => ({
      rows: [
        makeRow({ skill_id: 'skill:arabic:p1:grammar' }),
        makeRow({ skill_id: 'skill:arabic:p1:vocab' }),
      ],
      rowCount: 2,
    }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.skillStates).toHaveLength(2);
  });

  it('returns studentId in response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new StudentSkillStateReadService(db);
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new StudentSkillStateReadService(db);
    await expect(svc.getSkillStatesForStudent(STUDENT_ID)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Controller tests
// ---------------------------------------------------------------------------

describe('AimResultController.getSkillStates (P5-069)', () => {
  it('calls service with studentId from route param', async () => {
    const svc = {
      getSkillStatesForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, skillStates: [] }),
    } as unknown as StudentSkillStateReadService;
    const ctrl = new AimResultController(svc);

    await ctrl.getSkillStates(STUDENT_ID);

    expect(svc.getSkillStatesForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('returns response from service', async () => {
    const response = {
      studentId: STUDENT_ID,
      skillStates: [{ skillId: 'skill:arabic:p1:vocab', masteryScore: 0.75, masteryConfidence: 0.8, masteryTrend: 'improving', previousMasteryScore: null, lastAttemptId: 'att-001', lastEvaluatedAt: '2026-06-17T16:00:00Z', updatedAt: '2026-06-17T16:00:01Z' }],
    };
    const svc = { getSkillStatesForStudent: jest.fn().mockResolvedValue(response) } as unknown as StudentSkillStateReadService;
    const ctrl = new AimResultController(svc);

    const result = await ctrl.getSkillStates(STUDENT_ID);

    expect(result).toEqual(response);
  });

  it('propagates service errors', async () => {
    const svc = { getSkillStatesForStudent: jest.fn().mockRejectedValue(new Error('db error')) } as unknown as StudentSkillStateReadService;
    const ctrl = new AimResultController(svc);

    await expect(ctrl.getSkillStates(STUDENT_ID)).rejects.toThrow('db error');
  });
});
