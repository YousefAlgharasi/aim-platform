import { Injectable, Logger, BadGatewayException } from '@nestjs/common';

import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsGateway } from './tts-gateway.interface';
import { TtsProviderRequest, TtsProviderResponse } from './tts-gateway.types';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsAudioStorageService } from './tts-audio-storage.service';
import { TtsCompletionRequest } from './tts-request-mapper.types';
import { TtsCompletionResponse } from './tts-response-mapper.types';

const TTS_TIMEOUT_MS = 30_000;
const ERROR_CATEGORY_TIMEOUT = 'TTS_TIMEOUT';
const ERROR_CATEGORY_NETWORK = 'TTS_NETWORK_ERROR';
const ERROR_CATEGORY_PROVIDER = 'TTS_PROVIDER_ERROR';
const ERROR_CATEGORY_STORAGE_FAILED = 'TTS_AUDIO_STORAGE_FAILED';

@Injectable()
export class TtsAudioGenerationService extends TtsGateway {
  private readonly logger = new Logger(TtsAudioGenerationService.name);

  constructor(
    private readonly configService: TtsGatewayConfigService,
    private readonly requestMapper: TtsRequestMapperService,
    private readonly responseMapper: TtsResponseMapperService,
    private readonly audioStorage: TtsAudioStorageService,
  ) {
    super();
  }

  async synthesize(request: TtsProviderRequest): Promise<TtsProviderResponse> {
    const completionRequest = this.requestMapper.mapRequest(request);
    const { apiKey, baseUrl } = this.configService.getConfig();

    let raw: TtsCompletionResponse | null = null;
    let errorCategory: string | null = null;

    try {
      raw = await this.callProvider(apiKey, baseUrl, completionRequest);
    } catch (error: unknown) {
      errorCategory = this.classifyError(error);
      this.logger.warn(
        `TtsAudioGenerationService.synthesize: provider call failed, errorCategory=${errorCategory}`,
      );
    }

    return this.responseMapper.mapResponse({ raw, errorCategory });
  }

  private async callProvider(
    apiKey: string,
    baseUrl: string,
    request: TtsCompletionRequest,
  ): Promise<TtsCompletionResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      // Contract assumed for tts.ai (no verified docs yet): JSON body with
      // Bearer auth, raw audio bytes back. OpenAI's /v1/audio/speech shape
      // is used as the request/response template since it's the closest
      // documented reference; confirm and adjust once real tts.ai
      // credentials/docs are available.
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          input: request.text,
          voice: 'alloy',
          response_format: 'mp3',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new BadGatewayException(`TTS provider returned HTTP ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const audioRef = this.generateAudioRef();
      const contentType = 'audio/mpeg';
      const durationMs = this.estimateDurationMs(audioBuffer.length, contentType);

      const stored = await this.audioStorage.storeAudio({
        audioRef,
        audioData: audioBuffer,
        contentType,
        durationMs,
        sessionId: request.sessionId,
        studentId: request.studentId,
      });

      if (!stored.stored) {
        throw new BadGatewayException(ERROR_CATEGORY_STORAGE_FAILED);
      }

      return {
        audioRef,
        durationMs,
        contentType,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private generateAudioRef(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `tts_${timestamp}_${random}`;
  }

  private estimateDurationMs(byteLength: number, contentType: string): number {
    if (contentType === 'audio/mpeg') {
      // ~128kbps MP3 bitrate estimate
      return Math.round((byteLength * 8) / 128);
    }
    return 0;
  }

  private classifyError(error: unknown): string {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return ERROR_CATEGORY_TIMEOUT;
    }
    if (error instanceof TypeError) {
      return ERROR_CATEGORY_NETWORK;
    }
    return ERROR_CATEGORY_PROVIDER;
  }
}
