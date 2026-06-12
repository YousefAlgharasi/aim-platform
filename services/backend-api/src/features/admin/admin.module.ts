// Phase 2 — P2-031 (AdminProfileService added)
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { AdminProfileService } from './admin-profile.service';
import { AdminRoleAssignmentController } from './admin-role-assignment.controller';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [AdminRoleAssignmentController],
  providers: [AdminService, AdminRoleAssignmentService, AdminProfileService],
  exports: [AdminService, AdminRoleAssignmentService, AdminProfileService],
})
export class AdminModule {}
