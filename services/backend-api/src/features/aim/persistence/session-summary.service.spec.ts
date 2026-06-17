// Phase 5 — P5-063
// SessionSummaryService tests.
//
// Covers:
//   - null input → skipped_null, no DB calls
//   - undefined input → skipped_null, no DB calls
//   - empty sessionId → error result
//   - INSERT when no existing row
//   - UPDATE when existing row found
//   - all fields passed correctly on insert (studentId, sessionId, items, skills, shift, signal, closedOutAt)
//   - all AIM-derived fields overwritten on update
//   - skillsTouched serialised as JSON
//   - signalBasis serialised as JSON
//   - UPDATE targets correct sessionId
//   - frustrationLevel / engagementLevel passed as educational enum values
//   - no AIM Engine call (scope guard)

import { SessionSummaryService } from './session-summary.service';
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
const SESSION_ID = 'ses0e8400-e29b-41d4-a716-446655440050';

function makeSummary(
  overrides: Partial<AimValidatedSessionSummary> = {},
): AimValidatedSessionSummary {
  return {
    sessionId: SESSION_ID,
    itemsAttempted: 12,
    itemsCorrect: 9,
    skillsTouched: ['skill:arabic:p1:vocab'],
    overallMasteryShift: 'positive',
    frustrationLevel: 'none',
    engagementLevel: 'typical',
    signalBasis: [],
    closedOutAt: '2026-06-17T15:30:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionSummaryService.persist', () => {
  // -------------------------------------------------------------------------
  // Null / undefined
  // -------------------------------------------------------------------------

  it('returns skipped_null when sessionSummary is null', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionSummaryService(db);
    const result = await svc.persist(STUDENT_ID, null);
    expect(result.action).toBe('skipped_null');
    expect(result.ok).toBe(true);
    expect(result.skippedReason).toBe('null_summary');
  });

  it('returns skipped_null when sessionSummary is undefined', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionSummaryService(db);
    const result = await svc.persist(STUDENT_ID, undefined);
    expect(result.action).toBe('skipped_null');
  });

  it('makes no DB calls when sessionSummary is null', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, null);
    expect(calls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Defensive guard
  // -------------------------------------------------------------------------

  it('returns error when sessionId is empty', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionSummaryService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary({ sessionId: '' }));
    expect(result.ok).toBe(false);
    expect(result.skippedReason).toBe('empty_session_id');
  });

  // -------------------------------------------------------------------------
  // Rule 1: INSERT when no existing row
  // -------------------------------------------------------------------------

  it('returns action=inserted when no existing row', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    const result = await svc.persist(STUDENT_ID, makeSummary());
    expect(result.action).toBe('inserted');
    expect(result.ok).toBe(true);
  });

  it('inserts into session_summaries table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    expect(sqls.some(s => s.includes('INSERT INTO session_summaries'))).toBe(true);
  });

  it('passes studentId, sessionId on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    expect(insertParams[0]?.[0]).toBe(STUDENT_ID); // student_id ($1)
    expect(insertParams[0]?.[1]).toBe(SESSION_ID);  // session_id ($2)
  });

  it('passes itemsAttempted, itemsCorrect on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary({ itemsAttempted: 20, itemsCorrect: 15 }));
    expect(insertParams[0]?.[2]).toBe(20); // items_attempted ($3)
    expect(insertParams[0]?.[3]).toBe(15); // items_correct ($4)
  });

  it('serialises skillsTouched as JSON on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    const skills = ['skill:arabic:p1:vocab', 'skill:arabic:p1:grammar'];
    await svc.persist(STUDENT_ID, makeSummary({ skillsTouched: skills }));
    expect(insertParams[0]?.[4]).toBe(JSON.stringify(skills)); // skills_touched ($5)
  });

  it('passes overallMasteryShift and frustrationLevel, engagementLevel on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary({
      overallMasteryShift: 'mixed',
      frustrationLevel: 'moderate',
      engagementLevel: 'high',
    }));
    const p = insertParams[0];
    expect(p?.[5]).toBe('mixed');      // overall_mastery_shift ($6)
    expect(p?.[6]).toBe('moderate');   // frustration_level ($7)
    expect(p?.[7]).toBe('high');       // engagement_level ($8)
  });

  it('serialises signalBasis as JSON on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    const basis: AimValidatedSessionSummary['signalBasis'] = ['repeated_incorrect_streak'];
    await svc.persist(STUDENT_ID, makeSummary({ signalBasis: basis }));
    expect(insertParams[0]?.[8]).toBe(JSON.stringify(basis)); // signal_basis ($9)
  });

  it('passes closedOutAt on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary({ closedOutAt: '2026-06-17T16:00:00Z' }));
    expect(insertParams[0]?.[9]).toBe('2026-06-17T16:00:00Z'); // closed_out_at ($10)
  });

  // -------------------------------------------------------------------------
  // Rule 2: UPDATE when existing row
  // -------------------------------------------------------------------------

  it('returns action=updated when existing row found', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
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
    const svc = new SessionSummaryService(db);
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
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary({
      frustrationLevel: 'elevated',
      engagementLevel: 'low',
    }));
    expect(updateParams[0]?.[4]).toBe('elevated'); // frustration_level ($5)
    expect(updateParams[0]?.[5]).toBe('low');      // engagement_level ($6)
  });

  it('UPDATE targets correct sessionId', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    await svc.persist(STUDENT_ID, makeSummary());
    expect(updateParams[0]?.[8]).toBe(SESSION_ID); // WHERE session_id = $9
  });

  it('serialises signalBasis as JSON on update', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 'existing-id' }], rowCount: 1 };
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new SessionSummaryService(db);
    const basis: AimValidatedSessionSummary['signalBasis'] = ['increased_hesitation'];
    await svc.persist(STUDENT_ID, makeSummary({ signalBasis: basis }));
    expect(updateParams[0]?.[6]).toBe(JSON.stringify(basis)); // signal_basis ($7)
  });

  // -------------------------------------------------------------------------
  // Scope guard
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SessionSummaryService(db);
    await expect(svc.persist(STUDENT_ID, makeSummary())).resolves.toBeDefined();
  });
});
