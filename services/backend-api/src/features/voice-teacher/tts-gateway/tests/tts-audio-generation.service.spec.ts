import { TtsAudioGenerationService } from '../tts-audio-generation.service';
import { TtsGatewayConfigService } from '../tts-gateway.config';
import { TtsRequestMapperService } from '../tts-request.mapper';
import { TtsResponseMapperService } from '../tts-response.mapper';
import { TtsAudioStorageService } from '../tts-audio-storage.service';
import { TtsProviderRequest } from '../tts-gateway.types';

describe('TtsAudioGenerationService', () => {
  let service: TtsAudioGenerationService;
  let configService: jest.Mocked<TtsGatewayConfigService>;
  let requestMapper: jest.Mocked<TtsRequestMapperService>;
  let responseMapper: jest.Mocked<TtsResponseMapperService>;
  let audioStorage: jest.Mocked<TtsAudioStorageService>;

  const mockRequest: TtsProviderRequest = {
    text: 'Hello student',
    languageCode: 'ar',
    sessionId: 'session-1',
    studentId: 'student-1',
  };

  // A single successful round trip: submit -> immediately-completed poll -> download.
  const mockHappyPathFetch = () =>
    jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ uuid: 'job-uuid-1', status: 'queued' }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'completed',
              result_url: 'https://api.tts.ai/static/downloads/job-uuid-1/output.mp3',
            }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
        } as any),
      );

  beforeEach(() => {
    configService = {
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-key',
        model: 'kokoro',
        baseUrl: 'https://api.tts.ai/v1/tts/',
        voice: 'af_bella',
        resultsUrl: 'https://api.tts.ai/v1/speech/results/',
      }),
    } as any;

    requestMapper = {
      mapRequest: jest.fn().mockReturnValue({
        model: 'kokoro',
        text: 'Hello student',
        languageCode: 'ar',
        sessionId: 'session-1',
        studentId: 'student-1',
        voice: 'af_bella',
      }),
    } as any;

    audioStorage = {
      storeAudio: jest.fn().mockResolvedValue({ audioRef: 'ref', stored: true }),
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
      audioStorage,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call requestMapper.mapRequest with the input request', async () => {
    const fetchSpy = mockHappyPathFetch();

    await service.synthesize(mockRequest);

    expect(requestMapper.mapRequest).toHaveBeenCalledWith(mockRequest);
    fetchSpy.mockRestore();
  });

  it('should call configService.getConfig for the API key', async () => {
    const fetchSpy = mockHappyPathFetch();

    await service.synthesize(mockRequest);

    expect(configService.getConfig).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('submits the job with model/text/voice/format, then polls, then downloads result_url', async () => {
    const fetchSpy = mockHappyPathFetch();

    await service.synthesize(mockRequest);

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const [submitUrl, submitInit] = fetchSpy.mock.calls[0];
    expect(submitUrl).toBe('https://api.tts.ai/v1/tts/');
    expect(JSON.parse((submitInit as any).body)).toEqual({
      model: 'kokoro',
      text: 'Hello student',
      voice: 'af_bella',
      format: 'mp3',
    });
    expect((submitInit as any).headers.Authorization).toBe('Bearer test-key');

    const [pollUrl] = fetchSpy.mock.calls[1];
    expect(pollUrl).toBe('https://api.tts.ai/v1/speech/results/?uuid=job-uuid-1');

    const [downloadUrl] = fetchSpy.mock.calls[2];
    expect(downloadUrl).toBe('https://api.tts.ai/static/downloads/job-uuid-1/output.mp3');

    fetchSpy.mockRestore();
  });

  it('polls again while status is queued/processing before completing', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ uuid: 'job-uuid-1', status: 'queued' }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'processing' }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'completed',
              result_url: 'https://api.tts.ai/static/downloads/job-uuid-1/output.mp3',
            }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
        } as any),
      );

    const result = await service.synthesize(mockRequest);

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(result.status).toBe('success');
    fetchSpy.mockRestore();
  }, 10_000);

  it('should return an error response when the job status is failed', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ uuid: 'job-uuid-1', status: 'queued' }),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'failed', error: 'synthesis error' }),
        } as any),
      );

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('TTS_PROVIDER_ERROR');
    fetchSpy.mockRestore();
  });

  it('should return a success response when the full submit/poll/download flow succeeds', async () => {
    const fetchSpy = mockHappyPathFetch();

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('success');
    expect(result.audioRef).toBeTruthy();
    expect(result.contentType).toBe('audio/mpeg');
    fetchSpy.mockRestore();
  });

  it('should return an error response when the submit call returns non-ok HTTP', async () => {
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
    const fetchSpy = mockHappyPathFetch();

    const result = await service.synthesize(mockRequest);

    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('test-key');
    fetchSpy.mockRestore();
  });

  it('should pass response through responseMapper', async () => {
    const fetchSpy = mockHappyPathFetch();

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

  it('should return an error response when audio storage fails', async () => {
    const fetchSpy = mockHappyPathFetch();
    audioStorage.storeAudio.mockResolvedValue({ audioRef: 'ref', stored: false });

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('error');
    fetchSpy.mockRestore();
  });

  it('should generate opaque audioRef values', async () => {
    const fetchSpy = mockHappyPathFetch();

    await service.synthesize(mockRequest);

    const callArg = responseMapper.mapResponse.mock.calls[0][0];
    expect(callArg.raw?.audioRef).toMatch(/^tts_[a-z0-9]+_[a-z0-9]+$/);
    fetchSpy.mockRestore();
  });
});
