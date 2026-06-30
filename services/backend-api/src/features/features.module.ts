import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { AchievementsModule } from './achievements/achievements.module';
import { AdminModule } from './admin/admin.module';
import { AiTeacherModule } from './ai-teacher/ai-teacher.module';
import { AimModule } from './aim/aim.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { EngagementModule } from './engagement/engagement.module';
import { LessonsModule } from './lessons/lessons.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationSchedulerModule } from './notifications/notification-scheduler.module';
import { ParentsModule } from './parents/parents.module';
import { PlacementModule } from './placement/placement.module';
import { ProfileModule } from './profile/profile.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SessionsModule } from './sessions/sessions.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { VoiceTeacherModule } from './voice-teacher/voice-teacher.module';
import { BillingModule } from './billing/billing.module';
import { OperationsModule } from './operations/operations.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    NotificationSchedulerModule,
    StudentsModule,
    LessonsModule,
    SessionsModule,
    AimModule,
    AiTeacherModule,
    VoiceTeacherModule,
    AdminModule,
    ParentsModule,
    NotificationsModule,
    ReportsModule,
    ProfileModule,
    CurriculumModule,
    PlacementModule,
    AssessmentsModule,
    BillingModule,
    OperationsModule,
    EngagementModule,
    AchievementsModule,
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
    VoiceTeacherModule,
    AdminModule,
    ParentsModule,
    NotificationsModule,
    ReportsModule,
    ProfileModule,
    CurriculumModule,
    PlacementModule,
    AssessmentsModule,
    BillingModule,
    OperationsModule,
    EngagementModule,
    AchievementsModule,
  ],
})
export class FeaturesModule {}
