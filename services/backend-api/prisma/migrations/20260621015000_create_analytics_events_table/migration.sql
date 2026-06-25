
CREATE TABLE IF NOT EXISTS analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL,
  actor_role    TEXT NOT NULL CHECK (actor_role IN ('student', 'parent', 'admin', 'system')),
  actor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  subject_type  TEXT NOT NULL,
  subject_id    UUID,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_actor_id ON analytics_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_subject ON analytics_events(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events(occurred_at);
