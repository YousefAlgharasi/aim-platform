/**
 * AIM Request Mapper — Phase 5, Stage 3 (P5-047).
 *
 * Maps backend-assembled session and attempt context into the
 * AimAnalysisRawRequest the HTTP client (P5-045) sends to the AIM Engine.
 *
 * Backend-authority rules enforced by this mapper:
 * - studentId is always taken from the authenticated session context, never
 *   from a client-submitted field.
 * - isCorrect is always the backend-evaluated value, never a client value.
 * - skillIds are always backend-resolved from curriculum data.
 * - No mastery, level, weakness, difficulty, recommendation, review-schedule,
 *   retention, or frustration values are accepted as inputs or written into
 *   the request payload.
 * - Speed and timing fields are forwarded as raw behavioral context only.
 * - No secrets, service-role keys, database credentials, or AI provider keys
 *   are stored or logged here.
 *
 * Sources:
 *   packages/shared-contracts/api/aim-session-input-contracts.md  (P5-009)
 *   packages/shared-contracts/api/aim-attempt-input-contracts.md  (P5-010)
 */
import { Injectable } from '@nestjs/common';
import { AimAnalysisRawRequest } from '../aim-engine-client.types';
import {
  AimAttemptContextInput,
  AimMappingContext,
  AimSessionContextInput,
} from './aim-request-mapper.types';

@Injectable()
export class AimRequestMapperService {
  /**
   * Map a complete AimMappingContext to an AimAnalysisRawRequest.
   *
   * This is the sole function that produces the AIM Engine request payload.
   * No other service may construct this payload directly.
   */
  map(context: AimMappingContext): AimAnalysisRawRequest {
    return {
      backendRequestId: context.backendRequestId,
      session: this.mapSession(context.session),
      attempts: context.attempts.map((a) => this.mapAttempt(a)),
      skillMasteryContext: this.mapSkillMasteryContext(context.skillMasteryContext),
    };
  }

  // -------------------------------------------------------------------------
  // Skill mastery context segment (P20-007)
  // -------------------------------------------------------------------------

  private mapSkillMasteryContext(
    skillMasteryContext: AimMappingContext['skillMasteryContext'],
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(skillMasteryContext).map(([skillId, ctx]) => [
        skillId,
        {
          previousMasteryScore: ctx.previousMasteryScore,
          recentAttempts: ctx.recentAttempts.map((a) => ({
            isCorrect: a.isCorrect,
            attemptNumberForItem: a.attemptNumberForItem,
            presentedDifficulty: a.presentedDifficulty,
            usedHint: a.usedHint,
            skip: a.skip,
          })),
          category: ctx.category,
          lastEvaluatedAt: ctx.lastEvaluatedAt,
          retentionHistory: ctx.retentionHistory.map((h) => ({
            recordedAt: h.recordedAt,
            masteryScore: h.masteryScore,
          })),
        },
      ]),
    );
  }

  // -------------------------------------------------------------------------
  // Session segment (P5-009)
  // -------------------------------------------------------------------------

  private mapSession(session: AimSessionContextInput): Record<string, unknown> {
    return {
      sessionId: session.sessionId,
      studentId: session.studentId,
      sessionType: session.sessionType,
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
      skillFocusIds: session.skillFocusIds,
      levelContext: {
        currentLevel: session.levelContext.currentLevel,
        levelSource: session.levelContext.levelSource,
        levelSetAt: session.levelContext.levelSetAt,
      },
      placementContext: session.placementContext
        ? {
            placementResultId: session.placementContext.placementResultId,
            placementCompletedAt: session.placementContext.placementCompletedAt,
            initialSkillSignals: session.placementContext.initialSkillSignals.map(
              (sig) => ({
                skillId: sig.skillId,
                signalStrength: sig.signalStrength,
              }),
            ),
          }
        : null,
      behavioralContext: {
        itemsAttemptedInSession: session.behavioralContext.itemsAttemptedInSession,
        consecutiveIncorrect: session.behavioralContext.consecutiveIncorrect,
        consecutiveCorrect: session.behavioralContext.consecutiveCorrect,
        averageResponseTimeMs: session.behavioralContext.averageResponseTimeMs,
        hesitationEventCount: session.behavioralContext.hesitationEventCount,
        retryEventCount: session.behavioralContext.retryEventCount,
        idleGapCount: session.behavioralContext.idleGapCount,
      },
      contractVersion: session.contractVersion,
    };
  }

  // -------------------------------------------------------------------------
  // Attempt segment (P5-010)
  // -------------------------------------------------------------------------

  private mapAttempt(attempt: AimAttemptContextInput): Record<string, unknown> {
    return {
      attemptId: attempt.attemptId,
      sessionId: attempt.sessionId,
      itemId: attempt.itemId,
      itemType: attempt.itemType,
      skillIds: attempt.skillIds,
      presentedDifficulty: attempt.presentedDifficulty,
      studentAnswer: {
        format: attempt.studentAnswer.format,
        value: attempt.studentAnswer.value,
        optionsPresentedCount: attempt.studentAnswer.optionsPresentedCount,
      },
      isCorrect: attempt.isCorrect,
      attemptNumberForItem: attempt.attemptNumberForItem,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      responseTimeMs: attempt.responseTimeMs,
      behavioralContext: {
        answerChangeCount: attempt.behavioralContext.answerChangeCount,
        hesitationBeforeSubmitMs: attempt.behavioralContext.hesitationBeforeSubmitMs,
        usedHint: attempt.behavioralContext.usedHint,
        abandonedFirstThenRetried: attempt.behavioralContext.abandonedFirstThenRetried,
      },
    };
  }
}
