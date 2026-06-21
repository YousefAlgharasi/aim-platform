-- P15-012: Create metric_definitions table
-- Named, versioned definitions of computable metrics (the controlled KPI catalog).

CREATE TABLE IF NOT EXISTS metric_definitions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                 TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  domain              TEXT NOT NULL CHECK (domain IN (
                        'learning', 'placement', 'curriculum', 'assessment',
                        'notification', 'billing', 'user', 'operations'
                      )),
  value_type          TEXT NOT NULL CHECK (value_type IN ('count', 'rate', 'sum', 'average', 'distinct_count')),
  aggregation_method  TEXT NOT NULL,
  source_event_types  TEXT[] NOT NULL DEFAULT '{}',
  is_active           BOOLEAN NOT NULL DEFAULT true,
  version             INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, version)
);

CREATE INDEX idx_metric_definitions_domain ON metric_definitions(domain);
CREATE INDEX idx_metric_definitions_is_active ON metric_definitions(is_active);
