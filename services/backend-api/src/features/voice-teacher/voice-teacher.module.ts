import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { VoiceTeacherService } from './voice-teacher.service';
import { SttTranscriptPersistenceService } from './stt-gateway/stt-transcript-persistence.service';
import { VoiceSessionStartApiModule } from './session-start-api/voice-session-start-api.module';

@Module({
  imports: [ConfigModule, DatabaseModule, VoiceSessionStartApiModule],
  providers: [VoiceTeacherService, SttTranscriptPersistenceService],
  exports: [VoiceTeacherService, SttTranscriptPersistenceService],
})
export class VoiceTeacherModule {}
