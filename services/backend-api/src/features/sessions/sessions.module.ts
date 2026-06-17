import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';
import { LessonAttemptService } from './lesson-attempt.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionEventService, LessonAttemptService],
  exports: [SessionsService, SessionEventService, LessonAttemptService],
})
export class SessionsModule {}
