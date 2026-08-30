/**
 * Minimal WAV (RIFF/WAVE, PCM) parsing and concatenation helpers.
 *
 * Needed because Groq's Orpheus TTS endpoint caps each request at ~200
 * input characters and returns a complete, self-contained WAV file per
 * call — a longer AI Teacher reply has to be split into multiple
 * requests and the resulting WAV files stitched back into one audio
 * clip. Naively concatenating raw WAV files is invalid (each one repeats
 * a RIFF/fmt header mid-stream, which most players stop at), so this
 * parses each chunk down to its raw PCM `data` payload and rebuilds a
 * single valid WAV header sized for the combined audio.
 */

export interface WavParts {
  /** Raw `fmt ` chunk payload (not including the 8-byte chunk header). */
  readonly fmt: Buffer;
  /** Raw `data` chunk payload (the actual PCM samples). */
  readonly data: Buffer;
}

export function parseWav(buffer: Buffer): WavParts {
  if (
    buffer.length < 12 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error('Invalid WAV buffer: missing RIFF/WAVE header');
  }

  let offset = 12;
  let fmt: Buffer | null = null;
  let data: Buffer | null = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = Math.min(chunkStart + chunkSize, buffer.length);

    if (chunkId === 'fmt ') {
      fmt = buffer.subarray(chunkStart, chunkEnd);
    } else if (chunkId === 'data') {
      data = buffer.subarray(chunkStart, chunkEnd);
    }

    // Chunks are word-aligned: an odd-sized chunk has one byte of padding.
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!fmt || !data) {
    throw new Error('Invalid WAV buffer: missing fmt or data chunk');
  }

  return { fmt, data };
}

export function buildWav(fmt: Buffer, data: Buffer): Buffer {
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(4 + (8 + fmt.length) + (8 + data.length), 4);
  header.write('WAVE', 8, 'ascii');

  const fmtHeader = Buffer.alloc(8);
  fmtHeader.write('fmt ', 0, 'ascii');
  fmtHeader.writeUInt32LE(fmt.length, 4);

  const dataHeader = Buffer.alloc(8);
  dataHeader.write('data', 0, 'ascii');
  dataHeader.writeUInt32LE(data.length, 4);

  return Buffer.concat([header, fmtHeader, fmt, dataHeader, data]);
}

/** Concatenates one or more same-format WAV buffers into a single valid WAV buffer. */
export function concatWavBuffers(buffers: readonly Buffer[]): Buffer {
  if (buffers.length === 0) {
    throw new Error('concatWavBuffers: no buffers to concatenate');
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  const parts = buffers.map(parseWav);
  const data = Buffer.concat(parts.map((part) => part.data));
  return buildWav(parts[0].fmt, data);
}

/** PCM WAV duration from the `fmt ` chunk's byteRate field; 0 if unparseable. */
export function estimateWavDurationMs(buffer: Buffer): number {
  try {
    const { fmt, data } = parseWav(buffer);
    const byteRate = fmt.readUInt32LE(8);
    return byteRate > 0 ? Math.round((data.length / byteRate) * 1000) : 0;
  } catch {
    return 0;
  }
}
