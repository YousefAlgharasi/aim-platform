// Phase 5 — P5-070
// WeaknessRecordsReadService + AimResultController tests.

import { WeaknessRecordsReadService } from './weakness-records-read.service';
import { AimResultController } from './aim-result.controller';

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
    id: 'bb0e8400-e29b-41d4-a716-446655440006',
    skill_id: 'skill:arabic:p1:grammar',
    severity: 'developing',
    status: 'open',
    trigger_attempt_ids: ['880e8400-e29b-41d4-a716-446655440003'],
    detected_at: '2026-06-17T10:30:00.000Z',
    resolved_at: null,
    updated_at: '2026-06-17T10:30:00.000Z',
    ...overrides,
  };
}

describe('WeaknessRecordsReadService', () => {
  it('queries weakness_records with correct student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessRecordsReadService(db);
    await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(captured[0]?.[0]).toBe(STUDENT_ID);
  });

  it('selects from weakness_records table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new WeaknessRecordsReadService(db);
    await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(sqls[0]).toContain('FROM weakness_records');
  });

  it('orders open/improving before resolved, then by detected_at DESC', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new WeaknessRecordsReadService(db);
    await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(sqls[0]).toMatch(/ORDER BY/i);
    expect(sqls[0]).toContain("status = 'resolved'");
    expect(sqls[0]).toMatch(/detected_at DESC/i);
  });

  it('returns empty weaknessRecords when no rows found', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new WeaknessRecordsReadService(db);
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(result.weaknessRecords).toHaveLength(0);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('maps DB row to WeaknessRecordEntry correctly', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new WeaknessRecordsReadService(db);
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    const entry = result.weaknessRecords[0];
    expect(entry.weaknessId).toBe('bb0e8400-e29b-41d4-a716-446655440006');
    expect(entry.skillId).toBe('skill:arabic:p1:grammar');
    expect(entry.severity).toBe('developing');
    expect(entry.status).toBe('open');
    expect(entry.triggerAttemptIds).toEqual(['880e8400-e29b-41d4-a716-446655440003']);
    expect(entry.resolvedAt).toBeNull();
  });

  it('maps resolvedAt when present', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ status: 'resolved', resolved_at: '2026-06-18T08:00:00.000Z' })],
      rowCount: 1,
    }));
    const svc = new WeaknessRecordsReadService(db);
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(result.weaknessRecords[0].resolvedAt).toBe('2026-06-18T08:00:00.000Z');
  });

  it('returns multiple weakness records', async () => {
    const db = makeMockDb(async () => ({
      rows: [
        makeRow({ id: 'w1', skill_id: 'skill:a' }),
        makeRow({ id: 'w2', skill_id: 'skill:b' }),
      ],
      rowCount: 2,
    }));
    const svc = new WeaknessRecordsReadService(db);
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(result.weaknessRecords).toHaveLength(2);
  });

  it('returns studentId in response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new WeaknessRecordsReadService(db);
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new WeaknessRecordsReadService(db);
    await expect(svc.getWeaknessRecordsForStudent(STUDENT_ID)).resolves.toBeDefined();
  });
});

describe('AimResultController.getWeaknessRecords (P5-070)', () => {
  function makeStubs() {
    return {
      skillStateSvc: { getSkillStatesForStudent: jest.fn() } as unknown as import('./student-skill-state-read.service').StudentSkillStateReadService,
      reviewScheduleSvc: { getReviewSchedulesForStudent: jest.fn() } as unknown as import('./review-schedule-read.service').ReviewScheduleReadService,
      sessionStateSvc: { getSessionState: jest.fn() } as unknown as import('./session-state-read.service').SessionStateReadService,
    };
  }

  it('calls service with studentId from route param', async () => {
    const { skillStateSvc, reviewScheduleSvc, sessionStateSvc } = makeStubs();
    const weaknessRecordsSvc = {
      getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, weaknessRecords: [] }),
    } as unknown as WeaknessRecordsReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, weaknessRecordsSvc);

    await ctrl.getWeaknessRecords(STUDENT_ID);

    expect(weaknessRecordsSvc.getWeaknessRecordsForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('returns response from service', async () => {
    const { skillStateSvc, reviewScheduleSvc, sessionStateSvc } = makeStubs();
    const response = {
      studentId: STUDENT_ID,
      weaknessRecords: [{
        weaknessId: 'bb0e8400-e29b-41d4-a716-446655440006',
        skillId: 'skill:arabic:p1:grammar',
        severity: 'developing',
        status: 'open',
        triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
        detectedAt: '2026-06-17T10:30:00Z',
        resolvedAt: null,
        updatedAt: '2026-06-17T10:30:00Z',
      }],
    };
    const weaknessRecordsSvc = {
      getWeaknessRecordsForStudent: jest.fn().mockResolvedValue(response),
    } as unknown as WeaknessRecordsReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, weaknessRecordsSvc);

    const result = await ctrl.getWeaknessRecords(STUDENT_ID);

    expect(result).toEqual(response);
  });

  it('propagates service errors', async () => {
    const { skillStateSvc, reviewScheduleSvc, sessionStateSvc } = makeStubs();
    const weaknessRecordsSvc = {
      getWeaknessRecordsForStudent: jest.fn().mockRejectedValue(new Error('db error')),
    } as unknown as WeaknessRecordsReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, weaknessRecordsSvc);

    await expect(ctrl.getWeaknessRecords(STUDENT_ID)).rejects.toThrow('db error');
  });
});
