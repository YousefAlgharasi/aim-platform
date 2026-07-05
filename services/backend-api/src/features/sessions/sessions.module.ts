import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { AimModule } from '../aim/aim.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LessonsModule } from '../lessons/lessons.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';
import { LessonAttemptService } from './lesson-attempt.service';
import { SessionQuestionsService } from './session-questions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [DatabaseModule, AuthModule, AimModule, AnalyticsModule, LessonsModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionEventService,
    LessonAttemptService,
    SessionQuestionsService,
  ],
  exports: [
    SessionsService,
    SessionEventService,
    LessonAttemptService,
    SessionQuestionsService,
  ],
})
export class SessionsModule {}
