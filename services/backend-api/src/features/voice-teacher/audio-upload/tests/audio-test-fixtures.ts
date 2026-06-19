// P9-029: Add Audio File Validation.
// Builds small, synthetic, in-memory container buffers for unit tests.
// These are not real recorded audio and are never written to disk; they
// exist only as byte arrays inside the test process to exercise the
// magic-byte sniffer and duration decoder against spec-correct headers.

export function buildWavBuffer(opts: {
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
  durationMs?: number;
}): Buffer {
  const sampleRate = opts.sampleRate ?? 16_000;
  const channels = opts.channels ?? 1;
  const bitsPerSample = opts.bitsPerSample ?? 16;
  const durationMs = opts.durationMs ?? 1000;

  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = Math.round((durationMs / 1000) * byteRate);

  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, Buffer.alloc(dataSize)]);
}

function buildOggPage(opts: {
  granulePosition: bigint;
  payload: Buffer;
  pageSequence: number;
}): Buffer {
  const header = Buffer.alloc(27);
  header.write('OggS', 0, 'ascii');
  header.writeUInt8(0, 4);
  header.writeUInt8(0, 5);
  header.writeBigUInt64LE(opts.granulePosition, 6);
  header.writeUInt32LE(1, 14);
  header.writeUInt32LE(opts.pageSequence, 18);
  header.writeUInt32LE(0, 22);
  header.writeUInt8(1, 26);

  const segmentTable = Buffer.from([Math.min(opts.payload.length, 255)]);

  return Buffer.concat([header, segmentTable, opts.payload]);
}

export function buildOggOpusBuffer(opts: {
  granulePosition?: bigint;
}): Buffer {
  const opusHead = Buffer.alloc(19);
  opusHead.write('OpusHead', 0, 'ascii');

  const firstPage = buildOggPage({
    granulePosition: 0n,
    payload: opusHead,
    pageSequence: 0,
  });

  const secondPage = buildOggPage({
    granulePosition: opts.granulePosition ?? 48_000n,
    payload: Buffer.from([0x00]),
    pageSequence: 1,
  });

  return Buffer.concat([firstPage, secondPage]);
}

function writeVintSize(value: number): Buffer {
  if (value < 0x7f) {
    return Buffer.from([0x80 | value]);
  }
  const buf = Buffer.alloc(2);
  buf.writeUInt8(0x40 | (value >> 8), 0);
  buf.writeUInt8(value & 0xff, 1);
  return buf;
}

function ebmlElement(idBytes: number[], body: Buffer): Buffer {
  const id = Buffer.from(idBytes);
  const size = writeVintSize(body.length);
  return Buffer.concat([id, size, body]);
}

export function buildWebmBuffer(opts: {
  timecodeScale?: number;
  durationTicks?: number;
}): Buffer {
  const ebmlHeader = ebmlElement([0x1a, 0x45, 0xdf, 0xa3], Buffer.alloc(4));

  const timecodeScale = opts.timecodeScale ?? 1_000_000;
  const timecodeScaleBuf = Buffer.alloc(4);
  timecodeScaleBuf.writeUInt32BE(timecodeScale, 0);
  const timecodeScaleElement = ebmlElement([0x2a, 0xd7, 0xb1], timecodeScaleBuf);

  const durationBuf = Buffer.alloc(8);
  durationBuf.writeDoubleBE(opts.durationTicks ?? 5000, 0);
  const durationElement = ebmlElement([0x44, 0x89], durationBuf);

  const infoBody = Buffer.concat([timecodeScaleElement, durationElement]);
  const infoElement = ebmlElement([0x15, 0x49, 0xa9, 0x66], infoBody);

  const segmentBody = infoElement;
  const segmentElement = ebmlElement([0x18, 0x53, 0x80, 0x67], segmentBody);

  return Buffer.concat([ebmlHeader, segmentElement]);
}

export function buildIsoBmffBuffer(opts: {
  timescale?: number;
  duration?: number;
  brand?: string;
}): Buffer {
  const brand = opts.brand ?? 'M4A ';
  const ftypBody = Buffer.alloc(8);
  ftypBody.write(brand, 0, 'ascii');
  ftypBody.writeUInt32BE(0, 4);
  const ftypBox = Buffer.concat([
    lengthPrefixed('ftyp', ftypBody.length),
    ftypBody,
  ]);

  const mvhdBody = Buffer.alloc(96);
  mvhdBody.writeUInt8(0, 0);
  mvhdBody.writeUInt32BE(opts.timescale ?? 1000, 12);
  mvhdBody.writeUInt32BE(opts.duration ?? 5000, 16);

  const mvhdBox = Buffer.concat([
    lengthPrefixed('mvhd', mvhdBody.length),
    mvhdBody,
  ]);

  const moovBox = Buffer.concat([
    lengthPrefixed('moov', mvhdBox.length),
    mvhdBox,
  ]);

  return Buffer.concat([ftypBox, moovBox]);
}

function lengthPrefixed(type: string, bodyLength: number): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + bodyLength, 0);
  header.write(type, 4, 'ascii');
  return header;
}
