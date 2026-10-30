import { createHash } from 'crypto';

import { estimateWavDurationMs, parseWav } from '../wav-audio.util';
import { MP3_MIME } from './audio-transcoder.service';
import { looksLikeMp3 } from './mp3-audio.util';
import { TtsAudioAssetKey } from './tts-audio-asset.types';
import { buildStoragePath, hashVoiceConfig, normalizeLanguage, normalizeScript, VoiceConfigInput } from './tts-audio-key.util';

/**
 * Converts ready WAV assets to MP3 assets under their new (MP3) keys without calling the TTS provider.
 * Additive only: WAV rows and files are never modified or deleted, so the previous backend version keeps
 * working and rollback needs no data change. Re-running is safe (already-migrated assets are skipped).
 */

const WAV_MIME = 'audio/wav';
/** Decoded MP3 may differ from the source by the encoder's frame padding; anything more means damage. */
const MAX_DURATION_DRIFT_MS = 150;

export interface LegacyAssetRow {
  readonly id: string;
  readonly question_id: string | null;
  readonly language: string;
  readonly content_hash: string;
  readonly voice_config_hash: string;
  readonly storage_path: string;
  readonly mime_type: string;
  readonly size_bytes: string | number;
  readonly duration_ms: number | null;
}

export interface ScriptSource {
  /** e.g. "placement_questions", "question_bank", "lesson_assets". */
  readonly table: string;
  readonly id: string;
  readonly script: string;
}

export interface MigrationStore {
  /** Ready WAV assets produced with the given voice configuration hash. */
  listReadyWavAssets(voiceConfigHash: string): Promise<LegacyAssetRow[]>;
  findByKey(key: TtsAudioAssetKey): Promise<{ status: string } | null>;
  /** Inserts a ready row; false when a row for this key already exists (nothing changed). */
  insertReady(row: {
    questionId: string | null;
    key: TtsAudioAssetKey;
    storagePath: string;
    sizeBytes: number;
    durationMs: number | null;
  }): Promise<boolean>;
  /** Every script the audio services can synthesize, from the same columns they read. */
  listScripts(): Promise<ScriptSource[]>;
}

export interface MigrationObjectStore {
  get(path: string): Promise<Buffer | null>;
  put(path: string, data: Buffer, contentType: string): Promise<void>;
}

export interface MigrationTranscoder {
  wavToMp3(wav: Buffer): Promise<Buffer>;
  mp3ToWav(mp3: Buffer): Promise<Buffer>;
}

export type MigrationStatus = 'migrated' | 'would_migrate' | 'already_migrated' | 'skipped';

export interface MigrationResult {
  readonly assetId: string;
  readonly wavPath: string;
  readonly mp3Path: string | null;
  readonly language: string;
  readonly questionId: string | null;
  /** Where the script that hashes to this asset lives, e.g. "placement_questions:<id>". */
  readonly source: string | null;
  readonly status: MigrationStatus;
  readonly reason?: string;
  readonly wavBytes?: number;
  readonly mp3Bytes?: number;
  readonly wavDurationMs?: number;
  readonly mp3DurationMs?: number;
  readonly convertMs?: number;
}

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
const sha256Bytes = (value: Buffer) => createHash('sha256').update(value).digest('hex');

export async function migrateTtsAudioToMp3(
  deps: { store: MigrationStore; objects: MigrationObjectStore; transcoder: MigrationTranscoder },
  voice: VoiceConfigInput,
  options: { apply: boolean },
): Promise<MigrationResult[]> {
  const wavHash = hashVoiceConfig(voice, 'wav');
  const mp3Hash = hashVoiceConfig(voice, 'mp3');

  // content hash -> where that script lives, computed exactly as the services key their assets.
  const sources = new Map<string, ScriptSource[]>();
  for (const source of await deps.store.listScripts()) {
    const hash = sha256(normalizeScript(source.script));
    sources.set(hash, [...(sources.get(hash) ?? []), source]);
  }

  const results: MigrationResult[] = [];
  for (const row of await deps.store.listReadyWavAssets(wavHash)) {
    results.push(await migrateOne(deps, row, wavHash, mp3Hash, sources, options.apply));
  }
  return results;
}

async function migrateOne(
  deps: { store: MigrationStore; objects: MigrationObjectStore; transcoder: MigrationTranscoder },
  row: LegacyAssetRow,
  wavHash: string,
  mp3Hash: string,
  sources: Map<string, ScriptSource[]>,
  apply: boolean,
): Promise<MigrationResult> {
  const base = { assetId: row.id, wavPath: row.storage_path, language: row.language, questionId: row.question_id };
  const skip = (reason: string, extra: Partial<MigrationResult> = {}): MigrationResult => ({
    ...base,
    mp3Path: null,
    source: null,
    status: 'skipped',
    reason,
    ...extra,
  });

  // 1. Cache key: produced by the current voice configuration, as WAV, with a canonical language.
  if (row.voice_config_hash !== wavHash || row.mime_type !== WAV_MIME) return skip('not a WAV asset of the current voice configuration');
  if (normalizeLanguage(row.language) !== row.language) return skip('language is not in canonical form');
  if (row.storage_path !== buildStoragePath({ contentHash: row.content_hash, language: row.language, voiceConfigHash: wavHash }, 'wav')) {
    return skip('storage path does not match the asset key');
  }

  // 2. Content: the hash must belong to a script that exists today, and to the linked question if any.
  const matches = sources.get(row.content_hash) ?? [];
  if (matches.length === 0) return skip('content hash matches no current script');
  const linked = row.question_id ? matches.find((m) => m.table === 'placement_questions' && m.id === row.question_id) : matches[0];
  if (!linked) return skip('content hash does not match the linked placement question');
  const source = `${linked.table}:${linked.id}`;

  const key: TtsAudioAssetKey = { contentHash: row.content_hash, language: row.language, voiceConfigHash: mp3Hash };
  const mp3Path = buildStoragePath(key, 'mp3');

  const existing = await deps.store.findByKey(key);
  if (existing?.status === 'ready') return { ...base, mp3Path, source, status: 'already_migrated' };
  if (existing) return skip(`an MP3 row for this key already exists in state "${existing.status}"`, { source });

  // 3. Source file: present, the recorded size, and a structurally complete WAV.
  const wav = await deps.objects.get(row.storage_path);
  if (!wav) return skip('WAV object is missing', { source });
  if (wav.length !== Number(row.size_bytes)) return skip('WAV size differs from its metadata', { source });
  try {
    parseWav(wav);
    if (wav.readUInt32LE(4) + 8 !== wav.length) throw new Error('truncated');
  } catch {
    return skip('WAV object is not a complete WAV file', { source });
  }
  const wavDurationMs = estimateWavDurationMs(wav);

  // 4. Convert and prove the result decodes back to the same length of speech.
  const startedAt = Date.now();
  let mp3: Buffer;
  let mp3DurationMs: number;
  try {
    mp3 = await deps.transcoder.wavToMp3(wav);
    const decoded = await deps.transcoder.mp3ToWav(mp3);
    mp3DurationMs = estimateWavDurationMs(decoded);
  } catch (error) {
    return skip(`conversion failed (${error instanceof Error ? error.message : 'unknown'})`, { source });
  }
  const convertMs = Date.now() - startedAt;
  const measured = { source, wavBytes: wav.length, mp3Bytes: mp3.length, wavDurationMs, mp3DurationMs, convertMs };
  if (!looksLikeMp3(mp3)) return skip('converted file is not a valid MP3', measured);
  if (Math.abs(mp3DurationMs - wavDurationMs) > MAX_DURATION_DRIFT_MS) return skip('converted duration differs from the source', measured);

  if (!apply) return { ...base, mp3Path, status: 'would_migrate', ...measured };

  // 5. Upload, read back byte-for-byte, and only then publish the metadata row.
  await deps.objects.put(mp3Path, mp3, MP3_MIME);
  const readBack = await deps.objects.get(mp3Path);
  if (!readBack || sha256Bytes(readBack) !== sha256Bytes(mp3)) return skip('uploaded MP3 did not read back identically', { ...measured, mp3Path });

  const inserted = await deps.store.insertReady({
    questionId: row.question_id,
    key,
    storagePath: mp3Path,
    sizeBytes: mp3.length,
    durationMs: row.duration_ms ?? wavDurationMs,
  });
  return { ...base, mp3Path, status: inserted ? 'migrated' : 'already_migrated', ...measured };
}
