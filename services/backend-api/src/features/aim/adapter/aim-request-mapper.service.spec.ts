/**
 * Tests for AimRequestMapperService — P5-047.
 *
 * Verifies:
 * - map() produces a valid AimAnalysisRawRequest from a complete context.
 * - Envelope fields are correctly mapped (backendRequestId, session, attempts).
 * - Session segment fields mirror the P5-009 contract.
 * - Attempt segment fields mirror the P5-010 contract.
 * - placementContext is included when present, null when absent.
 * - Multiple attempts are all mapped.
 * - Backend-authority rules: no mastery/level/weakness/difficulty inputs accepted.
 * - Speed fields are passed through as raw behavioral context only.
 */

import { AimRequestMapperService } from './aim-request-mapper.service';
import { AimMappingContext } from './aim-request-mapper.types';

const BASE_CONTEXT: AimMappingContext = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  xRequestId: 'req-abc-123',
  session: {
    sessionId: '660e8400-e29b-41d4-a716-446655440001',
    studentId: '770e8400-e29b-41d4-a716-446655440002',
    sessionType: 'lesson_practice',
    startedAt: '2026-06-17T10:00:00Z',
    lastActivityAt: '2026-06-17T10:30:00Z',
    skillFocusIds: ['skill:arabic:p1:vocab'],
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
  },
  attempts: [
    {
      attemptId: '880e8400-e29b-41d4-a716-446655440003',
      sessionId: '660e8400-e29b-41d4-a716-446655440001',
      itemId: '990e8400-e29b-41d4-a716-446655440004',
      itemType: 'lesson_question',
      skillIds: ['skill:arabic:p1:vocab'],
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
    },
  ],
};

describe('AimRequestMapperService (P5-047)', () => {
  let mapper: AimRequestMapperService;

  beforeEach(() => {
    mapper = new AimRequestMapperService();
  });

  // -------------------------------------------------------------------------
  // Envelope
  // -------------------------------------------------------------------------

  it('maps backendRequestId to the request envelope', () => {
    const req = mapper.map(BASE_CONTEXT);
    expect(req.backendRequestId).toBe(BASE_CONTEXT.backendRequestId);
  });

  it('includes session and attempts fields in the envelope', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    expect(req['session']).toBeDefined();
    expect(Array.isArray(req['attempts'])).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Session segment (P5-009)
  // -------------------------------------------------------------------------

  it('maps session sessionId', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['sessionId']).toBe(BASE_CONTEXT.session.sessionId);
  });

  it('maps session studentId from backend-resolved identity', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['studentId']).toBe(BASE_CONTEXT.session.studentId);
  });

  it('maps session sessionType', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['sessionType']).toBe('lesson_practice');
  });

  it('maps session skillFocusIds', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['skillFocusIds']).toEqual(['skill:arabic:p1:vocab']);
  });

  it('maps session levelContext fields', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    const level = session['levelContext'] as Record<string, unknown>;
    expect(level['currentLevel']).toBe('level_2');
    expect(level['levelSource']).toBe('placement');
  });

  it('maps placementContext as null when absent', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['placementContext']).toBeNull();
  });

  it('maps placementContext fields when present', () => {
    const context: AimMappingContext = {
      ...BASE_CONTEXT,
      session: {
        ...BASE_CONTEXT.session,
        placementContext: {
          placementResultId: 'aaa00000-e29b-41d4-a716-446655440099',
          placementCompletedAt: '2026-06-16T08:00:00Z',
          initialSkillSignals: [
            { skillId: 'skill:arabic:p1:vocab', signalStrength: 0.75 },
          ],
        },
      },
    };

    const req = mapper.map(context) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    const placement = session['placementContext'] as Record<string, unknown>;

    expect(placement['placementResultId']).toBe('aaa00000-e29b-41d4-a716-446655440099');
    const signals = placement['initialSkillSignals'] as Array<Record<string, unknown>>;
    expect(signals[0]['signalStrength']).toBe(0.75);
  });

  it('maps session behavioralContext raw counts without transforming them', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    const bc = session['behavioralContext'] as Record<string, unknown>;
    expect(bc['itemsAttemptedInSession']).toBe(3);
    expect(bc['averageResponseTimeMs']).toBe(4200);
  });

  it('maps contractVersion', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const session = req['session'] as Record<string, unknown>;
    expect(session['contractVersion']).toBe('1.0');
  });

  // -------------------------------------------------------------------------
  // Attempt segment (P5-010)
  // -------------------------------------------------------------------------

  it('maps exactly one attempt when one is provided', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const attempts = req['attempts'] as unknown[];
    expect(attempts).toHaveLength(1);
  });

  it('maps attempt attemptId', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const attempt = (req['attempts'] as Array<Record<string, unknown>>)[0];
    expect(attempt['attemptId']).toBe(BASE_CONTEXT.attempts[0].attemptId);
  });

  it('maps attempt isCorrect (backend-evaluated value only)', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const attempt = (req['attempts'] as Array<Record<string, unknown>>)[0];
    expect(attempt['isCorrect']).toBe(true);
  });

  it('maps attempt studentAnswer', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const attempt = (req['attempts'] as Array<Record<string, unknown>>)[0];
    const answer = attempt['studentAnswer'] as Record<string, unknown>;
    expect(answer['format']).toBe('multiple_choice');
    expect(answer['value']).toBe('B');
    expect(answer['optionsPresentedCount']).toBe(4);
  });

  it('maps attempt responseTimeMs as raw behavioral context', () => {
    const req = mapper.map(BASE_CONTEXT) as Record<string, unknown>;
    const attempt = (req['attempts'] as Array<Record<string, unknown>>)[0];
    expect(attempt['responseTimeMs']).toBe(7000);
  });

  it('maps multiple attempts', () => {
    const context: AimMappingContext = {
      ...BASE_CONTEXT,
      attempts: [
        ...BASE_CONTEXT.attempts,
        {
          ...BASE_CONTEXT.attempts[0],
          attemptId: 'bbb00000-e29b-41d4-a716-446655440005',
          attemptNumberForItem: 2,
          isCorrect: false,
        },
      ],
    };

    const req = mapper.map(context) as Record<string, unknown>;
    const attempts = req['attempts'] as unknown[];
    expect(attempts).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  // Backend-authority rules
  // -------------------------------------------------------------------------

  it('does not include mastery in the mapped request', () => {
    const req = JSON.stringify(mapper.map(BASE_CONTEXT));
    expect(req).not.toContain('mastery');
  });

  it('does not include difficulty as an output decision in the request', () => {
    // presentedDifficulty (informational context) is allowed;
    // any field named "nextDifficulty" or "difficultyDecision" is not
    const req = JSON.stringify(mapper.map(BASE_CONTEXT));
    expect(req).not.toContain('nextDifficulty');
    expect(req).not.toContain('difficultyDecision');
  });

  it('does not include weakness or recommendations in the request', () => {
    const req = JSON.stringify(mapper.map(BASE_CONTEXT));
    expect(req).not.toContain('weakness');
    expect(req).not.toContain('recommendation');
  });
});
