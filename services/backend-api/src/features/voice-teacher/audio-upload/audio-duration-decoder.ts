/**
 * P9-029: Add Audio File Validation.
 * Decodes the actual audio duration directly from container headers,
 * without any external provider call. Implements step 8 of
 * docs/phase-9/audio-upload-contract.md (actual duration decoding).
 * Returns null when the duration cannot be determined from the header
 * data alone, which the caller treats as a validation failure.
 */
import { AudioContainerFamily } from './audio-container.types';

function decodeWavDurationMs(buffer: Buffer): number | null {
  let offset = 12;
  let byteRate: number | null = null;
  let dataSize: number | null = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const bodyStart = offset + 8;

    if (chunkId === 'fmt ' && bodyStart + 16 <= buffer.length) {
      byteRate = buffer.readUInt32LE(bodyStart + 8);
    }

    if (chunkId === 'data') {
      dataSize = chunkSize;
    }

    offset = bodyStart + chunkSize + (chunkSize % 2);
  }

  if (!byteRate || byteRate <= 0 || dataSize == null) {
    return null;
  }

  return Math.round((dataSize / byteRate) * 1000);
}

function decodeOggDurationMs(buffer: Buffer): number | null {
  const pages: { granulePosition: bigint; payloadStart: number; payloadEnd: number }[] = [];
  let offset = 0;

  while (offset + 27 <= buffer.length) {
    if (buffer.subarray(offset, offset + 4).toString('ascii') !== 'OggS') {
      break;
    }

    const granulePosition = buffer.readBigUInt64LE(offset + 6);
    const segmentCount = buffer.readUInt8(offset + 26);
    const segmentTableStart = offset + 27;

    if (segmentTableStart + segmentCount > buffer.length) {
      break;
    }

    let payloadSize = 0;
    for (let i = 0; i < segmentCount; i += 1) {
      payloadSize += buffer.readUInt8(segmentTableStart + i);
    }

    const payloadStart = segmentTableStart + segmentCount;
    const payloadEnd = payloadStart + payloadSize;

    pages.push({ granulePosition, payloadStart, payloadEnd });
    offset = payloadEnd;
  }

  if (pages.length === 0) {
    return null;
  }

  const firstPayload = buffer.subarray(
    pages[0].payloadStart,
    pages[0].payloadEnd,
  );

  let clockRate: number | null = null;

  if (
    firstPayload.length >= 19 &&
    firstPayload.subarray(0, 8).toString('ascii') === 'OpusHead'
  ) {
    clockRate = 48_000;
  } else if (
    firstPayload.length >= 30 &&
    firstPayload.subarray(1, 7).toString('ascii') === 'vorbis'
  ) {
    clockRate = firstPayload.readUInt32LE(12);
  }

  if (!clockRate || clockRate <= 0) {
    return null;
  }

  let lastGranulePosition = 0n;
  const UNSET_GRANULE_POSITION = 0xffffffffffffffffn;
  for (let i = pages.length - 1; i >= 0; i -= 1) {
    if (pages[i].granulePosition !== UNSET_GRANULE_POSITION) {
      lastGranulePosition = pages[i].granulePosition;
      break;
    }
  }

  if (lastGranulePosition <= 0n) {
    return null;
  }

  return Math.round((Number(lastGranulePosition) / clockRate) * 1000);
}

function readVint(
  buffer: Buffer,
  offset: number,
): { value: number; length: number } | null {
  if (offset >= buffer.length) {
    return null;
  }

  const firstByte = buffer.readUInt8(offset);
  let mask = 0x80;
  let length = 1;

  while (length <= 8 && !(firstByte & mask)) {
    mask >>= 1;
    length += 1;
  }

  if (length > 8 || offset + length > buffer.length) {
    return null;
  }

  let value = firstByte & (mask - 1);
  for (let i = 1; i < length; i += 1) {
    value = value * 256 + buffer.readUInt8(offset + i);
  }

  return { value, length };
}

function readEbmlId(
  buffer: Buffer,
  offset: number,
): { id: number; length: number } | null {
  if (offset >= buffer.length) {
    return null;
  }

  const firstByte = buffer.readUInt8(offset);
  let mask = 0x80;
  let length = 1;

  while (length <= 4 && !(firstByte & mask)) {
    mask >>= 1;
    length += 1;
  }

  if (length > 4 || offset + length > buffer.length) {
    return null;
  }

  let id = 0;
  for (let i = 0; i < length; i += 1) {
    id = id * 256 + buffer.readUInt8(offset + i);
  }

  return { id, length };
}

const EBML_ID_SEGMENT = 0x18538067;
const EBML_ID_INFO = 0x1549a966;
const EBML_ID_TIMECODE_SCALE = 0x2ad7b1;
const EBML_ID_DURATION = 0x4489;

function findChildElement(
  buffer: Buffer,
  rangeStart: number,
  rangeEnd: number,
  targetId: number,
): { bodyStart: number; bodyEnd: number } | null {
  let offset = rangeStart;

  while (offset < rangeEnd) {
    const idResult = readEbmlId(buffer, offset);
    if (!idResult) {
      return null;
    }

    const sizeOffset = offset + idResult.length;
    const sizeResult = readVint(buffer, sizeOffset);
    if (!sizeResult) {
      return null;
    }

    const bodyStart = sizeOffset + sizeResult.length;
    const bodyEnd = bodyStart + sizeResult.value;

    if (idResult.id === targetId) {
      return { bodyStart, bodyEnd: Math.min(bodyEnd, rangeEnd) };
    }

    offset = bodyEnd;
  }

  return null;
}

function decodeWebmDurationMs(buffer: Buffer): number | null {
  const segment = findChildElement(buffer, 0, buffer.length, EBML_ID_SEGMENT);
  if (!segment) {
    return null;
  }

  const info = findChildElement(
    buffer,
    segment.bodyStart,
    segment.bodyEnd,
    EBML_ID_INFO,
  );
  if (!info) {
    return null;
  }

  const timecodeScaleElement = findChildElement(
    buffer,
    info.bodyStart,
    info.bodyEnd,
    EBML_ID_TIMECODE_SCALE,
  );
  let timecodeScale = 1_000_000;
  if (timecodeScaleElement) {
    const length = timecodeScaleElement.bodyEnd - timecodeScaleElement.bodyStart;
    if (length > 0 && length <= 8) {
      let value = 0;
      for (let i = 0; i < length; i += 1) {
        value = value * 256 + buffer.readUInt8(timecodeScaleElement.bodyStart + i);
      }
      timecodeScale = value;
    }
  }

  const durationElement = findChildElement(
    buffer,
    info.bodyStart,
    info.bodyEnd,
    EBML_ID_DURATION,
  );
  if (!durationElement) {
    return null;
  }

  const length = durationElement.bodyEnd - durationElement.bodyStart;
  let durationValue: number;
  if (length === 4) {
    durationValue = buffer.readFloatBE(durationElement.bodyStart);
  } else if (length === 8) {
    durationValue = buffer.readDoubleBE(durationElement.bodyStart);
  } else {
    return null;
  }

  if (!Number.isFinite(durationValue) || durationValue <= 0) {
    return null;
  }

  return Math.round((durationValue * timecodeScale) / 1_000_000);
}

function decodeIsoBmffDurationMs(buffer: Buffer): number | null {
  let offset = 0;

  while (offset + 8 <= buffer.length) {
    const boxSize = buffer.readUInt32BE(offset);
    const boxType = buffer.subarray(offset + 4, offset + 8).toString('ascii');

    if (boxSize < 8) {
      return null;
    }

    if (boxType === 'moov') {
      return decodeMvhd(buffer, offset + 8, Math.min(offset + boxSize, buffer.length));
    }

    offset += boxSize;
  }

  return null;
}

function decodeMvhd(
  buffer: Buffer,
  rangeStart: number,
  rangeEnd: number,
): number | null {
  let offset = rangeStart;

  while (offset + 8 <= rangeEnd) {
    const boxSize = buffer.readUInt32BE(offset);
    const boxType = buffer.subarray(offset + 4, offset + 8).toString('ascii');

    if (boxSize < 8) {
      return null;
    }

    if (boxType === 'mvhd') {
      const version = buffer.readUInt8(offset + 8);
      if (version === 1) {
        const timescale = buffer.readUInt32BE(offset + 8 + 4 + 8 + 8);
        const duration = buffer.readBigUInt64BE(offset + 8 + 4 + 8 + 8 + 4);
        if (!timescale) {
          return null;
        }
        return Math.round((Number(duration) / timescale) * 1000);
      }

      const timescale = buffer.readUInt32BE(offset + 8 + 4 + 4 + 4);
      const duration = buffer.readUInt32BE(offset + 8 + 4 + 4 + 4 + 4);
      if (!timescale) {
        return null;
      }
      return Math.round((duration / timescale) * 1000);
    }

    offset += boxSize;
  }

  return null;
}

export function decodeActualAudioDurationMs(
  buffer: Buffer,
  family: AudioContainerFamily,
): number | null {
  switch (family) {
    case 'wav':
      return decodeWavDurationMs(buffer);
    case 'ogg':
      return decodeOggDurationMs(buffer);
    case 'webm':
      return decodeWebmDurationMs(buffer);
    case 'isobmff':
      return decodeIsoBmffDurationMs(buffer);
    default:
      return null;
  }
}
