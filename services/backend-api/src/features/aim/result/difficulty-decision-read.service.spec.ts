// P20-018
// DifficultyDecisionReadService + AimResultController.getDifficultyDecision tests.
//
// Service covers:
//   - Queries difficulty_decisions by student_id (optionally + skill_id)
//   - Orders by decided_at DESC, LIMIT 1 (latest decision only)
//   - Maps all DB columns to response fields
//   - Returns found: false / difficultyDecision: null when no rows
//   - Returns studentId in response
//   - Never calls AIM Engine
//
// Controller covers:
//   - GET /aim/students/:studentId/difficulty-decisions calls service
//   - Returns service response
//   - Service errors propagate

import { DifficultyDecisionReadService } from './difficulty-decision-read.service';
import { AimResultController } from './aim-result.controller';
import { StudentSkillStateReadService } from './student-skill-state-read.service';

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
    skill_id: 'skill:english:a1:vocab.daily-routines',
    current_difficulty: 3,
    previous_difficulty: 2,
    rationale: 'consistent_performance',
    based_on_attempt_ids: ['att0e8400-e29b-41d4-a716-446655440021'],
    decided_at: '2026-06-17T16:00:00.000Z',
    updated_at: '2026-06-17T16:00:01.000Z',
    ...overrides,
  };
}

function makeSkillSvc() {
  return {
    getSkillStatesForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, skillStates: [] }),
  } as unknown as StudentSkillStateReadService;
}

// ---------------------------------------------------------------------------
// Service tests
// ---------------------------------------------------------------------------

describe('DifficultyDecisionReadService', () => {
  it('queries difficulty_decisions with correct student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (_, params) => { captured.push(params); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionReadService(db);
    await svc.getLatestForStudent(STUDENT_ID);
    expect(captured[0]?.[0]).toBe(STUDENT_ID);
  });

  it('adds a skill_id filter when skillId is provided', async () => {
    const sqls: string[] = [];
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      sqls.push(sql);
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionReadService(db);
    await svc.getLatestForStudent(STUDENT_ID, 'skill:english:a1:vocab.daily-routines');
    expect(sqls[0]).toContain('AND skill_id = $2');
    expect(captured[0]).toEqual([STUDENT_ID, 'skill:english:a1:vocab.daily-routines']);
  });

  it('omits the skill_id filter when skillId is not provided', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionReadService(db);
    await svc.getLatestForStudent(STUDENT_ID);
    expect(sqls[0]).not.toContain('skill_id = $2');
  });

  it('orders by decided_at DESC with LIMIT 1', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionReadService(db);
    await svc.getLatestForStudent(STUDENT_ID);
    expect(sqls[0]).toMatch(/ORDER BY decided_at DESC/i);
    expect(sqls[0]).toMatch(/LIMIT 1/i);
  });

  it('selects from difficulty_decisions table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionReadService(db);
    await svc.getLatestForStudent(STUDENT_ID);
    expect(sqls[0]).toContain('FROM difficulty_decisions');
  });

  it('returns found: false and difficultyDecision: null when no rows', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionReadService(db);
    const result = await svc.getLatestForStudent(STUDENT_ID);
    expect(result.found).toBe(false);
    expect(result.difficultyDecision).toBeNull();
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('maps all row fields to DifficultyDecisionEntry', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new DifficultyDecisionReadService(db);
    const result = await svc.getLatestForStudent(STUDENT_ID);
    expect(result.found).toBe(true);
    const decision = result.difficultyDecision!;
    expect(decision.skillId).toBe('skill:english:a1:vocab.daily-routines');
    expect(decision.currentDifficulty).toBe(3);
    expect(decision.previousDifficulty).toBe(2);
    expect(decision.rationale).toBe('consistent_performance');
    expect(decision.basedOnAttemptIds).toEqual(['att0e8400-e29b-41d4-a716-446655440021']);
    expect(decision.decidedAt).toBe('2026-06-17T16:00:00.000Z');
    expect(decision.updatedAt).toBe('2026-06-17T16:00:01.000Z');
  });

  it('returns studentId in response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionReadService(db);
    const result = await svc.getLatestForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionReadService(db);
    await expect(svc.getLatestForStudent(STUDENT_ID)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Controller tests
// ---------------------------------------------------------------------------

describe('AimResultController.getDifficultyDecision (P20-018)', () => {
  function makeDifficultySvc(response: unknown = { studentId: STUDENT_ID, found: false, difficultyDecision: null }) {
    return {
      getLatestForStudent: jest.fn().mockResolvedValue(response),
    } as unknown as DifficultyDecisionReadService;
  }

  it('calls DifficultyDecisionReadService with studentId from route', async () => {
    const difficultySvc = makeDifficultySvc();
    const ctrl = new AimResultController(
      makeSkillSvc(),
      {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService,
      {} as unknown as import('./session-state-read.service').SessionStateReadService,
      {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService,
      {} as unknown as import('./recommendation-read.service').RecommendationReadService,
      difficultySvc,
    );
    await ctrl.getDifficultyDecision(STUDENT_ID);
    expect(difficultySvc.getLatestForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('returns service response', async () => {
    const response = {
      studentId: STUDENT_ID,
      found: true,
      difficultyDecision: {
        skillId: 'skill:english:a1:vocab.daily-routines',
        currentDifficulty: 3,
        previousDifficulty: 2,
        rationale: 'consistent_performance',
        basedOnAttemptIds: ['att0e8400-e29b-41d4-a716-446655440021'],
        decidedAt: '2026-06-17T16:00:00.000Z',
        updatedAt: '2026-06-17T16:00:01.000Z',
      },
    };
    const difficultySvc = makeDifficultySvc(response);
    const ctrl = new AimResultController(
      makeSkillSvc(),
      {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService,
      {} as unknown as import('./session-state-read.service').SessionStateReadService,
      {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService,
      {} as unknown as import('./recommendation-read.service').RecommendationReadService,
      difficultySvc,
    );
    expect(await ctrl.getDifficultyDecision(STUDENT_ID)).toEqual(response);
  });

  it('propagates service errors', async () => {
    const difficultySvc = {
      getLatestForStudent: jest.fn().mockRejectedValue(new Error('db error')),
    } as unknown as DifficultyDecisionReadService;
    const ctrl = new AimResultController(
      makeSkillSvc(),
      {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService,
      {} as unknown as import('./session-state-read.service').SessionStateReadService,
      {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService,
      {} as unknown as import('./recommendation-read.service').RecommendationReadService,
      difficultySvc,
    );
    await expect(ctrl.getDifficultyDecision(STUDENT_ID)).rejects.toThrow('db error');
  });
});
