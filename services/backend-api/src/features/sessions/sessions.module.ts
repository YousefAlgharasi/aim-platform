import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { AimModule } from '../aim/aim.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';
import { LessonAttemptService } from './lesson-attempt.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [DatabaseModule, AuthModule, AimModule, AnalyticsModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionEventService, LessonAttemptService],
  exports: [SessionsService, SessionEventService, LessonAttemptService],
})
export class SessionsModule {}
