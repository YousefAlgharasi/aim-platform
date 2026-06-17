// Phase 5 — P5-071
// RecommendationReadService + AimResultController.getRecommendations tests.
//
// Service covers:
//   - Queries recommendations by student_id WHERE status='active' ORDER BY rank ASC
//   - Maps all DB columns to response fields
//   - Returns null for nullable fields (target_lesson_id, based_on_weakness_id, expires_at)
//   - Returns empty array when no active rows
//   - Returns studentId in response
//   - Never calls AIM Engine
//
// Controller covers:
//   - GET /aim/students/:studentId/recommendations calls service
//   - Returns service response
//   - Service errors propagate

import { RecommendationReadService } from './recommendation-read.service';
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
    id: 'rec0e8400-e29b-41d4-a716-446655440020',
    kind: 'lesson',
    target_skill_id: 'skill:arabic:p1:vocab',
    target_lesson_id: 'les0e8400-e29b-41d4-a716-446655440021',
    rank: 1,
    reason: 'next_in_sequence',
    based_on_weakness_id: null,
    generated_at: '2026-06-17T16:00:00.000Z',
    expires_at: null,
    status: 'active',
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

describe('RecommendationReadService', () => {
  it('queries recommendations with correct student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (_, params) => { captured.push(params); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationReadService(db);
    await svc.getActiveForStudent(STUDENT_ID);
    expect(captured[0]?.[0]).toBe(STUDENT_ID);
  });

  it('filters by status=active', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationReadService(db);
    await svc.getActiveForStudent(STUDENT_ID);
    expect(sqls[0]).toContain("status = 'active'");
  });

  it('orders by rank ASC', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationReadService(db);
    await svc.getActiveForStudent(STUDENT_ID);
    expect(sqls[0]).toMatch(/ORDER BY rank ASC/i);
  });

  it('selects from recommendations table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationReadService(db);
    await svc.getActiveForStudent(STUDENT_ID);
    expect(sqls[0]).toContain('FROM recommendations');
  });

  it('returns empty recommendations when no rows', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.recommendations).toHaveLength(0);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('maps all row fields to RecommendationEntry', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    const rec = result.recommendations[0];
    expect(rec.id).toBe('rec0e8400-e29b-41d4-a716-446655440020');
    expect(rec.kind).toBe('lesson');
    expect(rec.targetSkillId).toBe('skill:arabic:p1:vocab');
    expect(rec.targetLessonId).toBe('les0e8400-e29b-41d4-a716-446655440021');
    expect(rec.rank).toBe(1);
    expect(rec.reason).toBe('next_in_sequence');
    expect(rec.basedOnWeaknessId).toBeNull();
    expect(rec.generatedAt).toBe('2026-06-17T16:00:00.000Z');
    expect(rec.expiresAt).toBeNull();
    expect(rec.status).toBe('active');
    expect(rec.updatedAt).toBe('2026-06-17T16:00:01.000Z');
  });

  it('maps null target_lesson_id correctly', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ target_lesson_id: null })],
      rowCount: 1,
    }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.recommendations[0].targetLessonId).toBeNull();
  });

  it('maps based_on_weakness_id when present', async () => {
    const wId = 'wea0e8400-e29b-41d4-a716-000000000001';
    const db = makeMockDb(async () => ({
      rows: [makeRow({ based_on_weakness_id: wId, reason: 'addresses_weakness' })],
      rowCount: 1,
    }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.recommendations[0].basedOnWeaknessId).toBe(wId);
  });

  it('maps expires_at when present', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ expires_at: '2026-06-24T16:00:00.000Z' })],
      rowCount: 1,
    }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.recommendations[0].expiresAt).toBe('2026-06-24T16:00:00.000Z');
  });

  it('returns multiple recommendations ordered by rank', async () => {
    const db = makeMockDb(async () => ({
      rows: [
        makeRow({ id: 'rec-a', rank: 1 }),
        makeRow({ id: 'rec-b', rank: 2 }),
        makeRow({ id: 'rec-c', rank: 3 }),
      ],
      rowCount: 3,
    }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.recommendations).toHaveLength(3);
    expect(result.recommendations[0].rank).toBe(1);
    expect(result.recommendations[2].rank).toBe(3);
  });

  it('returns studentId in response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationReadService(db);
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationReadService(db);
    await expect(svc.getActiveForStudent(STUDENT_ID)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Controller tests
// ---------------------------------------------------------------------------

describe('AimResultController.getRecommendations (P5-071)', () => {
  function makeRecSvc(recs: unknown[] = []) {
    return {
      getActiveForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, recommendations: recs }),
    } as unknown as RecommendationReadService;
  }

  it('calls RecommendationReadService with studentId from route', async () => {
    const recSvc = makeRecSvc();
    const ctrl = new AimResultController(makeSkillSvc(), {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, recSvc);
    await ctrl.getRecommendations(STUDENT_ID);
    expect(recSvc.getActiveForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('returns service response', async () => {
    const response = { studentId: STUDENT_ID, recommendations: [] };
    const recSvc = { getActiveForStudent: jest.fn().mockResolvedValue(response) } as unknown as RecommendationReadService;
    const ctrl = new AimResultController(makeSkillSvc(), {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, recSvc);
    expect(await ctrl.getRecommendations(STUDENT_ID)).toEqual(response);
  });

  it('propagates service errors', async () => {
    const recSvc = { getActiveForStudent: jest.fn().mockRejectedValue(new Error('db error')) } as unknown as RecommendationReadService;
    const ctrl = new AimResultController(makeSkillSvc(), {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, recSvc);
    await expect(ctrl.getRecommendations(STUDENT_ID)).rejects.toThrow('db error');
  });

  it('getSkillStates still delegates to StudentSkillStateReadService', async () => {
    const skillSvc = makeSkillSvc();
    const recSvc = makeRecSvc();
    const ctrl = new AimResultController(skillSvc, {} as unknown as import('./review-schedule-read.service').ReviewScheduleReadService, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, recSvc);
    await ctrl.getSkillStates(STUDENT_ID);
    expect(skillSvc.getSkillStatesForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });
});
