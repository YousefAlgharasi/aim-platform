import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';

@Module({
  // UsersModule imported directly — AuthModule imports it internally but
  // does not re-export it, so RoleGuard's UsersService dependency would not
  // otherwise resolve here (same gap fixed previously for other modules).
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
