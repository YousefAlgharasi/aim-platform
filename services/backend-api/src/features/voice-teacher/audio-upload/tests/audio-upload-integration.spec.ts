/**
 * P9-035: Add Audio Upload Tests.
 * Integration-level tests covering upload edge cases, constant
 * validation, and safe failure behavior across the audio upload
 * pipeline. Complements per-module unit tests (P9-028 through P9-034).
 */
import { AudioUploadService } from '../audio-upload.service';
import {
  AUDIO_UPLOAD_ALLOWED_MIME_TYPES,
  AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES,
  AUDIO_UPLOAD_MAX_DURATION_MS,
  AUDIO_UPLOAD_MIN_DURATION_MS,
  AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY,
} from '../audio-upload.constants';
import { buildWavBuffer, buildWebmBuffer } from './audio-test-fixtures';

const activeSession = {
  id: 'session-1',
  student_id: 'student-1',
  status: 'active',
};

// P21-021b: AudioUploadService's first two dependencies are now
// AiChatSessionRepository and AiChatMessageRepository (not the legacy
// VoiceSessionRepository/VoiceMessageRepository) — renamed here for
// accuracy, same mock shapes since both repos' findById()/create() rows
// expose the same fields this service reads (student_id/status; an id).
function buildService(overrides?: {
  findById?: jest.Mock;
  create?: jest.Mock;
  persist?: jest.Mock;
}) {
  const chatSessionRepo = {
    findById: overrides?.findById ?? jest.fn().mockResolvedValue(activeSession),
  } as any;
  const chatMessageRepo = {
    create:
      overrides?.create ??
      jest.fn().mockResolvedValue({ id: 'message-1' }),
  } as any;
  const audioMetadataPersistence = {
    persist:
      overrides?.persist ??
      jest.fn().mockResolvedValue({ assetId: 'asset-1', storageKey: 'key-1' }),
  } as any;
  return new AudioUploadService(chatSessionRepo, chatMessageRepo, audioMetadataPersistence);
}

describe('AudioUploadService — edge cases (P9-035)', () => {
  it('rejects when audio buffer is empty', async () => {
    const service = buildService();
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio: Buffer.alloc(0),
      mimeType: 'audio/wav',
      durationMs: 1000,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects when mimeType is empty string', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1000 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: '',
      durationMs: 1000,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects when durationMs is a float', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1000 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000.5,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects when session is inactive (ended)', async () => {
    const service = buildService({
      findById: jest.fn().mockResolvedValue({ ...activeSession, status: 'ended' }),
    });
    const audio = buildWavBuffer({ durationMs: 1000 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000,
    });
    expect(result).toEqual({ statusCode: 403, error: 'Forbidden' });
  });

  it('rejects when session does not exist', async () => {
    const service = buildService({
      findById: jest.fn().mockResolvedValue(null),
    });
    const audio = buildWavBuffer({ durationMs: 1000 });
    const result = await service.upload({
      sessionId: 'nonexistent',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000,
    });
    expect(result).toEqual({ statusCode: 403, error: 'Forbidden' });
  });

  it('rejects disallowed MIME type', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1000 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/mp3',
      durationMs: 1000,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects declared duration below minimum', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 100 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 100,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects declared duration above maximum', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 130_000 });
    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 130_000,
    });
    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });
});

describe('Audio upload constants (P9-035)', () => {
  it('max file size is 10 MB', () => {
    expect(AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it('min duration is 200ms', () => {
    expect(AUDIO_UPLOAD_MIN_DURATION_MS).toBe(200);
  });

  it('max duration is 120s', () => {
    expect(AUDIO_UPLOAD_MAX_DURATION_MS).toBe(120_000);
  });

  it('allowed MIME list includes expected types', () => {
    expect(AUDIO_UPLOAD_ALLOWED_MIME_TYPES).toContain('audio/webm');
    expect(AUDIO_UPLOAD_ALLOWED_MIME_TYPES).toContain('audio/wav');
    expect(AUDIO_UPLOAD_ALLOWED_MIME_TYPES).toContain('audio/ogg');
    expect(AUDIO_UPLOAD_ALLOWED_MIME_TYPES).toContain('audio/mp4');
    expect(AUDIO_UPLOAD_ALLOWED_MIME_TYPES).toContain('audio/x-m4a');
  });

  it('every allowed MIME type has a container family mapping', () => {
    for (const mime of AUDIO_UPLOAD_ALLOWED_MIME_TYPES) {
      expect(AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY[mime]).toBeDefined();
    }
  });

  it('mp4 and x-m4a both map to isobmff', () => {
    expect(AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY['audio/mp4']).toBe('isobmff');
    expect(AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY['audio/x-m4a']).toBe('isobmff');
  });
});
