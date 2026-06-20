// P10-033 / P10-034: AssessmentController — Student Assessment List & Detail API.
//
// Scope: Student-facing assessment list and detail endpoints only.
//
// Endpoints:
//   GET /student/assessments     — List published quizzes/exams available
//                                   to the authenticated student, with
//                                   backend-derived deadline status.
//   GET /student/assessments/:id — Return assessment metadata, settings,
//                                   and backend-derived deadline state
//                                   (P10-034).
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard (authentication) and
//     AssessmentPermissionGuard (role enforcement) — P10-032.
//   - Requires AuthorizedRole.STUDENT.
//   - student_id always resolved from JWT — never from client input.
//   - deadline status is backend-derived (AssessmentDeadlineService, P10-024,
//     via AssessmentService.getDetailWithDeadline); never accepted from or
//     recomputed by Flutter.
//   - pass_threshold, late_penalty_percent, section weights, correct_answer
//     are never included in these responses.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import {
  AssessmentService,
  AssessmentListItem,
  AssessmentDetailWithDeadline,
} from './assessment.service';

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
}
