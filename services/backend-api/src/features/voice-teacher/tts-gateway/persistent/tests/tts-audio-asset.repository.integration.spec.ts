// Runs the REAL migration and the repository's real SQL against PostgreSQL.
// Skipped unless TEST_DATABASE_URL points at a disposable database:
//   TEST_DATABASE_URL=postgres://postgres:pw@localhost:5432/postgres npx jest tts-audio-asset.repository.integration
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

import { TtsAudioAssetRepository } from '../tts-audio-asset.repository';
import { TtsAudioAssetKey } from '../tts-audio-asset.types';

const url = process.env.TEST_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb('TtsAudioAssetRepository + migration (PostgreSQL)', () => {
  let pool: Pool;
  let repo: TtsAudioAssetRepository;
  let migrationSql = '';
  let n = 0;
  const newKey = (): TtsAudioAssetKey => ({ contentHash: `c${++n}`.padEnd(64, '0'), language: 'en', voiceConfigHash: 'v'.padEnd(64, '0') });
  const ready = (p: string) => ({ storagePath: p, mimeType: 'audio/wav', sizeBytes: 1234, durationMs: 900 });

  beforeAll(async () => {
    migrationSql = readFileSync(
      join(__dirname, '../../../../../../prisma/migrations/20261028090000_create_tts_audio_assets/migration.sql'),
      'utf8',
    );
    pool = new Pool({ connectionString: url, max: 10 });
    await pool.query('DROP TABLE IF EXISTS tts_audio_assets; DROP TABLE IF EXISTS placement_questions;');
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await pool.query('CREATE TABLE placement_questions (id uuid PRIMARY KEY DEFAULT gen_random_uuid())');
    await pool.query(migrationSql);
    repo = new TtsAudioAssetRepository({ query: (t: string, v?: unknown[]) => pool.query(t, v as any[]) } as any);
  });
  afterAll(async () => {
    await pool.end();
  });

  it('the migration is idempotent (safe to re-run)', async () => {
    await expect(pool.query(migrationSql)).resolves.toBeDefined();
  });

  it('lets exactly one of many concurrent claimants generate', async () => {
    const key = newKey();
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => repo.claim(key, null, `owner-${i}`, 60)));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect((await pool.query('SELECT count(*)::int AS n FROM tts_audio_assets WHERE content_hash = $1', [key.contentHash])).rows[0].n).toBe(1);
  });

  it('refuses a second claim while the lease is live, and allows it once it expires', async () => {
    const key = newKey();
    const first = await repo.claim(key, null, 'a', 60);
    expect(await repo.claim(key, null, 'b', 60)).toBeNull();

    await pool.query(`UPDATE tts_audio_assets SET lease_expires_at = now() - interval '1 second' WHERE id = $1`, [first!.id]);
    const takeover = await repo.claim(key, null, 'b', 60);
    expect(takeover?.lease_owner).toBe('b');
    expect(takeover?.attempt_count).toBe(2);
  });

  it('publishes a ready asset and never re-claims it', async () => {
    const key = newKey();
    const row = await repo.claim(key, null, 'a', 60);
    expect(await repo.markReady(row!.id, ready('tts/en/x.wav'))).toBe(true);

    const found = await repo.findByKey(key);
    expect(found).toMatchObject({ status: 'ready', storage_path: 'tts/en/x.wav', mime_type: 'audio/wav', lease_owner: null });
    expect(await repo.claim(key, null, 'b', 60)).toBeNull();
    expect(await repo.markReady(row!.id, ready('tts/en/other.wav'))).toBe(false); // already published
  });

  it('records a failure without a storage path, and the next claim retries', async () => {
    const key = newKey();
    const row = await repo.claim(key, null, 'a', 60);
    await repo.markFailed(row!.id, 'someone-else', 'NOPE'); // not the lease holder: ignored
    expect((await repo.findByKey(key))?.status).toBe('generating');

    await repo.markFailed(row!.id, 'a', 'TTS_FAILED');
    const failed = await repo.findByKey(key);
    expect(failed).toMatchObject({ status: 'failed', storage_path: null, last_error: 'TTS_FAILED', lease_owner: null });
    expect((await repo.claim(key, null, 'b', 60))?.lease_owner).toBe('b');
  });

  it('lets exactly one of many concurrent instances claim a repair', async () => {
    const key = newKey();
    const row = await repo.claim(key, null, 'a', 60);
    await repo.markReady(row!.id, ready('tts/en/repair.wav'));
    const results = await Promise.all(Array.from({ length: 15 }, (_, i) => repo.claimRepair(row!.id, `o-${i}`, 60)));
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('the schema itself rejects a ready row with no file, and a duplicate storage path', async () => {
    const key = newKey();
    const row = await repo.claim(key, null, 'a', 60);
    await expect(pool.query(`UPDATE tts_audio_assets SET status = 'ready' WHERE id = $1`, [row!.id])).rejects.toThrow(/ready_has_file/);

    const other = await repo.claim(newKey(), null, 'a', 60);
    await repo.markReady(other!.id, ready('tts/en/dup.wav'));
    const third = await repo.claim(newKey(), null, 'a', 60);
    await expect(repo.markReady(third!.id, ready('tts/en/dup.wav'))).rejects.toThrow(/storage_path_unique/);
  });

  it('keeps the same script distinct per language and per voice configuration', async () => {
    const base = newKey();
    const ar = { ...base, language: 'ar' };
    const otherVoice = { ...base, voiceConfigHash: 'w'.padEnd(64, '0') };
    for (const key of [base, ar, otherVoice]) expect(await repo.claim(key, null, 'a', 60)).not.toBeNull();
    expect((await pool.query('SELECT count(*)::int AS n FROM tts_audio_assets WHERE content_hash = $1', [base.contentHash])).rows[0].n).toBe(3);
  });

  it('is deny-by-default for client roles (RLS on, no policies)', async () => {
    const r = await pool.query(`SELECT relrowsecurity FROM pg_class WHERE relname = 'tts_audio_assets'`);
    expect(r.rows[0].relrowsecurity).toBe(true);
    expect((await pool.query(`SELECT count(*)::int AS n FROM pg_policies WHERE tablename = 'tts_audio_assets'`)).rows[0].n).toBe(0);
  });
});
