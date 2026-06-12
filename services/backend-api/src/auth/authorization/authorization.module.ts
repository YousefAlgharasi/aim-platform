import { Module } from '@nestjs/common';
import { RolesModule } from '../../features/roles';
import { PermissionGuard } from './permission.guard';
import { RoleGuard } from './role.guard';
import { StudentOwnershipGuard } from './student-ownership.guard';

@Module({
  imports: [RolesModule],
  providers: [RoleGuard, PermissionGuard, StudentOwnershipGuard],
  exports: [RoleGuard, PermissionGuard, StudentOwnershipGuard],
})
export class AuthorizationModule {}
