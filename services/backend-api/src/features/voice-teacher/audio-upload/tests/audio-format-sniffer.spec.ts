// P9-029: Add Audio File Validation.
// Verifies actual container detection from magic bytes, independent of
// any client-declared MIME type, per
// docs/phase-9/audio-upload-contract.md step 6.

import { detectAudioContainerFamily } from '../audio-format-sniffer';
import {
  buildIsoBmffBuffer,
  buildOggOpusBuffer,
  buildWavBuffer,
  buildWebmBuffer,
} from './audio-test-fixtures';

describe('detectAudioContainerFamily', () => {
  it('detects a valid WAV buffer', () => {
    expect(detectAudioContainerFamily(buildWavBuffer({}))).toBe('wav');
  });

  it('detects a valid Ogg buffer', () => {
    expect(detectAudioContainerFamily(buildOggOpusBuffer({}))).toBe('ogg');
  });

  it('detects a valid WebM/EBML buffer', () => {
    expect(detectAudioContainerFamily(buildWebmBuffer({}))).toBe('webm');
  });

  it('detects a valid ISO-BMFF (mp4/m4a) buffer', () => {
    expect(detectAudioContainerFamily(buildIsoBmffBuffer({}))).toBe(
      'isobmff',
    );
  });

  it('returns null for an empty buffer', () => {
    expect(detectAudioContainerFamily(Buffer.alloc(0))).toBeNull();
  });

  it('returns null for random bytes that match no known container', () => {
    expect(
      detectAudioContainerFamily(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04])),
    ).toBeNull();
  });

  it('returns null for a RIFF buffer that is not WAVE (e.g. AVI)', () => {
    const buf = Buffer.alloc(12);
    buf.write('RIFF', 0, 'ascii');
    buf.write('AVI ', 8, 'ascii');
    expect(detectAudioContainerFamily(buf)).toBeNull();
  });

  it('does not misdetect a WebM buffer as ISO-BMFF', () => {
    expect(detectAudioContainerFamily(buildWebmBuffer({}))).not.toBe(
      'isobmff',
    );
  });
});
