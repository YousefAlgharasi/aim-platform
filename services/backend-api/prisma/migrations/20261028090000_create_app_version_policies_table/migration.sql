-- Create app_version_policies table.
--
-- Scope: Per-platform mobile app version policy read by the mobile client at
-- startup (GET /app/version-policy) to decide whether to show a blocking
-- "Update required" screen or a dismissible "Update available" banner.
--
--   - min_supported_version: installed versions below this are blocked until
--     the user updates (use when a backend change breaks old clients).
--   - latest_version: installed versions below this see an optional prompt.
--   - store_url: where the update button sends the user.
--
-- Versions are plain semantic versions ("1.2.3") matching the version name in
-- apps/mobile/pubspec.yaml (without the "+build" suffix).
--
-- To force or announce an update, update the row for the platform, e.g.:
--   UPDATE app_version_policies
--   SET latest_version = '1.1.0', min_supported_version = '1.0.0'
--   WHERE platform = 'android';

CREATE TABLE IF NOT EXISTS app_version_policies (
  platform               TEXT          PRIMARY KEY,
  min_supported_version  TEXT          NOT NULL DEFAULT '0.0.0',
  latest_version         TEXT          NOT NULL DEFAULT '0.0.0',
  store_url              TEXT,
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT app_version_policies_platform_check
    CHECK (platform IN ('android', 'ios')),
  CONSTRAINT app_version_policies_min_version_format_check
    CHECK (min_supported_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  CONSTRAINT app_version_policies_latest_version_format_check
    CHECK (latest_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

CREATE OR REPLACE FUNCTION set_app_version_policies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_version_policies_set_updated_at ON app_version_policies;

CREATE TRIGGER app_version_policies_set_updated_at
BEFORE UPDATE ON app_version_policies
FOR EACH ROW
EXECUTE FUNCTION set_app_version_policies_updated_at();

INSERT INTO app_version_policies (platform, min_supported_version, latest_version, store_url)
VALUES
  ('android', '0.0.0', '0.0.0', 'https://play.google.com/store/apps/details?id=en.aim.learning'),
  ('ios', '0.0.0', '0.0.0', NULL)
ON CONFLICT (platform) DO NOTHING;

COMMENT ON TABLE app_version_policies IS
  'Per-platform mobile app version policy (minimum supported / latest version, store link). Read publicly via the backend; written by operators only.';

-- No RLS policies defined (deny-by-default for anon/authenticated Supabase
-- roles reached via PostgREST) — matches every other backend-owned table's
-- posture. The backend API connects via a direct Postgres role that bypasses
-- RLS.
ALTER TABLE app_version_policies ENABLE ROW LEVEL SECURITY;
