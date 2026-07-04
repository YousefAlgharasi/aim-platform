/**
 * Concrete `SttGateway` implementation (Group E). Uploads the student's
 * recorded audio to the configured, OpenAI-compatible multipart
 * transcription endpoint (`STT_PROVIDER_BASE_URL`, defaults to Groq's free
 * Whisper endpoint) and maps the raw provider response through
 * `SttResponseMapperService` into the internal `SttProviderResponse`
 * contract. Mirrors `TtsAudioGenerationService`'s structure (timeout,
 * error classification, request/response mapper delegation).
 *
 * The raw audio Buffer is forwarded only to the provider; it is never
 * logged, persisted, or echoed back in the response
 * (docs/phase-9/voice-privacy-policy.md).
 */
import { Injectable, Logger, BadGatewayException } from '@nestjs/common';

import { SttGatewayConfigService } from './stt-gateway.config';
import { SttGateway } from './stt-gateway.interface';
import { SttProviderRequest, SttProviderResponse } from './stt-gateway.types';
import { SttRequestMapperService } from './stt-request.mapper';
import { SttResponseMapperService } from './stt-response.mapper';
import { SttCompletionRequest } from './stt-request-mapper.types';
import { SttCompletionResponse } from './stt-response-mapper.types';

const STT_TIMEOUT_MS = 30_000;
const ERROR_CATEGORY_TIMEOUT = 'STT_TIMEOUT';
const ERROR_CATEGORY_NETWORK = 'STT_NETWORK_ERROR';
const ERROR_CATEGORY_PROVIDER = 'STT_PROVIDER_ERROR';

@Injectable()
export class SttTranscriptionService extends SttGateway {
  private readonly logger = new Logger(SttTranscriptionService.name);

  constructor(
    private readonly configService: SttGatewayConfigService,
    private readonly requestMapper: SttRequestMapperService,
    private readonly responseMapper: SttResponseMapperService,
  ) {
    super();
  }

  async transcribe(request: SttProviderRequest): Promise<SttProviderResponse> {
    const completionRequest = this.requestMapper.mapRequest(request);
    const { apiKey, baseUrl } = this.configService.getConfig();

    const start = Date.now();
    let raw: SttCompletionResponse | null = null;
    let errorCategory: string | null = null;

    try {
      raw = await this.callProvider(apiKey, baseUrl, completionRequest);
    } catch (error: unknown) {
      errorCategory = this.classifyError(error);
      this.logger.warn(
        `SttTranscriptionService.transcribe: provider call failed, errorCategory=${errorCategory}`,
      );
    }

    return this.responseMapper.mapResponse({
      raw,
      errorCategory,
      latencyMs: Date.now() - start,
    });
  }

  private async callProvider(
    apiKey: string,
    baseUrl: string,
    request: SttCompletionRequest,
  ): Promise<SttCompletionResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);

    try {
      // OpenAI-compatible multipart transcription contract (OpenAI Whisper,
      // Groq Whisper): multipart/form-data with `file` + `model`, JSON
      // `{ text }` response.
      const form = new FormData();
      const audioBytes = new Uint8Array(request.audio);
      form.append('file', new Blob([audioBytes], { type: request.contentType }), 'audio');
      form.append('model', request.model);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
        signal: controller.signal,
      });

      if (!response.ok) {
        // Bugfix: this previously discarded the provider's error body,
        // logging only an HTTP status — made a real STT provider failure
        // (e.g. invalid API key, unsupported model, unsupported audio
        // format) indistinguishable from any other failure in the logs.
        // The provider's own error message never contains audio content or
        // our credentials, so it's safe to log (truncated defensively).
        const bodyText = await response.text().catch(() => '');
        this.logger.error(
          `SttTranscriptionService.callProvider: STT provider returned HTTP ${response.status}: ${bodyText.slice(0, 500)}`,
        );
        throw new BadGatewayException(`STT provider returned HTTP ${response.status}`);
      }

      const json = (await response.json()) as { text?: string };

      return {
        text: json.text ?? null,
        durationMs: null,
      };
    } finally {
      clearTimeout(timeout);
    }
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
