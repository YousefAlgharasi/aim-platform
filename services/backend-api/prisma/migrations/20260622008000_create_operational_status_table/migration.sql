-- P17-018: Create operational status table
-- Per-component operational status for the platform status page.

CREATE TABLE IF NOT EXISTS operational_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  component VARCHAR(100) NOT NULL UNIQUE,

  status VARCHAR(30) NOT NULL DEFAULT 'operational',

  description TEXT,

  updated_by UUID
    REFERENCES users (id),

  metadata JSONB NOT NULL DEFAULT '{}',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
