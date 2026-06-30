-- Admin broadcast schedules table for sending bulk notifications from the
-- admin dashboard. Supports immediate one-shot and recurring (daily/weekly/
-- monthly) automated broadcasts targeted at all users, free-tier users,
-- students, or parents.

CREATE TABLE IF NOT EXISTS admin_broadcast_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(255) NOT NULL,
  body          TEXT         NOT NULL,
  channel       TEXT         NOT NULL CHECK (channel IN ('in_app', 'push', 'email')),
  audience      TEXT         NOT NULL DEFAULT 'all'
                  CHECK (audience IN ('all', 'free', 'students', 'parents')),
  schedule      TEXT         NOT NULL DEFAULT 'once'
                  CHECK (schedule IN ('once', 'daily', 'weekly', 'monthly')),
  status        TEXT         NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'disabled', 'sent')),
  last_run_at   TIMESTAMPTZ,
  next_run_at   TIMESTAMPTZ,
  sent_count    INTEGER      NOT NULL DEFAULT 0,
  created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_broadcast_status_next
  ON admin_broadcast_schedules (status, next_run_at)
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION update_admin_broadcast_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_broadcast_schedules_updated_at
  BEFORE UPDATE ON admin_broadcast_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_broadcast_schedules_updated_at();

-- Seed pass-through templates for admin broadcasts (title/body injected as
-- variables at send time). ON CONFLICT is safe to run multiple times.
INSERT INTO notification_templates (key, channel, locale, category, title_template, body_template, status)
VALUES
  ('system_broadcast', 'in_app', 'en', 'system_alert', '{{broadcast_title}}', '{{broadcast_body}}', 'active'),
  ('system_broadcast', 'push',   'en', 'system_alert', '{{broadcast_title}}', '{{broadcast_body}}', 'active'),
  ('system_broadcast', 'email',  'en', 'system_alert', '{{broadcast_title}}', '{{broadcast_body}}', 'active')
ON CONFLICT (key, channel, locale) DO NOTHING;
