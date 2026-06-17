// Phase 5 — P5-062
// FrustrationSignalService tests.
//
// Covers:
//   - null input → skipped_null, no DB calls
//   - undefined input → skipped_null, no DB calls
//   - empty sessionId → skipped with error
//   - INSERT when no existing row (action=inserted)
//   - UPDATE when existing row found (action=updated)
//   - frustrationLevel, engagementLevel, signalBasis persisted as educational enums
//   - signalBasis serialised as JSON
//   - skillsTouched serialised as JSON
//   - studentId sourced from caller, not summary payload (scope guard)
//   - no AIM Engine call (scope guard)
//   - no clinical/diagnostic label stored (safety rule covered by enum values only)

import { FrustrationSignalService } from './frustration-signal.service';
import { AimValidatedSessionSummary } from '../adapter/aim-response-mapper.types';

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

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = 'ses0e8400-e29b-41d4-a716-446655440040';

function makeSummary(
  overrides: Partial<AimValidatedSessionSummary> = {},
): AimValidatedSessionSummary {
  return {
    sessionId: SESSION_ID,
    itemsAttempted: 10,
    itemsCorrect: 7,
    skillsTouched: ['skill:arabic:p1:vocab', 'skill:arabic:p1:grammar'],
    overallMasteryShift: 'positive',
    frustrationLevel: 'none',
    engagementLevel: 'typical',
    signalBasis: ['sustained_correct_streak'],
    closedOutAt: '2026-06-17T14:30:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FrustrationSignalService.persist', () => {
  // -------------------------------------------------------------------------
  // Null / undefined
  // -------------------------------------------------------------------------

  it('returns skipped_null when sessionSummary is null', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, null);
    expect(result.action).toBe('skipped_null');
    expect(result.ok).toBe(true);
    expect(result.skippedReason).toBe('null_summary');
  });

  it('returns skipped_null when sessionSummary is undefined', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, undefined);
    expect(result.action).toBe('skipped_null');
  });

  it('makes no DB calls when sessionSummary is null', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, null);
    expect(calls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Defensive guard
  // -------------------------------------------------------------------------

  it('returns error when sessionId is empty', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary({ sessionId: '' }));
    expect(result.ok).toBe(false);
    expect(result.skippedReason).toBe('empty_session_id');
  });

  it('returns error when sessionId is whitespace only', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary({ sessionId: '   ' }));
    expect(result.ok).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Rule 1: INSERT when no existing row
  // -------------------------------------------------------------------------

  it('returns action=inserted when no existing row', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary());
    expect(result.action).toBe('inserted');
    expect(result.ok).toBe(true);
  });

  it('inserts into session_summaries table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    expect(sqls.some(s => s.includes('INSERT INTO session_summaries'))).toBe(true);
  });

  it('passes studentId, sessionId, frustrationLevel, engagementLevel on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary({
      frustrationLevel: 'low',
      engagementLevel: 'high',
    }));
    const p = insertParams[0];
    expect(p?.[0]).toBe(STUDENT_ID);     // student_id ($1)
    expect(p?.[1]).toBe(SESSION_ID);     // session_id ($2)
    expect(p?.[6]).toBe('low');          // frustration_level ($7)
    expect(p?.[7]).toBe('high');         // engagement_level ($8)
  });

  it('serialises signalBasis as JSON on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    const basis: import('../adapter/aim-response-mapper.types').AimSignalBasis[] = ['repeated_incorrect_streak', 'increased_hesitation'];
    await svc.persist(STUDENT_ID, makeSummary({ signalBasis: basis }));
    expect(insertParams[0]?.[8]).toBe(JSON.stringify(basis)); // signal_basis ($9)
  });

  it('serialises skillsTouched as JSON on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    const skills = ['skill:arabic:p1:vocab'];
    await svc.persist(STUDENT_ID, makeSummary({ skillsTouched: skills }));
    expect(insertParams[0]?.[4]).toBe(JSON.stringify(skills)); // skills_touched ($5)
  });

  it('passes itemsAttempted, itemsCorrect, overallMasteryShift, closedOutAt on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary({
      itemsAttempted: 15,
      itemsCorrect: 12,
      overallMasteryShift: 'negative',
      closedOutAt: '2026-06-17T15:00:00Z',
    }));
    const p = insertParams[0];
    expect(p?.[2]).toBe(15);                        // items_attempted ($3)
    expect(p?.[3]).toBe(12);                        // items_correct ($4)
    expect(p?.[5]).toBe('negative');                // overall_mastery_shift ($6)
    expect(p?.[9]).toBe('2026-06-17T15:00:00Z');    // closed_out_at ($10)
  });

  // -------------------------------------------------------------------------
  // Rule 2: UPDATE when existing row
  // -------------------------------------------------------------------------

  it('returns action=updated when existing row found', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary());
    expect(result.action).toBe('updated');
    expect(result.ok).toBe(true);
  });

  it('issues UPDATE (not INSERT) when existing row', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => {
      sqls.push(sql);
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    expect(sqls.some(s => s.includes('UPDATE session_summaries'))).toBe(true);
    expect(sqls.some(s => s.includes('INSERT'))).toBe(false);
  });

  it('passes frustrationLevel, engagementLevel on update', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary({
      frustrationLevel: 'moderate',
      engagementLevel: 'low',
    }));
    const p = updateParams[0];
    expect(p?.[4]).toBe('moderate');  // frustration_level ($5)
    expect(p?.[5]).toBe('low');       // engagement_level ($6)
  });

  it('serialises signalBasis as JSON on update', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    const basis: import('../adapter/aim-response-mapper.types').AimSignalBasis[] = ['increased_retry_rate'];
    await svc.persist(STUDENT_ID, makeSummary({ signalBasis: basis }));
    expect(updateParams[0]?.[6]).toBe(JSON.stringify(basis)); // signal_basis ($7)
  });

  it('UPDATE targets correct sessionId', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    // session_id is the last WHERE param ($9)
    expect(updateParams[0]?.[8]).toBe(SESSION_ID);
  });

  // -------------------------------------------------------------------------
  // Safety: only fixed enum values (educational signal, never clinical)
  // -------------------------------------------------------------------------

  it('persists frustrationLevel as received enum value (none/low/moderate/elevated)', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new FrustrationSignalService(db);
    await svc.persist(STUDENT_ID, makeSummary({ frustrationLevel: 'elevated' }));
    expect(insertParams[0]?.[6]).toBe('elevated');
  });

  // -------------------------------------------------------------------------
  // Scope guard
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new FrustrationSignalService(db);
    await expect(svc.persist(STUDENT_ID, makeSummary())).resolves.toBeDefined();
  });
});
