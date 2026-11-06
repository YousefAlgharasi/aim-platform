// EngagementController.
//
// Scope: Student-facing daily goal + daily challenge + gamification stats
// endpoints only.
//
// Endpoints:
//   GET /student/engagement/summary — Goal, streak, and today's challenge.
//   POST /student/engagement/streak-freeze — Cover yesterday so the streak survives.
//   PUT /student/engagement/goal     — Update the student's daily lesson goal.
//   GET /student/engagement/leaderboard?period=week|all&limit=5 — Top students by XP.
//   GET /student/engagement/stats    — Level, XP, badge count, rank, and
//                                       weekly activity for the Home hero card.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { EngagementService } from './engagement.service';
import {
  DailyGoalSummary,
  EngagementStatsResponse,
  EngagementSummaryResponse,
  LeaderboardResponse,
} from './engagement.types';

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

  @Get('stats')
  @ApiOperation({
    summary:
      "Get the student's level, XP, badge count, global rank, and weekly activity for the Home hero card.",
  })
  @ApiOkResponse({ description: 'Engagement stats. studentId always from JWT.' })
  async getStats(@CurrentUser() user: AuthenticatedUser): Promise<EngagementStatsResponse> {
    return this.engagementService.getStats(user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top students by XP (this week or all time), with the caller\'s own place.' })
  @ApiOkResponse({ description: 'Leaderboard. Names are first name + last initial; the caller is flagged isYou.' })
  async getLeaderboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('period') period?: string,
    @Query('limit') limit?: string,
  ): Promise<LeaderboardResponse> {
    const parsed = Number.parseInt(limit ?? '', 10);
    const size = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 5;
    return this.engagementService.getLeaderboard(user.id, period === 'all' ? 'all' : 'week', size);
  }

  @Post('streak-freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Use a streak freeze to cover yesterday so the day streak survives (limited per month).",
  })
  @ApiOkResponse({ description: 'Fresh engagement summary after the freeze.' })
  async useStreakFreeze(@CurrentUser() user: AuthenticatedUser): Promise<EngagementSummaryResponse> {
    return this.engagementService.useStreakFreeze(user.id);
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
