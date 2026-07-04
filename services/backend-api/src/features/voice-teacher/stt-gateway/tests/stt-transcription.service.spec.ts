import { Logger } from '@nestjs/common';

import { SttTranscriptionService } from '../stt-transcription.service';
import { SttGatewayConfigService } from '../stt-gateway.config';
import { SttRequestMapperService } from '../stt-request.mapper';
import { SttResponseMapperService } from '../stt-response.mapper';
import { SttProviderRequest } from '../stt-gateway.types';

describe('SttTranscriptionService', () => {
  let service: SttTranscriptionService;
  let configService: jest.Mocked<SttGatewayConfigService>;
  let requestMapper: jest.Mocked<SttRequestMapperService>;
  let responseMapper: jest.Mocked<SttResponseMapperService>;

  const mockRequest: SttProviderRequest = {
    audio: Buffer.from('audio-bytes'),
    contentType: 'audio/webm',
  };

  beforeEach(() => {
    configService = {
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-key',
        model: 'whisper-large-v3',
        baseUrl: 'https://api.groq.com/openai/v1/audio/transcriptions',
      }),
    } as any;

    requestMapper = {
      mapRequest: jest.fn().mockReturnValue({
        model: 'whisper-large-v3',
        audio: mockRequest.audio,
        contentType: 'audio/webm',
      }),
    } as any;

    responseMapper = {
      mapResponse: jest.fn().mockImplementation((input) => {
        if (input.errorCategory) {
          return { status: 'error', transcript: null, durationMs: null, errorCategory: input.errorCategory };
        }
        if (input.raw?.text != null) {
          return { status: 'success', transcript: input.raw.text, durationMs: input.raw.durationMs };
        }
        return { status: 'error', transcript: null, durationMs: null, errorCategory: 'STT_PROVIDER_CALL_FAILED' };
      }),
    } as any;

    service = new SttTranscriptionService(configService, requestMapper, responseMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call requestMapper.mapRequest with the input request', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ text: 'hello' }) } as any);

    await service.transcribe(mockRequest);

    expect(requestMapper.mapRequest).toHaveBeenCalledWith(mockRequest);
    fetchSpy.mockRestore();
  });

  it('should return a success response when the provider call succeeds', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ text: 'hello teacher' }) } as any);

    const result = await service.transcribe(mockRequest);

    expect(result.status).toBe('success');
    expect(result.transcript).toBe('hello teacher');
    fetchSpy.mockRestore();
  });

  it('should send a multipart form with the audio file and model', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ text: 'hi' }) } as any);

    await service.transcribe(mockRequest);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/audio/transcriptions');
    expect(init?.body).toBeInstanceOf(FormData);
    fetchSpy.mockRestore();
  });

  it('should return an error response when the provider returns non-ok HTTP', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('{"error":{"message":"invalid api key"}}'),
    } as any);

    const result = await service.transcribe(mockRequest);

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('STT_PROVIDER_ERROR');
    fetchSpy.mockRestore();
  });

  it('logs the provider error body (bugfix — previously discarded, made real failures indistinguishable)', async () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('{"error":{"message":"invalid api key"}}'),
    } as any);

    await service.transcribe(mockRequest);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('invalid api key'),
    );
    fetchSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should return a network error when fetch throws TypeError', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

    const result = await service.transcribe(mockRequest);

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('STT_NETWORK_ERROR');
    fetchSpy.mockRestore();
  });

  it('should never include provider credentials in the response', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ text: 'hi' }) } as any);

    const result = await service.transcribe(mockRequest);

    expect(JSON.stringify(result)).not.toContain('test-key');
    fetchSpy.mockRestore();
  });
});
