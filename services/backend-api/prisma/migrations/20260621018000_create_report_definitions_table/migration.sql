-- P15-014: Create report_definitions table
-- Named, reusable report specifications.

CREATE TABLE IF NOT EXISTS report_definitions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  description        TEXT,
  category           TEXT NOT NULL CHECK (category IN (
                       'learning', 'curriculum', 'assessment', 'notification',
                       'billing', 'user', 'admin', 'parent', 'student'
                     )),
  allowed_roles      TEXT[] NOT NULL DEFAULT '{}',
  parameters_schema  JSONB NOT NULL DEFAULT '{}',
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_definitions_category ON report_definitions(category);
CREATE INDEX idx_report_definitions_is_active ON report_definitions(is_active);
