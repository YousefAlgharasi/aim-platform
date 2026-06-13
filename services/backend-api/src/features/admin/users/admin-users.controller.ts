// Phase 2 — P2-059 / P2-061
// Admin users controller.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Protected by SupabaseJwtAuthGuard (JWT validation) and RoleGuard (role check).
// - Only ADMIN and SUPER_ADMIN roles may access these endpoints.
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for authorization.

import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth';
import { AuthorizedRole, RequireRoles, RoleGuard } from '../../../auth/authorization';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AdminUserDetailDto } from './admin-user-detail.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail by ID. Admin and Super Admin only.' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID.' })
  @ApiOkResponse({ type: AdminUserDetailDto, description: 'Safe user detail with roles and profile.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getUserDetail(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AdminUserDetailDto> {
    return this.adminUsersService.getUserDetail(id);
  }
}
