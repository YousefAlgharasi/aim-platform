// Phase 2 — P2-032 / P2-033
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { ProfileOwnershipGuard } from '../../auth/authorization/profile-ownership.guard';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [AuthModule, UsersModule, StudentsModule, AdminModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileOwnershipGuard],
  exports: [ProfileService],
})
export class ProfileModule {}
