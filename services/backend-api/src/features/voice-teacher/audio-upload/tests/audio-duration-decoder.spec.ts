// P9-029: Add Audio File Validation.
// Verifies actual audio duration decoding directly from container
// headers, per docs/phase-9/audio-upload-contract.md step 8. No
// provider, AIM Engine, or network call is involved in any of these
// paths — decoding is pure header parsing on an in-memory buffer.

import { decodeActualAudioDurationMs } from '../audio-duration-decoder';
import {
  buildIsoBmffBuffer,
  buildOggOpusBuffer,
  buildWavBuffer,
  buildWebmBuffer,
} from './audio-test-fixtures';

describe('decodeActualAudioDurationMs', () => {
  it('decodes WAV duration from sample rate and data size', () => {
    const buf = buildWavBuffer({
      sampleRate: 16_000,
      channels: 1,
      bitsPerSample: 16,
      durationMs: 1500,
    });
    expect(decodeActualAudioDurationMs(buf, 'wav')).toBe(1500);
  });

  it('decodes WAV duration for stereo 48kHz audio', () => {
    const buf = buildWavBuffer({
      sampleRate: 48_000,
      channels: 2,
      bitsPerSample: 16,
      durationMs: 2000,
    });
    expect(decodeActualAudioDurationMs(buf, 'wav')).toBe(2000);
  });

  it('returns null for a WAV buffer with no data chunk', () => {
    const buf = Buffer.alloc(20);
    buf.write('RIFF', 0, 'ascii');
    buf.write('WAVE', 8, 'ascii');
    expect(decodeActualAudioDurationMs(buf, 'wav')).toBeNull();
  });

  it('decodes Ogg Opus duration from the granule position', () => {
    const buf = buildOggOpusBuffer({ granulePosition: 48_000n });
    expect(decodeActualAudioDurationMs(buf, 'ogg')).toBe(1000);
  });

  it('decodes Ogg Opus duration for a longer clip', () => {
    const buf = buildOggOpusBuffer({ granulePosition: 144_000n });
    expect(decodeActualAudioDurationMs(buf, 'ogg')).toBe(3000);
  });

  it('returns null for an Ogg buffer with no recognizable codec header', () => {
    const buf = Buffer.alloc(40);
    buf.write('OggS', 0, 'ascii');
    expect(decodeActualAudioDurationMs(buf, 'ogg')).toBeNull();
  });

  it('decodes WebM duration from Segment/Info/Duration', () => {
    const buf = buildWebmBuffer({ timecodeScale: 1_000_000, durationTicks: 2500 });
    expect(decodeActualAudioDurationMs(buf, 'webm')).toBe(2500);
  });

  it('decodes WebM duration with a non-default timecode scale', () => {
    const buf = buildWebmBuffer({ timecodeScale: 1000, durationTicks: 2_500_000 });
    expect(decodeActualAudioDurationMs(buf, 'webm')).toBe(2500);
  });

  it('returns null for a WebM buffer with no Info element', () => {
    const buf = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
    expect(decodeActualAudioDurationMs(buf, 'webm')).toBeNull();
  });

  it('decodes ISO-BMFF (mp4/m4a) duration from mvhd', () => {
    const buf = buildIsoBmffBuffer({ timescale: 1000, duration: 1800 });
    expect(decodeActualAudioDurationMs(buf, 'isobmff')).toBe(1800);
  });

  it('decodes ISO-BMFF duration with a non-1000 timescale', () => {
    const buf = buildIsoBmffBuffer({ timescale: 44_100, duration: 88_200 });
    expect(decodeActualAudioDurationMs(buf, 'isobmff')).toBe(2000);
  });

  it('returns null for an ISO-BMFF buffer with no moov box', () => {
    const buf = Buffer.alloc(16);
    buf.writeUInt32BE(16, 0);
    buf.write('ftyp', 4, 'ascii');
    expect(decodeActualAudioDurationMs(buf, 'isobmff')).toBeNull();
  });
});
