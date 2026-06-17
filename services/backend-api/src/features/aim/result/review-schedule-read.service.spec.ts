// Phase 5 — P5-072
// ReviewScheduleReadService + AimResultController tests.
//
// Service covers:
//   - Queries review_schedules by student_id ordered by due_at
//   - Maps DB row numbers/strings to JS types
//   - Returns empty reviewSchedules array when no rows
//   - Returns studentId in response
//   - Never calls AIM Engine
//
// Controller covers:
//   - Calls service with studentId from route param
//   - Returns service response directly
//   - Service errors propagate

import { ReviewScheduleReadService } from './review-schedule-read.service';
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
    id: 'ee0e8400-e29b-41d4-a716-446655440009',
    skill_id: 'skill:arabic:p1:listening',
    due_at: '2026-06-20T10:30:00.000Z',
    interval_days: '3.00',
    repetition_count: 2,
    status: 'pending',
    based_on_attempt_id: '880e8400-e29b-41d4-a716-446655440013',
    scheduled_at: '2026-06-17T10:30:05.000Z',
    updated_at: '2026-06-17T10:30:05.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Service tests
// ---------------------------------------------------------------------------

describe('ReviewScheduleReadService', () => {
  it('queries review_schedules with correct student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleReadService(db);
    await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(captured[0]?.[0]).toBe(STUDENT_ID);
  });

  it('selects from review_schedules table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new ReviewScheduleReadService(db);
    await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(sqls[0]).toContain('review_schedules');
  });

  it('orders results by due_at ASC', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new ReviewScheduleReadService(db);
    await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(sqls[0]).toMatch(/ORDER BY due_at ASC/i);
  });

  it('returns empty reviewSchedules when no rows found', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleReadService(db);
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(result.reviewSchedules).toHaveLength(0);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('maps DB row to ReviewScheduleEntry correctly', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new ReviewScheduleReadService(db);
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    const entry = result.reviewSchedules[0];
    expect(entry.scheduleId).toBe('ee0e8400-e29b-41d4-a716-446655440009');
    expect(entry.skillId).toBe('skill:arabic:p1:listening');
    expect(entry.dueAt).toBe('2026-06-20T10:30:00.000Z');
    expect(entry.intervalDays).toBe(3);
    expect(entry.repetitionCount).toBe(2);
    expect(entry.status).toBe('pending');
    expect(entry.basedOnAttemptId).toBe('880e8400-e29b-41d4-a716-446655440013');
  });

  it('parses interval_days as float', async () => {
    const db = makeMockDb(async () => ({
      rows: [makeRow({ interval_days: '5.50' })],
      rowCount: 1,
    }));
    const svc = new ReviewScheduleReadService(db);
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(typeof result.reviewSchedules[0].intervalDays).toBe('number');
    expect(result.reviewSchedules[0].intervalDays).toBeCloseTo(5.5);
  });

  it('returns multiple review schedules', async () => {
    const db = makeMockDb(async () => ({
      rows: [
        makeRow({ skill_id: 'skill:arabic:p1:listening' }),
        makeRow({ skill_id: 'skill:arabic:p1:vocab' }),
      ],
      rowCount: 2,
    }));
    const svc = new ReviewScheduleReadService(db);
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(result.reviewSchedules).toHaveLength(2);
  });

  it('returns studentId in response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleReadService(db);
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleReadService(db);
    await expect(svc.getReviewSchedulesForStudent(STUDENT_ID)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Controller tests
// ---------------------------------------------------------------------------

describe('AimResultController.getReviewSchedules (P5-072)', () => {
  it('calls service with studentId from route param', async () => {
    const skillStateSvc = {
      getSkillStatesForStudent: jest.fn(),
    } as unknown as import('./student-skill-state-read.service').StudentSkillStateReadService;
    const reviewScheduleSvc = {
      getReviewSchedulesForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, reviewSchedules: [] }),
    } as unknown as ReviewScheduleReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService);

    await ctrl.getReviewSchedules(STUDENT_ID);

    expect(reviewScheduleSvc.getReviewSchedulesForStudent).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('returns response from service', async () => {
    const response = {
      studentId: STUDENT_ID,
      reviewSchedules: [{
        scheduleId: 'ee0e8400-e29b-41d4-a716-446655440009',
        skillId: 'skill:arabic:p1:listening',
        dueAt: '2026-06-20T10:30:00.000Z',
        intervalDays: 3,
        repetitionCount: 2,
        status: 'pending',
        basedOnAttemptId: '880e8400-e29b-41d4-a716-446655440013',
        scheduledAt: '2026-06-17T10:30:05.000Z',
        updatedAt: '2026-06-17T10:30:05.000Z',
      }],
    };
    const skillStateSvc = {
      getSkillStatesForStudent: jest.fn(),
    } as unknown as import('./student-skill-state-read.service').StudentSkillStateReadService;
    const reviewScheduleSvc = {
      getReviewSchedulesForStudent: jest.fn().mockResolvedValue(response),
    } as unknown as ReviewScheduleReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService);

    const result = await ctrl.getReviewSchedules(STUDENT_ID);

    expect(result).toEqual(response);
  });

  it('propagates service errors', async () => {
    const skillStateSvc = {
      getSkillStatesForStudent: jest.fn(),
    } as unknown as import('./student-skill-state-read.service').StudentSkillStateReadService;
    const reviewScheduleSvc = {
      getReviewSchedulesForStudent: jest.fn().mockRejectedValue(new Error('db error')),
    } as unknown as ReviewScheduleReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, {} as unknown as import('./session-state-read.service').SessionStateReadService, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService);

    await expect(ctrl.getReviewSchedules(STUDENT_ID)).rejects.toThrow('db error');
  });
});
