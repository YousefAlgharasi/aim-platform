/**
 * P9-056: Add Voice Fallback to Text Policy (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Decides how a single voice
 * turn is delivered to the student when the TTS step did not produce
 * usable audio, per the "TTS provider failure" category of
 * `docs/phase-9/voice-error-policy.md`.
 *
 * Design constraints:
 * - This service computes no mastery/level/weakness/difficulty/
 *   recommendation/review-schedule value
 *   (docs/phase-9/no-aim-authority-change-rule.md).
 * - Never returns a broken/placeholder `audioRef`; a turn either gets a
 *   valid `audioRef` or none at all (`docs/phase-9/tts-output-contract.md`'s
 *   Failure Contract).
 * - Performs no TTS provider call itself and reads no TTS provider
 *   credential — it only interprets the outcome already produced by the
 *   TTS Gateway (a later task).
 * - Never drops the safety-filtered reply text; a student never loses a
 *   safe reply just because audio synthesis failed.
 */
import { Injectable } from '@nestjs/common';

import { ResolveVoiceTurnOutputInput, VoiceTurnOutput } from './voice-fallback-to-text-policy.types';

@Injectable()
export class VoiceFallbackToTextPolicyService {
  /**
   * Resolve the safe client-facing delivery for a single voice turn.
   * Falls back to text-only delivery (no `audioRef`) whenever TTS did
   * not succeed or did not produce a usable audio reference.
   */
  resolveTurnOutput(input: ResolveVoiceTurnOutputInput): VoiceTurnOutput {
    const replyText = input.replyText?.trim();

    if (!replyText) {
      throw new Error('Cannot resolve voice turn output: replyText is missing.');
    }

    const audioRef = input.audioRef?.trim();
    const hasUsableAudio = input.ttsSucceeded && !!audioRef;

    if (hasUsableAudio) {
      return {
        text: replyText,
        audioRef: audioRef as string,
        isFallbackToText: false,
      };
    }

    return {
      text: replyText,
      audioRef: null,
      isFallbackToText: true,
    };
  }
}
