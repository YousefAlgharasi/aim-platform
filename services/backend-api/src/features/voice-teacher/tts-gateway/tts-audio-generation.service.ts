import { Injectable, Logger, BadGatewayException, Optional } from '@nestjs/common';

import { VoiceLanguageSettingsService } from '../language-settings/voice-language-settings.service';
import { StudentVoicePreferencesService } from './voice-preferences/student-voice-preferences.service';
import { VoiceLang } from './voice-preferences/voice-catalog';
import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsGateway } from './tts-gateway.interface';
import { TtsProviderRequest, TtsProviderResponse } from './tts-gateway.types';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsAudioStorageService } from './tts-audio-storage.service';
import { TtsCompletionRequest } from './tts-request-mapper.types';
import { TtsCompletionResponse } from './tts-response-mapper.types';
import { concatWavBuffers, estimateWavDurationMs } from './wav-audio.util';

// Groq's TTS endpoint (Canopy Labs' Orpheus models) is synchronous — one
// POST returns the complete WAV audio directly, no submit/poll/download
// job cycle. Its documented per-request input limit is 200 characters, so
// a longer AI Teacher reply is split into chunks under that limit and the
// resulting WAV files are stitched into one clip (wav-audio.util.ts).
const TTS_MAX_CHARS_PER_REQUEST = 190;
// Safety cap on how many chunks (and thus provider calls) a single reply
// can produce — generous for a teaching turn, but bounds worst case
// latency/cost if an unexpectedly long reply ever reaches this gateway.
const TTS_MAX_CHUNKS = 20;
const TTS_TIMEOUT_MS = 20_000;
/** Parallel provider calls per clip; kept small to stay clear of provider rate limits. */
const TTS_CHUNK_CONCURRENCY = 4;
const ERROR_CATEGORY_TIMEOUT = 'TTS_TIMEOUT';
const ERROR_CATEGORY_NETWORK = 'TTS_NETWORK_ERROR';
const ERROR_CATEGORY_PROVIDER = 'TTS_PROVIDER_ERROR';
const ERROR_CATEGORY_STORAGE_FAILED = 'TTS_AUDIO_STORAGE_FAILED';
const ERROR_CATEGORY_EMPTY_TEXT = 'TTS_EMPTY_TEXT';

@Injectable()
export class TtsAudioGenerationService extends TtsGateway {
  private readonly logger = new Logger(TtsAudioGenerationService.name);

  constructor(
    private readonly configService: TtsGatewayConfigService,
    private readonly requestMapper: TtsRequestMapperService,
    private readonly responseMapper: TtsResponseMapperService,
    private readonly audioStorage: TtsAudioStorageService,
    @Optional() private readonly voiceLanguages?: VoiceLanguageSettingsService,
    @Optional() private readonly studentVoices?: StudentVoicePreferencesService,
  ) {
    super();
  }

  async synthesize(request: TtsProviderRequest): Promise<TtsProviderResponse> {
    let completionRequest = this.requestMapper.mapRequest(request);
    // Only Arabic and English are spoken. Replies are mixed-language, so each chunk is voiced by the model for its
    // script: chunks with Arabic letters use the Arabic model/voice (Admin > Voice Languages); the rest use English.
    if (this.voiceLanguages) {
      const { language, settings } = await this.voiceLanguages.resolveTts(request.languageCode);
      const arabicAllowed = settings.allowedLanguages.includes('ar');
      // The student's own voice choice (Settings > Voice) wins over the platform default for each language.
      const chosen = request.studentId && this.studentVoices
        ? await this.studentVoices.resolveForStudent(request.studentId)
        : { en: null, ar: null };
      completionRequest = {
        ...completionRequest,
        voice: chosen.en ?? completionRequest.voice,
        languageCode: language,
        arModel: arabicAllowed ? settings.ttsArModel : null,
        arVoice: arabicAllowed ? chosen.ar ?? settings.ttsArVoice : null,
      };
    }
    // resultsUrl is unused by Groq's synchronous endpoint — kept in the
    // config shape only for a future provider that needs it.
    const { apiKey, baseUrl } = this.configService.getConfig();

    let raw: TtsCompletionResponse | null = null;
    let errorCategory: string | null = null;

    try {
      raw = await this.callProvider(apiKey, baseUrl, completionRequest);
    } catch (error: unknown) {
      errorCategory = this.classifyError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `TtsAudioGenerationService.synthesize: provider call failed, ` +
          `errorCategory=${errorCategory}, message=${errorMessage}`,
      );
    }

    return this.responseMapper.mapResponse({ raw, errorCategory });
  }

  /** One short sample of [voice] for the voice picker (the caller stores it, so each voice is generated once). */
  async synthesizePreview(language: VoiceLang, voice: string, text: string): Promise<Buffer> {
    const { apiKey, baseUrl, model } = this.configService.getConfig();
    const settings = this.voiceLanguages ? await this.voiceLanguages.get() : null;
    const useModel = language === 'ar' ? settings?.ttsArModel : model;
    if (!useModel) throw new BadGatewayException('Arabic speech is not configured.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);
    try {
      return await this.synthesizeChunk(apiKey, baseUrl, useModel, voice, text, controller.signal);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Groq's /openai/v1/audio/speech contract is synchronous:
   *   POST { model, input, voice, response_format: "wav" } -> raw WAV bytes.
   * Splits request.text into <=200-char chunks, synthesizes each in turn,
   * and stitches multi-chunk replies into a single WAV clip.
   */
  private async callProvider(
    apiKey: string,
    baseUrl: string,
    request: TtsCompletionRequest,
  ): Promise<TtsCompletionResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      const chunks = this.chunkText(request.text, TTS_MAX_CHARS_PER_REQUEST).slice(
        0,
        TTS_MAX_CHUNKS,
      );
      if (chunks.length === 0) {
        throw new BadGatewayException(ERROR_CATEGORY_EMPTY_TEXT);
      }

      // Chunks are independent, so synthesize a few at a time instead of one after another; a long
      // script otherwise takes (number of chunks) x the provider latency. Order is preserved.
      const ARABIC_LETTERS = /[\u0600-\u06FF]/;
      const synthesized = await this.mapWithConcurrency(chunks, TTS_CHUNK_CONCURRENCY, async (chunk) => {
        if (ARABIC_LETTERS.test(chunk)) {
          // No Arabic voice configured (or Arabic disabled): never feed Arabic to the English model — skip the chunk
          // so the clip contains only speech the model can actually say (the full text is still shown to the student).
          if (!request.arModel) return null;
          return this.synthesizeChunk(apiKey, baseUrl, request.arModel, request.arVoice || request.voice, chunk, controller.signal);
        }
        return this.synthesizeChunk(apiKey, baseUrl, request.model, request.voice, chunk, controller.signal);
      });
      const wavBuffers = synthesized.filter((b): b is Buffer => b !== null);
      if (wavBuffers.length === 0) {
        throw new BadGatewayException(ERROR_CATEGORY_EMPTY_TEXT);
      }

      const audioBuffer = concatWavBuffers(wavBuffers);
      const audioRef = this.generateAudioRef();
      const contentType = 'audio/wav';
      const durationMs = estimateWavDurationMs(audioBuffer);

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

  private async mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    task: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    const worker = async (): Promise<void> => {
      while (next < items.length) {
        const index = next++;
        results[index] = await task(items[index]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
  }

  private async synthesizeChunk(
    apiKey: string,
    baseUrl: string,
    model: string,
    voice: string,
    text: string,
    signal: AbortSignal,
  ): Promise<Buffer> {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: 'wav',
      }),
      signal,
    });

    if (!response.ok) {
      throw new BadGatewayException(
        `TTS provider returned HTTP ${response.status}: ${await this.safeReadBody(response)}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Splits text into chunks no longer than maxChars, preferring to break
   * after sentence-ending punctuation, then on a word boundary, and only
   * hard-cutting mid-word as a last resort.
   */
  private chunkText(text: string, maxChars: number): string[] {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return [];
    }
    if (trimmed.length <= maxChars) {
      return [trimmed];
    }

    const chunks: string[] = [];
    let remaining = trimmed;

    while (remaining.length > maxChars) {
      const window = remaining.slice(0, maxChars + 1);

      let cut = -1;
      for (const punctuation of ['. ', '! ', '? ']) {
        const idx = window.lastIndexOf(punctuation);
        if (idx > cut) {
          cut = idx + 1; // keep the punctuation mark, drop the trailing space
        }
      }
      if (cut === -1) {
        const spaceIdx = window.lastIndexOf(' ');
        cut = spaceIdx > 0 ? spaceIdx : maxChars;
      }

      chunks.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }

    if (remaining.length > 0) {
      chunks.push(remaining);
    }

    return chunks;
  }

  /**
   * Best-effort read of an error response body for diagnostics (e.g. an
   * invalid API key or a rate-limit message), truncated so a large/
   * unexpected body can't blow up the log line. Never throws — a body
   * read failure falls back to a placeholder.
   */
  private async safeReadBody(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text.length > 500 ? `${text.slice(0, 500)}...` : text || '(empty body)';
    } catch {
      return '(failed to read response body)';
    }
  }

  private generateAudioRef(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `tts_${timestamp}_${random}`;
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
