import { Module } from '@nestjs/common';

import { LocaleModule } from '../../common/locale/locale.module';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { CourseBillingModule } from '../course-billing/course-billing.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { StudentCoursesController } from './student-courses.controller';
import { StudentCoursesRepository } from './student-courses.repository';
import { StudentCoursesService } from './student-courses.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, CourseBillingModule, LocaleModule],
  controllers: [StudentCoursesController],
  providers: [StudentCoursesRepository, StudentCoursesService],
  exports: [StudentCoursesService],
})
export class StudentCoursesModule {}
