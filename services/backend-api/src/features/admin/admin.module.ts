// Phase 2 — P2-059 / P2-061 (admin users API) + P2-031 (AdminProfileService added)
// Admin NestJS module.
//
// Scope: Auth, Users, Roles only.
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { AdminController } from './admin.controller';
import { AdminDataController } from './admin-data.controller';
import { AdminDataService } from './admin-data.service';
import { AdminProfileService } from './admin-profile.service';
import { AdminRoleAssignmentController } from './admin-role-assignment.controller';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';
import { AdminRolesController } from './admin-roles.controller';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminService } from './admin.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [AdminController, AdminDataController, AdminRoleAssignmentController, AdminRolesController, AdminUsersController, AdminStatsController],
  providers: [AdminService, AdminDataService, AdminRoleAssignmentService, AdminUsersService, AdminProfileService, AdminStatsService],
  exports: [AdminService, AdminDataService, AdminRoleAssignmentService, AdminProfileService],
})
export class AdminModule {}
