import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AimModule } from '../aim/aim.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LessonsModule } from '../lessons/lessons.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';
import { LessonAttemptService } from './lesson-attempt.service';
import { SessionQuestionsService } from './session-questions.service';
import { AimAttemptBridgeService } from './aim-attempt-bridge.service';
import { SessionsController } from './sessions.controller';

@Module({
  // Bugfix: UsersModule must be imported directly — AuthModule imports it
  // internally but does not re-export it, so ResolveInternalUserIdGuard's
  // UsersService dependency (needed by POST /sessions/start) would not
  // otherwise resolve here (same gap fixed previously for the voice-teacher
  // module).
  imports: [DatabaseModule, AuthModule, UsersModule, AimModule, AnalyticsModule, LessonsModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionEventService,
    LessonAttemptService,
    SessionQuestionsService,
    AimAttemptBridgeService,
  ],
  exports: [
    SessionsService,
    SessionEventService,
    LessonAttemptService,
    SessionQuestionsService,
    // Exported so AssessmentsModule/PlacementModule can feed their own
    // graded question answers into the same AIM pipeline session attempts
    // already trigger (see aim-attempt-bridge.service.ts).
    AimAttemptBridgeService,
  ],
})
export class SessionsModule {}
