import { TtsResponseMapperService } from '../tts-response.mapper';

describe('TtsResponseMapperService', () => {
  let service: TtsResponseMapperService;

  beforeEach(() => {
    service = new TtsResponseMapperService();
  });

  it('should map a successful raw response', () => {
    const result = service.mapResponse({
      raw: { audioRef: 'ref-1', durationMs: 2000, contentType: 'audio/mpeg' },
    });

    expect(result.status).toBe('success');
    expect(result.audioRef).toBe('ref-1');
    expect(result.durationMs).toBe(2000);
    expect(result.contentType).toBe('audio/mpeg');
  });

  it('should return error when errorCategory is provided', () => {
    const result = service.mapResponse({
      raw: null,
      errorCategory: 'TTS_TIMEOUT',
    });

    expect(result.status).toBe('error');
    expect(result.audioRef).toBeNull();
    expect(result.errorCategory).toBe('TTS_TIMEOUT');
  });

  it('should return error when raw response is null', () => {
    const result = service.mapResponse({ raw: null });
    expect(result.status).toBe('error');
  });

  it('should return error when raw audioRef is not a string', () => {
    const result = service.mapResponse({
      raw: { audioRef: null, durationMs: null, contentType: null },
    });
    expect(result.status).toBe('error');
  });

  it('should handle missing durationMs gracefully', () => {
    const result = service.mapResponse({
      raw: { audioRef: 'ref', durationMs: null, contentType: 'audio/mpeg' },
    });
    expect(result.status).toBe('success');
    expect(result.durationMs).toBeNull();
  });
});
