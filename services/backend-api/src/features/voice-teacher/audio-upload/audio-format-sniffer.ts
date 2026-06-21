/**
 * P9-029: Add Audio File Validation.
 * Detects the actual binary container family of an uploaded audio file
 * from its magic bytes, independent of the client-declared MIME type.
 * Implements step 6 of docs/phase-9/audio-upload-contract.md (actual
 * MIME type sniffing). No STT/TTS/AI provider, no AIM Engine field, and
 * no decoded media content is touched here — only container headers.
 */
import { AudioContainerFamily } from './audio-container.types';

const RIFF_TAG = Buffer.from('RIFF', 'ascii');
const WAVE_TAG = Buffer.from('WAVE', 'ascii');
const OGG_TAG = Buffer.from('OggS', 'ascii');
const FTYP_TAG = Buffer.from('ftyp', 'ascii');
const EBML_HEADER = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

function isWav(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }
  return (
    buffer.subarray(0, 4).equals(RIFF_TAG) &&
    buffer.subarray(8, 12).equals(WAVE_TAG)
  );
}

function isOgg(buffer: Buffer): boolean {
  if (buffer.length < 4) {
    return false;
  }
  return buffer.subarray(0, 4).equals(OGG_TAG);
}

function isWebm(buffer: Buffer): boolean {
  if (buffer.length < 4) {
    return false;
  }
  return buffer.subarray(0, 4).equals(EBML_HEADER);
}

function isIsoBmff(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }
  return buffer.subarray(4, 8).equals(FTYP_TAG);
}

export function detectAudioContainerFamily(
  buffer: Buffer,
): AudioContainerFamily | null {
  if (isWav(buffer)) {
    return 'wav';
  }
  if (isOgg(buffer)) {
    return 'ogg';
  }
  if (isWebm(buffer)) {
    return 'webm';
  }
  if (isIsoBmff(buffer)) {
    return 'isobmff';
  }
  return null;
}
