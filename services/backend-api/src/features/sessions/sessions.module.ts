import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';
import { LessonAttemptService } from './lesson-attempt.service';

@Module({
  imports: [DatabaseModule],
  providers: [SessionsService, SessionEventService, LessonAttemptService],
  exports: [SessionsService, SessionEventService, LessonAttemptService],
})
export class SessionsModule {}
