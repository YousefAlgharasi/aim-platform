/**
 * P9-032: Persist Audio Metadata.
 * Unit tests for AudioMetadataPersistenceService.
 * Verifies that:
 * - write() on AudioStorageAdapter is called with correct input.
 * - VoiceAudioAssetRepository.create() is called with the returned storageKey.
 * - The returned assetId and storageKey match the repo/adapter results.
 * - No STT/TTS/AI provider is called.
 * - No AIM Engine-owned field appears in any output.
 */

import { AudioMetadataPersistenceService } from '../audio-metadata-persistence.service';

describe('AudioMetadataPersistenceService', () => {
  const STORAGE_KEY = 'test-storage-key-uuid';
  const ASSET_ID = 'asset-row-uuid';

  function buildService(overrides?: {
    write?: jest.Mock;
    create?: jest.Mock;
  }) {
    const storageAdapter = {
      write: overrides?.write ?? jest.fn().mockResolvedValue({
        storageKey: STORAGE_KEY,
        byteLength: 1024,
      }),
      read: jest.fn(),
      delete: jest.fn(),
    } as any;

    const audioAssetRepo = {
      create: overrides?.create ?? jest.fn().mockResolvedValue({
        id: ASSET_ID,
        message_id: 'message-1',
        student_id: 'student-1',
        storage_key: STORAGE_KEY,
        content_type: 'audio/wav',
        duration_ms: 1500,
        created_at: '2026-01-01T00:00:00Z',
      }),
      findById: jest.fn(),
      findByMessageId: jest.fn(),
    } as any;

    return new AudioMetadataPersistenceService(storageAdapter, audioAssetRepo);
  }

  const validInput = {
    aiChatMessageId: 'message-1',
    studentId: 'student-1',
    audio: Buffer.from([0x52, 0x49, 0x46, 0x46]), // minimal wav-like bytes
    contentType: 'audio/wav',
    durationMs: 1500,
  };

  it('calls storage adapter write with correct input', async () => {
    const writeMock = jest.fn().mockResolvedValue({ storageKey: STORAGE_KEY, byteLength: 4 });
    const service = buildService({ write: writeMock });

    await service.persist(validInput);

    expect(writeMock).toHaveBeenCalledTimes(1);
    expect(writeMock).toHaveBeenCalledWith({
      studentId: 'student-1',
      contentType: 'audio/wav',
      data: validInput.audio,
    });
  });

  it('calls audioAssetRepo.create with storageKey returned from adapter', async () => {
    const createMock = jest.fn().mockResolvedValue({ id: ASSET_ID, storage_key: STORAGE_KEY });
    const service = buildService({ create: createMock });

    await service.persist(validInput);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      'message-1',    // aiChatMessageId
      'student-1',    // studentId
      STORAGE_KEY,    // storageKey from adapter
      'audio/wav',    // contentType
      1500,           // durationMs
    );
  });

  it('returns assetId from repo row and storageKey from adapter', async () => {
    const service = buildService();

    const result = await service.persist(validInput);

    expect(result.assetId).toBe(ASSET_ID);
    expect(result.storageKey).toBe(STORAGE_KEY);
  });

  it('propagates storage adapter errors', async () => {
    const service = buildService({
      write: jest.fn().mockRejectedValue(new Error('Storage failure')),
    });

    await expect(service.persist(validInput)).rejects.toThrow('Storage failure');
  });

  it('propagates repository errors', async () => {
    const service = buildService({
      create: jest.fn().mockRejectedValue(new Error('DB failure')),
    });

    await expect(service.persist(validInput)).rejects.toThrow('DB failure');
  });

  it('does not expose AIM Engine-owned fields in result', async () => {
    const service = buildService();

    const result = await service.persist(validInput) as any;

    expect(result.mastery).toBeUndefined();
    expect(result.weakness).toBeUndefined();
    expect(result.difficulty).toBeUndefined();
    expect(result.reviewSchedule).toBeUndefined();
    expect(result.recommendation).toBeUndefined();
  });

  it('does not expose raw audio bytes in result', async () => {
    const service = buildService();

    const result = await service.persist(validInput) as any;

    expect(result.audio).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(result.bytes).toBeUndefined();
  });

  it('does not expose filesystem path or public URL in result', async () => {
    const service = buildService();

    const result = await service.persist(validInput) as any;

    expect(result.filePath).toBeUndefined();
    expect(result.url).toBeUndefined();
    expect(result.publicUrl).toBeUndefined();
  });
});
