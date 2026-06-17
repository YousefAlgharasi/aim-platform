import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { SessionsService } from './sessions.service';
import { SessionEventService } from './session-event.service';

@Module({
  imports: [DatabaseModule],
  providers: [SessionsService, SessionEventService],
  exports: [SessionsService, SessionEventService],
})
export class SessionsModule {}
