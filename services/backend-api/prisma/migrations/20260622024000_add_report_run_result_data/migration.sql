-- Add result_data JSONB column to report_runs for storing assembled report output.
-- The existing result_ref column remains as a human-readable reference identifier;
-- result_data holds the actual backend-assembled report content.

ALTER TABLE report_runs ADD COLUMN IF NOT EXISTS result_data JSONB;

-- Completed runs should always have result_data populated.
ALTER TABLE report_runs
  ADD CONSTRAINT chk_report_runs_completed_has_result
  CHECK (status <> 'completed' OR result_data IS NOT NULL);
