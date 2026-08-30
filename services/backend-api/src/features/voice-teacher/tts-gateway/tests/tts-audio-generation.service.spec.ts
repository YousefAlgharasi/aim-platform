import { TtsAudioGenerationService } from '../tts-audio-generation.service';
import { TtsGatewayConfigService } from '../tts-gateway.config';
import { TtsRequestMapperService } from '../tts-request.mapper';
import { TtsResponseMapperService } from '../tts-response.mapper';
import { TtsAudioStorageService } from '../tts-audio-storage.service';
import { TtsProviderRequest } from '../tts-gateway.types';
import { buildWav } from '../wav-audio.util';

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

  // Standard 16-bit mono PCM fmt chunk (44.1kHz, byteRate = 88200).
  const testFmt = Buffer.from([
    0x01, 0x00, // audioFormat = PCM
    0x01, 0x00, // numChannels = 1
    0x44, 0xac, 0x00, 0x00, // sampleRate = 44100
    0x88, 0x58, 0x01, 0x00, // byteRate = 88200
    0x02, 0x00, // blockAlign
    0x10, 0x00, // bitsPerSample = 16
  ]);

  const makeWavBuffer = (dataLength: number) => buildWav(testFmt, Buffer.alloc(dataLength, 1));

  const mockSuccessfulFetch = (audioBuffer: Buffer = makeWavBuffer(1000)) =>
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () =>
        Promise.resolve(audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength)),
    } as any);

  beforeEach(() => {
    configService = {
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-key',
        model: 'canopylabs/orpheus-v1-english',
        baseUrl: 'https://api.groq.com/openai/v1/audio/speech',
        voice: 'hannah',
        resultsUrl: 'https://api.groq.com/openai/v1/audio/speech',
      }),
    } as any;

    requestMapper = {
      mapRequest: jest.fn().mockReturnValue({
        model: 'canopylabs/orpheus-v1-english',
        text: 'Hello student',
        languageCode: 'ar',
        sessionId: 'session-1',
        studentId: 'student-1',
        voice: 'hannah',
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
    const fetchSpy = mockSuccessfulFetch();

    await service.synthesize(mockRequest);

    expect(requestMapper.mapRequest).toHaveBeenCalledWith(mockRequest);
    fetchSpy.mockRestore();
  });

  it('should call configService.getConfig for the API key', async () => {
    const fetchSpy = mockSuccessfulFetch();

    await service.synthesize(mockRequest);

    expect(configService.getConfig).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('posts model/input/voice/response_format to the configured baseUrl', async () => {
    const fetchSpy = mockSuccessfulFetch();

    await service.synthesize(mockRequest);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/audio/speech');
    expect(JSON.parse((init as any).body)).toEqual({
      model: 'canopylabs/orpheus-v1-english',
      input: 'Hello student',
      voice: 'hannah',
      response_format: 'wav',
    });
    expect((init as any).headers.Authorization).toBe('Bearer test-key');

    fetchSpy.mockRestore();
  });

  it('should return a success response with audio/wav content type', async () => {
    const fetchSpy = mockSuccessfulFetch();

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('success');
    expect(result.audioRef).toBeTruthy();
    expect(result.contentType).toBe('audio/wav');
    fetchSpy.mockRestore();
  });

  it('splits text longer than the per-request character limit into multiple provider calls and stitches the audio', async () => {
    const longText = 'This is a sentence that repeats itself many times. '.repeat(10);
    requestMapper.mapRequest.mockReturnValue({
      model: 'canopylabs/orpheus-v1-english',
      text: longText,
      languageCode: 'ar',
      sessionId: 'session-1',
      studentId: 'student-1',
      voice: 'hannah',
    });
    const fetchSpy = mockSuccessfulFetch(makeWavBuffer(500));

    const result = await service.synthesize(mockRequest);

    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1);
    for (const [, init] of fetchSpy.mock.calls) {
      const body = JSON.parse((init as any).body);
      expect(body.input.length).toBeLessThanOrEqual(190);
    }
    expect(result.status).toBe('success');
    fetchSpy.mockRestore();
  });

  it('should return an error response when the provider call returns non-ok HTTP', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('internal error'),
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
    const fetchSpy = mockSuccessfulFetch();

    const result = await service.synthesize(mockRequest);

    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('test-key');
    fetchSpy.mockRestore();
  });

  it('should pass response through responseMapper', async () => {
    const fetchSpy = mockSuccessfulFetch();

    await service.synthesize(mockRequest);

    expect(responseMapper.mapResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        raw: expect.objectContaining({
          audioRef: expect.any(String),
          contentType: 'audio/wav',
        }),
      }),
    );
    fetchSpy.mockRestore();
  });

  it('should return an error response when audio storage fails', async () => {
    const fetchSpy = mockSuccessfulFetch();
    audioStorage.storeAudio.mockResolvedValue({ audioRef: 'ref', stored: false });

    const result = await service.synthesize(mockRequest);

    expect(result.status).toBe('error');
    fetchSpy.mockRestore();
  });

  it('should generate opaque audioRef values', async () => {
    const fetchSpy = mockSuccessfulFetch();

    await service.synthesize(mockRequest);

    const callArg = responseMapper.mapResponse.mock.calls[0][0];
    expect(callArg.raw?.audioRef).toMatch(/^tts_[a-z0-9]+_[a-z0-9]+$/);
    fetchSpy.mockRestore();
  });

  it('should estimate duration from the WAV fmt chunk byte rate', async () => {
    // 88200 bytes/sec byteRate, 88200 bytes of data -> ~1000ms.
    const fetchSpy = mockSuccessfulFetch(makeWavBuffer(88_200));

    await service.synthesize(mockRequest);

    const callArg = responseMapper.mapResponse.mock.calls[0][0];
    expect(callArg.raw?.durationMs).toBe(1000);
    fetchSpy.mockRestore();
  });
});
