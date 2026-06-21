-- P15-015: Create report_runs table
-- A single execution of a report definition with concrete parameters and a result reference.

CREATE TABLE IF NOT EXISTS report_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_definition_id  UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  requested_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role        TEXT NOT NULL CHECK (requested_role IN ('student', 'parent', 'admin', 'system')),
  parameters            JSONB NOT NULL DEFAULT '{}',
  status                TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  result_ref            TEXT,
  error_message         TEXT,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_runs_report_definition_id ON report_runs(report_definition_id);
CREATE INDEX idx_report_runs_requested_by_user_id ON report_runs(requested_by_user_id);
CREATE INDEX idx_report_runs_status ON report_runs(status);
