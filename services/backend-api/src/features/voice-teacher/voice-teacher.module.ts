import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { VoiceTeacherService } from './voice-teacher.service';
import { SttTranscriptPersistenceService } from './stt-gateway/stt-transcript-persistence.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [VoiceTeacherService, SttTranscriptPersistenceService],
  exports: [VoiceTeacherService, SttTranscriptPersistenceService],
})
export class VoiceTeacherModule {}
