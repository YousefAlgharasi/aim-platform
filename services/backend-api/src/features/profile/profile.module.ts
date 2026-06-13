// Phase 2 — P2-032
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [AuthModule, UsersModule, StudentsModule, AdminModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
