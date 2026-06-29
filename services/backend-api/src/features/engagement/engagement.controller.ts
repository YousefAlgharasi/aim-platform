// EngagementController.
//
// Scope: Student-facing daily goal + daily challenge endpoints only.
//
// Endpoints:
//   GET /student/engagement/summary — Goal, streak, and today's challenge.
//   PUT /student/engagement/goal     — Update the student's daily lesson goal.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { EngagementService } from './engagement.service';
import { DailyGoalSummary, EngagementSummaryResponse } from './engagement.types';

interface UpdateGoalBody {
  readonly dailyGoalLessons: number;
}

@ApiTags('engagement')
@Controller('student/engagement')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('summary')
  @ApiOperation({ summary: "Get the student's daily goal, streak, and today's challenge." })
  @ApiOkResponse({ description: 'Engagement summary. studentId always from JWT.' })
  async getSummary(@CurrentUser() user: AuthenticatedUser): Promise<EngagementSummaryResponse> {
    return this.engagementService.getSummary(user.id);
  }

  @Put('goal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update the student's daily lesson goal." })
  @ApiOkResponse({ description: 'Goal updated.' })
  async updateGoal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateGoalBody,
  ): Promise<DailyGoalSummary> {
    return this.engagementService.updateGoal(user.id, body.dailyGoalLessons);
  }
}
