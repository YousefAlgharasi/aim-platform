import { Injectable, Logger } from '@nestjs/common';

import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsGateway } from './tts-gateway.interface';
import { TtsProviderRequest, TtsProviderResponse } from './tts-gateway.types';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsCompletionResponse } from './tts-response-mapper.types';

const TTS_TIMEOUT_MS = 30_000;
const ERROR_CATEGORY_TIMEOUT = 'TTS_TIMEOUT';
const ERROR_CATEGORY_NETWORK = 'TTS_NETWORK_ERROR';
const ERROR_CATEGORY_PROVIDER = 'TTS_PROVIDER_ERROR';

@Injectable()
export class TtsAudioGenerationService extends TtsGateway {
  private readonly logger = new Logger(TtsAudioGenerationService.name);

  constructor(
    private readonly configService: TtsGatewayConfigService,
    private readonly requestMapper: TtsRequestMapperService,
    private readonly responseMapper: TtsResponseMapperService,
  ) {
    super();
  }

  async synthesize(request: TtsProviderRequest): Promise<TtsProviderResponse> {
    const completionRequest = this.requestMapper.mapRequest(request);
    const { apiKey } = this.configService.getConfig();

    let raw: TtsCompletionResponse | null = null;
    let errorCategory: string | null = null;

    try {
      raw = await this.callProvider(apiKey, completionRequest);
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
    request: { model: string; text: string; languageCode: string },
  ): Promise<TtsCompletionResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      const response = await fetch(
        'https://api.openai.com/v1/audio/speech',
        {
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
        },
      );

      if (!response.ok) {
        throw new Error(`TTS provider returned HTTP ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const audioRef = this.generateAudioRef();
      const durationMs = this.estimateDurationMs(audioBuffer.length, 'audio/mpeg');

      // Audio bytes stay in memory only long enough to be handed to
      // persistence (a later Group G task). The ref is opaque.
      return {
        audioRef,
        durationMs,
        contentType: 'audio/mpeg',
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
