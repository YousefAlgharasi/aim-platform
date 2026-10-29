# Persistent TTS audio (Supabase Storage)

Generated listening audio is stored in a **private Supabase Storage
bucket** and tracked in PostgreSQL, so it is generated once and then shared by every student, every
restart and every backend instance. It covers placement listening questions, practice-session and
assessment listening questions (`question_bank`), and lesson audio assets (`lesson_assets`). Voice Teacher
chat audio is a different feature and is unchanged.

## How a request is served

1. The controller's existing guards authorize the student (role + placement permission).
2. The content's service (`PlacementQuestionAudioService`, `SessionQuestionAudioService`,
   `AssessmentQuestionAudioService`, `LessonAssetAudioService`) reads the authored script and asks
   `PersistentTtsAudioService` for the audio.
3. The asset key is `(sha256(normalized script), language, sha256(voice config))`. The voice config hash
   covers provider host, model, voice, output format and a pipeline version.
4. Lookup order: this process's memory (optional) -> `tts_audio_assets` row + Storage object -> generate.
   A `ready` row is only a claim: the object must exist, match `size_bytes` and parse as a complete WAV,
   otherwise exactly one instance repairs it.
5. Generate: claim a row lease, synthesize through the existing TTS gateway (4 chunks in parallel,
   order preserved), upload to a deterministic path, then mark the row `ready`.
6. The student gets their own ownership-scoped audio reference and streams bytes from the same
   endpoint as before (for example `GET /placement/questions/:id/audio`; the practice, assessment and lesson endpoints work the same way), so web and Flutter contracts are unchanged.
   No public or signed URL is ever issued; the bucket is only reachable with the backend's service-role key.

## Cross-instance deduplication

A row in `tts_audio_assets` is the lease. `INSERT ... ON CONFLICT DO UPDATE ... WHERE status='failed' OR lease expired`
is one atomic statement, so exactly one instance wins and the rest poll the row (up to 30 s) and then read the
result. Leases last 60 s, so a crashed instance is replaced. No transaction is open during the TTS call, and no
advisory locks are used (they are unreliable behind Supabase's connection pooler).

## Required configuration

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | already set | Backend only. Never expose to clients. |
| `TTS_AUDIO_BUCKET` | no | Default `tts-audio`. |
| `TTS_AUDIO_WARMUP` | no | `false` disables startup warm-up for all listening content. Production only; skips existing assets; at most 2 provider calls at once. `PLACEMENT_AUDIO_WARMUP=false` is still honored. |

## One-time setup

1. **Migration** `services/backend-api/prisma/migrations/20261028090000_create_tts_audio_assets/migration.sql`
   creates `tts_audio_assets` (RLS on, no policies) and, where Supabase Storage exists, the bucket.
   It is idempotent.
2. **Bucket**: private `tts-audio`, 10 MB limit, audio MIME types only. Add **no** `storage.objects`
   policies: with none, `anon`/`authenticated` are denied and the service-role key still works.

## Safe deployment sequence

1. Apply the migration to the database **first** (the new code needs the table).
2. Confirm the bucket exists and is private: `select id, public from storage.buckets where id='tts-audio';`
3. Deploy the backend. Existing in-memory behavior is replaced, not duplicated.
4. Watch logs for `warmUp: generated=N alreadyStored=M` (first deploy: `generated` = number of listening
   questions; later deploys: `generated=0`).
5. Verify (see "Performance verification").

## Rollback

* **Code**: redeploy the previous backend image. Old code ignores the table and bucket.
* **Data** (only if you want it gone): see `rollback.sql` next to the migration. Delete the Storage
  objects through the Storage API/dashboard first; deleting `storage.objects` rows does not remove files.
* Rolling back never affects students' answers or progress: the table only caches audio.

## Existing audio references

Nothing to backfill. Audio references were always in-memory and short-lived; the first request after
deploy (or warm-up) creates the persistent asset. Clients keep calling the same endpoint.

## Performance verification plan

Measure, do not assume. In staging or production with a real student token and one listening question:

1. Cold: ensure no asset (new script text, or a new `TTS_PROVIDER_VOICE`) and time
   `GET /placement/questions/:id/audio` -> record time-to-first-byte (expect seconds: provider-bound).
2. Warm, same process: repeat 20 times -> p50/p95.
3. Restart the backend and time the first request -> expect Storage-download time, **no** provider call.
4. Two instances, simultaneous cold requests -> logs must show one synthesis; both clients get audio.
5. Compare against the pre-change baseline (every request synthesized). Report p50/p95 for each case.
Check `select status, attempt_count, last_error from tts_audio_assets;` afterwards: all `ready`, `attempt_count=1`.
