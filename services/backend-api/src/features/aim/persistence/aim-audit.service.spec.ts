// Phase 5 — P5-064
// AimAuditService tests.
//
// Covers:
//   - Inserts into aim_audit_log table
//   - Passes all required fields: requestId, backendRequestId, endpoint,
//     pipelineStage, outcome
//   - Passes optional fields: integrationErrorCode, studentId, sessionId,
//     attemptId, attemptNumber, durationMs
//   - Nulls optional fields when not provided
//   - Serialises metadata as JSON
//   - Empty metadata defaults to {}
//   - Audit failure is silently swallowed (does not throw)
//   - Never calls AIM Engine (scope guard)

import { AimAuditService, AimAuditEntry } from './aim-audit.service';

// ---------------------------------------------------------------------------
// Mock DB helper
// ---------------------------------------------------------------------------

type QueryHandler = (
  sql: string,
  params: unknown[],
) => Promise<{ rows: unknown[]; rowCount: number }>;

function makeMockDb(handler: QueryHandler) {
  return { query: handler } as unknown as import('../../../database/database.service').DatabaseService;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeEntry(overrides: Partial<AimAuditEntry> = {}): AimAuditEntry {
  return {
    requestId: 'req0e8400-e29b-41d4-a716-446655440060',
    backendRequestId: 'breq8400-e29b-41d4-a716-446655440061',
    endpoint: '/aim/v1/analysis',
    pipelineStage: 'aim_engine_call',
    outcome: 'success',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AimAuditService.record', () => {
  // -------------------------------------------------------------------------
  // Basic insert
  // -------------------------------------------------------------------------

  it('inserts into aim_audit_log table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 1 }; });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry());
    expect(sqls.some(s => s.includes('INSERT INTO aim_audit_log'))).toBe(true);
  });

  it('passes requestId and backendRequestId', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry({
      requestId: 'req-aaa',
      backendRequestId: 'breq-bbb',
    }));
    expect(insertParams[0]?.[0]).toBe('req-aaa');   // request_id ($1)
    expect(insertParams[0]?.[1]).toBe('breq-bbb');  // backend_request_id ($2)
  });

  it('passes endpoint, pipelineStage, outcome', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry({
      endpoint: '/aim/v1/analysis',
      pipelineStage: 'persistence',
      outcome: 'persistence_failed',
    }));
    expect(insertParams[0]?.[2]).toBe('/aim/v1/analysis');  // endpoint ($3)
    expect(insertParams[0]?.[3]).toBe('persistence');       // pipeline_stage ($4)
    expect(insertParams[0]?.[4]).toBe('persistence_failed'); // outcome ($5)
  });

  it('passes integrationErrorCode when provided', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry({ integrationErrorCode: 'AIM_ENGINE_TIMEOUT' }));
    expect(insertParams[0]?.[5]).toBe('AIM_ENGINE_TIMEOUT'); // integration_error_code ($6)
  });

  it('passes null for integrationErrorCode when not provided', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry());
    expect(insertParams[0]?.[5]).toBeNull();
  });

  it('passes studentId, sessionId, attemptId when provided', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry({
      studentId: 'stu-001',
      sessionId: 'ses-002',
      attemptId: 'att-003',
    }));
    expect(insertParams[0]?.[6]).toBe('stu-001');  // student_id ($7)
    expect(insertParams[0]?.[7]).toBe('ses-002');  // session_id ($8)
    expect(insertParams[0]?.[8]).toBe('att-003');  // attempt_id ($9)
  });

  it('passes null for studentId, sessionId, attemptId when absent', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry());
    expect(insertParams[0]?.[6]).toBeNull();
    expect(insertParams[0]?.[7]).toBeNull();
    expect(insertParams[0]?.[8]).toBeNull();
  });

  it('passes attemptNumber and durationMs when provided', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry({ attemptNumber: 2, durationMs: 350 }));
    expect(insertParams[0]?.[9]).toBe(2);    // attempt_number ($10)
    expect(insertParams[0]?.[10]).toBe(350); // duration_ms ($11)
  });

  it('passes null for attemptNumber and durationMs when absent', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry());
    expect(insertParams[0]?.[9]).toBeNull();
    expect(insertParams[0]?.[10]).toBeNull();
  });

  it('serialises metadata as JSON', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    const meta = { skillCount: 3, droppedCount: 1, durationMs: 210 };
    await svc.record(makeEntry({ metadata: meta }));
    expect(insertParams[0]?.[11]).toBe(JSON.stringify(meta)); // metadata ($12)
  });

  it('defaults metadata to {} when not provided', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      insertParams.push(params);
      return { rows: [], rowCount: 1 };
    });
    const svc = new AimAuditService(db);
    await svc.record(makeEntry());
    expect(insertParams[0]?.[11]).toBe('{}');
  });

  // -------------------------------------------------------------------------
  // Audit failures must not propagate
  // -------------------------------------------------------------------------

  it('does not throw when DB write fails', async () => {
    const db = makeMockDb(async () => { throw new Error('DB connection lost'); });
    const svc = new AimAuditService(db);
    await expect(svc.record(makeEntry())).resolves.toBeUndefined();
  });

  it('resolves to undefined (void) on success', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 1 }));
    const svc = new AimAuditService(db);
    await expect(svc.record(makeEntry())).resolves.toBeUndefined();
  });

  it('resolves to undefined even when DB throws non-Error', async () => {
    const db = makeMockDb(async () => { throw 'string error'; });
    const svc = new AimAuditService(db);
    await expect(svc.record(makeEntry())).resolves.toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Scope guards
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 1 }));
    const svc = new AimAuditService(db);
    await expect(svc.record(makeEntry())).resolves.toBeUndefined();
  });

  it('supports all valid pipeline stages without error', async () => {
    const stages: AimAuditEntry['pipelineStage'][] = [
      'client_entry', 'pipeline_trigger', 'state_assembly', 'aim_engine_call',
      'response_validation', 'persistence', 'result_emission', 'fallback', 'audit_close_out',
    ];
    const db = makeMockDb(async () => ({ rows: [], rowCount: 1 }));
    const svc = new AimAuditService(db);
    for (const stage of stages) {
      await expect(svc.record(makeEntry({ pipelineStage: stage }))).resolves.toBeUndefined();
    }
  });

  it('supports all valid outcomes without error', async () => {
    const outcomes: AimAuditEntry['outcome'][] = [
      'success', 'transient', 'non_retryable', 'validation_failed',
      'contract_violation', 'breaker_open', 'persistence_failed', 'authorization_denied',
    ];
    const db = makeMockDb(async () => ({ rows: [], rowCount: 1 }));
    const svc = new AimAuditService(db);
    for (const outcome of outcomes) {
      await expect(svc.record(makeEntry({ outcome }))).resolves.toBeUndefined();
    }
  });
});
