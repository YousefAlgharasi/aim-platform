-- P15-016: Create dashboard_widgets table
-- Backend-defined widget configuration rendering a metric/report on a dashboard surface.

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_key         TEXT NOT NULL CHECK (dashboard_key IN ('admin_overview', 'parent_summary', 'student_summary')),
  widget_type           TEXT NOT NULL CHECK (widget_type IN ('kpi', 'chart', 'table')),
  metric_definition_id  UUID REFERENCES metric_definitions(id) ON DELETE CASCADE,
  report_definition_id  UUID REFERENCES report_definitions(id) ON DELETE CASCADE,
  config                JSONB NOT NULL DEFAULT '{}',
  display_order         INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (metric_definition_id IS NOT NULL OR report_definition_id IS NOT NULL)
);

CREATE INDEX idx_dashboard_widgets_dashboard_key ON dashboard_widgets(dashboard_key);
CREATE INDEX idx_dashboard_widgets_metric_definition_id ON dashboard_widgets(metric_definition_id);
CREATE INDEX idx_dashboard_widgets_report_definition_id ON dashboard_widgets(report_definition_id);
