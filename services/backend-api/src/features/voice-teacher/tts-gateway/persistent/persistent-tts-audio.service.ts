import { randomUUID } from 'crypto';
import { HttpStatus, Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';
import { TtsGatewayConfigService } from '../tts-gateway.config';
import { TTS_GATEWAY, TtsGateway } from '../tts-gateway.interface';
import { TtsSafeFailureService } from '../tts-safe-failure.service';
import { TtsAudioStorageService } from '../tts-audio-storage.service';
import { estimateWavDurationMs, parseWav } from '../wav-audio.util';
import { AudioObjectStoreError, SupabaseAudioObjectStore } from './supabase-audio-object-store.service';
import { TtsAudioAssetRepository } from './tts-audio-asset.repository';
import {
  ResolvedTtsAudio,
  TtsAudioAssetKey,
  TtsAudioAssetRequest,
  TtsAudioAssetRow,
} from './tts-audio-asset.types';
import { assetKeyId, buildAssetKey, buildStoragePath, normalizeLanguage, normalizeScript } from './tts-audio-key.util';

/** Long enough for a full multi-chunk synthesis plus upload; short enough that a crashed instance is replaced quickly. */
const LEASE_SECONDS = 60;
/** How long a request waits for another instance's generation before giving up with a safe failure. */
const WAIT_FOR_OTHER_MS = 30_000;
const POLL_INTERVAL_MS = 500;
/** Optional per-process copy of recent clips (a few tens of MB). Correctness never depends on it. */
const MEMORY_CACHE_MAX = 100;
const WAV_MIME = 'audio/wav';
/**
 * Process-wide cap on simultaneous provider syntheses. Several services warm their audio at startup and
 * students can arrive meanwhile; this keeps the provider from being flooded either way.
 */
const MAX_CONCURRENT_SYNTHESES = 2;

export interface StudentAudioRequest extends TtsAudioAssetRequest {
  /** Names the kind of content, e.g. "placement-question"; becomes part of the student's reference. */
  readonly scope: string;
  /** Id of the question or asset inside that scope. */
  readonly subjectId: string;
}

export interface WarmUpItem {
  /** Placement question id, or null for content that lives in other tables. */
  readonly questionId: string | null;
  readonly script: string;
}

/** Warm-up is a production-only convenience; either variable set to "false" turns it off. */
export function isAudioWarmupEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production' && env.TTS_AUDIO_WARMUP !== 'false' && env.PLACEMENT_AUDIO_WARMUP !== 'false';
}

/**
 * Persistent, shared TTS audio: Supabase Storage holds the file, PostgreSQL holds its metadata and the
 * generation lease. A request is served from (in order) this process's memory, Storage, or a fresh
 * synthesis through the existing TTS gateway, so the provider is called at most once per distinct
 * (script, language, voice configuration), across students, restarts and backend instances.
 */
@Injectable()
export class PersistentTtsAudioService {
  private readonly logger = new Logger(PersistentTtsAudioService.name);
  private readonly memory = new Map<string, ResolvedTtsAudio>();
  private readonly inFlight = new Map<string, Promise<ResolvedTtsAudio | null>>();
  // Identifies this process as a lease holder.
  private readonly instanceId = randomUUID();
  private activeSyntheses = 0;
  private readonly synthesisQueue: Array<() => void> = [];

  constructor(
    private readonly repository: TtsAudioAssetRepository,
    private readonly objectStore: SupabaseAudioObjectStore,
    private readonly gatewayConfig: TtsGatewayConfigService,
    private readonly audioStorage: TtsAudioStorageService,
    private readonly safeFailure: TtsSafeFailureService,
    @Optional() @Inject(TTS_GATEWAY) private readonly gateway: TtsGateway | null,
  ) {}

  /**
   * Returns the audio for this script, generating and persisting it only if no valid asset exists.
   * Resolves null when the provider could not produce audio (nothing is cached for that); throws
   * when persistence itself (database or Storage) fails, so callers never receive a nonexistent asset.
   */
  getAudio(request: TtsAudioAssetRequest): Promise<ResolvedTtsAudio | null> {
    const key = this.keyFor(request);
    const id = assetKeyId(key);

    const cached = this.memory.get(id);
    if (cached) return Promise.resolve(cached);

    const pending = this.inFlight.get(id);
    if (pending) return pending;

    const run = this.resolve(key, request)
      .catch((error: unknown) => {
        throw this.toUnavailable(error);
      })
      .then((audio) => {
        if (audio) this.remember(id, audio);
        return audio;
      })
      .finally(() => this.inFlight.delete(id));
    this.inFlight.set(id, run);
    return run;
  }

  /**
   * Resolves the audio and issues THIS student their own reference to it, in the ownership-checked store
   * the controllers already stream from. The shared file stays private: knowing a Storage path or another
   * student's reference grants nothing. The reference is deterministic (repeat taps overwrite it) and holds
   * the same Buffer, not a copy. Returns null when audio could not be produced.
   */
  async getStudentAudioRef(request: StudentAudioRequest): Promise<string | null> {
    if (!request.studentId || request.studentId.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'A student identity is required to access audio.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const audio = await this.getAudio(request);
    if (!audio) return null;

    const audioRef = `${request.scope}_${request.subjectId}_${request.studentId}_${normalizeLanguage(request.languageCode)}`;
    const stored = await this.audioStorage.storeAudio({
      audioRef,
      audioData: audio.data,
      contentType: audio.contentType,
      durationMs: audio.durationMs,
      sessionId: `${request.scope}:${request.subjectId}`,
      studentId: request.studentId,
    });
    if (!stored.stored) {
      this.logger.warn(`PersistentTtsAudioService: could not stage audio for ${request.scope}`);
      return null;
    }
    return audioRef;
  }

  /**
   * Generates audio for scripts that have no stored asset yet. Existing assets are skipped without being
   * downloaded or regenerated, and one failing item never stops the rest. Returns what it did.
   */
  async warmUp(items: readonly WarmUpItem[], languageCode: string, studentId: string): Promise<{ generated: number; alreadyStored: number; failed: number }> {
    const tally = { generated: 0, alreadyStored: 0, failed: 0 };
    for (const item of items) {
      const request = { questionId: item.questionId, script: item.script, languageCode, studentId };
      try {
        if (await this.hasReadyAsset(request)) {
          tally.alreadyStored += 1;
        } else if (await this.getAudio(request)) {
          tally.generated += 1;
        } else {
          tally.failed += 1;
        }
      } catch {
        tally.failed += 1;
      }
    }
    return tally;
  }

  /** True when a ready asset is recorded. Cheap (no download); used by warm-up to skip finished work. */
  async hasReadyAsset(request: TtsAudioAssetRequest): Promise<boolean> {
    const row = await this.repository.findByKey(this.keyFor(request));
    return row?.status === 'ready';
  }

  private keyFor(request: TtsAudioAssetRequest): TtsAudioAssetKey {
    const { model, voice, baseUrl } = this.gatewayConfig.getConfig();
    return buildAssetKey(request.script, request.languageCode, { model, voice, baseUrl });
  }

  private async resolve(key: TtsAudioAssetKey, request: TtsAudioAssetRequest): Promise<ResolvedTtsAudio | null> {
    const deadline = Date.now() + WAIT_FOR_OTHER_MS;

    for (;;) {
      const row = await this.repository.findByKey(key);

      if (row?.status === 'ready') {
        const audio = await this.readReady(row);
        if (audio) return audio;
        // Metadata says ready but the file is gone or damaged: exactly one instance repairs it.
        this.logger.warn(`PersistentTtsAudioService: Storage object unusable for asset=${row.id}; repairing`);
        const repair = await this.repository.claimRepair(row.id, this.instanceId, LEASE_SECONDS);
        if (repair) return this.generate(repair, key, request);
      } else {
        const claimed = await this.repository.claim(key, request.questionId, this.instanceId, LEASE_SECONDS);
        if (claimed) return this.generate(claimed, key, request);
      }

      // Someone else holds a live lease: wait for their result instead of calling the provider again.
      if (Date.now() >= deadline) {
        this.logger.warn('PersistentTtsAudioService: timed out waiting for another instance to generate audio');
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  /** A metadata row is only a claim: the object must exist, match its recorded size, and parse as audio. */
  private async readReady(row: TtsAudioAssetRow): Promise<ResolvedTtsAudio | null> {
    if (!row.storage_path || !row.mime_type) return null;
    const data = await this.objectStore.get(row.storage_path);
    if (!data || data.length === 0) return null;
    if (row.size_bytes !== null && Number(row.size_bytes) !== data.length) return null;
    if (!this.looksLikeWav(data)) return null;
    return { data, contentType: row.mime_type, durationMs: row.duration_ms };
  }

  private async generate(
    row: TtsAudioAssetRow,
    key: TtsAudioAssetKey,
    request: TtsAudioAssetRequest,
  ): Promise<ResolvedTtsAudio | null> {
    const storagePath = buildStoragePath(key);
    try {
      // A previous attempt may have uploaded the file and then failed to record it. Adopt it rather than paying
      // for TTS again. Only for an asset that was never published: when repairing a row that WAS ready, the
      // file at this path is exactly what was judged unusable, so it must be regenerated, not adopted.
      const neverPublished = row.storage_path === null;
      let data = neverPublished ? await this.objectStore.get(storagePath) : null;
      let durationMs: number | null = null;

      if (data && this.looksLikeWav(data)) {
        durationMs = estimateWavDurationMs(data) || null;
      } else {
        const synthesized = await this.synthesize(key, request);
        if (!synthesized) {
          await this.repository.markFailed(row.id, this.instanceId, 'TTS_FAILED');
          return null;
        }
        data = synthesized.data;
        durationMs = synthesized.durationMs;
        await this.objectStore.put(storagePath, data, WAV_MIME);
      }

      const published = await this.repository.markReady(row.id, {
        storagePath,
        mimeType: WAV_MIME,
        sizeBytes: data.length,
        durationMs,
      });
      if (!published) {
        // Lost the lease and another instance already finished the same deterministic asset. Fine.
        this.logger.log(`PersistentTtsAudioService: asset=${row.id} was already published by another instance`);
      }
      return { data, contentType: WAV_MIME, durationMs };
    } catch (error) {
      const category = error instanceof AudioObjectStoreError ? `STORAGE_${error.operation.toUpperCase()}_FAILED` : 'PERSISTENCE_FAILED';
      await this.repository.markFailed(row.id, this.instanceId, category).catch(() => undefined);
      this.logger.error(`PersistentTtsAudioService: ${category} for asset=${row.id}`);
      // Surface the failure: the caller must not return a reference to an asset that does not exist.
      throw this.toUnavailable(error);
    }
  }

  /** Persistence problems (database or Storage) become one safe, retryable error; details stay in the logs. */
  private toUnavailable(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof AudioObjectStoreError) {
      this.logger.error(`PersistentTtsAudioService: Storage ${error.operation} failed`);
    } else {
      this.logger.error(`PersistentTtsAudioService: persistence error (${error instanceof Error ? error.name : 'unknown'})`);
    }
    return new AppError({
      code: ApiErrorCode.SERVICE_UNAVAILABLE,
      message: 'Audio is temporarily unavailable. Please try again.',
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    });
  }

  private async synthesize(
    key: TtsAudioAssetKey,
    request: TtsAudioAssetRequest,
  ): Promise<{ data: Buffer; durationMs: number | null } | null> {
    if (!this.gateway) {
      this.logger.warn('PersistentTtsAudioService: TTS_GATEWAY not bound, cannot synthesize');
      return null;
    }

    const gateway = this.gateway;
    const response = await this.withSynthesisSlot(() =>
      gateway.synthesize({
        // The normalized script is what the hash was computed from, so the asset is a pure function of its key.
        text: normalizeScript(request.script),
        languageCode: key.language,
        sessionId: `tts-asset:${key.contentHash.slice(0, 12)}`,
        studentId: request.studentId,
      }),
    );

    const outcome = this.safeFailure.toSafeOutcome(response);
    if (outcome.isFallback || !outcome.audioRef) {
      this.logger.warn('PersistentTtsAudioService: synthesis failed; nothing cached');
      return null;
    }

    // The gateway hands its output over through the existing in-memory store, scoped to the requester.
    const audio = await this.audioStorage.retrieveAudio(outcome.audioRef, request.studentId);
    if (!audio || audio.data.length === 0 || !this.looksLikeWav(audio.data)) {
      this.logger.warn('PersistentTtsAudioService: gateway returned no usable audio; nothing cached');
      return null;
    }
    return { data: audio.data, durationMs: response.durationMs ?? (estimateWavDurationMs(audio.data) || null) };
  }

  private async withSynthesisSlot<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeSyntheses >= MAX_CONCURRENT_SYNTHESES) {
      // The releasing task hands its slot straight to us, so the count is already ours.
      await new Promise<void>((resolve) => this.synthesisQueue.push(resolve));
    } else {
      this.activeSyntheses += 1;
    }
    try {
      return await task();
    } finally {
      const next = this.synthesisQueue.shift();
      if (next) next();
      else this.activeSyntheses -= 1;
    }
  }

  /** Parses as WAV and the RIFF header's declared size matches the bytes we hold (catches truncation). */
  private looksLikeWav(data: Buffer): boolean {
    try {
      parseWav(data);
      return data.readUInt32LE(4) + 8 === data.length;
    } catch {
      return false;
    }
  }

  private remember(id: string, audio: ResolvedTtsAudio): void {
    this.memory.set(id, audio);
    if (this.memory.size > MEMORY_CACHE_MAX) {
      this.memory.delete(this.memory.keys().next().value as string);
    }
  }
}
