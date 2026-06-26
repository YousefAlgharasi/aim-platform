import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AdminParentsService } from './admin-parents.service';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/parents')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminParentsController {
  constructor(private readonly adminParentsService: AdminParentsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get parent/guardian statistics. Admin and Super Admin only.' })
  @ApiOkResponse({ description: 'Parent stats summary.' })
  getStats() {
    return this.adminParentsService.getStats();
  }

  @Get('links')
  @ApiOperation({ summary: 'List parent-child links. Admin and Super Admin only.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated parent-child links.' })
  listLinks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminParentsService.listLinks({
      page: Math.max(parseInt(page ?? '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100),
      status: status || undefined,
      search: search || undefined,
    });
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List parent invitations. Admin and Super Admin only.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated parent invitations.' })
  listInvitations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminParentsService.listInvitations({
      page: Math.max(parseInt(page ?? '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100),
      status: status || undefined,
      search: search || undefined,
    });
  }

  @Get('consents')
  @ApiOperation({ summary: 'List parent consents. Admin and Super Admin only.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'consentType', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated parent consents.' })
  listConsents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('consentType') consentType?: string,
  ) {
    return this.adminParentsService.listConsents({
      page: Math.max(parseInt(page ?? '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100),
      status: status || undefined,
      consentType: consentType || undefined,
    });
  }
}
