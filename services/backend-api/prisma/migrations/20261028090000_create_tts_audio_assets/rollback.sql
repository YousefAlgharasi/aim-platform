-- MANUAL ROLLBACK for 20261028090000_create_tts_audio_assets (not run by Prisma Migrate).
-- Roll back the CODE first (previous image ignores this table), then run this. The table only caches
-- audio, so dropping it never affects student answers or progress. Order matters below.
--
-- 1. Remove the objects first (Storage API or dashboard) -- deleting storage.objects rows directly
--    does not delete the underlying files.
-- 2. Then:
DROP TABLE IF EXISTS tts_audio_assets;
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    DELETE FROM storage.buckets WHERE id = 'tts-audio' AND NOT EXISTS (
      SELECT 1 FROM storage.objects WHERE bucket_id = 'tts-audio'
    );
  END IF;
END
$$;
