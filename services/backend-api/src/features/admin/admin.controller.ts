// Phase 2 — P2-059
// Admin controller.
//
// Scope: Auth, Users, Roles only.
//
// Security:
//   - All routes require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - All routes require backend-verified role authorization (RoleGuard).
//   - The admin/super_admin role is enforced by the backend — not by the client.
//   - supabase_auth_uid is never returned in responses.

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AdminService } from './admin.service';
import { AdminUserListResponse } from './admin.types';

@ApiTags(OPENAPI_TAGS.admin)
@Controller('admin')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all users. Requires admin or super_admin role.' })
  @ApiOkResponse({ description: 'Paginated list of safe user records.' })
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<AdminUserListResponse> {
    return this.adminService.listUsers(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }
}
