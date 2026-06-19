// P9-030: Add Audio Duration Policy.
// Verifies the single-source min/max voice message duration rule used
// by both the declared-duration and actual-duration checks in
// AudioUploadService.

import { evaluateAudioDurationPolicy } from '../audio-duration-policy';
import {
  AUDIO_UPLOAD_MAX_DURATION_MS,
  AUDIO_UPLOAD_MIN_DURATION_MS,
} from '../audio-upload.constants';

describe('evaluateAudioDurationPolicy', () => {
  it('accepts the minimum allowed duration', () => {
    const result = evaluateAudioDurationPolicy(AUDIO_UPLOAD_MIN_DURATION_MS);
    expect(result).toEqual({ valid: true, violation: null });
  });

  it('accepts the maximum allowed duration', () => {
    const result = evaluateAudioDurationPolicy(AUDIO_UPLOAD_MAX_DURATION_MS);
    expect(result).toEqual({ valid: true, violation: null });
  });

  it('accepts a typical mid-range duration', () => {
    const result = evaluateAudioDurationPolicy(5000);
    expect(result.valid).toBe(true);
  });

  it('rejects a duration one millisecond below the minimum', () => {
    const result = evaluateAudioDurationPolicy(
      AUDIO_UPLOAD_MIN_DURATION_MS - 1,
    );
    expect(result).toEqual({ valid: false, violation: 'TOO_SHORT' });
  });

  it('rejects a duration one millisecond above the maximum', () => {
    const result = evaluateAudioDurationPolicy(
      AUDIO_UPLOAD_MAX_DURATION_MS + 1,
    );
    expect(result).toEqual({ valid: false, violation: 'TOO_LONG' });
  });

  it('rejects zero duration as too short', () => {
    const result = evaluateAudioDurationPolicy(0);
    expect(result).toEqual({ valid: false, violation: 'TOO_SHORT' });
  });

  it('rejects negative duration as too short', () => {
    const result = evaluateAudioDurationPolicy(-100);
    expect(result).toEqual({ valid: false, violation: 'TOO_SHORT' });
  });

  it('rejects a duration far above the maximum as too long', () => {
    const result = evaluateAudioDurationPolicy(600_000);
    expect(result).toEqual({ valid: false, violation: 'TOO_LONG' });
  });

  it('does not introduce any AIM Engine-owned field in its result', () => {
    const result = evaluateAudioDurationPolicy(5000) as any;
    expect(result.mastery).toBeUndefined();
    expect(result.difficulty).toBeUndefined();
    expect(result.weakness).toBeUndefined();
  });
});
