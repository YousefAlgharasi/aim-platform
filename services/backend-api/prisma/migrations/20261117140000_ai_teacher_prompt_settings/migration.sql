-- Admin-editable AI Teacher prompt parts and extra rules. A missing override means "use the built-in default".
CREATE TABLE IF NOT EXISTS ai_teacher_prompt_overrides (
  key        TEXT        PRIMARY KEY CHECK (key IN ('identity','greeting','teaching','complete','practice')),
  body       TEXT        NOT NULL CHECK (char_length(btrim(body)) > 0 AND char_length(body) <= 8000),
  updated_by TEXT        NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_teacher_custom_rules (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL CHECK (char_length(btrim(title)) > 0 AND char_length(title) <= 120),
  body       TEXT        NOT NULL CHECK (char_length(btrim(body)) > 0 AND char_length(body) <= 2000),
  enabled    BOOLEAN     NOT NULL DEFAULT true,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  updated_by TEXT        NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
