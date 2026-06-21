/**
 * P9-043: Add STT Confidence Policy.
 * A raw provider confidence score (0..1) below this threshold is treated
 * as a low-confidence transcription failure rather than a usable
 * transcript, per docs/phase-9/stt-confidence-policy.md. The threshold is
 * an internal STT Gateway constant; it is never derived from, or
 * combined with, a mastery/level/weakness/difficulty value.
 */
export const STT_LOW_CONFIDENCE_THRESHOLD = 0.4;

export const STT_LOW_CONFIDENCE_ERROR_CATEGORY = 'STT_LOW_CONFIDENCE';
