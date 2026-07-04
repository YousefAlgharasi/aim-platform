/**
 * Tests for AimResponseMapperService — P5-048.
 *
 * Covers:
 * - Valid complete response maps correctly.
 * - Envelope failures: correlation mismatch, unsupported version, missing categories.
 * - Category drops: invalid skill state, weakness, difficulty, recommendation,
 *   review schedule, session summary entries.
 * - Empty categories are valid.
 * - droppedValidationCodes accumulates all drop codes.
 */

import { AimAnalysisRawResponse } from '../aim-engine-client.types';
import { AimResponseMapperService } from './aim-response-mapper.service';

const ORIGIN = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
};

const VALID_RAW: AimAnalysisRawResponse = {
  backendRequestId: ORIGIN.backendRequestId,
  contractVersion: '1.0',
  studentId: ORIGIN.studentId,
  sessionId: ORIGIN.sessionId,
  generatedAt: '2026-06-17T10:00:00Z',
  categories: {
    skillState: [
      {
        skillId: 'skill:arabic:p1:vocab',
        masteryScore: 0.72,
        masteryConfidence: 0.85,
        masteryTrend: 'improving',
        attemptsConsideredCount: 5,
        lastAttemptId: '880e8400-e29b-41d4-a716-446655440003',
        evaluatedAt: '2026-06-17T10:00:00Z',
      },
    ],
    weaknessRecords: [],
    difficultyDecision: {
      decisionId: 'bbb00000-e29b-41d4-a716-446655440011',
      skillId: 'skill:arabic:p1:vocab',
      nextDifficulty: 3,
      previousDifficulty: 2,
      rationale: 'mastery_increase',
      basedOnAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
      decidedAt: '2026-06-17T10:00:00Z',
    },
    recommendations: [],
    reviewSchedule: [],
    sessionSummary: null,
  },
};

describe('AimResponseMapperService (P5-048)', () => {
  let mapper: AimResponseMapperService;

  beforeEach(() => {
    mapper = new AimResponseMapperService();
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('returns ok: true for a valid complete response', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    expect(result.ok).toBe(true);
  });

  it('echoes correlation ids in the validated response', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    if (!result.ok) fail('expected ok');
    expect(result.response.backendRequestId).toBe(ORIGIN.backendRequestId);
    expect(result.response.studentId).toBe(ORIGIN.studentId);
    expect(result.response.sessionId).toBe(ORIGIN.sessionId);
  });

  it('maps skill state when valid', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    if (!result.ok) fail('expected ok');
    expect(result.response.categories.skillState).toHaveLength(1);
    expect(result.response.categories.skillState[0].masteryScore).toBe(0.72);
  });

  it('maps difficulty decision when valid', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    if (!result.ok) fail('expected ok');
    const dd = result.response.categories.difficultyDecision;
    expect(dd).not.toBeNull();
    expect(dd!.nextDifficulty).toBe(3);
  });

  it('returns empty arrays for absent categories', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    if (!result.ok) fail('expected ok');
    expect(result.response.categories.weaknessRecords).toEqual([]);
    expect(result.response.categories.recommendations).toEqual([]);
    expect(result.response.categories.reviewSchedule).toEqual([]);
    expect(result.response.categories.sessionSummary).toBeNull();
  });

  it('returns empty droppedValidationCodes when all valid', () => {
    const result = mapper.map(VALID_RAW, ORIGIN);
    if (!result.ok) fail('expected ok');
    expect(result.response.droppedValidationCodes).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Envelope failures
  // -------------------------------------------------------------------------

  it('returns ok: false when backendRequestId mismatches', () => {
    const raw = { ...VALID_RAW, backendRequestId: 'different-id' };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failureCode).toBe('CORRELATION_MISMATCH');
  });

  it('returns ok: false when studentId mismatches', () => {
    const raw = { ...VALID_RAW, studentId: 'wrong-student' };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
  });

  it('returns ok: false when sessionId mismatches', () => {
    const raw = { ...VALID_RAW, sessionId: 'wrong-session' };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
  });

  it('returns ok: false when contractVersion is unsupported', () => {
    const raw = { ...VALID_RAW, contractVersion: '99.0' };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failureCode).toBe('CONTRACT_VERSION_UNSUPPORTED');
  });

  it('returns ok: false when generatedAt is invalid', () => {
    const raw = { ...VALID_RAW, generatedAt: 'not-a-date' };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
  });

  it('returns ok: false when categories field is missing', () => {
    const raw = { ...VALID_RAW, categories: null as unknown as Record<string, unknown> };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Category drops — valid entries in other categories still proceed
  // -------------------------------------------------------------------------

  it('drops invalid skill state entry but returns ok', () => {
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        skillState: [{ skillId: 'skill:x', masteryScore: 99 }], // score out of range
      },
    };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.categories.skillState).toHaveLength(0);
    expect(result.response.droppedValidationCodes).toContain('SKILL_STATE_ENTRY_INVALID');
  });

  it('drops difficulty decision that violates step constraint', () => {
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        difficultyDecision: {
          decisionId: 'dd-id',
          skillId: 'skill:x',
          nextDifficulty: 1,
          previousDifficulty: 4, // |1-4| = 3 > 1, violates constraint
          rationale: 'mastery_decrease',
          basedOnAttemptIds: ['att-1'],
          decidedAt: '2026-06-17T10:00:00Z',
        },
      },
    };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.categories.difficultyDecision).toBeNull();
    expect(result.response.droppedValidationCodes).toContain('DIFFICULTY_DECISION_INVALID');
  });

  it('drops duplicate recommendation ranks', () => {
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        recommendations: [
          {
            recommendationId: 'r1', kind: 'targeted_practice',
            targetSkillId: 'skill:x', rank: 1,
            reason: 'next_in_sequence', generatedAt: '2026-06-17T10:00:00Z',
          },
          {
            recommendationId: 'r2', kind: 'targeted_practice',
            targetSkillId: 'skill:y', rank: 1, // duplicate rank
            reason: 'next_in_sequence', generatedAt: '2026-06-17T10:00:00Z',
          },
        ],
      },
    };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // First rank=1 accepted, second dropped
    expect(result.response.categories.recommendations).toHaveLength(1);
  });

  it('drops invalid session summary but returns ok with other categories', () => {
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        sessionSummary: {
          sessionId: ORIGIN.sessionId,
          itemsAttempted: 5,
          itemsCorrect: 10, // itemsCorrect > itemsAttempted — invalid
          skillsTouched: [],
          overallMasteryShift: 'positive',
          behavioralSignal: {
            frustrationLevel: 'none',
            engagementLevel: 'typical',
            signalBasis: [],
          },
          closedOutAt: '2026-06-17T10:00:00Z',
        },
      },
    };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.categories.sessionSummary).toBeNull();
    expect(result.response.droppedValidationCodes).toContain('SESSION_SUMMARY_INVALID');
    // Skill state from the same response is still valid
    expect(result.response.categories.skillState).toHaveLength(1);
  });

  it('maps session summary when fully valid', () => {
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        sessionSummary: {
          sessionId: ORIGIN.sessionId,
          itemsAttempted: 5,
          itemsCorrect: 4,
          skillsTouched: ['skill:arabic:p1:vocab'],
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
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const summary = result.response.categories.sessionSummary;
    expect(summary).not.toBeNull();
    expect(summary!.frustrationLevel).toBe('none');
    expect(summary!.engagementLevel).toBe('high');
  });

  it('P20-016 regression: drops a session summary with frustration/engagement/signalBasis flat instead of nested under behavioralSignal', () => {
    // The AIM Engine's real AimSessionSummaryOutput nests these three fields
    // under behavioralSignal (AimSessionBehavioralSignal). A flat shape is
    // exactly the bug this mapper previously had — every real response was
    // silently dropped as SESSION_SUMMARY_INVALID. This proves the mapper
    // now correctly rejects the wrong (flat) shape rather than accepting it.
    const raw = {
      ...VALID_RAW,
      categories: {
        ...VALID_RAW.categories,
        sessionSummary: {
          sessionId: ORIGIN.sessionId,
          itemsAttempted: 5,
          itemsCorrect: 4,
          skillsTouched: ['skill:arabic:p1:vocab'],
          overallMasteryShift: 'positive',
          frustrationLevel: 'none',
          engagementLevel: 'high',
          signalBasis: ['sustained_correct_streak'],
          closedOutAt: '2026-06-17T10:00:00Z',
        },
      },
    };
    const result = mapper.map(raw, ORIGIN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.categories.sessionSummary).toBeNull();
    expect(result.response.droppedValidationCodes).toContain('SESSION_SUMMARY_INVALID');
  });
});
