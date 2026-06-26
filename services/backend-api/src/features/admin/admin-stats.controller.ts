import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AdminStatsService } from './admin-stats.service';

@ApiTags('Admin Stats')
@Controller('admin/stats')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {}

  @Get()
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform-wide statistics for admin dashboard' })
  async getStats() {
    return this.statsService.getDashboardStats();
  }
}
