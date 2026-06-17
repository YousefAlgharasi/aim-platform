// Phase 5 — P5-058
// WeaknessUpdateService tests.
//
// Covers:
//   - Empty input is a no-op (no DB calls)
//   - Looks up existing row by id = weaknessId
//   - First detection: insert with detectedAt verbatim, triggerAttemptIds verbatim
//   - Existing instance: update severity/status/resolvedAt, never touch detected_at
//   - triggerAttemptIds merge is append + dedupe, preserving existing order first
//   - Skips entries with empty weaknessId or skillId
//   - Processes multiple weakness records in sequence
//   - No severity/status computed here (scope guard — copied verbatim)

import { WeaknessUpdateService } from './weakness-update.service';
import { AimValidatedWeaknessRecord } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Mock DB helper
// ---------------------------------------------------------------------------

function makeMockDb(handler: (sql: string, params: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>) {
  return { query: handler } as unknown as import('../../../database/database.service').DatabaseService;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

function makeWeaknessRecord(
  overrides: Partial<AimValidatedWeaknessRecord> = {},
): AimValidatedWeaknessRecord {
  return {
    weaknessId: 'bb0e8400-e29b-41d4-a716-446655440006',
    skillId: 'skill:arabic:p1:grammar',
    severity: 'developing',
    status: 'open',
    triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
    detectedAt: '2026-06-17T10:30:00Z',
    resolvedAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WeaknessUpdateService.upsertMany', () => {
  it('is a no-op when weaknessRecords is empty', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new WeaknessUpdateService(db);
    await svc.upsertMany(STUDENT_ID, []);
    expect(calls).toHaveLength(0);
  });

  it('looks up the existing row by id = weaknessId', async () => {
    const selectCalls: { sql: string; params: unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT') && sql.includes('trigger_attempt_ids')) {
        selectCalls.push({ sql, params });
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord();
    await svc.upsertMany(STUDENT_ID, [record]);
    expect(selectCalls).toHaveLength(1);
    expect(selectCalls[0].params).toEqual([record.weaknessId]);
    expect(selectCalls[0].sql).toContain('FROM weakness_records');
  });

  it('inserts a new row on first detection with detectedAt and triggerAttemptIds verbatim', async () => {
    const insertCalls: { sql: string; params: unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT INTO weakness_records')) {
        insertCalls.push({ sql, params });
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord();
    await svc.upsertMany(STUDENT_ID, [record]);

    expect(insertCalls).toHaveLength(1);
    const [weaknessId, studentId, skillId, severity, status, triggerJson, detectedAt, resolvedAt] =
      insertCalls[0].params;
    expect(weaknessId).toBe(record.weaknessId);
    expect(studentId).toBe(STUDENT_ID);
    expect(skillId).toBe(record.skillId);
    expect(severity).toBe(record.severity);
    expect(status).toBe(record.status);
    expect(JSON.parse(triggerJson as string)).toEqual(record.triggerAttemptIds);
    expect(detectedAt).toBe(record.detectedAt);
    expect(resolvedAt).toBe(record.resolvedAt);
  });

  it('updates an existing row without an INSERT when a row already exists', async () => {
    const calls: { sql: string; params: unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      if (sql.includes('SELECT')) {
        return { rows: [{ trigger_attempt_ids: ['880e8400-e29b-41d4-a716-446655440003'] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord({ status: 'improving' });
    await svc.upsertMany(STUDENT_ID, [record]);

    const insertCalls = calls.filter((c) => c.sql.includes('INSERT INTO'));
    const updateCalls = calls.filter((c) => c.sql.includes('UPDATE weakness_records'));
    expect(insertCalls).toHaveLength(0);
    expect(updateCalls).toHaveLength(1);
  });

  it('update statement never references detected_at (never changed after first insert)', async () => {
    const calls: { sql: string }[] = [];
    const db = makeMockDb(async (sql) => {
      calls.push({ sql });
      if (sql.includes('SELECT')) {
        return { rows: [{ trigger_attempt_ids: [] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeWeaknessRecord()]);

    const updateCall = calls.find((c) => c.sql.includes('UPDATE weakness_records'));
    expect(updateCall?.sql).not.toContain('detected_at');
  });

  it('merges triggerAttemptIds by appending new ids and deduplicating', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) {
        return {
          rows: [{ trigger_attempt_ids: ['attempt-1', 'attempt-2'] }],
          rowCount: 1,
        };
      }
      if (sql.includes('UPDATE weakness_records')) {
        updateParams.push(params);
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord({
      triggerAttemptIds: ['attempt-2', 'attempt-3'], // attempt-2 already present
    });
    await svc.upsertMany(STUDENT_ID, [record]);

    const triggerJsonParam = updateParams[0][3] as string;
    expect(JSON.parse(triggerJsonParam)).toEqual(['attempt-1', 'attempt-2', 'attempt-3']);
  });

  it('sets resolvedAt from the wire output on update', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ trigger_attempt_ids: [] }], rowCount: 1 };
      }
      if (sql.includes('UPDATE weakness_records')) {
        updateParams.push(params);
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord({
      status: 'resolved',
      resolvedAt: '2026-06-18T08:00:00Z',
    });
    await svc.upsertMany(STUDENT_ID, [record]);

    const [, severity, status, , resolvedAt] = updateParams[0];
    expect(severity).toBe(record.severity);
    expect(status).toBe('resolved');
    expect(resolvedAt).toBe('2026-06-18T08:00:00Z');
  });

  it('skips entries with empty weaknessId', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new WeaknessUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeWeaknessRecord({ weaknessId: '' })]);
    expect(calls).toHaveLength(0);
  });

  it('skips entries with empty skillId', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new WeaknessUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeWeaknessRecord({ skillId: '' })]);
    expect(calls).toHaveLength(0);
  });

  it('processes multiple weakness records in sequence', async () => {
    const insertCalls: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT INTO weakness_records')) insertCalls.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [
      makeWeaknessRecord({ weaknessId: 'weakness-1', skillId: 'skill:a' }),
      makeWeaknessRecord({ weaknessId: 'weakness-2', skillId: 'skill:b' }),
    ]);
    expect(insertCalls).toHaveLength(2);
  });

  it('never computes severity or status (scope guard — copied verbatim from input)', async () => {
    const insertCalls: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT INTO weakness_records')) insertCalls.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new WeaknessUpdateService(db);
    const record = makeWeaknessRecord({ severity: 'critical', status: 'open' });
    await svc.upsertMany(STUDENT_ID, [record]);
    expect(insertCalls[0][3]).toBe('critical');
    expect(insertCalls[0][4]).toBe('open');
  });
});
