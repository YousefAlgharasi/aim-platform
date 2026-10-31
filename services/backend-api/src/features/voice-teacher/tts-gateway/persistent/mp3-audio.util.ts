// Minimal MPEG audio (MP3) frame parsing: just enough to tell a real MP3 stream from damaged or
// unrelated bytes, and to estimate its duration. No decoding.

/** kbps by [MPEG-1 ? 0 : 1][bitrate index], Layer III only. */
const LAYER3_BITRATES = [
  [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
] as const;

/** Hz by MPEG version bits (00 = 2.5, 10 = 2, 11 = 1) and sample-rate index. */
const SAMPLE_RATES: Record<number, readonly number[]> = {
  0b00: [11025, 12000, 8000],
  0b10: [22050, 24000, 16000],
  0b11: [44100, 48000, 32000],
};

export interface Mp3FrameHeader {
  readonly sampleRate: number;
  readonly bitrateKbps: number;
  readonly samplesPerFrame: number;
  readonly frameLength: number;
  readonly channels: 1 | 2;
}

/** Parses a Layer III frame header at `offset`, or returns null when the bytes are not one. */
export function parseMp3FrameHeader(data: Buffer, offset: number): Mp3FrameHeader | null {
  if (offset + 4 > data.length) return null;
  const b1 = data[offset + 1];
  const b2 = data[offset + 2];
  if (data[offset] !== 0xff || (b1 & 0xe0) !== 0xe0) return null;

  const versionBits = (b1 >> 3) & 0b11;
  const layerBits = (b1 >> 1) & 0b11;
  if (versionBits === 0b01 || layerBits !== 0b01) return null; // reserved version, or not Layer III

  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0b11;
  if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return null;

  const isMpeg1 = versionBits === 0b11;
  const bitrateKbps = LAYER3_BITRATES[isMpeg1 ? 0 : 1][bitrateIndex];
  const sampleRate = SAMPLE_RATES[versionBits][sampleRateIndex];
  const padding = (b2 >> 1) & 1;
  const samplesPerFrame = isMpeg1 ? 1152 : 576;
  const frameLength = Math.floor(((samplesPerFrame / 8) * bitrateKbps * 1000) / sampleRate) + padding;
  const channels = ((data[offset + 3] >> 6) & 0b11) === 0b11 ? 1 : 2;

  return { sampleRate, bitrateKbps, samplesPerFrame, frameLength, channels };
}

/** Offset of the first audio frame: skips an ID3v2 tag when present. */
function firstFrameOffset(data: Buffer): number {
  if (data.length >= 10 && data.toString('latin1', 0, 3) === 'ID3') {
    const size = ((data[6] & 0x7f) << 21) | ((data[7] & 0x7f) << 14) | ((data[8] & 0x7f) << 7) | (data[9] & 0x7f);
    return 10 + size;
  }
  return 0;
}

/**
 * Walks the frame chain. Returns the frame count and total samples when the whole buffer is a
 * consistent MP3 stream (every frame header valid and the last frame ends exactly at the end of the
 * buffer, so truncation is caught); null otherwise.
 */
export function scanMp3(data: Buffer): { frames: number; samples: number; sampleRate: number } | null {
  let offset = firstFrameOffset(data);
  let frames = 0;
  let samples = 0;
  let sampleRate = 0;

  while (offset < data.length) {
    const header = parseMp3FrameHeader(data, offset);
    if (!header || header.frameLength < 4) return null;
    if (sampleRate !== 0 && header.sampleRate !== sampleRate) return null;
    sampleRate = header.sampleRate;
    offset += header.frameLength;
    if (offset > data.length) return null;
    frames += 1;
    samples += header.samplesPerFrame;
  }

  return frames >= 2 ? { frames, samples, sampleRate } : null;
}

export function looksLikeMp3(data: Buffer): boolean {
  return scanMp3(data) !== null;
}

/** Duration from the frame chain; 0 when the data is not a valid MP3 stream. */
export function estimateMp3DurationMs(data: Buffer): number {
  const scan = scanMp3(data);
  return scan ? Math.round((scan.samples / scan.sampleRate) * 1000) : 0;
}
