export const VOICE_TEACHER_FEATURE_NAME = 'voice-teacher';

export const VOICE_TURN_STATUS = {
  PENDING: 'pending',
  TRANSCRIBED: 'transcribed',
  REPLIED: 'replied',
  SYNTHESIZED: 'synthesized',
  FAILED: 'failed',
} as const;

export type VoiceTurnStatus =
  (typeof VOICE_TURN_STATUS)[keyof typeof VOICE_TURN_STATUS];
