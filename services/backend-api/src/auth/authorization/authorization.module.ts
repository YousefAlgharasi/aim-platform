import { Module } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { StudentOwnershipGuard } from './student-ownership.guard';

@Module({
  providers: [RoleGuard, StudentOwnershipGuard],
  exports: [RoleGuard, StudentOwnershipGuard],
})
export class AuthorizationModule {}
