// EnrollmentController.
//
// Scope: "Which course is this student currently enrolled in" only.
//
// Endpoints:
//   POST /courses/:id/enroll — Start (enroll in) a course, making it active.
//   GET  /enrollment/current — Read the student's current active enrollment.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { EnrollmentService } from './enrollment.service';
import { CurrentEnrollmentResponse, EnrollResponse } from './enrollment.types';

@ApiTags('enrollment')
@Controller()
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('courses/:id/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Enroll the student in a course, making it their active course (student).',
    description:
      'Explicit start action — a student has at most one active course at a ' +
      'time; enrolling in a different course transitions the previous one to ' +
      "'switched'. studentId always from JWT.",
  })
  @ApiParam({ name: 'id', description: 'UUID of the published course.' })
  @ApiOkResponse({ description: 'Enrollment recorded (or already active).' })
  async enroll(
    @Param('id') courseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollResponse> {
    return this.enrollmentService.enroll(user.id, courseId);
  }

  @Get('enrollment/current')
  @ApiOperation({ summary: "Read the student's current active enrollment (student)." })
  @ApiOkResponse({
    description: 'Current active enrollment. found: false if not yet enrolled in anything.',
  })
  async getCurrent(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CurrentEnrollmentResponse> {
    return this.enrollmentService.getCurrentEnrollment(user.id);
  }
}
