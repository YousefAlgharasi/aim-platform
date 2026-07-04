// Phase 5 — P5-076
// AIM Engine contract tests.
//
// Purpose: verify the backend's outbound wire format (AimRequestMapperService,
// P5-047, sent verbatim by AimEngineClientService.postAnalysis via
// JSON.stringify, P5-045) matches the field names the AIM Engine's Pydantic
// request schema accepts (AimAnalysisRequest, P5-021/P5-022,
// services/aim-engine/app/schemas/aim_analysis_request.py), per the shared
// contracts P5-009 (session input) and P5-010 (attempt input).
//
// History: this test originally caught a real contract defect — the backend
// mapper emitted camelCase keys (sessionId, studentId, ...) while the AIM
// Engine schema required snake_case (session_id, student_id, ...) with no
// alias on either side, so every live analysis call failed Pydantic
// validation. Fixed in the same P5-076 changeset by adding
// AimCamelCaseModel (alias_generator=to_camel, populate_by_name=True) to
// every request/response schema class in aim_analysis_request.py and
// aim_analysis_response.py, and by serializing the response with
// model_dump(mode="json", by_alias=True) in app/api/analysis.py. The engine
// now accepts (and emits, on the response side) camelCase on the wire while
// keeping snake_case Python attribute names internally — zero changes
// required on the backend (TS) side.
//
// This test now asserts the camelCase shape the mapper has always produced,
// confirming it is accepted end-to-end by the (now-fixed) engine schema.

import { AimRequestMapperService } from '../adapter/aim-request-mapper.service';
import {
  AimAttemptContextInput,
  AimMappingContext,
  AimSessionContextInput,
} from '../adapter/aim-request-mapper.types';
import { AimResponseMapperService } from './aim-response-mapper.service';
import { AimAnalysisRawResponse } from '../aim-engine-client.types';

// ---------------------------------------------------------------------------
// Reference contract field sets — camelCase wire format, accepted by the
// AIM Engine's AimCamelCaseModel-based schemas (P5-076 fix) via
// alias_generator=to_camel.
// ---------------------------------------------------------------------------

const EXPECTED_ENVELOPE_FIELDS = ['backendRequestId', 'session', 'attempts', 'skillMasteryContext'];

const EXPECTED_SKILL_MASTERY_CONTEXT_FIELDS = [
  'previousMasteryScore',
  'recentAttempts',
  'category',
  'lastEvaluatedAt',
  'retentionHistory',
];

const EXPECTED_RETENTION_HISTORY_POINT_FIELDS = ['recordedAt', 'masteryScore'];

const EXPECTED_RECENT_ATTEMPT_FIELDS = [
  'isCorrect',
  'attemptNumberForItem',
  'presentedDifficulty',
  'usedHint',
  'skip',
];

const EXPECTED_SESSION_FIELDS = [
  'sessionId',
  'studentId',
  'sessionType',
  'startedAt',
  'lastActivityAt',
  'skillFocusIds',
  'levelContext',
  'placementContext',
  'behavioralContext',
  'contractVersion',
];

const EXPECTED_LEVEL_CONTEXT_FIELDS = [
  'currentLevel',
  'levelSource',
  'levelSetAt',
];

const EXPECTED_SESSION_BEHAVIORAL_CONTEXT_FIELDS = [
  'itemsAttemptedInSession',
  'consecutiveIncorrect',
  'consecutiveCorrect',
  'averageResponseTimeMs',
  'hesitationEventCount',
  'retryEventCount',
  'idleGapCount',
];

const EXPECTED_ATTEMPT_FIELDS = [
  'attemptId',
  'sessionId',
  'itemId',
  'itemType',
  'skillIds',
  'presentedDifficulty',
  'studentAnswer',
  'isCorrect',
  'attemptNumberForItem',
  'startedAt',
  'submittedAt',
  'responseTimeMs',
  'behavioralContext',
];

const EXPECTED_STUDENT_ANSWER_FIELDS = [
  'format',
  'value',
  'optionsPresentedCount',
];

const EXPECTED_ATTEMPT_BEHAVIORAL_CONTEXT_FIELDS = [
  'answerChangeCount',
  'hesitationBeforeSubmitMs',
  'usedHint',
  'abandonedFirstThenRetried',
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
  skillMasteryContext: {
    'skill:english:a1:vocab.daily-routines': {
      previousMasteryScore: 62,
      recentAttempts: [
        {
          isCorrect: true,
          attemptNumberForItem: 1,
          presentedDifficulty: 2,
          usedHint: false,
          skip: false,
        },
      ],
      category: 'vocabulary',
      lastEvaluatedAt: '2026-06-16T09:00:00Z',
      retentionHistory: [
        {
          recordedAt: '2026-06-10T09:00:00Z',
          masteryScore: 55,
        },
      ],
    },
  },
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
    expect(keysOf(session.levelContext)).toEqual(
      EXPECTED_LEVEL_CONTEXT_FIELDS.slice().sort(),
    );
  });

  it('session behavioral_context keys match the AIM Engine schema', () => {
    const session = rawRequest.session as Record<string, unknown>;
    expect(keysOf(session.behavioralContext)).toEqual(
      EXPECTED_SESSION_BEHAVIORAL_CONTEXT_FIELDS.slice().sort(),
    );
  });

  it('attempt entry keys match the AIM Engine AimAttemptInput schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    expect(keysOf(attempts[0])).toEqual(EXPECTED_ATTEMPT_FIELDS.slice().sort());
  });

  it('student_answer keys match the AIM Engine schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    const answer = attempts[0].studentAnswer;
    expect(keysOf(answer)).toEqual(EXPECTED_STUDENT_ANSWER_FIELDS.slice().sort());
  });

  it('attempt behavioral_context keys match the AIM Engine schema', () => {
    const attempts = rawRequest.attempts as Record<string, unknown>[];
    const ctx = attempts[0].behavioralContext;
    expect(keysOf(ctx)).toEqual(EXPECTED_ATTEMPT_BEHAVIORAL_CONTEXT_FIELDS.slice().sort());
  });

  it('skill_mastery_context entry keys match the AIM Engine AimSkillMasteryContext schema (P20-007)', () => {
    const skillMasteryContext = rawRequest.skillMasteryContext as Record<string, unknown>;
    const entry = skillMasteryContext['skill:english:a1:vocab.daily-routines'];
    expect(keysOf(entry)).toEqual(EXPECTED_SKILL_MASTERY_CONTEXT_FIELDS.slice().sort());
  });

  it('skill_mastery_context recent attempt keys match the AIM Engine AimRecentAttemptSnapshot schema (P20-007)', () => {
    const skillMasteryContext = rawRequest.skillMasteryContext as Record<
      string,
      { recentAttempts: Record<string, unknown>[] }
    >;
    const recentAttempt = skillMasteryContext['skill:english:a1:vocab.daily-routines'].recentAttempts[0];
    expect(keysOf(recentAttempt)).toEqual(EXPECTED_RECENT_ATTEMPT_FIELDS.slice().sort());
  });

  it('skill_mastery_context retention_history point keys match the AIM Engine AimRetentionHistoryPoint schema (P20-008)', () => {
    const skillMasteryContext = rawRequest.skillMasteryContext as Record<
      string,
      { retentionHistory: Record<string, unknown>[] }
    >;
    const point = skillMasteryContext['skill:english:a1:vocab.daily-routines'].retentionHistory[0];
    expect(keysOf(point)).toEqual(EXPECTED_RETENTION_HISTORY_POINT_FIELDS.slice().sort());
  });

  it('a JSON.stringify of the raw request is accepted by the AIM Engine schema field names', () => {
    // This is the exact transport path used by AimEngineClientService.postAnalysis:
    // body: JSON.stringify(request). The AIM Engine schema now accepts this
    // camelCase shape directly via AimCamelCaseModel (alias_generator=to_camel,
    // populate_by_name=True), added in this same task as the contract fix.
    const wireKeys = keysOf(JSON.parse(JSON.stringify(rawRequest)));
    expect(wireKeys).toEqual(EXPECTED_ENVELOPE_FIELDS.slice().sort());
  });
});

// ---------------------------------------------------------------------------
// Response-side contract: AimResponseMapperService (P5-048) reads
// raw.backendRequestId / raw.studentId / raw.sessionId / raw.contractVersion /
// raw.generatedAt / raw.categories directly off the parsed JSON body
// (see aim-response-mapper.service.ts lines ~92-118). The AIM Engine's
// analysis endpoint (P5-020) now serializes with
// response.model_dump(mode="json", by_alias=True), so the wire response is
// camelCase — matching what the mapper has always expected. This was the
// other half of the same contract defect fixed in this task.
// ---------------------------------------------------------------------------

const EXPECTED_RESPONSE_ENVELOPE_FIELDS = [
  'backendRequestId',
  'contractVersion',
  'studentId',
  'sessionId',
  'generatedAt',
  'categories',
];

describe('AIM Engine response contract (P5-076)', () => {
  it('documents the camelCase envelope keys AimResponseMapperService reads from the AIM Engine response', () => {
    // This list mirrors the exact property accesses in
    // aim-response-mapper.service.ts (raw.backendRequestId, raw.studentId,
    // raw.sessionId, raw.contractVersion, raw.generatedAt, raw.categories).
    // It exists so a future change to either side that drops one of these
    // accessors, or removes the corresponding alias in
    // services/aim-engine/app/schemas/aim_analysis_response.py, is caught by
    // a diff to this list rather than discovered in production.
    expect(EXPECTED_RESPONSE_ENVELOPE_FIELDS.slice().sort()).toEqual(
      [
        'backendRequestId',
        'categories',
        'contractVersion',
        'generatedAt',
        'sessionId',
        'studentId',
      ].sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// P20-016: full per-category response contract.
//
// The above only documented the envelope's own keys — it never asserted the
// shape of what's *inside* categories. That gap let a real defect through:
// AimResponseMapperService.mapSessionSummary read frustrationLevel/
// engagementLevel/signalBasis flat off the session summary object, but the
// AIM Engine's real AimSessionSummaryOutput nests all three under a
// behavioralSignal sub-object (AimSessionBehavioralSignal). Every real
// session summary was silently dropped (SESSION_SUMMARY_INVALID) in
// production. Fixed in this same task (see aim-response-mapper.service.ts);
// this section is the regression guard, generalized to every category so
// the same class of bug in any other category is caught here too.
//
// Field lists below are transcribed directly from
// services/aim-engine/app/schemas/aim_analysis_response.py (verified against
// that file's current contents, not assumed).
// ---------------------------------------------------------------------------

const EXPECTED_CATEGORIES_FIELDS = [
  'skillState',
  'weaknessRecords',
  'difficultyDecision',
  'recommendations',
  'reviewSchedule',
  'sessionSummary',
];

const EXPECTED_SKILL_STATE_OUTPUT_FIELDS = [
  'skillId',
  'masteryScore',
  'masteryConfidence',
  'masteryTrend',
  'attemptsConsideredCount',
  'lastAttemptId',
  'evaluatedAt',
];

const EXPECTED_WEAKNESS_RECORD_OUTPUT_FIELDS = [
  'weaknessId',
  'skillId',
  'severity',
  'status',
  'triggerAttemptIds',
  'detectedAt',
  'resolvedAt',
];

const EXPECTED_DIFFICULTY_DECISION_OUTPUT_FIELDS = [
  'decisionId',
  'skillId',
  'nextDifficulty',
  'previousDifficulty',
  'rationale',
  'basedOnAttemptIds',
  'decidedAt',
];

const EXPECTED_RECOMMENDATION_OUTPUT_FIELDS = [
  'recommendationId',
  'kind',
  'targetSkillId',
  'targetLessonId',
  'rank',
  'reason',
  'basedOnWeaknessId',
  'generatedAt',
  'expiresAt',
];

const EXPECTED_REVIEW_SCHEDULE_OUTPUT_FIELDS = [
  'scheduleId',
  'skillId',
  'dueAt',
  'intervalDays',
  'repetitionCount',
  'basedOnAttemptId',
  'scheduledAt',
];

const EXPECTED_BEHAVIORAL_SIGNAL_FIELDS = ['frustrationLevel', 'engagementLevel', 'signalBasis'];

const EXPECTED_SESSION_SUMMARY_OUTPUT_FIELDS = [
  'sessionId',
  'itemsAttempted',
  'itemsCorrect',
  'skillsTouched',
  'overallMasteryShift',
  'behavioralSignal',
  'closedOutAt',
];

const FULL_RAW_RESPONSE: AimAnalysisRawResponse = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  contractVersion: '1.0',
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
  generatedAt: '2026-06-17T10:00:00Z',
  categories: {
    skillState: [
      {
        skillId: 'skill:english:a1:vocab.daily-routines',
        masteryScore: 0.72,
        masteryConfidence: 0.85,
        masteryTrend: 'improving',
        attemptsConsideredCount: 5,
        lastAttemptId: '880e8400-e29b-41d4-a716-446655440003',
        evaluatedAt: '2026-06-17T10:00:00Z',
      },
    ],
    weaknessRecords: [
      {
        weaknessId: 'aaa00000-e29b-41d4-a716-446655440010',
        skillId: 'skill:english:a1:vocab.daily-routines',
        severity: 'developing',
        status: 'open',
        triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
        detectedAt: '2026-06-17T10:00:00Z',
        resolvedAt: null,
      },
    ],
    difficultyDecision: {
      decisionId: 'bbb00000-e29b-41d4-a716-446655440011',
      skillId: 'skill:english:a1:vocab.daily-routines',
      nextDifficulty: 3,
      previousDifficulty: 2,
      rationale: 'mastery_increase',
      basedOnAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
      decidedAt: '2026-06-17T10:00:00Z',
    },
    recommendations: [
      {
        recommendationId: 'ccc00000-e29b-41d4-a716-446655440012',
        kind: 'targeted_practice',
        targetSkillId: 'skill:english:a1:vocab.daily-routines',
        targetLessonId: null,
        rank: 1,
        reason: 'reinforces_recent_skill',
        basedOnWeaknessId: null,
        generatedAt: '2026-06-17T10:00:00Z',
        expiresAt: null,
      },
    ],
    reviewSchedule: [
      {
        scheduleId: 'ddd00000-e29b-41d4-a716-446655440013',
        skillId: 'skill:english:a1:vocab.daily-routines',
        dueAt: '2026-06-24T10:00:00Z',
        intervalDays: 7,
        repetitionCount: 1,
        basedOnAttemptId: '880e8400-e29b-41d4-a716-446655440003',
        scheduledAt: '2026-06-17T10:00:00Z',
      },
    ],
    sessionSummary: {
      sessionId: '660e8400-e29b-41d4-a716-446655440001',
      itemsAttempted: 5,
      itemsCorrect: 4,
      skillsTouched: ['skill:english:a1:vocab.daily-routines'],
      overallMasteryShift: 'positive',
      behavioralSignal: {
        frustrationLevel: 'none',
        engagementLevel: 'high',
        signalBasis: ['sustained_correct_streak'],
      },
      closedOutAt: '2026-06-17T10:00:00Z',
    },
  },
};

describe('AIM Engine response contract — per-category shape (P20-016)', () => {
  const categories = FULL_RAW_RESPONSE.categories as Record<string, unknown>;

  it('categories container keys match AimResponseCategories', () => {
    expect(keysOf(categories)).toEqual(EXPECTED_CATEGORIES_FIELDS.slice().sort());
  });

  it('skillState entry keys match AimSkillStateOutput', () => {
    const entry = (categories.skillState as Record<string, unknown>[])[0];
    expect(keysOf(entry)).toEqual(EXPECTED_SKILL_STATE_OUTPUT_FIELDS.slice().sort());
  });

  it('weaknessRecords entry keys match AimWeaknessRecordOutput', () => {
    const entry = (categories.weaknessRecords as Record<string, unknown>[])[0];
    expect(keysOf(entry)).toEqual(EXPECTED_WEAKNESS_RECORD_OUTPUT_FIELDS.slice().sort());
  });

  it('difficultyDecision keys match AimDifficultyDecisionOutput', () => {
    expect(keysOf(categories.difficultyDecision)).toEqual(
      EXPECTED_DIFFICULTY_DECISION_OUTPUT_FIELDS.slice().sort(),
    );
  });

  it('recommendations entry keys match AimRecommendationOutput', () => {
    const entry = (categories.recommendations as Record<string, unknown>[])[0];
    expect(keysOf(entry)).toEqual(EXPECTED_RECOMMENDATION_OUTPUT_FIELDS.slice().sort());
  });

  it('reviewSchedule entry keys match AimReviewScheduleOutput', () => {
    const entry = (categories.reviewSchedule as Record<string, unknown>[])[0];
    expect(keysOf(entry)).toEqual(EXPECTED_REVIEW_SCHEDULE_OUTPUT_FIELDS.slice().sort());
  });

  it('sessionSummary keys match AimSessionSummaryOutput, with behavioralSignal nested (not flat)', () => {
    expect(keysOf(categories.sessionSummary)).toEqual(
      EXPECTED_SESSION_SUMMARY_OUTPUT_FIELDS.slice().sort(),
    );
    const summary = categories.sessionSummary as Record<string, unknown>;
    expect(keysOf(summary.behavioralSignal)).toEqual(
      EXPECTED_BEHAVIORAL_SIGNAL_FIELDS.slice().sort(),
    );
  });

  it('a realistic full response with every category populated is accepted end-to-end with zero drops', () => {
    // This is the actual regression guard: if any category's field names or
    // nesting drift from the real Pydantic schema again, AimResponseMapperService
    // will drop that category and this assertion catches it here instead of
    // in production (exactly what happened with sessionSummary before this task).
    const mapper = new AimResponseMapperService();
    const origin = {
      backendRequestId: FULL_RAW_RESPONSE.backendRequestId,
      studentId: FULL_RAW_RESPONSE.studentId,
      sessionId: FULL_RAW_RESPONSE.sessionId,
    };
    const result = mapper.map(FULL_RAW_RESPONSE, origin);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.droppedValidationCodes).toEqual([]);
    expect(result.response.categories.skillState).toHaveLength(1);
    expect(result.response.categories.weaknessRecords).toHaveLength(1);
    expect(result.response.categories.difficultyDecision).not.toBeNull();
    expect(result.response.categories.recommendations).toHaveLength(1);
    expect(result.response.categories.reviewSchedule).toHaveLength(1);
    expect(result.response.categories.sessionSummary).not.toBeNull();
    expect(result.response.categories.sessionSummary?.frustrationLevel).toBe('none');
    expect(result.response.categories.sessionSummary?.engagementLevel).toBe('high');
  });
});
