/**
 * P9-028: Build Audio Upload Service.
 * Constants for backend audio upload validation, matching the constraints
 * defined in docs/phase-9/audio-upload-contract.md exactly.
 */

export const AUDIO_UPLOAD_ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
] as const;

export type AudioUploadMimeType = (typeof AUDIO_UPLOAD_ALLOWED_MIME_TYPES)[number];

export const AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const AUDIO_UPLOAD_MIN_DURATION_MS = 200;

export const AUDIO_UPLOAD_MAX_DURATION_MS = 120_000; // 120 seconds
