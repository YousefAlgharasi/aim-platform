import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseJwtAuthGuard } from '../../auth';
import {
  AuthorizedRole,
  RequireRoles,
  RoleGuard,
} from '../../auth/authorization';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';
import { AdminRoleAssignmentResponse } from './admin-role-assignment.types';

interface AssignUserRoleBody {
  readonly roleKey?: string;
  readonly reason?: string;
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminRoleAssignmentController {
  constructor(
    private readonly roleAssignmentService: AdminRoleAssignmentService,
  ) {}

  @Put('users/:userId/roles')
  @ApiOperation({ summary: 'Assign or change a user role.' })
  @ApiOkResponse({ description: 'Role assignment result.' })
  assignUserRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: AssignUserRoleBody,
  ): Promise<AdminRoleAssignmentResponse> {
    return this.roleAssignmentService.assignUserRole({
      actorSupabaseAuthUid: actor.id,
      targetUserId: userId,
      roleKey: body.roleKey ?? '',
      reason: body.reason,
    });
  }
}
