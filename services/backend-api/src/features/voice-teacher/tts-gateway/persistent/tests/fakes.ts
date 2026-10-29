import { TtsAudioStorageService } from '../../tts-audio-storage.service';
import { TtsSafeFailureService } from '../../tts-safe-failure.service';
import { buildWav } from '../../wav-audio.util';
import { PersistentTtsAudioService } from '../persistent-tts-audio.service';
import { AudioObjectStoreError } from '../supabase-audio-object-store.service';
import {
  TtsAudioAssetKey,
  TtsAudioAssetReadyInput,
  TtsAudioAssetRow,
} from '../tts-audio-asset.types';

const FMT = Buffer.from([1, 0, 1, 0, 0x44, 0xac, 0, 0, 0x88, 0x58, 1, 0, 2, 0, 16, 0]);
export const makeWav = (marker = 1, length = 2000): Buffer => buildWav(FMT, Buffer.alloc(length, marker));

/** Same atomic claim/lease semantics as the SQL in TtsAudioAssetRepository, over shared in-memory state. */
export class FakeAssetRepository {
  readonly rows = new Map<string, TtsAudioAssetRow & { lease_live: boolean }>();
  failNextMarkReady = false;
  private seq = 0;

  private idOf = (k: TtsAudioAssetKey) => `${k.language}|${k.contentHash}|${k.voiceConfigHash}`;

  async findByKey(key: TtsAudioAssetKey) {
    await Promise.resolve();
    return this.rows.get(this.idOf(key)) ?? null;
  }

  async claim(key: TtsAudioAssetKey, questionId: string | null, owner: string) {
    await Promise.resolve();
    const id = this.idOf(key);
    const existing = this.rows.get(id);
    if (!existing) {
      const row = {
        id: `asset-${++this.seq}`,
        question_id: questionId,
        language: key.language,
        content_hash: key.contentHash,
        voice_config_hash: key.voiceConfigHash,
        status: 'generating' as const,
        storage_path: null,
        mime_type: null,
        size_bytes: null,
        duration_ms: null,
        lease_owner: owner,
        lease_expires_at: null,
        attempt_count: 1,
        last_error: null,
        lease_live: true,
      };
      this.rows.set(id, row);
      return row;
    }
    if (existing.status === 'failed' || (existing.status === 'generating' && !existing.lease_live)) {
      Object.assign(existing, { status: 'generating', lease_owner: owner, lease_live: true, attempt_count: existing.attempt_count + 1, last_error: null });
      return existing;
    }
    return null;
  }

  async claimRepair(rowId: string, owner: string) {
    await Promise.resolve();
    const row = [...this.rows.values()].find((r) => r.id === rowId);
    if (!row || row.status !== 'ready') return null;
    Object.assign(row, { status: 'generating', lease_owner: owner, lease_live: true, last_error: 'STORAGE_OBJECT_UNUSABLE' });
    return row;
  }

  async markReady(rowId: string, input: TtsAudioAssetReadyInput) {
    await Promise.resolve();
    if (this.failNextMarkReady) {
      this.failNextMarkReady = false;
      throw new Error('db down');
    }
    const row = [...this.rows.values()].find((r) => r.id === rowId);
    if (!row || row.status !== 'generating') return false;
    Object.assign(row, { status: 'ready', storage_path: input.storagePath, mime_type: input.mimeType, size_bytes: input.sizeBytes, duration_ms: input.durationMs, lease_owner: null, lease_live: false });
    return true;
  }

  async markFailed(rowId: string, owner: string, category: string) {
    await Promise.resolve();
    const row = [...this.rows.values()].find((r) => r.id === rowId);
    if (row && row.status === 'generating' && row.lease_owner === owner) {
      Object.assign(row, { status: 'failed', lease_owner: null, lease_live: false, last_error: category });
    }
  }

  /** Simulates a crashed instance whose lease ran out. */
  expireLeases() {
    for (const row of this.rows.values()) if (row.status === 'generating') row.lease_live = false;
  }
}

export class FakeObjectStore {
  readonly objects = new Map<string, Buffer>();
  putCalls = 0;
  failPut = false;
  failGet = false;

  async put(path: string, data: Buffer) {
    this.putCalls += 1;
    if (this.failPut) throw new AudioObjectStoreError('upload', 500);
    this.objects.set(path, data);
  }

  async get(path: string) {
    if (this.failGet) throw new AudioObjectStoreError('download', 500);
    return this.objects.get(path) ?? null;
  }
}

export interface Harness {
  repo: FakeAssetRepository;
  store: FakeObjectStore;
  audioStorage: TtsAudioStorageService;
  config: { model: string; voice: string; baseUrl: string };
  gateway: { synthesize: jest.Mock };
  /** A new backend process sharing the same database and Storage (fresh memory, own lease id). */
  newInstance: () => PersistentTtsAudioService;
}

/** `gatewayDelayMs` makes synthesis slow enough for concurrent requests to overlap. */
export function buildHarness(options: { gatewayDelayMs?: number; failTts?: () => boolean } = {}): Harness {
  const repo = new FakeAssetRepository();
  const store = new FakeObjectStore();
  const audioStorage = new TtsAudioStorageService();
  const config = { model: 'orpheus', voice: 'hannah', baseUrl: 'https://api.groq.com/openai/v1/audio/speech' };
  let counter = 0;

  const gateway = {
    synthesize: jest.fn(async (req: { studentId: string; sessionId: string }) => {
      if (options.gatewayDelayMs) await new Promise((r) => setTimeout(r, options.gatewayDelayMs));
      if (options.failTts?.()) return { status: 'error', audioRef: null, durationMs: null, contentType: null };
      counter += 1;
      const audioRef = `tts_${counter}`;
      await audioStorage.storeAudio({ audioRef, audioData: makeWav(counter), contentType: 'audio/wav', durationMs: 1000, sessionId: req.sessionId, studentId: req.studentId });
      return { status: 'success', audioRef, durationMs: 1000, contentType: 'audio/wav' };
    }),
  };

  const newInstance = () =>
    new PersistentTtsAudioService(
      repo as any,
      store as any,
      { getConfig: () => config } as any,
      audioStorage,
      new TtsSafeFailureService(),
      gateway as any,
    );

  return { repo, store, audioStorage, config, gateway, newInstance };
}
