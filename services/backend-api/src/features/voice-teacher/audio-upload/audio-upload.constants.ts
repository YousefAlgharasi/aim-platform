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

/**
 * P9-029: Add Audio File Validation.
 * Maps each declared MIME type to the on-disk container family it must
 * actually be, per docs/phase-9/audio-upload-contract.md step 6 (actual
 * MIME type sniffing). audio/mp4 and audio/x-m4a both resolve to the
 * ISO base media file format container and are not distinguishable from
 * magic bytes alone; both are accepted against an isobmff container.
 */
export const AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY: Record<
  AudioUploadMimeType,
  'wav' | 'ogg' | 'webm' | 'isobmff'
> = {
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/mp4': 'isobmff',
  'audio/x-m4a': 'isobmff',
};
