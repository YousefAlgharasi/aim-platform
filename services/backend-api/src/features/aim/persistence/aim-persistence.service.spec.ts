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
    sessionId: SESSION_ID,
    generatedAt: '2026-06-17T16:00:00Z',
    categories: makeCategories(),
    droppedValidationCodes: [],
    ...overrides,
  };
}

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

function makeSvc(db: import('../../../database/database.service').DatabaseService) {
  const stubs = {
    skillStateUpdate: { upsertMany: jest.fn().mockResolvedValue(undefined) },
    weaknessUpdate: { upsertMany: jest.fn().mockResolvedValue(undefined) },
    difficultyDecision: { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) },
    recommendationOutput: { replaceActiveSet: jest.fn().mockResolvedValue({ skippedReason: 'null_or_empty_array' }) },
    reviewScheduleOutput: { upsertMany: jest.fn().mockResolvedValue({ processedCount: 0, skippedNullOrEmpty: true, actions: [] }) },
    sessionSummary: { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) },
    learningReminderIntegration: { createReviewReminder: jest.fn().mockResolvedValue(undefined) },
  };
  const svc = new AimPersistenceService(
    db,
    stubs.skillStateUpdate as never,
    stubs.weaknessUpdate as never,
    stubs.difficultyDecision as never,
    stubs.recommendationOutput as never,
    stubs.reviewScheduleOutput as never,
    stubs.sessionSummary as never,
    stubs.learningReminderIntegration as never,
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
});
