import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { LocaleModule } from '../../common/locale/locale.module';
import { AimModule } from '../aim/aim.module';
import { AssessmentsModule } from '../assessments/assessments.module';
import { EngagementModule } from '../engagement/engagement.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LessonsModule } from '../lessons/lessons.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
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
  ],
  controllers: [StudentHomeController],
  providers: [StudentHomeService],
})
export class StudentHomeModule {}
