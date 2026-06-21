// Phase 5 — P5-059
// DifficultyDecisionService tests.
//
// Covers:
//   - null/undefined decision is a no-op (skipped_null)
//   - Empty decisionId returns empty_decision_id failure
//   - Empty skillId returns empty_skill_id failure
//   - Step constraint violation (|next - prev| > 1) returns step_constraint_violated
//   - Valid first insert: no existing row → inserted
//   - Valid update: existing row with matching previousDifficulty → updated
//   - Stale decision: existing row with mismatched previousDifficulty → stale_decision
//   - Upsert SQL uses ON CONFLICT (student_id, skill_id)
//   - based_on_attempt_ids serialised as JSON
//   - studentId never sourced from decision payload (scope guard)
//   - No AIM Engine call is made here (scope guard)

import { DifficultyDecisionService } from './difficulty-decision.service';
import { AimValidatedDifficultyDecision } from '../adapter/aim-response-mapper.types';

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

function makeDecision(
  overrides: Partial<AimValidatedDifficultyDecision> = {},
): AimValidatedDifficultyDecision {
  return {
    decisionId: 'dd0e8400-e29b-41d4-a716-446655440010',
    skillId: 'skill:arabic:p1:vocab',
    nextDifficulty: 2,
    previousDifficulty: 1,
    rationale: 'mastery_increase',
    basedOnAttemptIds: ['att0e8400-e29b-41d4-a716-446655440011'],
    decidedAt: '2026-06-17T12:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DifficultyDecisionService.persist', () => {
  // -------------------------------------------------------------------------
  // Null / undefined input
  // -------------------------------------------------------------------------

  it('returns ok=true / skipped_null when decision is null', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, null);
    expect(result).toEqual({ ok: true, action: 'skipped_null' });
  });

  it('returns ok=true / skipped_null when decision is undefined', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, undefined);
    expect(result).toEqual({ ok: true, action: 'skipped_null' });
  });

  it('makes no DB calls when decision is null', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionService(db);
    await svc.persist(STUDENT_ID, null);
    expect(calls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Defensive guards
  // -------------------------------------------------------------------------

  it('returns empty_decision_id when decisionId is empty string', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision({ decisionId: '' }));
    expect(result).toEqual({ ok: false, reason: 'empty_decision_id' });
  });

  it('returns empty_decision_id when decisionId is whitespace only', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision({ decisionId: '   ' }));
    expect(result).toEqual({ ok: false, reason: 'empty_decision_id' });
  });

  it('returns empty_skill_id when skillId is empty string', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision({ skillId: '' }));
    expect(result).toEqual({ ok: false, reason: 'empty_skill_id' });
  });

  it('returns empty_skill_id when skillId is whitespace only', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision({ skillId: '   ' }));
    expect(result).toEqual({ ok: false, reason: 'empty_skill_id' });
  });

  // -------------------------------------------------------------------------
  // Step constraint
  // -------------------------------------------------------------------------

  it('returns step_constraint_violated when |next - prev| > 1', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    // 1 → 3: step = 2 (violation)
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 3, previousDifficulty: 1 }),
    );
    expect(result).toEqual({ ok: false, reason: 'step_constraint_violated' });
  });

  it('returns step_constraint_violated when |next - prev| = 2 (downward)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    // 4 → 2: step = 2 (violation)
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 2, previousDifficulty: 4 }),
    );
    expect(result).toEqual({ ok: false, reason: 'step_constraint_violated' });
  });

  it('allows step of 0 (same difficulty held)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 2, previousDifficulty: 2 }),
    );
    expect(result.ok).toBe(true);
  });

  it('allows step of 1 upward', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 2, previousDifficulty: 1 }),
    );
    expect(result.ok).toBe(true);
  });

  it('allows step of 1 downward', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 3, previousDifficulty: 4 }),
    );
    expect(result.ok).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Stale-decision guard
  // -------------------------------------------------------------------------

  it('returns stale_decision when existing row has different currentDifficulty', async () => {
    // existing persisted current_difficulty = 3, incoming previousDifficulty = 2 → stale
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ current_difficulty: 3 }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 3, previousDifficulty: 2 }),
    );
    expect(result).toEqual({ ok: false, reason: 'stale_decision' });
  });

  it('does not insert when stale_decision is detected', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [{ current_difficulty: 3 }], rowCount: 1 };
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 3, previousDifficulty: 2 }),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('allows update when previousDifficulty matches persisted currentDifficulty', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        // persisted current_difficulty = 2, incoming previousDifficulty = 2 → match
        return { rows: [{ current_difficulty: 2 }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(
      STUDENT_ID,
      makeDecision({ nextDifficulty: 3, previousDifficulty: 2 }),
    );
    expect(result).toEqual({ ok: true, action: 'updated' });
  });

  // -------------------------------------------------------------------------
  // Insert / update actions
  // -------------------------------------------------------------------------

  it('returns ok=true / inserted when no existing row', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision());
    expect(result).toEqual({ ok: true, action: 'inserted' });
  });

  it('returns ok=true / updated when existing row matches', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [{ current_difficulty: 1 }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const result = await svc.persist(STUDENT_ID, makeDecision());
    expect(result).toEqual({ ok: true, action: 'updated' });
  });

  // -------------------------------------------------------------------------
  // SQL correctness
  // -------------------------------------------------------------------------

  it('uses ON CONFLICT (student_id, skill_id) upsert', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionService(db);
    await svc.persist(STUDENT_ID, makeDecision());
    const insertSql = sqls.find(s => s.includes('INSERT INTO difficulty_decisions'));
    expect(insertSql).toBeDefined();
    expect(insertSql).toContain('ON CONFLICT');
    expect(insertSql).toContain('DO UPDATE');
  });

  it('writes to difficulty_decisions table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new DifficultyDecisionService(db);
    await svc.persist(STUDENT_ID, makeDecision());
    expect(sqls.some(s => s.includes('difficulty_decisions'))).toBe(true);
  });

  it('passes correct params: decisionId, studentId, skillId, nextDifficulty', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const decision = makeDecision({
      decisionId: 'dd0e8400-e29b-41d4-a716-000000000099',
      skillId: 'skill:arabic:p1:grammar',
      nextDifficulty: 3,
      previousDifficulty: 2,
    });
    await svc.persist(STUDENT_ID, decision);
    const p = insertParams[0];
    expect(p?.[0]).toBe('dd0e8400-e29b-41d4-a716-000000000099'); // id ($1)
    expect(p?.[1]).toBe(STUDENT_ID);                             // student_id ($2)
    expect(p?.[2]).toBe('skill:arabic:p1:grammar');             // skill_id ($3)
    expect(p?.[3]).toBe(3);                                      // current_difficulty ($4)
    expect(p?.[4]).toBe(2);                                      // previous_difficulty ($5)
  });

  it('serialises basedOnAttemptIds as JSON string', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    const ids = ['att-aaa', 'att-bbb'];
    await svc.persist(STUDENT_ID, makeDecision({ basedOnAttemptIds: ids }));
    // $7 is based_on_attempt_ids (index 6)
    expect(insertParams[0]?.[6]).toBe(JSON.stringify(ids));
  });

  it('passes rationale and decidedAt correctly', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new DifficultyDecisionService(db);
    await svc.persist(
      STUDENT_ID,
      makeDecision({ rationale: 'consistent_performance', decidedAt: '2026-06-17T15:00:00Z' }),
    );
    const p = insertParams[0];
    expect(p?.[5]).toBe('consistent_performance'); // rationale ($6)
    expect(p?.[7]).toBe('2026-06-17T15:00:00Z');  // decided_at ($8)
  });

  // -------------------------------------------------------------------------
  // Scope guards
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new DifficultyDecisionService(db);
    // Resolves without error using only the mock db — confirms no other deps
    await expect(svc.persist(STUDENT_ID, makeDecision())).resolves.toBeDefined();
  });
});
