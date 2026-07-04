/**
 * AIM Response Mapper — Phase 5, Stage 5 (P5-048).
 *
 * Validates the raw AimAnalysisRawResponse from the HTTP client (P5-045) and
 * maps it to typed AimValidatedResponse DTOs ready for persistence (Stage 6).
 *
 * Validation rules per the P5-011 contract:
 *   Envelope: backendRequestId, studentId, sessionId must match originating
 *             request; contractVersion must be supported; generatedAt valid.
 *   Categories: each present category is independently validated per its
 *               contract (P5-012 through P5-017). Invalid entries are dropped;
 *               valid entries from the same response still proceed.
 *   Envelope failure: if the envelope itself is malformed the entire response
 *                     is rejected and nothing is persisted.
 *
 * This service never passes unvalidated data to the persistence layer.
 * No mastery, level, weakness, difficulty, recommendations, review-schedule,
 * retention, or frustration values are accepted from the client side.
 * No secrets, service-role keys, or AI provider keys are referenced here.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AimAnalysisRawResponse } from '../aim-engine-client.types';
import {
  AimDifficultyLevel,
  AimDifficultyRationale,
  AimEngagementLevel,
  AimFrustrationLevel,
  AimMasteryShiftDirection,
  AimMasteryTrend,
  AimRecommendationKind,
  AimRecommendationReason,
  AimResponseMappingResult,
  AimSignalBasis,
  AimValidatedCategories,
  AimValidatedDifficultyDecision,
  AimValidatedRecommendation,
  AimValidatedResponse,
  AimValidatedReviewSchedule,
  AimValidatedSessionSummary,
  AimValidatedSkillState,
  AimValidatedWeaknessRecord,
  AimWeaknessStatus,
} from './aim-response-mapper.types';

const SUPPORTED_CONTRACT_VERSIONS = new Set(['1.0']);

const MASTERY_TREND_VALUES: AimMasteryTrend[] = [
  'improving', 'stable', 'declining', 'insufficient_data',
];
const WEAKNESS_SEVERITY_VALUES = ['emerging', 'developing', 'critical'];
const WEAKNESS_STATUS_VALUES: AimWeaknessStatus[] = ['open', 'improving', 'resolved'];
const DIFFICULTY_LEVELS: AimDifficultyLevel[] = [1, 2, 3, 4];
const DIFFICULTY_RATIONALE_VALUES: AimDifficultyRationale[] = [
  'mastery_increase', 'mastery_decrease', 'consistent_performance', 'insufficient_data_hold',
];
const RECOMMENDATION_KIND_VALUES: AimRecommendationKind[] = [
  'lesson', 'targeted_practice', 'review_session',
];
const RECOMMENDATION_REASON_VALUES: AimRecommendationReason[] = [
  'addresses_weakness', 'reinforces_recent_skill', 'next_in_sequence', 'review_due',
];
const MASTERY_SHIFT_VALUES: AimMasteryShiftDirection[] = [
  'positive', 'neutral', 'negative', 'mixed',
];
const FRUSTRATION_LEVEL_VALUES: AimFrustrationLevel[] = [
  'none', 'low', 'moderate', 'elevated',
];
const ENGAGEMENT_LEVEL_VALUES: AimEngagementLevel[] = ['low', 'typical', 'high'];
const SIGNAL_BASIS_VALUES: AimSignalBasis[] = [
  'repeated_incorrect_streak', 'increased_hesitation', 'increased_retry_rate',
  'session_abandonment_pattern', 'sustained_correct_streak',
];

@Injectable()
export class AimResponseMapperService {
  private readonly logger = new Logger(AimResponseMapperService.name);

  /**
   * Validate and map an AimAnalysisRawResponse to typed backend DTOs.
   *
   * @param raw            The raw body from the AIM Engine HTTP response.
   * @param originRequest  The originating request for correlation checks.
   */
  map(
    raw: AimAnalysisRawResponse,
    originRequest: { backendRequestId: string; studentId: string; sessionId: string },
  ): AimResponseMappingResult {
    // -----------------------------------------------------------------------
    // Envelope validation — entire response rejected on any failure
    // -----------------------------------------------------------------------

    if (raw.backendRequestId !== originRequest.backendRequestId) {
      return this.envelopeFailure(
        'CORRELATION_MISMATCH',
        `backendRequestId mismatch: expected ${originRequest.backendRequestId}`,
      );
    }

    if (raw.studentId !== originRequest.studentId) {
      return this.envelopeFailure('CORRELATION_MISMATCH', 'studentId mismatch');
    }

    if (raw.sessionId !== originRequest.sessionId) {
      return this.envelopeFailure('CORRELATION_MISMATCH', 'sessionId mismatch');
    }

    if (!SUPPORTED_CONTRACT_VERSIONS.has(raw.contractVersion)) {
      return this.envelopeFailure(
        'CONTRACT_VERSION_UNSUPPORTED',
        `contractVersion ${raw.contractVersion} is not supported`,
      );
    }

    if (!raw.generatedAt || !isValidIso(raw.generatedAt)) {
      return this.envelopeFailure('INVALID_ENVELOPE', 'generatedAt is not a valid ISO-8601 timestamp');
    }

    if (!raw.categories || typeof raw.categories !== 'object') {
      return this.envelopeFailure('INVALID_ENVELOPE', 'categories field is missing or not an object');
    }

    // -----------------------------------------------------------------------
    // Category validation — dropped entries do not block other valid categories
    // -----------------------------------------------------------------------

    const dropped: string[] = [];
    const cats = raw.categories as Record<string, unknown>;

    const skillState = this.mapSkillState(cats['skillState'], dropped);
    const weaknessRecords = this.mapWeaknessRecords(cats['weaknessRecords'], dropped);
    const difficultyDecision = this.mapDifficultyDecision(cats['difficultyDecision'], dropped);
    const recommendations = this.mapRecommendations(cats['recommendations'], dropped);
    const reviewSchedule = this.mapReviewSchedule(cats['reviewSchedule'], dropped);
    const sessionSummary = this.mapSessionSummary(cats['sessionSummary'], dropped);

    if (dropped.length > 0) {
      this.logger.warn('AIM response had validation drops', { codes: dropped });
    }

    const categories: AimValidatedCategories = {
      skillState,
      weaknessRecords,
      difficultyDecision,
      recommendations,
      reviewSchedule,
      sessionSummary,
    };

    const response: AimValidatedResponse = {
      backendRequestId: raw.backendRequestId,
      contractVersion: raw.contractVersion,
      studentId: raw.studentId,
      sessionId: raw.sessionId,
      generatedAt: raw.generatedAt,
      categories,
      droppedValidationCodes: dropped,
    };

    return { ok: true, response };
  }

  // -------------------------------------------------------------------------
  // Category mappers
  // -------------------------------------------------------------------------

  private mapSkillState(
    raw: unknown,
    dropped: string[],
  ): AimValidatedSkillState[] {
    if (raw === undefined || raw === null) return [];
    if (!Array.isArray(raw)) {
      dropped.push('SKILL_STATE_NOT_ARRAY');
      return [];
    }
    const results: AimValidatedSkillState[] = [];
    for (const entry of raw) {
      const e = entry as Record<string, unknown>;
      if (
        !isString(e['skillId']) ||
        !isScore(e['masteryScore']) ||
        !isScore(e['masteryConfidence']) ||
        !isOneOf(e['masteryTrend'], MASTERY_TREND_VALUES) ||
        !isNonNegInt(e['attemptsConsideredCount']) ||
        !isString(e['lastAttemptId']) ||
        !isValidIso(e['evaluatedAt'] as string)
      ) {
        dropped.push('SKILL_STATE_ENTRY_INVALID');
        continue;
      }
      results.push({
        skillId: e['skillId'] as string,
        masteryScore: e['masteryScore'] as number,
        masteryConfidence: e['masteryConfidence'] as number,
        masteryTrend: e['masteryTrend'] as AimMasteryTrend,
        attemptsConsideredCount: e['attemptsConsideredCount'] as number,
        lastAttemptId: e['lastAttemptId'] as string,
        evaluatedAt: e['evaluatedAt'] as string,
      });
    }
    return results;
  }

  private mapWeaknessRecords(
    raw: unknown,
    dropped: string[],
  ): AimValidatedWeaknessRecord[] {
    if (raw === undefined || raw === null) return [];
    if (!Array.isArray(raw)) { dropped.push('WEAKNESS_NOT_ARRAY'); return []; }
    const results: AimValidatedWeaknessRecord[] = [];
    for (const entry of raw) {
      const e = entry as Record<string, unknown>;
      const status = e['status'] as string;
      const resolvedAt = e['resolvedAt'];
      if (
        !isString(e['weaknessId']) ||
        !isString(e['skillId']) ||
        !isOneOf(e['severity'], WEAKNESS_SEVERITY_VALUES) ||
        !isOneOf(status, WEAKNESS_STATUS_VALUES) ||
        !Array.isArray(e['triggerAttemptIds']) ||
        !isValidIso(e['detectedAt'] as string) ||
        (status === 'resolved' && !isValidIso(resolvedAt as string)) ||
        (status !== 'resolved' && resolvedAt !== null && resolvedAt !== undefined)
      ) {
        dropped.push('WEAKNESS_ENTRY_INVALID');
        continue;
      }
      results.push({
        weaknessId: e['weaknessId'] as string,
        skillId: e['skillId'] as string,
        severity: e['severity'] as AimValidatedWeaknessRecord['severity'],
        status: status as AimWeaknessStatus,
        triggerAttemptIds: e['triggerAttemptIds'] as string[],
        detectedAt: e['detectedAt'] as string,
        resolvedAt: resolvedAt as string | null,
      });
    }
    return results;
  }

  private mapDifficultyDecision(
    raw: unknown,
    dropped: string[],
  ): AimValidatedDifficultyDecision | null {
    if (raw === undefined || raw === null) return null;
    const e = raw as Record<string, unknown>;
    const next = e['nextDifficulty'] as number;
    const prev = e['previousDifficulty'] as number;
    if (
      !isString(e['decisionId']) ||
      !isString(e['skillId']) ||
      !isOneOf(next, DIFFICULTY_LEVELS) ||
      !isOneOf(prev, DIFFICULTY_LEVELS) ||
      Math.abs(next - prev) > 1 ||
      !isOneOf(e['rationale'], DIFFICULTY_RATIONALE_VALUES) ||
      !Array.isArray(e['basedOnAttemptIds']) || (e['basedOnAttemptIds'] as unknown[]).length < 1 ||
      !isValidIso(e['decidedAt'] as string)
    ) {
      dropped.push('DIFFICULTY_DECISION_INVALID');
      return null;
    }
    return {
      decisionId: e['decisionId'] as string,
      skillId: e['skillId'] as string,
      nextDifficulty: next as AimDifficultyLevel,
      previousDifficulty: prev as AimDifficultyLevel,
      rationale: e['rationale'] as AimDifficultyRationale,
      basedOnAttemptIds: e['basedOnAttemptIds'] as string[],
      decidedAt: e['decidedAt'] as string,
    };
  }

  private mapRecommendations(
    raw: unknown,
    dropped: string[],
  ): AimValidatedRecommendation[] {
    if (raw === undefined || raw === null) return [];
    if (!Array.isArray(raw)) { dropped.push('RECOMMENDATIONS_NOT_ARRAY'); return []; }
    const results: AimValidatedRecommendation[] = [];
    const seenRanks = new Set<number>();
    for (const entry of raw) {
      const e = entry as Record<string, unknown>;
      const rank = e['rank'] as number;
      if (
        !isString(e['recommendationId']) ||
        !isOneOf(e['kind'], RECOMMENDATION_KIND_VALUES) ||
        !isString(e['targetSkillId']) ||
        typeof rank !== 'number' || rank < 1 || seenRanks.has(rank) ||
        !isOneOf(e['reason'], RECOMMENDATION_REASON_VALUES) ||
        !isValidIso(e['generatedAt'] as string)
      ) {
        dropped.push('RECOMMENDATION_ENTRY_INVALID');
        continue;
      }
      seenRanks.add(rank);
      results.push({
        recommendationId: e['recommendationId'] as string,
        kind: e['kind'] as AimRecommendationKind,
        targetSkillId: e['targetSkillId'] as string,
        targetLessonId: (e['targetLessonId'] as string | null) ?? null,
        rank,
        reason: e['reason'] as AimRecommendationReason,
        basedOnWeaknessId: (e['basedOnWeaknessId'] as string | null) ?? null,
        generatedAt: e['generatedAt'] as string,
        expiresAt: (e['expiresAt'] as string | null) ?? null,
      });
    }
    return results;
  }

  private mapReviewSchedule(
    raw: unknown,
    dropped: string[],
  ): AimValidatedReviewSchedule[] {
    if (raw === undefined || raw === null) return [];
    if (!Array.isArray(raw)) { dropped.push('REVIEW_SCHEDULE_NOT_ARRAY'); return []; }
    const results: AimValidatedReviewSchedule[] = [];
    for (const entry of raw) {
      const e = entry as Record<string, unknown>;
      if (
        !isString(e['scheduleId']) ||
        !isString(e['skillId']) ||
        !isValidIso(e['dueAt'] as string) ||
        typeof e['intervalDays'] !== 'number' || (e['intervalDays'] as number) <= 0 ||
        !isNonNegInt(e['repetitionCount']) ||
        !isString(e['basedOnAttemptId']) ||
        !isValidIso(e['scheduledAt'] as string)
      ) {
        dropped.push('REVIEW_SCHEDULE_ENTRY_INVALID');
        continue;
      }
      results.push({
        scheduleId: e['scheduleId'] as string,
        skillId: e['skillId'] as string,
        dueAt: e['dueAt'] as string,
        intervalDays: e['intervalDays'] as number,
        repetitionCount: e['repetitionCount'] as number,
        basedOnAttemptId: e['basedOnAttemptId'] as string,
        scheduledAt: e['scheduledAt'] as string,
      });
    }
    return results;
  }

  private mapSessionSummary(
    raw: unknown,
    dropped: string[],
  ): AimValidatedSessionSummary | null {
    if (raw === undefined || raw === null) return null;
    const e = raw as Record<string, unknown>;
    // P20-016: the AIM Engine's AimSessionSummaryOutput nests frustration/
    // engagement/signal-basis under behavioralSignal (AimSessionBehavioralSignal)
    // — they are NOT flat on the session summary object. Reading them flat
    // here previously meant every real session summary failed validation
    // (SESSION_SUMMARY_INVALID) and was silently dropped in production; this
    // was caught only when the contract test was extended to cover this
    // category's exact shape.
    const behavioralSignal = e['behavioralSignal'] as Record<string, unknown> | undefined;
    const signalBasis = behavioralSignal?.['signalBasis'];
    if (
      !isString(e['sessionId']) ||
      !isNonNegInt(e['itemsAttempted']) ||
      !isNonNegInt(e['itemsCorrect']) ||
      (e['itemsCorrect'] as number) > (e['itemsAttempted'] as number) ||
      !Array.isArray(e['skillsTouched']) ||
      !isOneOf(e['overallMasteryShift'], MASTERY_SHIFT_VALUES) ||
      !behavioralSignal ||
      !isOneOf(behavioralSignal['frustrationLevel'], FRUSTRATION_LEVEL_VALUES) ||
      !isOneOf(behavioralSignal['engagementLevel'], ENGAGEMENT_LEVEL_VALUES) ||
      !Array.isArray(signalBasis) ||
      !(signalBasis as unknown[]).every((b) => isOneOf(b, SIGNAL_BASIS_VALUES)) ||
      !isValidIso(e['closedOutAt'] as string)
    ) {
      dropped.push('SESSION_SUMMARY_INVALID');
      return null;
    }
    return {
      sessionId: e['sessionId'] as string,
      itemsAttempted: e['itemsAttempted'] as number,
      itemsCorrect: e['itemsCorrect'] as number,
      skillsTouched: e['skillsTouched'] as string[],
      overallMasteryShift: e['overallMasteryShift'] as AimMasteryShiftDirection,
      frustrationLevel: behavioralSignal['frustrationLevel'] as AimFrustrationLevel,
      engagementLevel: behavioralSignal['engagementLevel'] as AimEngagementLevel,
      signalBasis: signalBasis as AimSignalBasis[],
      closedOutAt: e['closedOutAt'] as string,
    };
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private envelopeFailure(
    failureCode: string,
    reason: string,
  ): { ok: false; failureCode: string; reason: string } {
    this.logger.warn(`AIM response envelope validation failed [${failureCode}]: ${reason}`);
    return { ok: false, failureCode, reason };
  }
}

// ---------------------------------------------------------------------------
// Pure guard functions
// ---------------------------------------------------------------------------

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isScore(v: unknown): v is number {
  return typeof v === 'number' && v >= 0 && v <= 1;
}

function isNonNegInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0;
}

function isOneOf<T>(v: unknown, allowed: T[]): v is T {
  return allowed.includes(v as T);
}

function isValidIso(v: string): boolean {
  if (!v) return false;
  const d = new Date(v);
  return !isNaN(d.getTime());
}
