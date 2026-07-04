// Phase 5 — P5-068
// SessionStateReadService + AimResultController tests.

import { SessionStateReadService } from './session-state-read.service';
import { AimResultController } from './aim-result.controller';

type QueryHandler = (
  sql: string,
  params: unknown[],
) => Promise<{ rows: unknown[]; rowCount: number }>;

function makeMockDb(handler: QueryHandler) {
  return { query: handler } as unknown as import('../../../database/database.service').DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '660e8400-e29b-41d4-a716-446655440001';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    items_attempted: 3,
    items_correct: 2,
    skills_touched: ['skill:arabic:p1:vocab', 'skill:arabic:p1:listening'],
    overall_mastery_shift: 'positive',
    frustration_level: 'low',
    engagement_level: 'typical',
    signal_basis: ['sustained_correct_streak'],
    closed_out_at: '2026-06-17T10:30:05.000Z',
    updated_at: '2026-06-17T10:30:05.000Z',
    ...overrides,
  };
}

describe('SessionStateReadService', () => {
  it('queries session_summaries scoped by session_id and student_id', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionStateReadService(db);
    await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(captured[0]).toEqual([SESSION_ID, STUDENT_ID]);
  });

  it('selects from session_summaries table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new SessionStateReadService(db);
    await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(sqls[0]).toContain('FROM session_summaries');
  });

  it('returns found: false when no row exists', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionStateReadService(db);
    const result = await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(result.found).toBe(false);
    expect(result.itemsAttempted).toBeNull();
    expect(result.behavioralSignal).toBeNull();
  });

  it('returns found: true and maps fields when a row exists', async () => {
    const db = makeMockDb(async () => ({ rows: [makeRow()], rowCount: 1 }));
    const svc = new SessionStateReadService(db);
    const result = await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(result.found).toBe(true);
    expect(result.itemsAttempted).toBe(3);
    expect(result.itemsCorrect).toBe(2);
    expect(result.overallMasteryShift).toBe('positive');
    expect(result.behavioralSignal).toEqual({
      frustrationLevel: 'low',
      engagementLevel: 'typical',
      signalBasis: ['sustained_correct_streak'],
    });
  });

  it('returns studentId and sessionId in the response', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionStateReadService(db);
    const result = await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.sessionId).toBe(SESSION_ID);
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionStateReadService(db);
    await expect(svc.getSessionState(STUDENT_ID, SESSION_ID)).resolves.toBeDefined();
  });
});

describe('SessionStateReadService.getRecentSessionsForStudent (P12-029)', () => {
  it('queries session_summaries scoped by student_id, ordered by updated_at desc', async () => {
    const captured: { sql: string; params: unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionStateReadService(db);
    await svc.getRecentSessionsForStudent(STUDENT_ID, 5);

    expect(captured[0].params).toEqual([STUDENT_ID, 5]);
    expect(captured[0].sql).toContain('FROM session_summaries');
    expect(captured[0].sql).toContain('WHERE student_id = $1');
    expect(captured[0].sql).toContain('ORDER BY updated_at DESC');
  });

  it('defaults to a limit of 10 when not provided', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      captured.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionStateReadService(db);
    await svc.getRecentSessionsForStudent(STUDENT_ID);

    expect(captured[0]).toEqual([STUDENT_ID, 10]);
  });

  it('maps rows into RecentSessionSummaryItem entries', async () => {
    const db = makeMockDb(async () => ({
      rows: [
        {
          session_id: SESSION_ID,
          items_attempted: 4,
          items_correct: 3,
          skills_touched: ['skill:arabic:p1:vocab'],
          overall_mastery_shift: 'positive',
          closed_out_at: '2026-06-17T10:30:05.000Z',
          updated_at: '2026-06-17T10:30:05.000Z',
        },
      ],
      rowCount: 1,
    }));
    const svc = new SessionStateReadService(db);
    const result = await svc.getRecentSessionsForStudent(STUDENT_ID);

    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.sessions).toEqual([
      {
        sessionId: SESSION_ID,
        itemsAttempted: 4,
        itemsCorrect: 3,
        skillsTouched: ['skill:arabic:p1:vocab'],
        overallMasteryShift: 'positive',
        closedOutAt: '2026-06-17T10:30:05.000Z',
        updatedAt: '2026-06-17T10:30:05.000Z',
      },
    ]);
  });

  it('returns an empty sessions array when no rows exist', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionStateReadService(db);
    const result = await svc.getRecentSessionsForStudent(STUDENT_ID);

    expect(result.sessions).toEqual([]);
  });
});

describe('AimResultController.getSessionState (P5-068)', () => {
  function makeStubs() {
    return {
      skillStateSvc: { getSkillStatesForStudent: jest.fn() } as unknown as import('./student-skill-state-read.service').StudentSkillStateReadService,
      reviewScheduleSvc: { getReviewSchedulesForStudent: jest.fn() } as unknown as import('./review-schedule-read.service').ReviewScheduleReadService,
    };
  }

  it('calls service with studentId and sessionId from route params', async () => {
    const { skillStateSvc, reviewScheduleSvc } = makeStubs();
    const sessionStateSvc = {
      getSessionState: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, sessionId: SESSION_ID, found: false }),
    } as unknown as SessionStateReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, {} as unknown as import('./recommendation-read.service').RecommendationReadService, {} as unknown as import('./difficulty-decision-read.service').DifficultyDecisionReadService);

    await ctrl.getSessionState(STUDENT_ID, SESSION_ID);

    expect(sessionStateSvc.getSessionState).toHaveBeenCalledWith(STUDENT_ID, SESSION_ID);
  });

  it('returns response from service', async () => {
    const { skillStateSvc, reviewScheduleSvc } = makeStubs();
    const response = { studentId: STUDENT_ID, sessionId: SESSION_ID, found: true, itemsAttempted: 3 };
    const sessionStateSvc = {
      getSessionState: jest.fn().mockResolvedValue(response),
    } as unknown as SessionStateReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, {} as unknown as import('./recommendation-read.service').RecommendationReadService, {} as unknown as import('./difficulty-decision-read.service').DifficultyDecisionReadService);

    const result = await ctrl.getSessionState(STUDENT_ID, SESSION_ID);

    expect(result).toEqual(response);
  });

  it('propagates service errors', async () => {
    const { skillStateSvc, reviewScheduleSvc } = makeStubs();
    const sessionStateSvc = {
      getSessionState: jest.fn().mockRejectedValue(new Error('db error')),
    } as unknown as SessionStateReadService;
    const ctrl = new AimResultController(skillStateSvc, reviewScheduleSvc, sessionStateSvc, {} as unknown as import('./weakness-records-read.service').WeaknessRecordsReadService, {} as unknown as import('./recommendation-read.service').RecommendationReadService, {} as unknown as import('./difficulty-decision-read.service').DifficultyDecisionReadService);

    await expect(ctrl.getSessionState(STUDENT_ID, SESSION_ID)).rejects.toThrow('db error');
  });
});
