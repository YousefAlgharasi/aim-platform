/**
 * P9-049: Build Voice Session Start Service — module wiring.
 * Backed directly by `DatabaseModule`; no separate voice repositories
 * module exists yet, so `VoiceSessionRepository` is provided here.
 */
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { VoiceSessionRepository } from './voice-session.repository';
import { VoiceSessionStartService } from './voice-session-start.service';

@Module({
  imports: [DatabaseModule],
  providers: [VoiceSessionRepository, VoiceSessionStartService],
  exports: [VoiceSessionStartService, VoiceSessionRepository],
})
export class VoiceSessionStartModule {}
