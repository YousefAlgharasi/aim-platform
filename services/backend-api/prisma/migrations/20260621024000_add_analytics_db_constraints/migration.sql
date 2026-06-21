-- P15-020: Add analytics DB constraints
-- Foreign keys, uniqueness, statuses, period checks, and indexes.

-- Ensure metric_aggregates period_end > period_start
ALTER TABLE metric_aggregates
  ADD CONSTRAINT chk_metric_aggregates_period
  CHECK (period_end > period_start);

-- Ensure report_runs completed_at is after started_at when both set
ALTER TABLE report_runs
  ADD CONSTRAINT chk_report_runs_timing
  CHECK (
    started_at IS NULL
    OR completed_at IS NULL
    OR completed_at >= started_at
  );

-- Ensure failed report_runs always carry an error_message
ALTER TABLE report_runs
  ADD CONSTRAINT chk_report_runs_failed_has_error
  CHECK (status <> 'failed' OR error_message IS NOT NULL);

-- Ensure denied export_jobs always carry a denial_reason
ALTER TABLE export_jobs
  ADD CONSTRAINT chk_export_jobs_denied_has_reason
  CHECK (status <> 'denied' OR denial_reason IS NOT NULL);

-- Ensure completed export_jobs always carry a file_ref
ALTER TABLE export_jobs
  ADD CONSTRAINT chk_export_jobs_completed_has_file
  CHECK (status <> 'completed' OR file_ref IS NOT NULL);

-- Ensure dashboard_widgets display_order is non-negative
ALTER TABLE dashboard_widgets
  ADD CONSTRAINT chk_dashboard_widgets_display_order
  CHECK (display_order >= 0);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_actor_role_type ON analytics_events(actor_role, event_type);
CREATE INDEX IF NOT EXISTS idx_metric_aggregates_definition_period ON metric_aggregates(metric_definition_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_report_runs_definition_status ON report_runs(report_definition_id, status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_role_status ON export_jobs(requested_role, status);
CREATE INDEX IF NOT EXISTS idx_analytics_access_audit_logs_role_result ON analytics_access_audit_logs(actor_role, result);
