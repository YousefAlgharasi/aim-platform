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

/**
 * Bugfix: Groq's (OpenAI-compatible) transcription endpoint validates the
 * uploaded file's type from the multipart filename's extension, not from
 * the part's Content-Type header — confirmed directly from a real 400
 * response: `"file must be one of the following types: [flac mp3 mp4 mpeg
 * mpga m4a ogg opus wav webm]"`, returned even when the actual bytes were a
 * real, valid WAV recording sent with the correct audio/wav content type.
 * The upload previously used the literal filename 'audio' with no
 * extension at all, so Groq could never recognize it as any allowed type —
 * every single real recording was rejected, regardless of format.
 */
const CONTENT_TYPE_TO_FILE_EXTENSION: Record<string, string> = {
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac',
};
const DEFAULT_FILE_EXTENSION = 'wav';

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
      const extension =
        CONTENT_TYPE_TO_FILE_EXTENSION[request.contentType] ?? DEFAULT_FILE_EXTENSION;
      form.append(
        'file',
        new Blob([audioBytes], { type: request.contentType }),
        `audio.${extension}`,
      );
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
