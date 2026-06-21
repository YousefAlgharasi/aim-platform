-- P15-013: Create metric_aggregates table
-- Computed, time-bucketed values for a metric definition, scoped to platform/cohort/role/student/parent.

CREATE TABLE IF NOT EXISTS metric_aggregates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_definition_id  UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  scope_type            TEXT NOT NULL CHECK (scope_type IN ('platform', 'cohort', 'role', 'student', 'parent')),
  scope_id              UUID,
  period_type           TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month')),
  period_start          TIMESTAMPTZ NOT NULL,
  period_end            TIMESTAMPTZ NOT NULL,
  value                 NUMERIC NOT NULL,
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (metric_definition_id, scope_type, scope_id, period_type, period_start)
);

CREATE INDEX idx_metric_aggregates_metric_definition_id ON metric_aggregates(metric_definition_id);
CREATE INDEX idx_metric_aggregates_scope ON metric_aggregates(scope_type, scope_id);
CREATE INDEX idx_metric_aggregates_period ON metric_aggregates(period_type, period_start, period_end);
