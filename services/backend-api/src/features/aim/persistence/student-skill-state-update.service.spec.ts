// Phase 5 — P5-057
// StudentSkillStateUpdateService tests.
//
// Covers:
//   - Empty input is a no-op (no DB calls)
//   - Reads existing mastery_score for previous_mastery_score tracking
//   - Upsert uses ON CONFLICT for (student_id, skill_id)
//   - previous_mastery_score is null on first insert (no existing row)
//   - previous_mastery_score is set from existing row on update
//   - Skips entries with empty skillId
//   - Processes multiple skills in sequence
//   - No mastery values computed here (scope guard)

import { StudentSkillStateUpdateService } from './student-skill-state-update.service';
import { AimValidatedSkillState } from '../adapter/aim-response-mapper.types';

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

function makeSkillState(overrides: Partial<AimValidatedSkillState> = {}): AimValidatedSkillState {
  return {
    skillId: 'skill:arabic:p1:vocab',
    masteryScore: 0.75,
    masteryConfidence: 0.80,
    masteryTrend: 'improving',
    attemptsConsideredCount: 5,
    lastAttemptId: '880e8400-e29b-41d4-a716-446655440003',
    evaluatedAt: '2026-06-17T10:30:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StudentSkillStateUpdateService.upsertMany', () => {
  it('is a no-op when skillStates is empty', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, []);
    expect(calls).toHaveLength(0);
  });

  it('reads existing mastery_score before upserting', async () => {
    const selectCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT') && sql.includes('mastery_score')) {
        selectCalls.push(sql);
        return { rows: [{ mastery_score: '0.600' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeSkillState()]);
    expect(selectCalls).toHaveLength(1);
  });

  it('queries student_skill_states with correct (student_id, skill_id)', async () => {
    const captured: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT') && sql.includes('mastery_score')) {
        captured.push(params);
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    const state = makeSkillState({ skillId: 'skill:arabic:p1:grammar' });
    await svc.upsertMany(STUDENT_ID, [state]);
    expect(captured[0]).toEqual([STUDENT_ID, 'skill:arabic:p1:grammar']);
  });

  it('uses ON CONFLICT upsert SQL', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => {
      sqls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeSkillState()]);
    const insertSql = sqls.find(s => s.includes('INSERT INTO student_skill_states'));
    expect(insertSql).toBeDefined();
    expect(insertSql).toContain('ON CONFLICT');
    expect(insertSql).toContain('DO UPDATE');
  });

  it('passes null as previous_mastery_score when no existing row', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeSkillState()]);
    // previous_mastery_score is param $6 (index 5)
    expect(insertParams[0]?.[5]).toBeNull();
  });

  it('passes existing mastery_score as previous_mastery_score on update', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [{ mastery_score: '0.650' }], rowCount: 1 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeSkillState()]);
    expect(insertParams[0]?.[5]).toBe('0.650');
  });

  it('passes masteryScore, masteryConfidence, masteryTrend correctly', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    const state = makeSkillState({ masteryScore: 0.82, masteryConfidence: 0.90, masteryTrend: 'stable' });
    await svc.upsertMany(STUDENT_ID, [state]);
    expect(insertParams[0]?.[2]).toBe(0.82);    // masteryScore ($3)
    expect(insertParams[0]?.[3]).toBe(0.90);    // masteryConfidence ($4)
    expect(insertParams[0]?.[4]).toBe('stable'); // masteryTrend ($5)
  });

  it('skips entries with empty skillId', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [
      makeSkillState({ skillId: '' }),
      makeSkillState({ skillId: '   ' }),
    ]);
    expect(insertCalls).toHaveLength(0);
  });

  it('processes multiple skills in sequence', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [
      makeSkillState({ skillId: 'skill:a' }),
      makeSkillState({ skillId: 'skill:b' }),
      makeSkillState({ skillId: 'skill:c' }),
    ]);
    expect(insertCalls).toHaveLength(3);
  });

  it('skips empty-skill entries but still processes valid ones', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [
      makeSkillState({ skillId: '' }),
      makeSkillState({ skillId: 'skill:valid' }),
    ]);
    expect(insertCalls).toHaveLength(1);
  });

  it('inserts into student_skill_states table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => {
      sqls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new StudentSkillStateUpdateService(db);
    await svc.upsertMany(STUDENT_ID, [makeSkillState()]);
    expect(sqls.some(s => s.includes('student_skill_states'))).toBe(true);
  });

  it('does not call AIM Engine (no HTTP calls)', async () => {
    // Verify the service only uses db.query — no other dependencies
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new StudentSkillStateUpdateService(db);
    // If this resolves without error, the service has no other deps
    await expect(svc.upsertMany(STUDENT_ID, [makeSkillState()])).resolves.toBeUndefined();
  });
});
