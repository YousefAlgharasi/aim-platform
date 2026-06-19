/**
 * P9-031: Add Audio Storage Adapter.
 * Types for the backend audio storage abstraction. Only an opaque
 * `storageKey` and operational metadata (content type, byte length)
 * cross this boundary; raw audio bytes are written to/read from
 * backend-managed storage only and never returned to or accepted from
 * the Flutter client directly
 * (docs/phase-9/voice-privacy-policy.md "Raw Audio Handling Rules").
 */

export interface AudioStorageWriteInput {
  readonly studentId: string;
  readonly contentType: string;
  readonly data: Buffer;
}

export interface AudioStorageWriteResult {
  readonly storageKey: string;
  readonly byteLength: number;
}

export interface AudioStorageReadResult {
  readonly data: Buffer;
  readonly contentType: string;
}
