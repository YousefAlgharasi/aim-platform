import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';
import { AdminEngagementService } from './admin-engagement.service';

@ApiTags('Admin Engagement')
@Controller('admin')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminEngagementController {
  constructor(private readonly svc: AdminEngagementService) {}

  @Get('achievements')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List achievement definitions (admin)' })
  listAchievements() { return this.svc.listAchievements(); }

  @Patch('achievements/:id')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Edit an achievement (title, description, icon, active) (admin)' })
  updateAchievement(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.svc.updateAchievement(id, body ?? {}, req.internalUserId!);
  }

  @Get('daily-challenges')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List daily challenge templates (admin)' })
  listChallenges() { return this.svc.listChallenges(); }

  @Post('daily-challenges')
  @HttpCode(HttpStatus.CREATED)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Create a daily challenge template (admin)' })
  createChallenge(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.svc.createChallenge(body ?? {}, req.internalUserId!);
  }

  @Patch('daily-challenges/:id')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Edit a daily challenge template (admin)' })
  updateChallenge(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.svc.updateChallenge(id, body ?? {}, req.internalUserId!);
  }
}
