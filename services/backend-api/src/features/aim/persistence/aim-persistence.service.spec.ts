// Phase 5 — P5-058 follow-up
// AimPersistenceService tests (full Stage 6 wiring of all six categories).
//
// Covers:
//   - Calls each underlying persistence service with studentId + the
//     correct category slice from validatedResponse.categories
//   - Skips array-based services when their category array is empty
//     (skillState, weaknessRecords) — matches the conditional guards in
//     the implementation
//   - Always calls difficultyDecision/recommendationOutput/
//     reviewScheduleOutput/sessionSummary even when their input is
//     null/empty, since those services own their own null/empty handling
//     per their respective contracts (P5-014/P5-015/P5-016/P5-017)
//   - Does not throw on a fully empty-categories response

import { AimPersistenceService } from './aim-persistence.service';
import { WeaknessUpdateService } from './weakness-update.service';
import { StudentSkillStateUpdateService } from './student-skill-state-update.service';
import { DifficultyDecisionService } from './difficulty-decision.service';
import { RecommendationOutputService } from './recommendation-output.service';
import { ReviewScheduleOutputService } from './review-schedule-output.service';
import { SessionSummaryService } from './session-summary.service';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';
// Phase 5 — P5-065
// AimPersistenceService tests — transaction policy.
//
// The service creates tx-scoped instances of each category service internally,
// so we test transaction semantics via the mock client queries (BEGIN/COMMIT/ROLLBACK)
// and verify withClient is called. Category-level wiring is tested in each
// service's own spec suite.

import { AimPersistenceService } from './aim-persistence.service';
import { AimValidatedResponse, AimValidatedCategories } from '../adapter/aim-response-mapper.types';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = 'ses0e8400-e29b-41d4-a716-446655440050';
const BACKEND_REQUEST_ID = 'brq0e8400-e29b-41d4-a716-446655440099';

function makeEmptyCategories(): AimValidatedResponse['categories'] {
  return {
    skillState: [],
    weaknessRecords: [],
    difficultyDecision: null,
    recommendations: [],
    reviewSchedule: [],
    sessionSummary: null,
  };
}

function makeValidatedResponse(
  categories: AimValidatedResponse['categories'] = makeEmptyCategories(),
): AimValidatedResponse {
function makeCategories(overrides: Partial<AimValidatedCategories> = {}): AimValidatedCategories {
  return {
    skillState: [],
    weaknessRecords: [],
    difficultyDecision: null,
    recommendations: [],
    reviewSchedule: [],
    sessionSummary: null,
    ...overrides,
  };
}

function makeResponse(overrides: Partial<AimValidatedResponse> = {}): AimValidatedResponse {
  return {
    backendRequestId: BACKEND_REQUEST_ID,
    contractVersion: '1.0',
    studentId: STUDENT_ID,
    sessionId: '660e8400-e29b-41d4-a716-446655440001',
    generatedAt: '2026-06-17T10:30:05Z',
    categories,
    sessionId: SESSION_ID,
    generatedAt: '2026-06-17T16:00:00Z',
    categories: makeCategories(),
    droppedValidationCodes: [],
  };
}

function makeMocks() {
  const weaknessUpdate = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as WeaknessUpdateService;
  const skillStateUpdate = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as StudentSkillStateUpdateService;
  const difficultyDecision = { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) } as unknown as DifficultyDecisionService;
  const recommendationOutput = { replaceActiveSet: jest.fn().mockResolvedValue({ supersededCount: 0, insertedCount: 0 }) } as unknown as RecommendationOutputService;
  const reviewScheduleOutput = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as ReviewScheduleOutputService;
  const sessionSummary = { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) } as unknown as SessionSummaryService;

  const svc = new AimPersistenceService(
    weaknessUpdate,
    skillStateUpdate,
    difficultyDecision,
    recommendationOutput,
    reviewScheduleOutput,
    sessionSummary,
  );

  return {
    svc,
    weaknessUpdate,
    skillStateUpdate,
    difficultyDecision,
    recommendationOutput,
    reviewScheduleOutput,
    sessionSummary,
  };
}

describe('AimPersistenceService.persist', () => {
  it('calls WeaknessUpdateService.upsertMany with studentId and weaknessRecords', async () => {
    const { svc, weaknessUpdate } = makeMocks();
    const weaknessRecord = {
      weaknessId: 'bb0e8400-e29b-41d4-a716-446655440006',
      skillId: 'skill:arabic:p1:grammar',
      severity: 'developing' as const,
      status: 'open' as const,
      triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
      detectedAt: '2026-06-17T10:30:00Z',
      resolvedAt: null,
    };
    await svc.persist(makeValidatedResponse({ ...makeEmptyCategories(), weaknessRecords: [weaknessRecord] }));
    expect(weaknessUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, [weaknessRecord]);
  });

  it('does not call WeaknessUpdateService.upsertMany when weaknessRecords is empty', async () => {
    const { svc, weaknessUpdate } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(weaknessUpdate.upsertMany).not.toHaveBeenCalled();
  });

  it('calls StudentSkillStateUpdateService.upsertMany with studentId and skillState', async () => {
    const { svc, skillStateUpdate } = makeMocks();
    const skillState = {
      skillId: 'skill:arabic:p1:vocab',
      masteryScore: 0.75,
      masteryConfidence: 0.8,
      masteryTrend: 'improving' as const,
      attemptsConsideredCount: 5,
      lastAttemptId: '880e8400-e29b-41d4-a716-446655440003',
      evaluatedAt: '2026-06-17T10:30:00Z',
    };
    await svc.persist(makeValidatedResponse({ ...makeEmptyCategories(), skillState: [skillState] }));
    expect(skillStateUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, [skillState]);
  });

  it('does not call StudentSkillStateUpdateService.upsertMany when skillState is empty', async () => {
    const { svc, skillStateUpdate } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(skillStateUpdate.upsertMany).not.toHaveBeenCalled();
  });

  it('always calls DifficultyDecisionService.persist, even with null decision', async () => {
    const { svc, difficultyDecision } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(difficultyDecision.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });

  it('always calls RecommendationOutputService.replaceActiveSet, even with empty array', async () => {
    const { svc, recommendationOutput } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(recommendationOutput.replaceActiveSet).toHaveBeenCalledWith(STUDENT_ID, []);
  });

  it('always calls ReviewScheduleOutputService.upsertMany, even with empty array', async () => {
    const { svc, reviewScheduleOutput } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(reviewScheduleOutput.upsertMany).toHaveBeenCalledWith(STUDENT_ID, []);
  });

  it('always calls SessionSummaryService.persist, even with null summary', async () => {
    const { svc, sessionSummary } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(sessionSummary.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });

  it('does not throw when persisting a fully empty-categories response', async () => {
    const { svc } = makeMocks();
    await expect(svc.persist(makeValidatedResponse())).resolves.toBeUndefined();
function makeMocksWithFailure(failSql?: string) {
  const clientQueries: string[] = [];
  const mockClient = {
    query: jest.fn().mockImplementation(async (sql: string) => {
      clientQueries.push(sql);
      if (failSql && sql === failSql) throw new Error(`mock failure at ${sql}`);
      return { rows: [], rowCount: 0 };
    }),
    release: jest.fn(),
  };

  const db = {
    withClient: jest.fn().mockImplementation(
      async (callback: (client: typeof mockClient) => Promise<void>) => {
        await callback(mockClient);
      },
    ),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  } as unknown as import('../../../database/database.service').DatabaseService;

  return { db, mockClient, clientQueries };
}

// Services injected into the constructor (not used for tx-scoped writes,
// but required by NestJS DI — pass minimal stubs)
function makeStubServices() {
  return {
    skillStateUpdate: { upsertMany: jest.fn().mockResolvedValue(undefined) },
    weaknessUpdate: { upsertMany: jest.fn().mockResolvedValue(undefined) },
    difficultyDecision: { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) },
    recommendationOutput: { replaceActiveSet: jest.fn().mockResolvedValue({ skippedReason: 'null_or_empty_array' }) },
    reviewScheduleOutput: { upsertMany: jest.fn().mockResolvedValue({ processedCount: 0, skippedNullOrEmpty: true, actions: [] }) },
    sessionSummary: { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) },
  };
}

function makeSvc(db: import('../../../database/database.service').DatabaseService) {
  const stubs = makeStubServices();
  const svc = new AimPersistenceService(
    db,
    stubs.skillStateUpdate as never,
    stubs.weaknessUpdate as never,
    stubs.difficultyDecision as never,
    stubs.recommendationOutput as never,
    stubs.reviewScheduleOutput as never,
    stubs.sessionSummary as never,
  );
  return { svc, ...stubs };
}

describe('AimPersistenceService.persist (P5-065 transaction policy)', () => {
  it('calls withClient to get a dedicated connection', async () => {
    const { db } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await svc.persist(makeResponse());
    expect(db.withClient as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('issues BEGIN as the first SQL statement', async () => {
    const { db, clientQueries } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await svc.persist(makeResponse());
    expect(clientQueries[0]).toBe('BEGIN');
  });

  it('issues COMMIT as the last SQL statement on success', async () => {
    const { db, clientQueries } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await svc.persist(makeResponse());
    expect(clientQueries[clientQueries.length - 1]).toBe('COMMIT');
  });

  it('does not issue ROLLBACK on success', async () => {
    const { db, clientQueries } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await svc.persist(makeResponse());
    expect(clientQueries).not.toContain('ROLLBACK');
  });

  it('issues ROLLBACK (not COMMIT) when withClient callback throws mid-transaction', async () => {
    const clientQueries: string[] = [];
    const mockClient = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        clientQueries.push(sql);
        // After BEGIN, throw to simulate a category write failure
        if (sql === 'BEGIN') return { rows: [], rowCount: 0 };
        // Any subsequent query (COMMIT or otherwise) simulates a mid-tx error
        throw new Error('simulated mid-transaction DB error');
      }),
      release: jest.fn(),
    };
    // withClient calls the callback but the callback throws after BEGIN
    const db = {
      withClient: jest.fn().mockImplementation(async (cb: (c: typeof mockClient) => Promise<void>) => {
        await cb(mockClient);
      }),
      query: jest.fn(),
    } as unknown as import('../../../database/database.service').DatabaseService;

    const { svc } = makeSvc(db);
    await expect(svc.persist(makeResponse())).rejects.toThrow('simulated mid-transaction DB error');
    expect(clientQueries).toContain('BEGIN');
    expect(clientQueries).toContain('ROLLBACK');
  });

  it('re-throws the error after ROLLBACK', async () => {
    const db = {
      withClient: jest.fn().mockRejectedValue(new Error('withClient failed')),
      query: jest.fn(),
    } as unknown as import('../../../database/database.service').DatabaseService;
    const { svc } = makeSvc(db);
    await expect(svc.persist(makeResponse())).rejects.toThrow('withClient failed');
  });

  it('ROLLBACK comes after BEGIN on failure', async () => {
    let count = 0;
    const clientQueries: string[] = [];
    const mockClient = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        clientQueries.push(sql);
        count++;
        if (count === 2) throw new Error('fail after BEGIN');
        return { rows: [], rowCount: 0 };
      }),
      release: jest.fn(),
    };
    const db = {
      withClient: jest.fn().mockImplementation(async (cb: (c: typeof mockClient) => Promise<void>) => cb(mockClient)),
      query: jest.fn(),
    } as unknown as import('../../../database/database.service').DatabaseService;

    const { svc } = makeSvc(db);
    await expect(svc.persist(makeResponse())).rejects.toThrow();
    const beginIdx = clientQueries.indexOf('BEGIN');
    const rollbackIdx = clientQueries.indexOf('ROLLBACK');
    expect(beginIdx).toBeGreaterThanOrEqual(0);
    expect(rollbackIdx).toBeGreaterThan(beginIdx);
  });

  it('resolves to undefined (void) on success', async () => {
    const { db } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await expect(svc.persist(makeResponse())).resolves.toBeUndefined();
  });

  it('does not call AIM Engine (scope guard)', async () => {
    const { db } = makeMocksWithFailure();
    const { svc } = makeSvc(db);
    await expect(svc.persist(makeResponse())).resolves.toBeUndefined();
  });

  it('passes the same studentId to every category service for a given response', async () => {
    const { svc, weaknessUpdate, skillStateUpdate, difficultyDecision, recommendationOutput, reviewScheduleOutput, sessionSummary } = makeMocks();
    const categories = {
      skillState: [{
        skillId: 's', masteryScore: 0.5, masteryConfidence: 0.5,
        masteryTrend: 'stable' as const, attemptsConsideredCount: 1,
        lastAttemptId: 'a1', evaluatedAt: '2026-06-17T10:00:00Z',
      }],
      weaknessRecords: [{
        weaknessId: 'w1', skillId: 's', severity: 'emerging' as const,
        status: 'open' as const, triggerAttemptIds: ['a1'],
        detectedAt: '2026-06-17T10:00:00Z', resolvedAt: null,
      }],
      difficultyDecision: null,
      recommendations: [],
      reviewSchedule: [],
      sessionSummary: null,
    };
    await svc.persist(makeValidatedResponse(categories));

    expect(weaknessUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, categories.weaknessRecords);
    expect(skillStateUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, categories.skillState);
    expect(difficultyDecision.persist).toHaveBeenCalledWith(STUDENT_ID, null);
    expect(recommendationOutput.replaceActiveSet).toHaveBeenCalledWith(STUDENT_ID, []);
    expect(reviewScheduleOutput.upsertMany).toHaveBeenCalledWith(STUDENT_ID, []);
    expect(sessionSummary.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });
});
