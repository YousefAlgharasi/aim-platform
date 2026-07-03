import { TtsRequestMapperService } from '../tts-request.mapper';
import { TtsProviderRequest } from '../tts-gateway.types';

describe('TtsRequestMapperService', () => {
  const mockConfig = {
    getConfig: jest.fn().mockReturnValue({ apiKey: 'key', model: 'tts-1' }),
  } as any;

  let service: TtsRequestMapperService;

  beforeEach(() => {
    service = new TtsRequestMapperService(mockConfig);
  });

  it('should map text and languageCode from request', () => {
    const request: TtsProviderRequest = {
      text: 'Hello',
      languageCode: 'ar',
      sessionId: 'session-1',
      studentId: 'student-1',
    };
    const result = service.mapRequest(request);

    expect(result.text).toBe('Hello');
    expect(result.languageCode).toBe('ar');
    expect(result.model).toBe('tts-1');
    expect(result.sessionId).toBe('session-1');
    expect(result.studentId).toBe('student-1');
  });

  it('should never include apiKey in the mapped request', () => {
    const request: TtsProviderRequest = {
      text: 'Test',
      languageCode: 'en',
      sessionId: 'session-1',
      studentId: 'student-1',
    };
    const result = service.mapRequest(request);

    expect(JSON.stringify(result)).not.toContain('key');
  });

  it('should read model from config, not hardcode it', () => {
    mockConfig.getConfig.mockReturnValue({ apiKey: 'k', model: 'tts-2-hd' });
    const result = service.mapRequest({
      text: 't',
      languageCode: 'ar',
      sessionId: 'session-1',
      studentId: 'student-1',
    });
    expect(result.model).toBe('tts-2-hd');
  });
});
