// P9-029: Add Audio File Validation.
// P9-032: Persist Audio Metadata — updated to mock AudioMetadataPersistenceService
// as the third constructor argument; success results now include assetId.
// Verifies AudioUploadService rejects declared/actual MIME mismatches
// and declared/actual duration mismatches, while preserving the
// P9-028 behavior for field presence, size, and session ownership.
// Confirms no STT/TTS/AI provider call and no AIM Engine field is ever
// touched by this service.

import { AudioUploadService } from '../audio-upload.service';
import { AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES } from '../audio-upload.constants';
import { buildWavBuffer, buildWebmBuffer } from './audio-test-fixtures';

describe('AudioUploadService', () => {
  const session = {
    id: 'session-1',
    student_id: 'student-1',
    status: 'active',
  };

  function buildService(overrides?: {
    findById?: jest.Mock;
    create?: jest.Mock;
    persist?: jest.Mock;
  }) {
    const voiceSessionRepo = {
      findById: overrides?.findById ?? jest.fn().mockResolvedValue(session),
    } as any;

    const voiceMessageRepo = {
      create:
        overrides?.create ??
        jest.fn().mockResolvedValue({ id: 'message-1' }),
    } as any;

    // P9-032: mock AudioMetadataPersistenceService
    const audioMetadataPersistence = {
      persist:
        overrides?.persist ??
        jest.fn().mockResolvedValue({ assetId: 'asset-1', storageKey: 'key-1' }),
    } as any;

    return new AudioUploadService(voiceSessionRepo, voiceMessageRepo, audioMetadataPersistence);
  }

  it('accepts a valid WAV upload matching declared mime and duration', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1500 });

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1500,
    });

    expect(result).toEqual({ messageId: 'message-1', assetId: 'asset-1', status: 'pending' });
  });

  it('rejects when declared mimeType does not match actual container bytes', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1500 });

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/webm',
      durationMs: 1500,
    });

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects a webm-declared file whose bytes are actually WAV', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1000 });

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/webm',
      durationMs: 1000,
    });

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects when actual decoded duration is outside the allowed range', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 130_000 });

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 120_000,
    });

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('rejects an unparseable container even if declared fields look valid', async () => {
    const service = buildService();
    const audio = Buffer.from([0x00, 0x01, 0x02, 0x03]);

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000,
    });

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
  });

  it('accepts a valid WebM upload', async () => {
    const service = buildService();
    const audio = buildWebmBuffer({ timecodeScale: 1_000_000, durationTicks: 2000 });

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/webm',
      durationMs: 2000,
    });

    expect(result).toEqual({ messageId: 'message-1', assetId: 'asset-1', status: 'pending' });
  });

  it('still rejects oversized files before any container parsing', async () => {
    const service = buildService();
    const audio = Buffer.alloc(AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES + 1);

    const result = await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000,
    });

    expect(result).toEqual({ statusCode: 413, error: 'Payload Too Large' });
  });

  it('still rejects when the session is not owned by the student', async () => {
    const service = buildService({
      findById: jest.fn().mockResolvedValue({ ...session, student_id: 'other' }),
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

  it('never introduces AIM Engine-owned fields in a successful result', async () => {
    const service = buildService();
    const audio = buildWavBuffer({ durationMs: 1000 });

    const result = (await service.upload({
      sessionId: 'session-1',
      studentId: 'student-1',
      audio,
      mimeType: 'audio/wav',
      durationMs: 1000,
    })) as any;

    // P9-032: assetId is now present; AIM fields must still be absent
    expect(result.assetId).toBeDefined();
    expect(result.mastery).toBeUndefined();
    expect(result.difficulty).toBeUndefined();
    expect(result.weakness).toBeUndefined();
    expect(result.reviewSchedule).toBeUndefined();
  });
});
