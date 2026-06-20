// P10-033 / P10-034 / P10-035 / P10-037: AssessmentController — Student
// Assessment List, Detail, Start Attempt, and Submit Attempt API.
//
// Scope: Student-facing assessment list, detail, start-attempt, and
//        submit-attempt endpoints only.
//
// Endpoints:
//   GET  /student/assessments                       — List published
//                                                      quizzes/exams available
//                                                      to the authenticated
//                                                      student, with
//                                                      backend-derived deadline
//                                                      status.
//   GET  /student/assessments/:id                   — Return assessment
//                                                      metadata, settings, and
//                                                      backend-derived deadline
//                                                      state (P10-034).
//   POST /student/assessments/:id/attempts           — Start an attempt if the
//                                                      authenticated student is
//                                                      eligible (P10-035).
//   POST /student/assessments/attempts/:attemptId/submit — Submit an attempt
//                                                      and run the backend-only
//                                                      submit -> grade ->
//                                                      persist pipeline
//                                                      (P10-037).
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
//   - pass_threshold, late_penalty_percent, section weights, correct_answer,
//     score, maxScore, passed, and latePenaltyApplied are never included in
//     these responses.
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
import {
  AssessmentService,
  AssessmentListItem,
  AssessmentDetailWithDeadline,
} from './assessment.service';
import { AttemptLifecycleService, StartAttemptResult } from './assessment-attempt.service';
import { AssessmentSubmissionFlowService, SubmitAttemptApiResult } from './assessment-submission-flow.service';

@ApiTags('assessments')
@Controller('student/assessments')
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly attemptLifecycleService: AttemptLifecycleService,
    private readonly submissionFlowService: AssessmentSubmissionFlowService,
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
}
