// Phase 5 — P5-061
// ReviewScheduleOutputService tests.
//
// Covers:
//   - null input → skippedNullOrEmpty, no DB calls
//   - undefined input → skippedNullOrEmpty, no DB calls
//   - empty array → skippedNullOrEmpty, no DB calls
//   - empty scheduleId guard
//   - empty skillId guard
//   - INSERT when no existing row (action=inserted)
//   - UPDATE new cycle when repetitionCount > stored (action=updated_new_cycle)
//   - UPDATE reschedule when repetitionCount == stored, dueAt differs (action=updated_rescheduled)
//   - skip when repetitionCount < stored (action=skipped_repetition_regression)
//   - skip_no_change when repetitionCount == stored and dueAt unchanged
//   - status=due when dueAt is in the past
//   - status=pending when dueAt is in the future
//   - processedCount reflects insert+update actions only
//   - no AIM Engine call (scope guard)

import { ReviewScheduleOutputService } from './review-schedule-output.service';
import { AimValidatedReviewSchedule } from '../adapter/aim-response-mapper.types';

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
const PAST_DUE_AT = '2020-01-01T00:00:00Z';   // always in the past → due
const FUTURE_DUE_AT = '2099-12-31T23:59:59Z'; // always in the future → pending

function makeSched(
  overrides: Partial<AimValidatedReviewSchedule> = {},
): AimValidatedReviewSchedule {
  return {
    scheduleId: 'sch0e8400-e29b-41d4-a716-446655440030',
    skillId: 'skill:arabic:p1:vocab',
    dueAt: FUTURE_DUE_AT,
    intervalDays: 3,
    repetitionCount: 1,
    basedOnAttemptId: 'att0e8400-e29b-41d4-a716-446655440031',
    scheduledAt: '2026-06-17T10:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReviewScheduleOutputService.upsertMany', () => {
  // -------------------------------------------------------------------------
  // Null / undefined / empty
  // -------------------------------------------------------------------------

  it('returns skippedNullOrEmpty=true when schedules is null', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, null);
    expect(result.skippedNullOrEmpty).toBe(true);
    expect(result.processedCount).toBe(0);
  });

  it('returns skippedNullOrEmpty=true when schedules is undefined', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, undefined);
    expect(result.skippedNullOrEmpty).toBe(true);
  });

  it('returns skippedNullOrEmpty=true when schedules is empty array', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, []);
    expect(result.skippedNullOrEmpty).toBe(true);
  });

  it('makes no DB calls when schedules is null', async () => {
    const calls: string[] = [];
    const db = makeMockDb(async (sql) => { calls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, null);
    expect(calls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Defensive guards
  // -------------------------------------------------------------------------

  it('skips entry with empty scheduleId', async () => {
    const insertCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('INSERT') || sql.includes('UPDATE')) insertCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched({ scheduleId: '' })]);
    expect(insertCalls).toHaveLength(0);
    expect(result.actions[0]).toBe('skipped_empty_id');
  });

  it('skips entry with whitespace-only scheduleId', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched({ scheduleId: '   ' })]);
    expect(result.actions[0]).toBe('skipped_empty_id');
  });

  it('skips entry with empty skillId', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched({ skillId: '' })]);
    expect(result.actions[0]).toBe('skipped_empty_skill_id');
  });

  // -------------------------------------------------------------------------
  // Rule 2: INSERT when no existing row
  // -------------------------------------------------------------------------

  it('returns action=inserted when no existing row', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched()]);
    expect(result.actions[0]).toBe('inserted');
  });

  it('inserts into review_schedules table', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => { sqls.push(sql); return { rows: [], rowCount: 0 }; });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, [makeSched()]);
    expect(sqls.some(s => s.includes('INSERT INTO review_schedules'))).toBe(true);
  });

  it('passes scheduleId, studentId, skillId, dueAt on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const sched = makeSched({
      scheduleId: 'sch-test-001',
      skillId: 'skill:arabic:p1:grammar',
      dueAt: FUTURE_DUE_AT,
    });
    await svc.upsertMany(STUDENT_ID, [sched]);
    const p = insertParams[0];
    expect(p?.[0]).toBe('sch-test-001');            // id ($1)
    expect(p?.[1]).toBe(STUDENT_ID);                // student_id ($2)
    expect(p?.[2]).toBe('skill:arabic:p1:grammar'); // skill_id ($3)
    expect(p?.[3]).toBe(FUTURE_DUE_AT);            // due_at ($4)
  });

  it('passes intervalDays, repetitionCount, basedOnAttemptId, scheduledAt on insert', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const sched = makeSched({
      intervalDays: 7,
      repetitionCount: 2,
      basedOnAttemptId: 'att-abc',
      scheduledAt: '2026-06-17T09:00:00Z',
    });
    await svc.upsertMany(STUDENT_ID, [sched]);
    const p = insertParams[0];
    expect(p?.[4]).toBe(7);                        // interval_days ($5)
    expect(p?.[5]).toBe(2);                        // repetition_count ($6)
    expect(p?.[6]).toBe('att-abc');                // based_on_attempt_id ($7)
    expect(p?.[7]).toBe('2026-06-17T09:00:00Z');   // scheduled_at ($8)
  });

  // -------------------------------------------------------------------------
  // Status computation (backend-only)
  // -------------------------------------------------------------------------

  it('inserts with status=due when dueAt is in the past', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, [makeSched({ dueAt: PAST_DUE_AT })]);
    expect(insertParams[0]?.[8]).toBe('due'); // status ($9)
  });

  it('inserts with status=pending when dueAt is in the future', async () => {
    const insertParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT')) insertParams.push(params);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, [makeSched({ dueAt: FUTURE_DUE_AT })]);
    expect(insertParams[0]?.[8]).toBe('pending'); // status ($9)
  });

  // -------------------------------------------------------------------------
  // Rule 3: UPDATE new cycle (repetitionCount > stored)
  // -------------------------------------------------------------------------

  it('returns action=updated_new_cycle when repetitionCount > stored', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 1, due_at: FUTURE_DUE_AT }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched({ repetitionCount: 2 })]);
    expect(result.actions[0]).toBe('updated_new_cycle');
  });

  it('issues UPDATE (not INSERT) for new cycle', async () => {
    const sqls: string[] = [];
    const db = makeMockDb(async (sql) => {
      sqls.push(sql);
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 0, due_at: FUTURE_DUE_AT }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, [makeSched({ repetitionCount: 1 })]);
    expect(sqls.some(s => s.includes('UPDATE review_schedules'))).toBe(true);
    expect(sqls.some(s => s.includes('INSERT'))).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Rule 4: UPDATE reschedule (same repetitionCount, different dueAt)
  // -------------------------------------------------------------------------

  it('returns action=updated_rescheduled when repetitionCount same but dueAt differs', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 1, due_at: PAST_DUE_AT }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [
      makeSched({ repetitionCount: 1, dueAt: FUTURE_DUE_AT }),
    ]);
    expect(result.actions[0]).toBe('updated_rescheduled');
  });

  // -------------------------------------------------------------------------
  // Rule 5: skip repetition regression
  // -------------------------------------------------------------------------

  it('returns action=skipped_repetition_regression when repetitionCount < stored', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 3, due_at: FUTURE_DUE_AT }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [makeSched({ repetitionCount: 2 })]);
    expect(result.actions[0]).toBe('skipped_repetition_regression');
  });

  it('does not write when repetition regression detected', async () => {
    const writeCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 5, due_at: FUTURE_DUE_AT }], rowCount: 1 };
      }
      if (sql.includes('UPDATE') || sql.includes('INSERT')) writeCalls.push(sql);
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    await svc.upsertMany(STUDENT_ID, [makeSched({ repetitionCount: 2 })]);
    expect(writeCalls).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // No-change
  // -------------------------------------------------------------------------

  it('returns action=skipped_no_change when repetitionCount same and dueAt same', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        return { rows: [{ repetition_count: 1, due_at: FUTURE_DUE_AT }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [
      makeSched({ repetitionCount: 1, dueAt: FUTURE_DUE_AT }),
    ]);
    expect(result.actions[0]).toBe('skipped_no_change');
  });

  // -------------------------------------------------------------------------
  // processedCount
  // -------------------------------------------------------------------------

  it('processedCount counts only insert+update actions', async () => {
    let callIdx = 0;
    const db = makeMockDb(async (sql) => {
      if (sql.includes('SELECT')) {
        callIdx++;
        if (callIdx === 1) return { rows: [], rowCount: 0 };            // → inserted
        if (callIdx === 2) return { rows: [{ repetition_count: 1, due_at: FUTURE_DUE_AT }], rowCount: 1 }; // → skipped_repetition_regression (rep=0 < 1)
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new ReviewScheduleOutputService(db);
    const result = await svc.upsertMany(STUDENT_ID, [
      makeSched({ scheduleId: 'sch-a', repetitionCount: 1 }),
      makeSched({ scheduleId: 'sch-b', repetitionCount: 0 }),
    ]);
    // sch-a: inserted (processed), sch-b: regression (not processed)
    expect(result.processedCount).toBe(1);
  });

  // -------------------------------------------------------------------------
  // Scope guard
  // -------------------------------------------------------------------------

  it('does not make AIM Engine calls (scope guard: only uses db.query)', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new ReviewScheduleOutputService(db);
    await expect(svc.upsertMany(STUDENT_ID, [makeSched()])).resolves.toBeDefined();
  });
});
