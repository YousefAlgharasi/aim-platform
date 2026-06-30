// AchievementsController.
//
// Scope: Student-facing achievement gallery endpoint only.
//
// Endpoints:
//   GET /student/achievements — Locked/unlocked badge gallery.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { AchievementsService } from './achievements.service';
import { AchievementsResponse } from './achievements.types';

@ApiTags('achievements')
@Controller('student/achievements')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: "Get the student's achievement gallery (locked/unlocked badges)." })
  @ApiOkResponse({ description: 'Achievement gallery. studentId always from JWT.' })
  async getAchievements(@CurrentUser() user: AuthenticatedUser): Promise<AchievementsResponse> {
    return this.achievementsService.getAchievements(user.id);
  }
}
