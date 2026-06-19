/**
 * P9-056: Add Voice Fallback to Text Policy — module.
 * Exports `VoiceFallbackToTextPolicyService` for use by the voice
 * orchestration pipeline once the TTS Gateway (a later task) exists.
 * Not yet wired into the top-level `VoiceTeacherModule` since no
 * controller/API route exists to invoke it directly — that integration
 * is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { VoiceFallbackToTextPolicyService } from './voice-fallback-to-text-policy.service';

@Module({
  providers: [VoiceFallbackToTextPolicyService],
  exports: [VoiceFallbackToTextPolicyService],
})
export class VoiceFallbackToTextPolicyModule {}
