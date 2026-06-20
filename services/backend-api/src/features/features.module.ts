import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AiTeacherModule } from './ai-teacher/ai-teacher.module';
import { AimModule } from './aim/aim.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { LessonsModule } from './lessons/lessons.module';
import { ParentsModule } from './parents/parents.module';
import { PlacementModule } from './placement/placement.module';
import { ProfileModule } from './profile/profile.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SessionsModule } from './sessions/sessions.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    StudentsModule,
    LessonsModule,
    SessionsModule,
    AimModule,
    AiTeacherModule,
    AdminModule,
    ParentsModule,
    ReportsModule,
    ProfileModule,
    CurriculumModule,
    PlacementModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    RolesModule,
    StudentsModule,
    LessonsModule,
    SessionsModule,
    AimModule,
    AiTeacherModule,
    AdminModule,
    ParentsModule,
    ReportsModule,
    ProfileModule,
    CurriculumModule,
    PlacementModule,
  ],
})
export class FeaturesModule {}
