// P10-069: AssessmentProgressIntegrationService.
//
// Scope: Feed backend-approved assessment grading results into the progress
//        pipeline after a successful grade in the submission flow.
//
// This service is the single integration point between the assessment
// grading pipeline and the progress/AIM system. It accepts only
// backend-computed grading outcomes — never client-supplied values.
//
// Security rules:
//   - All input fields (score, maxScore, passed, etc.) come exclusively from
//     AssessmentGradingService output that has already been persisted by
//     AssessmentResultService. No client payload is accepted.
//   - No grading logic is duplicated here — this service only forwards.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.
//   - No AIM Engine calls are made directly; this service records the
//     assessment outcome for downstream progress consumers.

import { Injectable, Logger } from '@nestjs/common';

/** Backend-approved graded result forwarded from the submission pipeline. */
export interface AssessmentProgressEvent {
  readonly assessmentId: string;
  readonly attemptId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
}

/** Outcome returned to the caller after progress recording. */
export interface AssessmentProgressOutcome {
  readonly recorded: boolean;
  readonly attemptId: string;
  readonly studentId: string;
}

@Injectable()
export class AssessmentProgressIntegrationService {
  private readonly logger = new Logger(AssessmentProgressIntegrationService.name);

  /**
   * Record a backend-graded assessment result for progress tracking.
   *
   * This method is intentionally non-blocking to the submission pipeline:
   * failures are logged but do not reject, so grading confirmation is
   * never withheld from the student due to a progress-tracking issue.
   *
   * Future phases will wire this into the AIM pipeline or a dedicated
   * assessment-progress persistence layer.
   */
  async recordAssessmentResult(event: AssessmentProgressEvent): Promise<AssessmentProgressOutcome> {
    try {
      this.logger.log('assessment_progress_recorded', {
        assessmentId: event.assessmentId,
        attemptId: event.attemptId,
        studentId: event.studentId,
        score: event.score,
        maxScore: event.maxScore,
        passed: event.passed,
        latePenaltyApplied: event.latePenaltyApplied,
        gradedAt: event.gradedAt.toISOString(),
      });

      return {
        recorded: true,
        attemptId: event.attemptId,
        studentId: event.studentId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('assessment_progress_recording_failed', {
        attemptId: event.attemptId,
        studentId: event.studentId,
        error: errorMessage,
      });

      return {
        recorded: false,
        attemptId: event.attemptId,
        studentId: event.studentId,
      };
    }
  }
}
