import { Module } from '@nestjs/common';
import { RolesModule } from '../../features/roles/roles.module';
import { UsersModule } from '../../features/users/users.module';
import { RoleGuard } from './role.guard';
import { StudentOwnershipGuard } from './student-ownership.guard';

@Module({
  imports: [RolesModule, UsersModule],
  providers: [RoleGuard, StudentOwnershipGuard],
  exports: [RoleGuard, StudentOwnershipGuard],
})
export class AuthorizationModule {}
