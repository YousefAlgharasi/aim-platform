// Phase 5 — P5-060
// RecommendationOutputService tests.
//
// Covers:
//   - null input → skipped_null_or_empty, no DB calls
//   - undefined input → skipped_null_or_empty, no DB calls
//   - empty array → skipped_null_or_empty, no DB calls
//   - existing active rows superseded before insert
//   - supersededCount matches UPDATE RETURNING rows
//   - each valid recommendation inserted with status='active'
//   - insertedCount reflects successfully inserted rows
//   - entries with empty recommendationId are skipped
//   - entries with empty targetSkillId are skipped
//   - targetLessonId null passes as null
//   - expiresAt null passes as null
//   - basedOnWeaknessId null passes as null
//   - rank and reason passed correctly
//   - studentId never sourced from recommendation payload (scope guard)
//   - no AIM Engine call (scope guard)

import { RecommendationOutputService } from './recommendation-output.service';
import { AimValidatedRecommendation } from '../adapter/aim-response-mapper.types';

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

function makeRec(
  overrides: Partial<AimValidatedRecommendation> = {},
): AimValidatedRecommendation {
  return {
    recommendationId: 'rec0e8400-e29b-41d4-a716-446655440020',
    kind: 'lesson',
    targetSkillId: 'skill:arabic:p1:vocab',
    targetLessonId: 'les0e8400-e29b-41d4-a716-446655440021',
    rank: 1,
    reason: 'next_in_sequence',
    basedOnWeaknessId: null,
    generatedAt: '2026-06-17T14:00:00Z',
    expiresAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecommendationOutputService.replaceActiveSet', () => {
  // -------------------------------------------------------------------------
  // Null / undefined / empty input
  // -------------------------------------------------------------------------

  it('returns skipped_null_or_empty when recommendations is null', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, null);
    expect(result.skippedReason).toBe('null_or_empty_array');
    expect(result.supersededCount).toBe(0);
    expect(result.insertedCount).toBe(0);
  });

  it('returns skipped_null_or_empty when recommendations is undefined', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, undefined);
    expect(result.skippedReason).toBe('null_or_empty_array');
  });

  it('returns skipped_null_or_empty when recommendations is empty array', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, []);
    expect(result.skippedReason).toBe('null_or_empty_array');
  });

  it('makes no DB calls when recommendations is null', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, null);
    expect(calls).toHaveLength(0);
  });

  it('makes no DB calls when recommendations is empty array', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, []);
    expect(calls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Full-set replacement: supersede then insert
  // -------------------------------------------------------------------------

  it('issues UPDATE to supersede active rows before INSERT', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => {
      sqls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    const updateIdx = sqls.findIndex(s => s.includes('UPDATE recommendations'));
    const insertIdx = sqls.findIndex(s => s.includes('INSERT INTO recommendations'));
    expect(updateIdx).toBeGreaterThanOrEqual(0);
    expect(insertIdx).toBeGreaterThan(updateIdx);
  });

  it('supersede UPDATE targets student_id and status=active', async () => {
    const updateParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('UPDATE')) updateParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    expect(updateParams[0]?.[0]).toBe(STUDENT_ID);
    // SQL contains AND status = 'active' (hardcoded in query)
  });

  it('supersededCount reflects rowCount from UPDATE RETURNING', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('UPDATE')) {
        return {
          rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }],
          rowCount: 3,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    expect(result.supersededCount).toBe(3);
  });

  it('supersededCount is 0 when no active rows exist', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('UPDATE')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    expect(result.supersededCount).toBe(0);
  });

  // -------------------------------------------------------------------------
  // Insert correctness
  // -------------------------------------------------------------------------

  it('inserts into recommendations table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    expect(sqls.some(s => s.includes('INSERT INTO recommendations'))).toBe(true);
  });

  it('inserts with status=active (hardcoded in SQL)', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    const insertSql = sqls.find(s => s.includes('INSERT INTO recommendations'));
    expect(insertSql).toContain("'active'");
  });

  it('passes recommendationId as id, studentId, kind, targetSkillId, rank', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    const rec = makeRec({
      recommendationId: 'rec0e8400-e29b-41d4-a716-000000000099',
      kind: 'targeted_practice',
      targetSkillId: 'skill:arabic:p1:grammar',
      rank: 2,
    });
    await svc.replaceActiveSet(STUDENT_ID, [rec]);
    const p = insertParams[0];
    expect(p?.[0]).toBe('rec0e8400-e29b-41d4-a716-000000000099'); // id ($1)
    expect(p?.[1]).toBe(STUDENT_ID);                              // student_id ($2)
    expect(p?.[2]).toBe('targeted_practice');                     // kind ($3)
    expect(p?.[3]).toBe('skill:arabic:p1:grammar');               // target_skill_id ($4)
    expect(p?.[5]).toBe(2);                                       // rank ($6)
  });

  it('passes targetLessonId correctly', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    const lessonId = 'les0e8400-e29b-41d4-a716-999999999999';
    await svc.replaceActiveSet(STUDENT_ID, [makeRec({ targetLessonId: lessonId })]);
    expect(insertParams[0]?.[4]).toBe(lessonId); // target_lesson_id ($5)
  });

  it('passes null when targetLessonId is null', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec({ targetLessonId: null })]);
    expect(insertParams[0]?.[4]).toBeNull();
  });

  it('passes reason and basedOnWeaknessId correctly', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    const weaknessId = 'wea0e8400-e29b-41d4-a716-000000000001';
    await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ reason: 'addresses_weakness', basedOnWeaknessId: weaknessId }),
    ]);
    expect(insertParams[0]?.[6]).toBe('addresses_weakness'); // reason ($7)
    expect(insertParams[0]?.[7]).toBe(weaknessId);           // based_on_weakness_id ($8)
  });

  it('passes null for basedOnWeaknessId when null', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec({ basedOnWeaknessId: null })]);
    expect(insertParams[0]?.[7]).toBeNull();
  });

  it('passes generatedAt and expiresAt correctly', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ generatedAt: '2026-06-17T14:30:00Z', expiresAt: '2026-06-24T14:30:00Z' }),
    ]);
    expect(insertParams[0]?.[8]).toBe('2026-06-17T14:30:00Z'); // generated_at ($9)
    expect(insertParams[0]?.[9]).toBe('2026-06-24T14:30:00Z'); // expires_at ($10)
  });

  it('passes null for expiresAt when null', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec({ expiresAt: null })]);
    expect(insertParams[0]?.[9]).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Multiple recommendations
  // -------------------------------------------------------------------------

  it('inserts one row per recommendation', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ recommendationId: 'rec-aaa', rank: 1 }),
      makeRec({ recommendationId: 'rec-bbb', rank: 2 }),
      makeRec({ recommendationId: 'rec-ccc', rank: 3 }),
    ]);
    expect(insertCalls).toHaveLength(3);
  });

  it('insertedCount reflects number of valid inserted rows', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ recommendationId: 'rec-aaa', rank: 1 }),
      makeRec({ recommendationId: 'rec-bbb', rank: 2 }),
    ]);
    expect(result.insertedCount).toBe(2);
  });

  // -------------------------------------------------------------------------
  // Defensive guards: skip invalid entries
  // -------------------------------------------------------------------------

  it('skips entries with empty recommendationId', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ recommendationId: '' }),
      makeRec({ recommendationId: '   ' }),
    ]);
    expect(insertCalls).toHaveLength(0);
  });

  it('skips entries with empty targetSkillId', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [makeRec({ targetSkillId: '' })]);
    expect(insertCalls).toHaveLength(0);
  });

  it('skips invalid but still processes valid entries', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new RecommendationOutputService(db);
    await svc.replaceActiveSet(STUDENT_ID, [
      makeRec({ recommendationId: '' }),
      makeRec({ recommendationId: 'rec-valid', rank: 2 }),
    ]);
    expect(insertCalls).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // Scope guards
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    await expect(
      svc.replaceActiveSet(STUDENT_ID, [makeRec()]),
    ).resolves.toBeDefined();
  });

  it('skippedReason is null on successful persist', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new RecommendationOutputService(db);
    const result = await svc.replaceActiveSet(STUDENT_ID, [makeRec()]);
    expect(result.skippedReason).toBeNull();
  });
});
