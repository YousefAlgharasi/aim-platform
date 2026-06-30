import { Module } from '@nestjs/common';
import { RolesModule } from '../../features/roles';
import { UsersModule } from '../../features/users';
import { PermissionGuard } from './permission.guard';
import { ResolveInternalUserIdGuard } from './resolve-internal-user-id.guard';
import { RoleGuard } from './role.guard';
import { StudentOwnershipGuard } from './student-ownership.guard';

@Module({
  imports: [RolesModule, UsersModule],
  providers: [RoleGuard, PermissionGuard, StudentOwnershipGuard, ResolveInternalUserIdGuard],
  exports: [RoleGuard, PermissionGuard, StudentOwnershipGuard, ResolveInternalUserIdGuard],
})
export class AuthorizationModule {}
