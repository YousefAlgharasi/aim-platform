import { TtsAudioGenerationService } from '../tts-audio-generation.service';
import { TtsGatewayConfigService } from '../tts-gateway.config';
import { TtsRequestMapperService } from '../tts-request.mapper';
import { TtsResponseMapperService } from '../tts-response.mapper';
import { TtsProviderRequest } from '../tts-gateway.types';

describe('TtsAudioGenerationService', () => {
  let service: TtsAudioGenerationService;
  let configService: jest.Mocked<TtsGatewayConfigService>;
  let requestMapper: jest.Mocked<TtsRequestMapperService>;
  let responseMapper: jest.Mocked<TtsResponseMapperService>;

  const mockRequest: TtsProviderRequest = {
    text: 'Hello student',
    languageCode: 'ar',
  };

  beforeEach(() => {
    configService = {
      getConfig: jest.fn().mockReturnValue({ apiKey: 'test-key', model: 'tts-1' }),
    } as any;

    requestMapper = {
      mapRequest: jest.fn().mockReturnValue({
        model: 'tts-1',
        text: 'Hello student',
        languageCode: 'ar',
      }),
    } as any;

    responseMapper = {
      mapResponse: jest.fn().mockImplementation((input) => {
        if (input.errorCategory) {
          return {
            status: 'error',
            audioRef: null,
            durationMs: null,
            contentType: null,
            errorCategory: input.errorCategory,
          };
        }
        if (input.raw?.audioRef) {
          return {
            status: 'success',
            audioRef: input.raw.audioRef,
            durationMs: input.raw.durationMs,
            contentType: input.raw.contentType,
          };
        }
        return {
          status: 'error',
          audioRef: null,
          durationMs: null,
          contentType: null,
          errorCategory: 'TTS_PROVIDER_CALL_FAILED',
        };
      }),
    } as any;

    service = new TtsAudioGenerationService(
      configService,
      requestMapper,
      responseMapper,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call requestMapper.mapRequest with the input request', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    await service.synthesize(mockRequest);

    expect(requestMapper.mapRequest).toHaveBeenCalledWith(mockRequest);
    fetchSpy.mockRestore();
  });

  it('should call configService.getConfig for the API key', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    await service.synthesize(mockRequest);

    expect(configService.getConfig).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('should return a success response when provider call succeeds', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('success');
    expect(result.audioRef).toBeTruthy();
    expect(result.contentType).toBe('audio/mpeg');
    fetchSpy.mockRestore();
  });

  it('should return an error response when provider returns non-ok HTTP', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('TTS_PROVIDER_ERROR');
    fetchSpy.mockRestore();
  });

  it('should return a network error when fetch throws TypeError', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(
      new TypeError('fetch failed'),
    );

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('TTS_NETWORK_ERROR');
    fetchSpy.mockRestore();
  });

  it('should never include provider credentials in the response', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    const result = await service.synthesize(mockRequest);

    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('test-key');
    fetchSpy.mockRestore();
  });

  it('should pass response through responseMapper', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    await service.synthesize(mockRequest);

    expect(responseMapper.mapResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        raw: expect.objectContaining({
          audioRef: expect.any(String),
          contentType: 'audio/mpeg',
        }),
      }),
    );
    fetchSpy.mockRestore();
  });

  it('should generate opaque audioRef values', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
    } as any);

    await service.synthesize(mockRequest);

    const callArg = responseMapper.mapResponse.mock.calls[0][0];
    expect(callArg.raw?.audioRef).toMatch(/^tts_[a-z0-9]+_[a-z0-9]+$/);
    fetchSpy.mockRestore();
  });
});
