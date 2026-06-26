// LessonsController.
//
// Scope: Student-facing lesson progress endpoints only.
//
// Endpoints:
//   POST /lessons/:id/progress — Record in-progress percent for a lesson.
//   POST /lessons/:id/complete — Mark a lesson as completed.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.
//   - No AIM Engine runtime, mastery, difficulty, or skill-map logic here.

import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressAckResponse } from './lesson-progress.types';

interface RecordProgressBody {
  readonly percent: number;
}

@ApiTags('lessons')
@Controller('lessons')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonProgress: LessonProgressService) {}

  @Post(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record in-progress percent for a lesson (student).' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson.' })
  @ApiOkResponse({ description: 'Progress recorded. studentId always from JWT.' })
  async recordProgress(
    @Param('id') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RecordProgressBody,
  ): Promise<LessonProgressAckResponse> {
    return this.lessonProgress.recordProgress({
      studentId: user.id,
      lessonId,
      percent: body.percent,
    });
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a lesson as completed (student).' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson.' })
  @ApiOkResponse({ description: 'Lesson marked completed. studentId always from JWT.' })
  async markComplete(
    @Param('id') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LessonProgressAckResponse> {
    return this.lessonProgress.markComplete(user.id, lessonId);
  }
}
