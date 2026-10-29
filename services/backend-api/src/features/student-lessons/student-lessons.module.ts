import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { CourseBillingModule } from '../course-billing/course-billing.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { StudentLessonsController } from './student-lessons.controller';
import { StudentLessonsRepository } from './student-lessons.repository';
import { StudentLessonsService } from './student-lessons.service';

@Module({
  imports: [CourseBillingModule, DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [StudentLessonsController],
  providers: [StudentLessonsRepository, StudentLessonsService],
  exports: [StudentLessonsService],
})
export class StudentLessonsModule {}
