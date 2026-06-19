/**
 * P9-029: Add Audio File Validation.
 * Container-family types shared by the magic-byte sniffer and the
 * actual-duration decoder. A "container family" is the on-disk binary
 * structure of an audio file, independent of the declared MIME type
 * string a client sends.
 */

export type AudioContainerFamily = 'wav' | 'ogg' | 'webm' | 'isobmff';

export interface AudioContainerDetectionResult {
  readonly family: AudioContainerFamily | null;
}

export interface AudioDurationDecodeResult {
  readonly durationMs: number | null;
}
