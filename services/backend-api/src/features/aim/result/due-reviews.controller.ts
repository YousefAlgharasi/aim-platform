import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { StudentOwnershipGuard } from '../../../auth/authorization/student-ownership.guard';
import { RequireStudentOwnership } from '../../../auth/authorization/require-student-ownership.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { DueReviewsReadResponse, DueReviewsReadService } from './due-reviews-read.service';

@ApiTags(OPENAPI_TAGS.aim)
@Controller('aim')
export class DueReviewsController {
  constructor(private readonly dueReviewsReadService: DueReviewsReadService) {}

  /**
   * GET /aim/students/:studentId/due-reviews
   *
   * The reviews the student should do now: due, and only for skills they are
   * weak at (an open/improving weakness record, or low mastery). Each entry
   * carries the readable skill title and a published lesson to practise.
   * Read-only; studentId is validated against the JWT.
   */
  @Get('students/:studentId/due-reviews')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Read the due reviews for the student's weak skills (student).",
    description:
      'Due reviews limited to weak skills, with skill title and a lesson to practise. ' +
      'No live AIM Engine call. studentId in route validated against JWT.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({ description: 'Due reviews for weak skills. Empty array if none.' })
  async getDueReviews(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<DueReviewsReadResponse> {
    return this.dueReviewsReadService.getDueReviewsForStudent(studentId);
  }
}
