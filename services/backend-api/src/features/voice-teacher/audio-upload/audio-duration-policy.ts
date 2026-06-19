/**
 * P9-030: Add Audio Duration Policy.
 * Single source of truth for voice message min/max duration rules.
 * Both the declared duration check (contract step 7) and the actual
 * decoded duration check (contract step 8, from P9-029) evaluate
 * against this policy so the limits cannot drift apart. This module
 * never calls an STT/TTS/AI provider and never reads or writes any
 * AIM Engine-owned field.
 */
import {
  AUDIO_UPLOAD_MAX_DURATION_MS,
  AUDIO_UPLOAD_MIN_DURATION_MS,
} from './audio-upload.constants';

export type AudioDurationPolicyViolation = 'TOO_SHORT' | 'TOO_LONG';

export interface AudioDurationPolicyResult {
  readonly valid: boolean;
  readonly violation: AudioDurationPolicyViolation | null;
}

export function evaluateAudioDurationPolicy(
  durationMs: number,
): AudioDurationPolicyResult {
  if (durationMs < AUDIO_UPLOAD_MIN_DURATION_MS) {
    return { valid: false, violation: 'TOO_SHORT' };
  }

  if (durationMs > AUDIO_UPLOAD_MAX_DURATION_MS) {
    return { valid: false, violation: 'TOO_LONG' };
  }

  return { valid: true, violation: null };
}
