// P10-033: AssessmentController — Student Assessment List API.
//
// Scope: Student-facing assessment list endpoint only.
//
// Endpoints:
//   GET /student/assessments — List published quizzes/exams available to
//                               the authenticated student, with backend-
//                               derived deadline status.
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard (authentication) and
//     AssessmentPermissionGuard (role enforcement) — P10-032.
//   - Requires AuthorizedRole.STUDENT.
//   - student_id always resolved from JWT — never from client input.
//   - deadlineStatus is backend-derived (AssessmentService.deriveDeadlineStatus);
//     never accepted from or recomputed by Flutter.
//   - pass_threshold, late_penalty_percent, section weights, correct_answer
//     are never included in this response.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AssessmentService, AssessmentListItem } from './assessment.service';

@ApiTags('assessments')
@Controller('student/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

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
}
