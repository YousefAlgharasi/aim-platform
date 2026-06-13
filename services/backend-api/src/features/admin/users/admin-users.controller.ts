// Phase 2 — P2-059
// Admin users list controller.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Protected by SupabaseJwtAuthGuard (JWT validation) and RoleGuard (role check).
// - Only ADMIN and SUPER_ADMIN roles may access this endpoint.
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for authorization.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth';
import { AuthorizedRole, RequireRoles, RoleGuard } from '../../../auth/authorization';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AdminUsersService } from './admin-users.service';
import { SafeUserDto } from './safe-user.dto';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users. Admin and Super Admin only.' })
  @ApiOkResponse({ type: [SafeUserDto], description: 'Safe user list.' })
  listUsers(): Promise<SafeUserDto[]> {
    return this.adminUsersService.listUsers();
  }
}