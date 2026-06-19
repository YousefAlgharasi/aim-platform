/**
 * P9-033: Add Audio Cleanup Policy.
 * Wires AudioCleanupPolicyService and AudioCleanupService together with
 * their dependencies: AudioStorageModule (for AUDIO_STORAGE_ADAPTER),
 * DatabaseModule (for DatabaseService), and no STT/TTS/AI provider.
 *
 * Import this module wherever cleanup needs to be triggered —
 * a scheduled job module or the voice session-end module.
 */
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { AudioStorageModule } from '../audio-storage/audio-storage.module';
import { AudioCleanupPolicyService } from './audio-cleanup-policy.service';
import { AudioCleanupService } from './audio-cleanup.service';

@Module({
  imports: [DatabaseModule, AudioStorageModule],
  providers: [AudioCleanupPolicyService, AudioCleanupService],
  exports: [AudioCleanupService],
})
export class AudioCleanupModule {}
