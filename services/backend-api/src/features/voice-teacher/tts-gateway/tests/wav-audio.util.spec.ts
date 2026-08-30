import { buildWav, concatWavBuffers, estimateWavDurationMs, parseWav } from '../wav-audio.util';

describe('wav-audio.util', () => {
  const testFmt = Buffer.from([
    0x01, 0x00, // audioFormat = PCM
    0x01, 0x00, // numChannels = 1
    0x44, 0xac, 0x00, 0x00, // sampleRate = 44100
    0x88, 0x58, 0x01, 0x00, // byteRate = 88200
    0x02, 0x00, // blockAlign
    0x10, 0x00, // bitsPerSample = 16
  ]);

  describe('buildWav + parseWav', () => {
    it('round-trips fmt and data through a built WAV buffer', () => {
      const data = Buffer.from([1, 2, 3, 4, 5]);
      const wav = buildWav(testFmt, data);

      expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
      expect(wav.toString('ascii', 8, 12)).toBe('WAVE');

      const parsed = parseWav(wav);
      expect(parsed.fmt).toEqual(testFmt);
      expect(parsed.data).toEqual(data);
    });

    it('throws on a buffer missing the RIFF/WAVE header', () => {
      expect(() => parseWav(Buffer.from('not a wav file'))).toThrow();
    });
  });

  describe('concatWavBuffers', () => {
    it('returns the single buffer unchanged when given only one', () => {
      const wav = buildWav(testFmt, Buffer.from([1, 2, 3]));
      expect(concatWavBuffers([wav])).toBe(wav);
    });

    it('concatenates PCM data from multiple same-format WAV buffers into one valid WAV', () => {
      const wavA = buildWav(testFmt, Buffer.from([1, 2, 3]));
      const wavB = buildWav(testFmt, Buffer.from([4, 5]));

      const combined = concatWavBuffers([wavA, wavB]);
      const parsed = parseWav(combined);

      expect(parsed.fmt).toEqual(testFmt);
      expect(parsed.data).toEqual(Buffer.from([1, 2, 3, 4, 5]));
    });

    it('throws when given no buffers', () => {
      expect(() => concatWavBuffers([])).toThrow();
    });
  });

  describe('estimateWavDurationMs', () => {
    it('computes duration from byteRate and data length', () => {
      // byteRate = 88200 bytes/sec; 88200 bytes of data -> 1000ms.
      const wav = buildWav(testFmt, Buffer.alloc(88_200));
      expect(estimateWavDurationMs(wav)).toBe(1000);
    });

    it('returns 0 for an unparseable buffer instead of throwing', () => {
      expect(estimateWavDurationMs(Buffer.from('garbage'))).toBe(0);
    });
  });
});
