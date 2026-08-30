// Phase 2 — P2-059 / P2-061 (admin users API) + P2-031 (AdminProfileService added)
// Admin NestJS module.
//
// Scope: Auth, Users, Roles only.
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { LessonsModule } from '../lessons/lessons.module';
import { PlacementModule } from '../placement/placement.module';
import { BillingModule } from '../billing/billing.module';
import { CertificateModule } from '../certificates/certificate.module';
import { AimModule } from '../aim/aim.module';
import { AdminController } from './admin.controller';
import { AdminDataController } from './admin-data.controller';
import { AdminDataService } from './admin-data.service';
import { AdminParentsController } from './admin-parents.controller';
import { AdminParentsService } from './admin-parents.service';
import { AdminProfileService } from './admin-profile.service';
import { AdminRoleAssignmentController } from './admin-role-assignment.controller';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';
import { AdminRolesController } from './admin-roles.controller';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminService } from './admin.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminStudentProgressController } from './users/admin-student-progress.controller';
import { AdminStudentProgressService } from './users/admin-student-progress.service';
import { AdminStudentProfileService } from './users/admin-student-profile.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule, LessonsModule, PlacementModule, BillingModule, CertificateModule, AimModule],
  controllers: [AdminController, AdminDataController, AdminParentsController, AdminRoleAssignmentController, AdminRolesController, AdminUsersController, AdminStudentProgressController, AdminStatsController],
  providers: [AdminService, AdminDataService, AdminParentsService, AdminRoleAssignmentService, AdminUsersService, AdminStudentProgressService, AdminStudentProfileService, AdminProfileService, AdminStatsService],
  exports: [AdminService, AdminDataService, AdminRoleAssignmentService, AdminProfileService],
})
export class AdminModule {}
