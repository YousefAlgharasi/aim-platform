// Phase 2 — P2-059 / P2-061
// P11-013: Extended with search/filter query params and PATCH status endpoint.
//
// Admin users controller.
//
// Security rules:
// - Protected by SupabaseJwtAuthGuard (JWT validation) and RoleGuard (role check).
// - Only ADMIN and SUPER_ADMIN roles may access these endpoints.
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for authorization.
// - userId is always resolved from the route param — never from client body.

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth';
import { AuthorizedRole, RequireRoles, RoleGuard } from '../../../auth/authorization';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AdminUserDetailDto } from './admin-user-detail.dto';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersListQueryDto } from './admin-users-list-query.dto';
import { UpdateUserStatusDto } from './update-user-status.dto';
import { SafeUserDto } from './safe-user.dto';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List users with optional search and filter. Admin and Super Admin only.',
  })
  @ApiQuery({ name: 'page',     required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit',    required: false, type: Number, description: 'Items per page (default 20, max 100)' })
  @ApiQuery({ name: 'status',   required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'userType', required: false, type: String, description: 'Filter by user type' })
  @ApiQuery({ name: 'email',    required: false, type: String, description: 'Search by email (partial)' })
  @ApiOkResponse({ description: 'Paginated safe user list with total count.' })
  listUsers(@Query() query: AdminUsersListQueryDto) {
    return this.adminUsersService.listUsers({
      page:     query.page,
      limit:    query.limit,
      status:   query.status,
      userType: query.userType,
      email:    query.email,
    });
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

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user status (active or disabled). Admin and Super Admin only.',
    description:
      'Backend resolves userId from the route param only. ' +
      'Only active and disabled are permitted. Roles cannot be changed here.',
  })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID.' })
  @ApiOkResponse({ type: SafeUserDto, description: 'Updated safe user record.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  updateUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<SafeUserDto> {
    // userId is always from the verified route param — never from the request body.
    return this.adminUsersService.updateUserStatus(id, body.status);
  }
}
