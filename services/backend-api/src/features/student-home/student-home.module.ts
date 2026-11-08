import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { LocaleModule } from '../../common/locale/locale.module';
import { AimModule } from '../aim/aim.module';
import { AssessmentsModule } from '../assessments/assessments.module';
import { CourseBillingModule } from '../course-billing/course-billing.module';
import { LevelsModule } from '../curriculum/levels/levels.module';
import { EngagementModule } from '../engagement/engagement.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LessonsModule } from '../lessons/lessons.module';
import { RolesModule } from '../roles/roles.module';
import { StudentChaptersModule } from '../student-chapters/student-chapters.module';
import { StudentLessonsModule } from '../student-lessons/student-lessons.module';
import { UsersModule } from '../users/users.module';
import { StudentCoursePathController } from './student-course-path.controller';
import { StudentCoursePathService } from './student-course-path.service';
import { StudentHomeController } from './student-home.controller';
import { StudentHomeService } from './student-home.service';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    UsersModule,
    LocaleModule,
    AimModule,
    AssessmentsModule,
    EngagementModule,
    EnrollmentModule,
    LessonsModule,
    CourseBillingModule,
    LevelsModule,
    StudentChaptersModule,
    StudentLessonsModule,
  ],
  controllers: [StudentHomeController, StudentCoursePathController],
  providers: [StudentHomeService, StudentCoursePathService],
})
export class StudentHomeModule {}
