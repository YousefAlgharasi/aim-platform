import { Injectable, Logger, BadGatewayException } from '@nestjs/common';

import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsGateway } from './tts-gateway.interface';
import { TtsProviderRequest, TtsProviderResponse } from './tts-gateway.types';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsAudioStorageService } from './tts-audio-storage.service';
import { TtsCompletionRequest } from './tts-request-mapper.types';
import { TtsCompletionResponse } from './tts-response-mapper.types';

// tts.ai's synthesis job is async (submit -> poll -> download), so the
// overall budget has to cover polling, not just one network round trip.
const TTS_TIMEOUT_MS = 45_000;
const TTS_POLL_INTERVAL_MS = 1_500;
const TTS_MAX_POLL_ATTEMPTS = 20;
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
    const { apiKey, baseUrl, resultsUrl } = this.configService.getConfig();

    let raw: TtsCompletionResponse | null = null;
    let errorCategory: string | null = null;

    try {
      raw = await this.callProvider(apiKey, baseUrl, resultsUrl, completionRequest);
    } catch (error: unknown) {
      errorCategory = this.classifyError(error);
      this.logger.warn(
        `TtsAudioGenerationService.synthesize: provider call failed, errorCategory=${errorCategory}`,
      );
    }

    return this.responseMapper.mapResponse({ raw, errorCategory });
  }

  /**
   * tts.ai's real, documented /v1/tts/ contract is an async job:
   *   1. POST baseUrl -> { uuid, job_id, status: "queued", ... }
   *   2. Poll GET `${resultsUrl}?uuid=...` until status is "completed" or "failed".
   *   3. GET the completed response's `result_url` to download the audio bytes.
   */
  private async callProvider(
    apiKey: string,
    baseUrl: string,
    resultsUrl: string,
    request: TtsCompletionRequest,
  ): Promise<TtsCompletionResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      const uuid = await this.submitJob(apiKey, baseUrl, request, controller.signal);
      const resultUrl = await this.pollForResult(resultsUrl, uuid, controller.signal);
      const audioBuffer = await this.downloadAudio(resultUrl, controller.signal);

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

  private async submitJob(
    apiKey: string,
    baseUrl: string,
    request: TtsCompletionRequest,
    signal: AbortSignal,
  ): Promise<string> {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        text: request.text,
        voice: request.voice,
        format: 'mp3',
      }),
      signal,
    });

    if (!response.ok) {
      throw new BadGatewayException(`TTS provider returned HTTP ${response.status}`);
    }

    const submitted = (await response.json()) as { uuid?: string };

    if (!submitted.uuid) {
      throw new BadGatewayException('TTS provider submit response missing uuid');
    }

    return submitted.uuid;
  }

  private async pollForResult(
    resultsUrl: string,
    uuid: string,
    signal: AbortSignal,
  ): Promise<string> {
    const pollUrl = `${resultsUrl}?uuid=${encodeURIComponent(uuid)}`;

    for (let attempt = 0; attempt < TTS_MAX_POLL_ATTEMPTS; attempt++) {
      const response = await fetch(pollUrl, { signal });

      if (!response.ok) {
        throw new BadGatewayException(`TTS provider returned HTTP ${response.status}`);
      }

      const poll = (await response.json()) as {
        status?: string;
        result_url?: string;
        error?: string;
      };

      if (poll.status === 'completed') {
        if (!poll.result_url) {
          throw new BadGatewayException('TTS provider completed response missing result_url');
        }
        return poll.result_url;
      }

      if (poll.status === 'failed') {
        throw new BadGatewayException(poll.error ?? 'TTS provider job failed');
      }

      // status is "queued"/"processing" (or unknown) — wait and poll again.
      await this.sleep(TTS_POLL_INTERVAL_MS);
    }

    throw new BadGatewayException('TTS provider job did not complete before max poll attempts');
  }

  private async downloadAudio(resultUrl: string, signal: AbortSignal): Promise<Buffer> {
    const response = await fetch(resultUrl, { signal });

    if (!response.ok) {
      throw new BadGatewayException(`TTS provider returned HTTP ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
