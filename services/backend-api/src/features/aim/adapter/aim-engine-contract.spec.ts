// Phase 5 — P5-076
// AIM Engine contract tests.
//
// Purpose: verify the backend's outbound wire format (AimRequestMapperService,
// P5-047, sent verbatim by AimEngineClientService.postAnalysis via
// JSON.stringify, P5-045) actually matches the field names the AIM Engine's
// Pydantic request schema requires (AimAnalysisRequest, P5-021/P5-022,
// services/aim-engine/app/schemas/aim_analysis_request.py), per the shared
// contracts P5-009 (session input) and P5-010 (attempt input).
//
// This test encodes the EXACT snake_case field names declared in
// services/aim-engine/app/schemas/aim_analysis_request.py (verified by
// direct inspection — that schema has no alias_generator and no
// populate_by_name config, so it accepts only the literal snake_case names
// below) and checks them against the camelCase keys actually produced by
// AimRequestMapperService.
//
// Scope: this is a TEST file only. It does not modify P5-047 or P5-021/022.
// Any mismatch surfaced here is a cross-task contract defect to be resolved
// by whichever of those tasks the team designates, not by this test file.

import { AimRequestMapperService } from '../adapter/aim-request-mapper.service';
import {
  AimAttemptContextInput,
  AimMappingContext,
  AimSessionContextInput,
} from '../adapter/aim-request-mapper.types';

// ---------------------------------------------------------------------------
// Reference contract field sets (mirrors the AIM Engine Pydantic schema
// verbatim — see services/aim-engine/app/schemas/aim_analysis_request.py)
// ---------------------------------------------------------------------------

const EXPECTED_ENVELOPE_FIELDS = ['backend_request_id', 'session', 'attempts'];

const EXPECTED_SESSION_FIELDS = [
  'session_id',
  'student_id',
  'session_type',
  'started_at',
  'last_activity_at',
  'skill_focus_ids',
  'level_context',
  'placement_context',
  'behavioral_context',
  'contract_version',
];

const EXPECTED_LEVEL_CONTEXT_FIELDS = [
  'current_level',
  'level_source',
  'level_set_at',
];

const EXPECTED_SESSION_BEHAVIORAL_CONTEXT_FIELDS = [
  'items_attempted_in_session',
  'consecutive_incorrect',
  'consecutive_correct',
  'average_response_time_ms',
  'hesitation_event_count',
  'retry_event_count',
  'idle_gap_count',
];

const EXPECTED_ATTEMPT_FIELDS = [
  'attempt_id',
  'session_id',
  'item_id',
  'item_type',
  'skill_ids',
  'presented_difficulty',
  'student_answer',
  'is_correct',
  'attempt_number_for_item',
  'started_at',
  'submitted_at',
  'response_time_ms',
  'behavioral_context',
];

const EXPECTED_STUDENT_ANSWER_FIELDS = [
  'format',
  'value',
  'options_presented_count',
];

const EXPECTED_ATTEMPT_BEHAVIORAL_CONTEXT_FIELDS = [
  'answer_change_count',
  'hesitation_before_submit_ms',
  'used_hint',
  'abandoned_first_then_retried',
];

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const SESSION_INPUT: AimSessionContextInput = {
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  sessionType: 'lesson_practice',
  startedAt: '2026-06-17T10:00:00Z',
  lastActivityAt: '2026-06-17T10:30:00Z',
  skillFocusIds: ['skill:english:a1:vocab.daily-routines'],
  levelContext: {
    currentLevel: 'level_2',
    levelSource: 'placement',
    levelSetAt: '2026-06-16T09:00:00Z',
  },
  placementContext: null,
  behavioralContext: {
    itemsAttemptedInSession: 3,
    consecutiveIncorrect: 0,
    consecutiveCorrect: 3,
    averageResponseTimeMs: 4200,
    hesitationEventCount: 0,
    retryEventCount: 0,
    idleGapCount: 0,
  },
  contractVersion: '1.0',
};

const ATTEMPT_INPUT: AimAttemptContextInput = {
  attemptId: '880e8400-e29b-41d4-a716-446655440003',
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
  itemId: '990e8400-e29b-41d4-a716-446655440004',
  itemType: 'lesson_question',
  skillIds: ['skill:english:a1:vocab.daily-routines'],
  presentedDifficulty: 2,
  studentAnswer: {
    format: 'multiple_choice',
    value: 'B',
    optionsPresentedCount: 4,
  },
  isCorrect: true,
  attemptNumberForItem: 1,
  startedAt: '2026-06-17T10:05:00Z',
  submittedAt: '2026-06-17T10:05:07Z',
  responseTimeMs: 7000,
  behavioralContext: {
    answerChangeCount: 0,
    hesitationBeforeSubmitMs: null,
    usedHint: false,
    abandonedFirstThenRetried: false,
  },
};

const MAPPING_CONTEXT: AimMappingContext = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  xRequestId: 'req-test-001',
  session: SESSION_INPUT,
  attempts: [ATTEMPT_INPUT],
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function keysOf(obj: unknown): string[] {
  return Object.keys(obj as Record<string, unknown>).sort();
}

// ---------------------------------------------------------------------------
// Contract tests
// ---------------------------------------------------------------------------

describe('AIM Engine request contract (P5-076)', () => {
  const mapper = new AimRequestMapperService();
  const rawRequest = mapper.map(MAPPING_CONTEXT) as Record<string, unknown>;

  it('top-level envelope keys match the AIM Engine AimAnalysisRequest schema', () => {
    expect(keysOf(rawRequest)).toEqual(EXPECTED_ENVELOPE_FIELDS.slice().sort());
  });

  it('session segment keys match the AIM Engine AimSessionInput schema', () => {
    expect(keysOf(rawRequest.session)).toEqual(EXPECTED_SESSION_FIELDS.slice().sort());
  });

  it('level_context keys match the AIM Engine schema', () => {
    const session = rawRequest.session as Record<string, unknown>;
    expect(keysOf(session.levelContext ?? session.level_context)).toEqual(
      EXPECTED_LEVEL_CONTEXT_FIELDS.slice().sort(),
    );
  });

  it('session behavioral_context keys match the AIM Engine schema', () => {
    const session = rawRequest.session as Record<string, unknown>;
    expect(keysOf(session.behavioralContext ?? session.behavioral_context)).toEqual(
      EXPECTED_SESSION_BEHAVIORAL_CONTEXT_FIELDS.slice().sort(),
    );
  });

  it('attempt entry keys match the AIM Engine AimAttemptInput schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    expect(keysOf(attempts[0])).toEqual(EXPECTED_ATTEMPT_FIELDS.slice().sort());
  });

  it('student_answer keys match the AIM Engine schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    const answer = attempts[0].studentAnswer ?? attempts[0].student_answer;
    expect(keysOf(answer)).toEqual(EXPECTED_STUDENT_ANSWER_FIELDS.slice().sort());
  });

  it('attempt behavioral_context keys match the AIM Engine schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    const ctx = attempts[0].behavioralContext ?? attempts[0].behavioral_context;
    expect(keysOf(ctx)).toEqual(EXPECTED_ATTEMPT_BEHAVIORAL_CONTEXT_FIELDS.slice().sort());
  });

  it('a JSON.stringify of the raw request would be accepted by the AIM Engine schema field names', () => {
    // This is the exact transport path used by AimEngineClientService.postAnalysis:
    // body: JSON.stringify(request). If this assertion fails, every live
    // analysis call from the backend to the AIM Engine fails Pydantic
    // validation at the AIM Engine boundary (missing required snake_case
    // fields), even though both sides pass their own isolated unit tests.
    const wireKeys = keysOf(JSON.parse(JSON.stringify(rawRequest)));
    expect(wireKeys).toEqual(EXPECTED_ENVELOPE_FIELDS.slice().sort());
  });
});
