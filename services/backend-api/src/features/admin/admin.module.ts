// Phase 2 — P2-059
// Admin NestJS module.
//
// Scope: Auth, Users, Roles only.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { AdminController } from './admin.controller';
import { AdminRoleAssignmentController } from './admin-role-assignment.controller';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [AdminController, AdminRoleAssignmentController],
  providers: [AdminService, AdminRoleAssignmentService],
  exports: [AdminService, AdminRoleAssignmentService],
})
export class AdminModule {}
