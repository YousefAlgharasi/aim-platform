// P10-033 / P10-034 / P10-035 / P10-036 / P10-037 / P10-038 / P10-039 / P10-040: AssessmentController —
// Student Assessment List, Detail, Start Attempt, Resume Attempt, Submit
// Attempt, Attempt Result, and Deadlines API.
//
// Scope: Student-facing assessment list, detail, start-attempt,
//        submit-attempt, attempt-result, and deadlines endpoints only.
//
// Endpoints:
//   GET  /student/assessments                       — List published
//                                                      quizzes/exams available
//                                                      to the authenticated
//                                                      student, with
//                                                      backend-derived deadline
//                                                      status. Chapter-gated
//                                                      assessments not yet
//                                                      unlocked are omitted.
//   GET  /student/assessments/next                   — The single current
//                                                      assessment (oldest
//                                                      unlocked, not yet
//                                                      attempted), or null.
//                                                      Used by Home so a
//                                                      student only ever sees
//                                                      one assessment there.
//   GET  /student/assessments/deadlines              — List the authenticated
//                                                      student's deadlines
//                                                      across all published
//                                                      assessments, grouped
//                                                      into upcoming/active/
//                                                      late/missed/closed
//                                                      (P10-039).
//   GET  /student/assessments/:id                   — Return assessment
//                                                      metadata, settings, and
//                                                      backend-derived deadline
//                                                      state (P10-034).
//   POST /student/assessments/:id/attempts           — Start an attempt if the
//                                                      authenticated student is
//                                                      eligible (P10-035).
//   GET  /student/assessments/attempts/:attemptId/resume — Resume an active
//                                                      attempt if owned by the
//                                                      authenticated student
//                                                      (P10-036).
//   POST /student/assessments/attempts/:attemptId/submit — Submit an attempt
//                                                      and run the backend-only
//                                                      submit -> grade ->
//                                                      persist pipeline
//                                                      (P10-037).
//   GET  /student/assessments/attempts/:attemptId/result — Return the
//                                                      backend-approved
//                                                      result (score,
//                                                      pass/fail, feedback)
//                                                      for an owned attempt
//                                                      (P10-038).
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard (authentication) and
//     AssessmentPermissionGuard (role enforcement) — P10-032.
//   - Requires AuthorizedRole.STUDENT.
//   - student_id always resolved from JWT — never from client input.
//   - deadline status is backend-derived (AssessmentDeadlineService, P10-024,
//     via AssessmentService.getDetailWithDeadline); never accepted from or
//     recomputed by Flutter.
//   - Attempt eligibility (deadline window, max attempts) is always
//     backend-evaluated (AttemptLifecycleService, P10-025); never accepted
//     from or recomputed by Flutter.
//   - Submit attempt is guarded by AssessmentAttemptOwnershipGuard (P10-032)
//     so only the owning student may submit; grading and persistence are
//     fully backend-evaluated (AssessmentSubmissionFlowService, P10-037).
//   - Attempt result is guarded by AssessmentResultOwnershipGuard (P10-032)
//     so only the owning student may view it; score, passed, and
//     latePenaltyApplied are backend-authoritative values from
//     AssessmentFeedbackService (P10-030) — never recomputed by Flutter.
//     Correct answer text is never included regardless of feedback policy.
//   - pass_threshold, late_penalty_percent, section weights, and
//     correct_answer are never included in these responses.
//   - Deadline grouping (upcoming/active/late/missed/closed) is always
//     backend-derived (AssessmentDeadlineService, P10-024, via
//     AssessmentService.listDeadlinesForStudent); never accepted from or
//     recomputed by Flutter. late_window_seconds and late_penalty_percent
//     are never included in the deadlines response.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AssessmentAttemptOwnershipGuard } from './guards/assessment-attempt-ownership.guard';
import { AssessmentResultOwnershipGuard } from './guards/assessment-result-ownership.guard';
import {
  AssessmentService,
  AssessmentListItem,
  AssessmentDetailWithDeadline,
  StudentDeadlinesResponse,
} from './assessment.service';
import { AttemptLifecycleService, StartAttemptResult, ResumeAttemptResult } from './assessment-attempt.service';
import { AssessmentSubmissionFlowService, SubmitAttemptApiResult } from './assessment-submission-flow.service';
import { AssessmentFeedbackService, FeedbackSummary } from './assessment-feedback.service';
import { AssessmentResultService, ResultHistoryResponse } from './assessment-result.service';

@ApiTags('assessments')
@Controller('student/assessments')
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly attemptLifecycleService: AttemptLifecycleService,
    private readonly submissionFlowService: AssessmentSubmissionFlowService,
    private readonly feedbackService: AssessmentFeedbackService,
    private readonly resultService: AssessmentResultService,
  ) {}

  /**
   * GET /student/assessments
   * List published quizzes/exams available to the authenticated student.
   * deadlineStatus is computed backend-side per student.
   */
  @Get()
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List published assessments for the authenticated student.' })
  @ApiOkResponse({
    description:
      'Published assessment list with backend-derived deadlineStatus. ' +
      'pass_threshold, late_penalty_percent, section weights, and correct_answer are never included.',
  })
  async listAssessments(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssessmentListItem[]> {
    return this.assessmentService.listForStudent(user.id);
  }

  /**
   * GET /student/assessments/next
   * The single "current" assessment for the student — the oldest unlocked,
   * not-yet-attempted assessment, or null when nothing is currently due.
   * Declared before the ':id' route so 'next' is never matched as an
   * assessment id.
   */
  @Get('next')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "The authenticated student's single current assessment, or null." })
  @ApiOkResponse({
    description:
      'The oldest unlocked, not-yet-attempted assessment for this student, or null if none is due.',
  })
  async getNextAssessment(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssessmentListItem | null> {
    return this.assessmentService.getNextAssessment(user.id);
  }

  /**
   * GET /student/assessments/deadlines
   * Return the authenticated student's deadlines across all published
   * assessments, grouped into upcoming/active/late/missed/closed. P10-039.
   * Declared before the ':id' route so 'deadlines' is never matched as an
   * assessment id.
   */
  @Get('deadlines')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated student\'s deadlines, grouped by backend-derived status.' })
  @ApiOkResponse({
    description:
      'Deadlines grouped into upcoming/active/late/missed/closed. Status is backend-derived; ' +
      'late_window_seconds and late_penalty_percent are never included.',
  })
  async listDeadlines(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudentDeadlinesResponse> {
    return this.assessmentService.listDeadlinesForStudent(user.id);
  }

  /**
   * GET /student/assessments/:id
   * Return assessment metadata, settings, and backend-derived deadline
   * state for the authenticated student. P10-034.
   */
  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assessment detail and deadline state for the authenticated student.' })
  @ApiParam({ name: 'id', description: 'UUID of the published assessment.' })
  @ApiOkResponse({
    description:
      'Assessment metadata, sections (with questionCount only), settings, and backend-derived ' +
      'deadline state. pass_threshold, late_penalty_percent, section weights, and correct_answer ' +
      'are never included.',
  })
  async getAssessmentDetail(
    @Param('id') assessmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssessmentDetailWithDeadline> {
    return this.assessmentService.getDetailWithDeadline(assessmentId, user.id);
  }

  /**
   * GET /student/assessments/:id/history
   * Return all previous attempt results for the authenticated student on this
   * assessment, ordered by attempt number. P10-040.
   */
  @Get(':id/history')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List previous attempt results for the authenticated student on this assessment.' })
  @ApiParam({ name: 'id', description: 'UUID of the published assessment.' })
  @ApiOkResponse({
    description:
      'Result history with backend-authoritative score, passed, and latePenaltyApplied. ' +
      'correct_answer, pass_threshold, and late_penalty_percent are never included.',
  })
  async getResultHistory(
    @Param('id') assessmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResultHistoryResponse> {
    return this.resultService.listByAssessment(assessmentId, user.id);
  }

  /**
   * POST /student/assessments/:id/attempts
   * Start an attempt for the authenticated student if eligible. P10-035.
   * Eligibility (deadline window, max attempts) is fully backend-evaluated
   * by AttemptLifecycleService — never accepted from or recomputed by Flutter.
   */
  @Post(':id/attempts')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start an assessment attempt for the authenticated student if eligible.' })
  @ApiParam({ name: 'id', description: 'UUID of the published assessment.' })
  @ApiOkResponse({
    description:
      'Started attempt with backend-computed expiresAt. Backend evaluates deadline window and ' +
      'max-attempts eligibility; client-supplied eligibility is never accepted.',
  })
  async startAttempt(
    @Param('id') assessmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StartAttemptResult> {
    return this.attemptLifecycleService.startAttempt(assessmentId, user.id);
  }

  /**
   * GET /student/assessments/attempts/:attemptId/resume
   * Resume an active attempt for the authenticated student. P10-036.
   * Backend validates ownership and resumability (only 'started' or
   * 'in_progress' attempts may be resumed). expiresAt is backend-computed;
   * Flutter uses it for display countdown only.
   */
  @Get('attempts/:attemptId/resume')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard, AssessmentAttemptOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resume an active assessment attempt for the authenticated student.' })
  @ApiParam({ name: 'attemptId', description: 'UUID of the attempt owned by the authenticated student.' })
  @ApiOkResponse({
    description:
      'Resumed attempt with backend-computed expiresAt. Only attempts in started/in_progress ' +
      'status may be resumed. Backend validates ownership and status.',
  })
  async resumeAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResumeAttemptResult> {
    return this.attemptLifecycleService.resumeAttempt(attemptId, user.id);
  }

  /**
   * POST /student/assessments/attempts/:attemptId/submit
   * Submit an attempt for the authenticated student and run the backend-only
   * submit -> grade -> persist pipeline. P10-037.
   * Returns only a submission confirmation shape; score, maxScore, passed,
   * and latePenaltyApplied are never returned here (see P10-038 result API).
   */
  @Post('attempts/:attemptId/submit')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard, AssessmentAttemptOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an assessment attempt and run backend grading and result persistence.' })
  @ApiParam({ name: 'attemptId', description: 'UUID of the attempt owned by the authenticated student.' })
  @ApiOkResponse({
    description:
      'Submission confirmation (attemptId, status, submittedAt, resultId). Backend computes grading; ' +
      'score, maxScore, passed, and latePenaltyApplied are never included here.',
  })
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmitAttemptApiResult> {
    return this.submissionFlowService.submitAndGrade(attemptId, user.id);
  }

  /**
   * GET /student/assessments/attempts/:attemptId/result
   * Return the backend-approved result for an attempt owned by the
   * authenticated student. P10-038. Mobile displays this result only —
   * score, pass/fail, and per-question isCorrect (gated by feedback_policy)
   * are computed entirely backend-side; correct answer text is never
   * included.
   */
  @Get('attempts/:attemptId/result')
  @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard, AssessmentResultOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the backend-approved result for an assessment attempt.' })
  @ApiParam({ name: 'attemptId', description: 'UUID of the attempt owned by the authenticated student.' })
  @ApiOkResponse({
    description:
      'Backend-approved result (score, maxScore, passed, latePenaltyApplied, breakdown). ' +
      'Per-question isCorrect is included only when feedback_policy allows; correct answer text ' +
      'is never included.',
  })
  async getAttemptResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeedbackSummary> {
    return this.feedbackService.getFeedback(attemptId, user.id);
  }
}
