/**
 * P9-028: Build Audio Upload Service.
 * P9-032: Persist Audio Metadata — extended AudioUploadResult with assetId.
 * Input/output types for the audio upload service, matching the request
 * shape from docs/phase-9/audio-upload-contract.md. No provider
 * credentials, AIM Engine fields, or raw storage paths cross this boundary.
 */

export interface AudioUploadInput {
  readonly sessionId: string;
  readonly studentId: string;
  readonly audio: Buffer;
  readonly mimeType: string;
  readonly durationMs: number;
}

export interface AudioUploadValidationError {
  readonly statusCode: number;
  readonly error: string;
}

export interface AudioUploadResult {
  readonly messageId: string;
  /**
   * P9-032: Opaque UUID of the voice_audio_assets row created after
   * storage write. Used by the orchestration layer to reference the
   * stored audio without exposing a filesystem path or public URL.
   */
  readonly assetId: string;
  readonly status: 'pending';
}
