// P20-005: AimStateAssemblyService.assemble() — implements the root-cause stub.
//
// Covers:
//   - Missing session -> throws AppError (NOT_FOUND)
//   - Session with zero attempts -> insufficient_data (not thrown)
//   - attemptId not belonging to the session -> throws AppError (NOT_FOUND)
//   - Real assembly -> correct session/attempt shape, event counts,
//     consecutive correct/incorrect streaks, placement context inclusion rule.

import { AimStateAssemblyService } from './aim-state-assembly.service';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { AimPipelineContext } from './aim-pipeline-orchestrator.service';

const STUDENT_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const SESSION_ID = 'bbbbbbbb-0000-4000-8000-000000000002';
const ATTEMPT_ID = 'cccccccc-0000-4000-8000-000000000003';

const CTX: AimPipelineContext = {
  studentId: STUDENT_ID,
  sessionId: SESSION_ID,
  attemptId: ATTEMPT_ID,
  xRequestId: 'req-001',
};

const SESSION_ROW = {
  id: SESSION_ID,
  student_id: STUDENT_ID,
  session_type: 'lesson_practice',
  started_at: '2026-01-01T10:00:00.000Z',
  last_activity_at: '2026-01-01T10:05:00.000Z',
  current_level: 'A2',
  level_source: 'placement',
  level_set_at: '2026-01-01T09:00:00.000Z',
  skill_focus_ids: ['grammar.past_simple.forms'],
  placement_result_id: 'placement-result-1',
  placement_completed_at: '2026-01-01T08:00:00.000Z',
  contract_version: '1.0',
};

function makeAttemptRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: ATTEMPT_ID,
    learning_session_id: SESSION_ID,
    item_id: 'item-001',
    item_type: 'lesson_question',
    skill_ids: ['grammar.past_simple.forms'],
    presented_difficulty: 2,
    answer_format: 'multiple_choice',
    answer_value: 'A',
    options_presented_count: 4,
    is_correct: true,
    attempt_number_for_item: 1,
    started_at: '2026-01-01T10:04:00.000Z',
    submitted_at: '2026-01-01T10:05:00.000Z',
    response_time_ms: 4000,
    answer_change_count: 0,
    hesitation_before_submit_ms: null,
    used_hint: false,
    abandoned_first_then_retried: false,
    ...overrides,
  };
}

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: any[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

describe('AimStateAssemblyService.assemble', () => {
  it('throws AppError (NOT_FOUND) when the session does not exist', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM learning_sessions')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const service = new AimStateAssemblyService(db);
    await expect(service.assemble(CTX)).rejects.toBeInstanceOf(AppError);
  });

  it('returns insufficient_data (not a throw) when the session has zero attempts', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM learning_sessions')) return { rows: [SESSION_ROW], rowCount: 1 };
      if (sql.includes('FROM lesson_attempts')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const service = new AimStateAssemblyService(db);
    const result = await service.assemble(CTX);
    expect(result.status).toBe('insufficient_data');
  });

  it('throws AppError when the triggering attemptId does not belong to the session', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM learning_sessions')) return { rows: [SESSION_ROW], rowCount: 1 };
      if (sql.includes('FROM lesson_attempts')) {
        return { rows: [makeAttemptRow({ id: 'some-other-attempt-id' })], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    const service = new AimStateAssemblyService(db);
    await expect(service.assemble(CTX)).rejects.toBeInstanceOf(AppError);
  });

  it('assembles a real AimMappingContext with event counts and streaks', async () => {
    const attempts = [
      makeAttemptRow({ id: 'attempt-a', submitted_at: '2026-01-01T10:01:00.000Z', is_correct: false, response_time_ms: 2000 }),
      makeAttemptRow({ id: 'attempt-b', submitted_at: '2026-01-01T10:02:00.000Z', is_correct: true, response_time_ms: 3000 }),
      makeAttemptRow({ id: ATTEMPT_ID, submitted_at: '2026-01-01T10:05:00.000Z', is_correct: true, response_time_ms: 4000 }),
    ];

    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM learning_sessions')) return { rows: [SESSION_ROW], rowCount: 1 };
      if (sql.includes('FROM lesson_attempts')) return { rows: attempts, rowCount: attempts.length };
      if (sql.includes('FROM session_events')) {
        return {
          rows: [
            { event_type: 'hesitation', count: '2' },
            { event_type: 'retry', count: '1' },
            { event_type: 'idle_gap', count: '0' },
          ],
          rowCount: 3,
        };
      }
      if (sql.includes('FROM student_skill_states')) return { rows: [{ count: '0' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const service = new AimStateAssemblyService(db);
    const result = await service.assemble(CTX);

    expect(result.status).toBe('assembled');
    if (result.status !== 'assembled') return;

    expect(result.context.session.sessionId).toBe(SESSION_ID);
    expect(result.context.session.studentId).toBe(STUDENT_ID);
    expect(result.context.session.behavioralContext.itemsAttemptedInSession).toBe(3);
    // Last two attempts are correct -> consecutiveCorrect 2, consecutiveIncorrect 0.
    expect(result.context.session.behavioralContext.consecutiveCorrect).toBe(2);
    expect(result.context.session.behavioralContext.consecutiveIncorrect).toBe(0);
    expect(result.context.session.behavioralContext.averageResponseTimeMs).toBeCloseTo(3000);
    expect(result.context.session.behavioralContext.hesitationEventCount).toBe(2);
    expect(result.context.session.behavioralContext.retryEventCount).toBe(1);
    expect(result.context.session.behavioralContext.idleGapCount).toBe(0);

    // Only the triggering attempt is included in the attempts array.
    expect(result.context.attempts).toHaveLength(1);
    expect(result.context.attempts[0].attemptId).toBe(ATTEMPT_ID);

    // No prior skill-state history -> placement context included.
    expect(result.context.session.placementContext).not.toBeNull();
    expect(result.context.session.placementContext?.placementResultId).toBe('placement-result-1');
    expect(result.context.session.placementContext?.initialSkillSignals).toEqual([]);
  });

  it('omits placementContext once the student has skill-state history', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM learning_sessions')) return { rows: [SESSION_ROW], rowCount: 1 };
      if (sql.includes('FROM lesson_attempts')) return { rows: [makeAttemptRow()], rowCount: 1 };
      if (sql.includes('FROM session_events')) return { rows: [], rowCount: 0 };
      if (sql.includes('FROM student_skill_states')) return { rows: [{ count: '3' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const service = new AimStateAssemblyService(db);
    const result = await service.assemble(CTX);

    expect(result.status).toBe('assembled');
    if (result.status !== 'assembled') return;
    expect(result.context.session.placementContext).toBeNull();
  });
});
