-- Phase 3 — P3-028
-- Create curriculum_audit_logs table for append-only curriculum action traceability.
--
-- Scope:
-- Curriculum & Content System only.
-- Tracks: content create, update, publish, archive, skill mapping changes, objective mapping changes.
--
-- Security rules:
-- - Append-only. Application code must not UPDATE or DELETE rows.
-- - Contains curriculum content management context. Must not be returned to clients without
--   a backend-confirmed admin permission check.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Backend remains final authority for access to audit log data.
-- - No onboarding, placement, session, AIM runtime, or learner delivery event types are included.

CREATE TABLE IF NOT EXISTS curriculum_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_user_id UUID,

  entity_type TEXT NOT NULL,

  entity_id UUID NOT NULL,

  event_type TEXT NOT NULL,

  previous_status TEXT,

  new_status TEXT,

  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT curriculum_audit_logs_entity_type_check
    CHECK (
      entity_type IN (
        'course',
        'level',
        'chapter',
        'lesson',
        'skill',
        'objective',
        'lesson_asset',
        'question',
        'lesson_skill_mapping',
        'lesson_objective_mapping',
        'question_skill_mapping'
      )
    ),

  CONSTRAINT curriculum_audit_logs_event_type_check
    CHECK (
      event_type IN (
        'created',
        'updated',
        'status_changed',
        'published',
        'archived',
        'restored',
        'skill_linked',
        'skill_unlinked',
        'objective_linked',
        'objective_unlinked',
        'asset_attached',
        'asset_removed'
      )
    ),

  CONSTRAINT curriculum_audit_logs_actor_user_id_fkey
    FOREIGN KEY (actor_user_id)
    REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_actor_user_id_idx
  ON curriculum_audit_logs (actor_user_id);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_entity_type_idx
  ON curriculum_audit_logs (entity_type);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_entity_id_idx
  ON curriculum_audit_logs (entity_id);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_event_type_idx
  ON curriculum_audit_logs (event_type);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_created_at_idx
  ON curriculum_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS curriculum_audit_logs_entity_type_entity_id_idx
  ON curriculum_audit_logs (entity_type, entity_id);

ALTER TABLE curriculum_audit_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE curriculum_audit_logs IS
  'Append-only audit log for curriculum content management actions. Records must not be updated or deleted by application code. Backend authorization is required to access log data. No onboarding, placement, session, AIM runtime, or learner delivery events.';

COMMENT ON COLUMN curriculum_audit_logs.actor_user_id IS
  'Internal AIM user ID of the admin or content manager performing the action. Nullable to support system-initiated events.';

COMMENT ON COLUMN curriculum_audit_logs.entity_type IS
  'Type of curriculum entity affected by the event.';

COMMENT ON COLUMN curriculum_audit_logs.entity_id IS
  'UUID of the curriculum entity affected by the event.';

COMMENT ON COLUMN curriculum_audit_logs.event_type IS
  'Stable event key identifying the curriculum management action being logged.';

COMMENT ON COLUMN curriculum_audit_logs.previous_status IS
  'Content status before the event, for status change events. Nullable for non-status events.';

COMMENT ON COLUMN curriculum_audit_logs.new_status IS
  'Content status after the event, for status change events. Nullable for non-status events.';

COMMENT ON COLUMN curriculum_audit_logs.metadata IS
  'Additional structured event context. Must not contain secrets, credentials, or privileged backend configuration.';

