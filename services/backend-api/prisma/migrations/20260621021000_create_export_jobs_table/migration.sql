-- P15-017: Create export_jobs table
-- Permissioned, audited request to export report/metric output.

CREATE TABLE IF NOT EXISTS export_jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role        TEXT NOT NULL CHECK (requested_role IN ('student', 'parent', 'admin', 'system')),
  report_run_id         UUID REFERENCES report_runs(id) ON DELETE SET NULL,
  export_type           TEXT NOT NULL CHECK (export_type IN ('csv', 'json', 'pdf')),
  scope                 JSONB NOT NULL DEFAULT '{}',
  status                TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'denied')),
  file_ref              TEXT,
  denial_reason         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX idx_export_jobs_requested_by_user_id ON export_jobs(requested_by_user_id);
CREATE INDEX idx_export_jobs_report_run_id ON export_jobs(report_run_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
