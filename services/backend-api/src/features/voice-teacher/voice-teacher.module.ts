import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VoiceTeacherService } from './voice-teacher.service';

@Module({
  imports: [ConfigModule],
  providers: [VoiceTeacherService],
  exports: [VoiceTeacherService],
})
export class VoiceTeacherModule {}
