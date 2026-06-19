/**
 * P9-034: Add Audio Upload Safe Failure Handling — constants.
 * Fixed, student-facing fallback messages used when audio upload fails
 * due to unexpected errors (storage write failure, database error, etc.),
 * per the upload failure category in docs/phase-9/voice-error-policy.md.
 * No internal error text, stack trace, or storage path is ever shown.
 */

export const AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE =
  "Couldn't upload the recording, please try again.";

export const AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE_AR =
  'لم نتمكن من رفع التسجيل، يرجى المحاولة مرة أخرى.';
