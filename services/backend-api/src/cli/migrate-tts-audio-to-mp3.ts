// Converts the stored WAV TTS assets to MP3 assets (see tts-audio-mp3-migration.ts).
// Runs inside the backend image, which has ffmpeg and the backend's environment:
//
//   docker compose exec backend-api node dist/cli/migrate-tts-audio-to-mp3.js            # dry run
//   docker compose exec backend-api node dist/cli/migrate-tts-audio-to-mp3.js --apply    # write
//
// Never calls the TTS provider, never changes or deletes WAV rows/files, prints no secrets.
// Exit code: 0 when every asset is migrated (or would be), 2 when any asset was skipped, 1 on error.
import { Pool } from 'pg';

import { BackendConfigService } from '../config/backend-config.service';
import { AudioTranscoderService, MP3_MIME } from '../features/voice-teacher/tts-gateway/persistent/audio-transcoder.service';
import { SupabaseAudioObjectStore } from '../features/voice-teacher/tts-gateway/persistent/supabase-audio-object-store.service';
import {
  LegacyAssetRow,
  migrateTtsAudioToMp3,
  MigrationStore,
  ScriptSource,
} from '../features/voice-teacher/tts-gateway/persistent/tts-audio-mp3-migration';

function poolFor(config: BackendConfigService): Pool {
  // Same TLS rule as DatabaseService: sslmode in the URL is stripped and replaced by an explicit setting.
  const raw = config.database.url;
  const requiresSsl = raw.includes('sslmode=require') || config.nodeEnv === 'production';
  const url = new URL(raw);
  url.searchParams.delete('sslmode');
  return new Pool({ connectionString: url.toString(), max: 2, ssl: requiresSsl ? { rejectUnauthorized: false } : undefined });
}

function pgStore(pool: Pool): MigrationStore {
  return {
    async listReadyWavAssets(voiceConfigHash) {
      const result = await pool.query<LegacyAssetRow>(
        `SELECT id, question_id, language, content_hash, voice_config_hash, storage_path, mime_type, size_bytes, duration_ms
           FROM tts_audio_assets
          WHERE status = 'ready' AND mime_type = 'audio/wav' AND voice_config_hash = $1
          ORDER BY storage_path`,
        [voiceConfigHash],
      );
      return result.rows;
    },
    async findByKey(key) {
      const result = await pool.query<{ status: string }>(
        `SELECT status FROM tts_audio_assets WHERE content_hash = $1 AND language = $2 AND voice_config_hash = $3`,
        [key.contentHash, key.language, key.voiceConfigHash],
      );
      return result.rows[0] ?? null;
    },
    async insertReady({ questionId, key, storagePath, sizeBytes, durationMs }) {
      const result = await pool.query(
        `INSERT INTO tts_audio_assets
           (question_id, language, content_hash, voice_config_hash, status, storage_path, mime_type, size_bytes, duration_ms, attempt_count)
         VALUES ($1, $2, $3, $4, 'ready', $5, $6, $7, $8, 0)
         ON CONFLICT (content_hash, language, voice_config_hash) DO NOTHING
         RETURNING id`,
        [questionId, key.language, key.contentHash, key.voiceConfigHash, storagePath, MP3_MIME, sizeBytes, durationMs],
      );
      return (result.rowCount ?? 0) > 0;
    },
    async listScripts() {
      // The same columns the placement, session, assessment and lesson-asset audio services read.
      const result = await pool.query<ScriptSource>(
        `SELECT 'placement_questions' AS "table", id::text AS id, listening_script AS script
           FROM placement_questions WHERE btrim(coalesce(listening_script, '')) <> ''
         UNION ALL
         SELECT 'question_bank', id::text, listening_script
           FROM question_bank WHERE btrim(coalesce(listening_script, '')) <> ''
         UNION ALL
         SELECT 'lesson_assets', id::text, metadata->>'script'
           FROM lesson_assets WHERE btrim(coalesce(metadata->>'script', '')) <> ''`,
      );
      return result.rows;
    },
  };
}

async function main(): Promise<number> {
  const apply = process.argv.includes('--apply');
  const config = new BackendConfigService();
  const transcoder = new AudioTranscoderService();
  if (!(await transcoder.isAvailable())) {
    console.error('ffmpeg with libmp3lame is not available in this environment; nothing done.');
    return 1;
  }

  const pool = poolFor(config);
  try {
    const { model, voice, baseUrl } = config.ttsProvider;
    const results = await migrateTtsAudioToMp3(
      { store: pgStore(pool), objects: new SupabaseAudioObjectStore(config), transcoder },
      { model, voice, baseUrl },
      { apply },
    );

    console.log(`mode: ${apply ? 'APPLY' : 'dry run (pass --apply to write)'}`);
    console.table(
      results.map((r) => ({
        asset: r.assetId.slice(0, 8),
        source: r.source ?? '-',
        lang: r.language,
        status: r.status,
        wavKB: r.wavBytes ? Math.round(r.wavBytes / 1000) : '-',
        mp3KB: r.mp3Bytes ? Math.round(r.mp3Bytes / 1000) : '-',
        wavMs: r.wavDurationMs ?? '-',
        mp3Ms: r.mp3DurationMs ?? '-',
        convertMs: r.convertMs ?? '-',
        reason: r.reason ?? '',
      })),
    );
    const count = (status: string) => results.filter((r) => r.status === status).length;
    const wavBytes = results.reduce((sum, r) => sum + (r.wavBytes ?? 0), 0);
    const mp3Bytes = results.reduce((sum, r) => sum + (r.mp3Bytes ?? 0), 0);
    console.log(
      JSON.stringify({
        total: results.length,
        migrated: count('migrated'),
        wouldMigrate: count('would_migrate'),
        alreadyMigrated: count('already_migrated'),
        skipped: count('skipped'),
        wavBytes,
        mp3Bytes,
        ratio: mp3Bytes ? Number((wavBytes / mp3Bytes).toFixed(2)) : null,
      }),
    );
    return count('skipped') > 0 ? 2 : 0;
  } finally {
    await pool.end();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(`migration failed: ${error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error'}`);
    process.exit(1);
  },
);
