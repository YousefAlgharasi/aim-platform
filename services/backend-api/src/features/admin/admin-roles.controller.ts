// P11-018: Admin roles and permissions controller.
// Exposes read-only endpoints for roles and role details with permissions.
// Protected by SupabaseJwtAuthGuard + RoleGuard (admin/super_admin only).

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { RolesService } from '../roles/roles.service';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/roles')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles. Admin and Super Admin only.' })
  @ApiOkResponse({ description: 'List of all role records.' })
  async listRoles() {
    const roles = await this.rolesService.getRoles();
    return { success: true, data: { roles } };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get role detail with permissions by key. Admin and Super Admin only.' })
  @ApiOkResponse({ description: 'Role record with associated permissions.' })
  async getRoleDetail(@Param('key') key: string) {
    const result = await this.rolesService.getRoleByKey(key);
    return { success: true, data: result };
  }
}
