// P10-037: AssessmentSubmissionFlowService.
//
// Scope: Orchestrate the backend-only submit → grade → persist pipeline for
//        a single assessment attempt. Used by the student-facing submit
//        attempt endpoint.
//
// Security rules:
//   - Accepts only (attemptId, studentId); studentId is always JWT-derived
//     by the caller (controller), never accepted from a client payload.
//   - Attempt ownership, status, and deadline eligibility are enforced by
//     AttemptLifecycleService.submitAttempt (P10-025) before grading runs.
//   - Grading (correctness, score, pass/fail, late penalty) is computed
//     exclusively by AssessmentGradingService (P10-027) — never accepted
//     from or recomputed by Flutter.
//   - Result persistence is delegated to AssessmentResultService (P10-029).
//   - This service returns only a submission confirmation shape
//     (attemptId, status, submittedAt, resultId) — score, maxScore, passed,
//     and latePenaltyApplied are NEVER returned here. Flutter must fetch
//     the backend-approved result via the dedicated result endpoint
//     (P10-038), which controls what is safe to expose.
//   - No AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.
//   - P10-069: After grading and persistence, the backend-approved result is
//     forwarded to AssessmentProgressIntegrationService for progress tracking.
//     This is fire-and-forget: progress recording failures never block the
//     submission confirmation.

import { Injectable, Logger } from '@nestjs/common';
import { AttemptLifecycleService } from './assessment-attempt.service';
import { AssessmentGradingService } from './assessment-grading.service';
import { AssessmentResultService } from './assessment-result.service';
import { AssessmentProgressIntegrationService } from './assessment-progress-integration.service';

export interface SubmitAttemptApiResult {
  readonly attemptId: string;
  readonly status: 'graded';
  readonly submittedAt: Date;
  readonly resultId: string;
  // score, maxScore, passed, latePenaltyApplied: NEVER returned here.
}

@Injectable()
export class AssessmentSubmissionFlowService {
  private readonly logger = new Logger(AssessmentSubmissionFlowService.name);

  constructor(
    private readonly attemptLifecycleService: AttemptLifecycleService,
    private readonly gradingService: AssessmentGradingService,
    private readonly resultService: AssessmentResultService,
    private readonly progressIntegration: AssessmentProgressIntegrationService,
  ) {}

  /**
   * Submit an attempt and run it through backend grading and result
   * persistence in one pipeline. Never accepts score/correctness from
   * the caller — those are computed entirely backend-side.
   *
   * P10-069: After persistence, the grading result is forwarded to the
   * progress integration service. This is fire-and-forget — a failure
   * in progress recording never blocks the submission confirmation.
   */
  async submitAndGrade(attemptId: string, studentId: string): Promise<SubmitAttemptApiResult> {
    const submitResult = await this.attemptLifecycleService.submitAttempt(attemptId, studentId);
    const gradingResult = await this.gradingService.gradeAttempt(attemptId);
    const persisted = await this.resultService.persistResult(gradingResult);

    // P10-069: Feed backend-approved result into progress pipeline.
    // Fire-and-forget — do not await in the critical path if recording
    // fails; log and continue so the student always gets confirmation.
    try {
      await this.progressIntegration.recordAssessmentResult({
        assessmentId: gradingResult.assessmentId,
        attemptId: gradingResult.attemptId,
        studentId: gradingResult.studentId,
        score: gradingResult.score,
        maxScore: gradingResult.maxScore,
        passed: gradingResult.passed,
        latePenaltyApplied: gradingResult.latePenaltyApplied,
        gradedAt: gradingResult.gradedAt,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('assessment_progress_integration_failed', {
        attemptId,
        studentId,
        error: errorMessage,
      });
      // Intentionally swallowed — progress recording must not block submission.
    }

    return {
      attemptId,
      status: 'graded',
      submittedAt: submitResult.submittedAt,
      resultId: persisted.resultId,
    };
  }
}
