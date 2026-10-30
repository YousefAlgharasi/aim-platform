import { estimateMp3DurationMs, looksLikeMp3, parseMp3FrameHeader, scanMp3 } from '../mp3-audio.util';
import { makeMp3, makeWav } from './fakes';

describe('mp3-audio.util', () => {
  it('parses an MPEG-2 Layer III 48 kbps 24 kHz mono frame header', () => {
    expect(parseMp3FrameHeader(makeMp3(), 0)).toEqual({
      sampleRate: 24000,
      bitrateKbps: 48,
      samplesPerFrame: 576,
      frameLength: 144,
      channels: 1,
    });
  });

  it('accepts a complete frame chain and computes its duration', () => {
    const mp3 = makeMp3(1, 50);
    expect(looksLikeMp3(mp3)).toBe(true);
    expect(scanMp3(mp3)).toEqual({ frames: 50, samples: 50 * 576, sampleRate: 24000 });
    expect(estimateMp3DurationMs(mp3)).toBe(1200);
  });

  it('skips a leading ID3v2 tag', () => {
    // 'ID3', version 4.0, flags 0, syncsafe size 10, then 10 tag bytes.
    const tag = Buffer.concat([Buffer.from('ID3'), Buffer.from([4, 0, 0, 0, 0, 0, 10]), Buffer.alloc(10)]);
    expect(looksLikeMp3(Buffer.concat([tag, makeMp3()]))).toBe(true);
  });

  it('rejects truncated, padded, empty, WAV and random data', () => {
    const mp3 = makeMp3();
    expect(looksLikeMp3(mp3.subarray(0, mp3.length - 10))).toBe(false);
    expect(looksLikeMp3(Buffer.concat([mp3, Buffer.from('trailing')]))).toBe(false);
    expect(looksLikeMp3(Buffer.alloc(0))).toBe(false);
    expect(looksLikeMp3(makeWav())).toBe(false);
    expect(looksLikeMp3(Buffer.from('ffff not audio'))).toBe(false);
    expect(estimateMp3DurationMs(makeWav())).toBe(0);
  });

  it('rejects a single frame and frames whose sample rate changes mid-stream', () => {
    expect(looksLikeMp3(makeMp3(1, 1))).toBe(false);
    const other = makeMp3(1, 1);
    other[2] = 0x60; // 22.05 kHz
    expect(looksLikeMp3(Buffer.concat([makeMp3(1, 2), other]))).toBe(false);
  });
});
