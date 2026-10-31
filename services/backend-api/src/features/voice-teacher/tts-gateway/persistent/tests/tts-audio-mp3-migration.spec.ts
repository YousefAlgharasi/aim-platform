import { createHash } from 'crypto';

import { AudioTranscodeError } from '../audio-transcoder.service';
import { buildAssetKey, buildStoragePath, hashVoiceConfig, normalizeScript } from '../tts-audio-key.util';
import { LegacyAssetRow, migrateTtsAudioToMp3, MigrationStore, ScriptSource } from '../tts-audio-mp3-migration';
import { FakeObjectStore, FakeTranscoder, makeWav } from './fakes';

const VOICE = { model: 'orpheus', voice: 'hannah', baseUrl: 'https://api.groq.com/openai/v1/audio/speech' };
const WAV_HASH = hashVoiceConfig(VOICE, 'wav');
const MP3_HASH = hashVoiceConfig(VOICE, 'mp3');
const hashOf = (script: string) => createHash('sha256').update(normalizeScript(script), 'utf8').digest('hex');

class FakeStore implements MigrationStore {
  rows: Array<LegacyAssetRow & { status: string }> = [];
  scripts: ScriptSource[] = [];
  inserted: Array<Parameters<MigrationStore['insertReady']>[0]> = [];

  async listReadyWavAssets(voiceConfigHash: string) {
    return this.rows.filter((r) => r.status === 'ready' && r.mime_type === 'audio/wav' && r.voice_config_hash === voiceConfigHash);
  }
  async findByKey(key: { contentHash: string; language: string; voiceConfigHash: string }) {
    return this.rows.find((r) => r.content_hash === key.contentHash && r.language === key.language && r.voice_config_hash === key.voiceConfigHash) ?? null;
  }
  async insertReady(row: Parameters<MigrationStore['insertReady']>[0]) {
    if (await this.findByKey(row.key)) return false;
    this.inserted.push(row);
    this.rows.push({
      id: `new-${this.inserted.length}`,
      question_id: row.questionId,
      language: row.key.language,
      content_hash: row.key.contentHash,
      voice_config_hash: row.key.voiceConfigHash,
      storage_path: row.storagePath,
      mime_type: 'audio/mpeg',
      size_bytes: row.sizeBytes,
      duration_ms: row.durationMs,
      status: 'ready',
    });
    return true;
  }
  async listScripts() {
    return this.scripts;
  }
}

/** One legacy WAV asset for `script`, stored and recorded exactly as the WAV-era backend did. */
function seed(store: FakeStore, objects: FakeObjectStore, script: string, opts: { questionId?: string | null; table?: string; wav?: Buffer } = {}) {
  const key = buildAssetKey(script, 'en', VOICE, 'wav');
  const path = buildStoragePath(key, 'wav');
  const wav = opts.wav ?? makeWav(3, 24000 * 2); // ~0.54 s at the fakes' 44.1 kHz mono 16-bit
  objects.objects.set(path, wav);
  const row = {
    id: `wav-${store.rows.length + 1}`,
    question_id: opts.questionId ?? null,
    language: 'en',
    content_hash: key.contentHash,
    voice_config_hash: key.voiceConfigHash,
    storage_path: path,
    mime_type: 'audio/wav',
    size_bytes: wav.length,
    duration_ms: 1000,
    status: 'ready',
  };
  store.rows.push(row);
  store.scripts.push({ table: opts.table ?? 'placement_questions', id: opts.questionId ?? `src-${store.rows.length}`, script });
  return { row, path, wav };
}

/** Decodes to a WAV of the same length as the source, like the real round trip. */
class RoundTripTranscoder extends FakeTranscoder {
  decodedLength: number | null = null;
  async mp3ToWav(mp3: Buffer): Promise<Buffer> {
    this.mp3ToWavCalls += 1;
    if (this.failWith) throw new AudioTranscodeError(this.failWith);
    return makeWav(mp3[4] ?? 1, this.decodedLength ?? 24000 * 2);
  }
}

function setup() {
  const store = new FakeStore();
  const objects = new FakeObjectStore();
  const transcoder = new RoundTripTranscoder();
  const run = (apply: boolean) => migrateTtsAudioToMp3({ store, objects, transcoder }, VOICE, { apply });
  return { store, objects, transcoder, run };
}

describe('migrateTtsAudioToMp3', () => {
  it('dry run converts and validates in memory but writes nothing', async () => {
    const t = setup();
    seed(t.store, t.objects, 'Good evening.', { questionId: 'q-1' });
    const before = new Map(t.objects.objects);

    const [result] = await t.run(false);
    expect(result.status).toBe('would_migrate');
    expect(result.source).toBe('placement_questions:q-1');
    expect(result.mp3Bytes).toBeGreaterThan(0);
    expect(t.objects.putCalls).toBe(0);
    expect(t.store.inserted).toHaveLength(0);
    expect(t.objects.objects).toEqual(before);
  });

  it('apply uploads the MP3 under its new key and records it, leaving the WAV row and file untouched', async () => {
    const t = setup();
    const { row, path, wav } = seed(t.store, t.objects, 'Good evening.', { questionId: 'q-1' });
    const rowBefore = { ...row };

    const [result] = await t.run(true);
    expect(result.status).toBe('migrated');

    const mp3Key = { contentHash: row.content_hash, language: 'en', voiceConfigHash: MP3_HASH };
    expect(result.mp3Path).toBe(buildStoragePath(mp3Key, 'mp3'));
    expect(t.store.inserted).toEqual([
      { questionId: 'q-1', key: mp3Key, storagePath: result.mp3Path, sizeBytes: result.mp3Bytes, durationMs: 1000 },
    ]);
    // The WAV-era backend keeps finding its asset exactly as before.
    expect(t.objects.objects.get(path)?.equals(wav)).toBe(true);
    expect(t.store.rows.find((r) => r.id === row.id)).toEqual(rowBefore);
  });

  it('the migrated asset is exactly the key the new backend looks up (no regeneration after deploy)', async () => {
    const t = setup();
    seed(t.store, t.objects, '  Good   evening. '); // cosmetic whitespace normalizes to the same key
    await t.run(true);
    const lookedUp = buildAssetKey('Good evening.', 'en', VOICE);
    expect(await t.store.findByKey(lookedUp)).toMatchObject({ status: 'ready', mime_type: 'audio/mpeg' });
  });

  it('is idempotent: a second run reports already_migrated and writes nothing', async () => {
    const t = setup();
    seed(t.store, t.objects, 'Good evening.');
    await t.run(true);
    const puts = t.objects.putCalls;

    const [again] = await t.run(true);
    expect(again.status).toBe('already_migrated');
    expect(t.objects.putCalls).toBe(puts);
    expect(t.store.inserted).toHaveLength(1);
  });

  it('accepts scripts from question_bank and lesson_assets for rows without a question link', async () => {
    const t = setup();
    seed(t.store, t.objects, 'Repeat after me.', { table: 'lesson_assets' });
    seed(t.store, t.objects, 'How much is this shirt?', { table: 'question_bank' });
    const results = await t.run(false);
    expect(results.map((r) => r.status)).toEqual(['would_migrate', 'would_migrate']);
    expect(results.map((r) => r.source?.split(':')[0]).sort()).toEqual(['lesson_assets', 'question_bank']);
  });

  describe('skips (and never writes) when validation fails', () => {
    const expectSkipped = async (t: ReturnType<typeof setup>, reason: RegExp) => {
      const [result] = await t.run(true);
      expect(result.status).toBe('skipped');
      expect(result.reason).toMatch(reason);
      expect(t.store.inserted).toHaveLength(0);
    };

    it('content hash belongs to no current script', async () => {
      const t = setup();
      seed(t.store, t.objects, 'Good evening.');
      t.store.scripts = [];
      await expectSkipped(t, /no current script/);
    });

    it('linked question does not have this script', async () => {
      const t = setup();
      seed(t.store, t.objects, 'Good evening.', { questionId: 'q-1' });
      t.store.scripts = [{ table: 'placement_questions', id: 'q-other', script: 'Good evening.' }];
      await expectSkipped(t, /linked placement question/);
    });

    it('storage path does not match the key', async () => {
      const t = setup();
      const { row, path } = seed(t.store, t.objects, 'Good evening.');
      Object.assign(row, { storage_path: 'tts/en/elsewhere.wav' });
      t.objects.objects.set('tts/en/elsewhere.wav', t.objects.objects.get(path) as Buffer);
      await expectSkipped(t, /storage path/);
    });

    it('WAV object is missing, truncated, or not the recorded size', async () => {
      const missing = setup();
      const a = seed(missing.store, missing.objects, 'One.');
      missing.objects.objects.delete(a.path);
      await expectSkipped(missing, /missing/);

      const truncated = setup();
      const b = seed(truncated.store, truncated.objects, 'Two.');
      const cut = (truncated.objects.objects.get(b.path) as Buffer).subarray(0, 500);
      truncated.objects.objects.set(b.path, cut);
      Object.assign(b.row, { size_bytes: cut.length });
      await expectSkipped(truncated, /complete WAV/);

      const resized = setup();
      const c = seed(resized.store, resized.objects, 'Three.');
      Object.assign(c.row, { size_bytes: 12 });
      await expectSkipped(resized, /size differs/);
    });

    it('conversion fails', async () => {
      const t = setup();
      seed(t.store, t.objects, 'Good evening.');
      t.transcoder.failWith = 'unavailable';
      await expectSkipped(t, /conversion failed/);
      expect(t.objects.putCalls).toBe(0);
    });

    it('decoded MP3 is a different length than the source', async () => {
      const t = setup();
      seed(t.store, t.objects, 'Good evening.');
      t.transcoder.decodedLength = 24000 * 4;
      await expectSkipped(t, /duration differs/);
      expect(t.objects.putCalls).toBe(0);
    });

    it('uploaded MP3 does not read back identically (and the row is not published)', async () => {
      const t = setup();
      seed(t.store, t.objects, 'Good evening.');
      const put = t.objects.put.bind(t.objects);
      t.objects.put = async (path: string, data: Buffer) => put(path, Buffer.concat([data, Buffer.from('x')]));
      await expectSkipped(t, /read back/);
    });
  });

  it('ignores assets from another voice configuration and assets that are already MP3', async () => {
    const t = setup();
    const { row } = seed(t.store, t.objects, 'Good evening.');
    Object.assign(row, { voice_config_hash: 'other' });
    seed(t.store, t.objects, 'Second clip.');
    Object.assign(t.store.rows[1], { mime_type: 'audio/mpeg' });
    expect(await t.run(true)).toEqual([]);
    expect(WAV_HASH).not.toBe(MP3_HASH);
  });
});
