/**
 * P9-028: Build Audio Upload Service.
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
  readonly status: 'pending';
}
