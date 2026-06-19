/**
 * P9-031: Add Audio Storage Adapter.
 * Binds the `AUDIO_STORAGE_ADAPTER` token to the local-disk
 * implementation. Consumers (the Group D upload-persistence task and
 * the Group G TTS reply-persistence task) import this module and
 * inject `AudioStorageAdapter` via the token — never
 * `LocalAudioStorageAdapter` directly — so a future object-storage
 * adapter can be swapped in here with no caller-side change.
 */
import { Module } from '@nestjs/common';

import { AUDIO_STORAGE_ADAPTER } from './audio-storage.adapter';
import { AudioStorageConfigService } from './audio-storage.config';
import { LocalAudioStorageAdapter } from './local-audio-storage.adapter';

@Module({
  providers: [
    AudioStorageConfigService,
    { provide: AUDIO_STORAGE_ADAPTER, useClass: LocalAudioStorageAdapter },
  ],
  exports: [AUDIO_STORAGE_ADAPTER],
})
export class AudioStorageModule {}
