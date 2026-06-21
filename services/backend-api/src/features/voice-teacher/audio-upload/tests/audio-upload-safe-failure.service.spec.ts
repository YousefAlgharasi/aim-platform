import { AudioUploadSafeFailureService } from '../audio-upload-safe-failure.service';
import { AudioUploadService } from '../audio-upload.service';
import { AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE } from '../audio-upload-safe-failure.constants';
import { AudioUploadInput } from '../audio-upload.types';

const mockInput: AudioUploadInput = {
  sessionId: 'session-1',
  studentId: 'student-1',
  audio: Buffer.from('test'),
  mimeType: 'audio/webm',
  durationMs: 5000,
};

describe('AudioUploadSafeFailureService', () => {
  let service: AudioUploadSafeFailureService;
  let uploadService: jest.Mocked<AudioUploadService>;

  beforeEach(() => {
    uploadService = {
      upload: jest.fn(),
    } as unknown as jest.Mocked<AudioUploadService>;
    service = new AudioUploadSafeFailureService(uploadService);
  });

  it('should pass through successful upload results', async () => {
    const successResult = { messageId: 'msg-1', assetId: 'asset-1', status: 'pending' as const };
    uploadService.upload.mockResolvedValue(successResult);

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.result).toEqual(successResult);
    expect(outcome.isFallback).toBe(false);
  });

  it('should pass through validation errors unchanged', async () => {
    const validationError = { statusCode: 400, error: 'Bad Request' };
    uploadService.upload.mockResolvedValue(validationError);

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.result).toEqual(validationError);
    expect(outcome.isFallback).toBe(false);
  });

  it('should pass through 413 errors unchanged', async () => {
    const sizeError = { statusCode: 413, error: 'Payload Too Large' };
    uploadService.upload.mockResolvedValue(sizeError);

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.result).toEqual(sizeError);
    expect(outcome.isFallback).toBe(false);
  });

  it('should return safe fallback on unexpected error', async () => {
    uploadService.upload.mockRejectedValue(new Error('DB connection lost'));

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.isFallback).toBe(true);
    expect(outcome.result).toEqual({
      statusCode: 500,
      error: AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE,
    });
  });

  it('should return safe fallback on non-Error throw', async () => {
    uploadService.upload.mockRejectedValue('unknown failure');

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.isFallback).toBe(true);
    expect(outcome.result).toEqual({
      statusCode: 500,
      error: AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE,
    });
  });

  it('should never expose internal error details', async () => {
    uploadService.upload.mockRejectedValue(new Error('ENOENT: /var/audio/secret-path'));

    const outcome = await service.safeUpload(mockInput);

    expect(outcome.result).toEqual({
      statusCode: 500,
      error: AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE,
    });
    expect(JSON.stringify(outcome.result)).not.toContain('ENOENT');
    expect(JSON.stringify(outcome.result)).not.toContain('secret-path');
  });
});
