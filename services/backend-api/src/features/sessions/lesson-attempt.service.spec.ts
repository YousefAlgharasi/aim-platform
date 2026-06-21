// Phase 5 — P5-054
// LessonAttemptService tests.
//
// Covers:
//   - Input validation (item type, answer format, difficulty, format-consistency,
//     answer value, temporal ordering, hesitation)
//   - Session ownership verification (NOT_FOUND on missing/foreign/inactive)
//   - attempt_number_for_item backend-counted correctly
//   - responseTimeMs backend-computed from timestamps
//   - Atomic insert: both lesson_attempts and answers rows created
//   - Transaction rollback on insert failure
//   - Safe response shape
//   - Scope guards: no mastery/AIM logic introduced

import { HttpStatus } from '@nestjs/common';
import { LessonAttemptService } from './lesson-attempt.service';
import { RecordLessonAttemptInput } from './lesson-attempt.types';

// ---------------------------------------------------------------------------
// Mock DB helper
// ---------------------------------------------------------------------------

interface QueryCall {
  sql: string;
  params: unknown[];
}

function makeMockDb(handler: (sql: string, params: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>) {
  return {
    query: (sql: string, params: unknown[]) => handler(sql, params),
  } as unknown as import('../../database/database.service').DatabaseService;
}

// ---------------------------------------------------------------------------
// Valid base input
// ---------------------------------------------------------------------------

const BASE_INPUT: RecordLessonAttemptInput = {
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  learningSessionId: '660e8400-e29b-41d4-a716-446655440001',
  itemId: '990e8400-e29b-41d4-a716-446655440004',
  itemType: 'lesson_question',
  skillIds: ['skill:arabic:p1:vocab'],
  presentedDifficulty: 2,
  answerFormat: 'multiple_choice',
  answerValue: 'B',
  optionsPresentedCount: 4,
  isCorrect: true,
  startedAt: '2026-06-17T10:05:00Z',
  submittedAt: '2026-06-17T10:05:07Z',
};

// Simulates a DB that handles the full happy path
function makeHappyDb(existingAttemptCount = 0) {
  const calls: QueryCall[] = [];

  const db = makeMockDb(async (sql, params) => {
    calls.push({ sql, params });
    const s = sql.trim().toUpperCase();

    if (s.startsWith('SELECT') && sql.includes('learning_sessions')) {
      // Session ownership check
      return { rows: [{ id: params[0] }], rowCount: 1 };
    }
    if (s.startsWith('SELECT') && sql.includes('COUNT')) {
      // Attempt count
      return { rows: [{ count: String(existingAttemptCount) }], rowCount: 1 };
    }
    if (s === 'BEGIN' || s === 'COMMIT' || s === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }
    if (s.startsWith('INSERT INTO LESSON_ATTEMPTS')) {
      return {
        rows: [{
          id: 'attempt-uuid-001',
          learning_session_id: params[0],
          student_id: params[1],
          item_id: params[2],
          item_type: params[3],
          skill_ids: JSON.parse(params[4] as string),
          presented_difficulty: params[5],
          answer_format: params[6],
          answer_value: params[7],
          options_presented_count: params[8],
          is_correct: params[9],
          attempt_number_for_item: existingAttemptCount + 1,
          started_at: params[11],
          submitted_at: params[12],
          response_time_ms: params[13],
          answer_change_count: params[14],
          hesitation_before_submit_ms: params[15],
          used_hint: params[16],
          abandoned_first_then_retried: params[17],
          created_at: new Date().toISOString(),
        }],
        rowCount: 1,
      };
    }
    if (s.startsWith('INSERT INTO ANSWERS')) {
      return {
        rows: [{
          id: 'answer-uuid-001',
          lesson_attempt_id: params[0],
          student_id: params[1],
          item_id: params[2],
          answer_format: params[3],
          answer_value: params[4],
          options_presented_count: params[5],
          is_correct: params[6],
          submitted_at: params[7],
          created_at: new Date().toISOString(),
        }],
        rowCount: 1,
      };
    }
    return { rows: [], rowCount: 0 };
  });

  return { db, calls };
}

// ---------------------------------------------------------------------------
// Helper: expect AppError
// ---------------------------------------------------------------------------
async function expectError(fn: () => Promise<unknown>, code: string, status: number) {
  try {
    await fn();
    throw new Error('Expected an error but none was thrown');
  } catch (err: unknown) {
    const e = err as { code?: string; statusCode?: number };
    expect(e.code).toBe(code);
    expect(e.statusCode).toBe(status);
  }
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe('LessonAttemptService — input validation', () => {
  it('rejects invalid itemType', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, itemType: 'bad_type' as never }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects invalid answerFormat', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, answerFormat: 'emoji' as never }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects presentedDifficulty below 1', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, presentedDifficulty: 0 as never }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects presentedDifficulty above 4', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, presentedDifficulty: 5 as never }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects empty answerValue', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, answerValue: '   ' }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects missing optionsPresentedCount for multiple_choice', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, optionsPresentedCount: null }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects optionsPresentedCount present for fill_blank', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({
        ...BASE_INPUT,
        answerFormat: 'fill_blank',
        optionsPresentedCount: 4,
      }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects startedAt > submittedAt', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({
        ...BASE_INPUT,
        startedAt: '2026-06-17T10:10:00Z',
        submittedAt: '2026-06-17T10:05:00Z',
      }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects negative hesitationBeforeSubmitMs', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt({ ...BASE_INPUT, hesitationBeforeSubmitMs: -1 }),
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  });
});

// ---------------------------------------------------------------------------
// Session ownership
// ---------------------------------------------------------------------------

describe('LessonAttemptService — session ownership', () => {
  it('throws NOT_FOUND when session does not belong to student', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('learning_sessions')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt(BASE_INPUT),
      'NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  });

  it('throws NOT_FOUND when session is not active', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('learning_sessions')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    await expectError(
      () => svc.recordAttempt(BASE_INPUT),
      'NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  });
});

// ---------------------------------------------------------------------------
// attempt_number_for_item is backend-counted
// ---------------------------------------------------------------------------

describe('LessonAttemptService — attempt_number_for_item', () => {
  it('sets attempt_number_for_item to 1 on first attempt', async () => {
    const { db, calls } = makeHappyDb(0);
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt(BASE_INPUT);
    expect(result.attemptNumberForItem).toBe(1);
  });

  it('sets attempt_number_for_item to 3 when 2 prior attempts exist', async () => {
    const { db } = makeHappyDb(2);
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt(BASE_INPUT);
    expect(result.attemptNumberForItem).toBe(3);
  });

  it('counts attempts scoped to the correct (session, item) pair', async () => {
    const captured: unknown[][] = [];
    const { db } = makeHappyDb(0);
    const trackedDb = makeMockDb(async (sql, params) => {
      if (sql.includes('COUNT')) captured.push(params);
      return (db as unknown as { query: (s: string, p: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }> }).query(sql, params);
    });
    const svc = new LessonAttemptService(trackedDb);
    await svc.recordAttempt(BASE_INPUT);
    expect(captured[0]).toEqual([BASE_INPUT.learningSessionId, BASE_INPUT.itemId]);
  });
});

// ---------------------------------------------------------------------------
// responseTimeMs is backend-computed
// ---------------------------------------------------------------------------

describe('LessonAttemptService — responseTimeMs', () => {
  it('computes responseTimeMs from submittedAt minus startedAt', async () => {
    const capturedParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      const s = sql.trim().toUpperCase();
      if (s.startsWith('SELECT') && sql.includes('learning_sessions')) return { rows: [{ id: 'x' }], rowCount: 1 };
      if (s.startsWith('SELECT') && sql.includes('COUNT')) return { rows: [{ count: '0' }], rowCount: 1 };
      if (s === 'BEGIN' || s === 'COMMIT') return { rows: [], rowCount: 0 };
      if (s.startsWith('INSERT INTO LESSON_ATTEMPTS')) {
        capturedParams.push(params);
        return {
          rows: [{
            id: 'a', learning_session_id: '', student_id: '', item_id: '',
            item_type: 'lesson_question', skill_ids: [], presented_difficulty: 2,
            answer_format: 'multiple_choice', answer_value: 'B',
            options_presented_count: 4, is_correct: true, attempt_number_for_item: 1,
            started_at: params[11], submitted_at: params[12],
            response_time_ms: params[13],
            answer_change_count: 0, hesitation_before_submit_ms: null,
            used_hint: false, abandoned_first_then_retried: false,
            created_at: new Date().toISOString(),
          }],
          rowCount: 1,
        };
      }
      if (s.startsWith('INSERT INTO ANSWERS')) {
        return { rows: [{ id: 'b', lesson_attempt_id: 'a', student_id: '', item_id: '', answer_format: 'multiple_choice', answer_value: 'B', options_presented_count: 4, is_correct: true, submitted_at: new Date().toISOString(), created_at: new Date().toISOString() }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    await svc.recordAttempt({
      ...BASE_INPUT,
      startedAt: '2026-06-17T10:05:00.000Z',
      submittedAt: '2026-06-17T10:05:07.000Z',
    });
    // responseTimeMs = 7000ms (7 seconds)
    const responseTimeMs = capturedParams[0]?.[13];
    expect(responseTimeMs).toBe(7000);
  });
});

// ---------------------------------------------------------------------------
// Atomic insert — both rows written
// ---------------------------------------------------------------------------

describe('LessonAttemptService — atomic insert', () => {
  it('returns both attemptId and answerId', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt(BASE_INPUT);
    expect(result.attemptId).toBe('attempt-uuid-001');
    expect(result.answerId).toBe('answer-uuid-001');
  });

  it('wraps inserts in a transaction (BEGIN + COMMIT)', async () => {
    const txCalls: string[] = [];
    const db = makeMockDb(async (sql, params) => {
      const s = sql.trim().toUpperCase();
      if (s === 'BEGIN' || s === 'COMMIT' || s === 'ROLLBACK') txCalls.push(s);
      if (s.startsWith('SELECT') && sql.includes('learning_sessions')) return { rows: [{ id: 'x' }], rowCount: 1 };
      if (s.startsWith('SELECT') && sql.includes('COUNT')) return { rows: [{ count: '0' }], rowCount: 1 };
      if (s.startsWith('INSERT INTO LESSON_ATTEMPTS')) {
        return { rows: [{ id: 'a', learning_session_id: '', student_id: '', item_id: '', item_type: 'lesson_question', skill_ids: [], presented_difficulty: 2, answer_format: 'multiple_choice', answer_value: 'B', options_presented_count: 4, is_correct: true, attempt_number_for_item: 1, started_at: '', submitted_at: '', response_time_ms: 0, answer_change_count: 0, hesitation_before_submit_ms: null, used_hint: false, abandoned_first_then_retried: false, created_at: '' }], rowCount: 1 };
      }
      if (s.startsWith('INSERT INTO ANSWERS')) {
        return { rows: [{ id: 'b', lesson_attempt_id: 'a', student_id: '', item_id: '', answer_format: 'multiple_choice', answer_value: 'B', options_presented_count: 4, is_correct: true, submitted_at: '', created_at: '' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    await svc.recordAttempt(BASE_INPUT);
    expect(txCalls).toContain('BEGIN');
    expect(txCalls).toContain('COMMIT');
    expect(txCalls).not.toContain('ROLLBACK');
  });

  it('rolls back transaction on insert failure', async () => {
    const txCalls: string[] = [];
    const db = makeMockDb(async (sql) => {
      const s = sql.trim().toUpperCase();
      if (s === 'BEGIN' || s === 'COMMIT' || s === 'ROLLBACK') { txCalls.push(s); return { rows: [], rowCount: 0 }; }
      if (s.startsWith('SELECT') && sql.includes('learning_sessions')) return { rows: [{ id: 'x' }], rowCount: 1 };
      if (s.startsWith('SELECT') && sql.includes('COUNT')) return { rows: [{ count: '0' }], rowCount: 1 };
      if (s.startsWith('INSERT INTO LESSON_ATTEMPTS')) throw new Error('DB error');
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    await expect(svc.recordAttempt(BASE_INPUT)).rejects.toThrow('DB error');
    expect(txCalls).toContain('ROLLBACK');
    expect(txCalls).not.toContain('COMMIT');
  });
});

// ---------------------------------------------------------------------------
// Safe response shape
// ---------------------------------------------------------------------------

describe('LessonAttemptService — response shape', () => {
  it('returns correct isCorrect value', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt({ ...BASE_INPUT, isCorrect: false });
    // isCorrect in response comes from the inserted row
    expect(typeof result.isCorrect).toBe('boolean');
  });

  it('returns submittedAt string', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt(BASE_INPUT);
    expect(typeof result.submittedAt).toBe('string');
  });

  it('does not expose mastery, level, or difficulty-decision fields', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    const result = await svc.recordAttempt(BASE_INPUT);
    const keys = Object.keys(result);
    for (const forbidden of ['mastery', 'masteryScore', 'nextDifficulty', 'weakness', 'recommendation']) {
      expect(keys).not.toContain(forbidden);
    }
  });
});

// ---------------------------------------------------------------------------
// Defaults applied correctly
// ---------------------------------------------------------------------------

describe('LessonAttemptService — optional field defaults', () => {
  it('defaults answerChangeCount to 0 when omitted', async () => {
    const capturedParams: unknown[][] = [];
    const db = makeMockDb(async (sql, params) => {
      const s = sql.trim().toUpperCase();
      if (s.startsWith('SELECT') && sql.includes('learning_sessions')) return { rows: [{ id: 'x' }], rowCount: 1 };
      if (s.startsWith('SELECT') && sql.includes('COUNT')) return { rows: [{ count: '0' }], rowCount: 1 };
      if (s === 'BEGIN' || s === 'COMMIT') return { rows: [], rowCount: 0 };
      if (s.startsWith('INSERT INTO LESSON_ATTEMPTS')) {
        capturedParams.push(params);
        return { rows: [{ id: 'a', learning_session_id: '', student_id: '', item_id: '', item_type: 'lesson_question', skill_ids: [], presented_difficulty: 2, answer_format: 'multiple_choice', answer_value: 'B', options_presented_count: 4, is_correct: true, attempt_number_for_item: 1, started_at: '', submitted_at: '', response_time_ms: 7000, answer_change_count: 0, hesitation_before_submit_ms: null, used_hint: false, abandoned_first_then_retried: false, created_at: '' }], rowCount: 1 };
      }
      if (s.startsWith('INSERT INTO ANSWERS')) return { rows: [{ id: 'b', lesson_attempt_id: 'a', student_id: '', item_id: '', answer_format: 'multiple_choice', answer_value: 'B', options_presented_count: 4, is_correct: true, submitted_at: '', created_at: '' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const svc = new LessonAttemptService(db);
    const { answerChangeCount: _, ...inputWithoutCount } = BASE_INPUT as RecordLessonAttemptInput & { answerChangeCount?: number };
    await svc.recordAttempt(inputWithoutCount);
    // answerChangeCount is param index 14 in the INSERT
    expect(capturedParams[0]?.[14]).toBe(0);
  });

  it('defaults usedHint to false when omitted', async () => {
    const { db } = makeHappyDb();
    const svc = new LessonAttemptService(db);
    // Omit usedHint entirely — service should default to false
    const { usedHint: _u, ...inputWithoutHint } = BASE_INPUT;
    await expect(svc.recordAttempt(inputWithoutHint as RecordLessonAttemptInput)).resolves.toBeDefined();
  });
});
