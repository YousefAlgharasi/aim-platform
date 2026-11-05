-- Idempotency-Key support for critical POST endpoints (placement completion, AI chat messages).
-- A client sends `Idempotency-Key: <opaque id>`; the first request claims the key, retries/double
-- clicks with the same key either get the stored response back (JSON routes) or a 409 (streams).
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text        NOT NULL,
  scope           text        NOT NULL,
  idem_key        text        NOT NULL,
  request_hash    text        NOT NULL,
  state           text        NOT NULL DEFAULT 'in_progress'
                  CHECK (state IN ('in_progress', 'completed')),
  response_status integer,
  response_body   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  CONSTRAINT idempotency_keys_user_scope_key_uq UNIQUE (user_id, scope, idem_key)
);

-- Supports the retention sweep (keys are only meaningful for a day or two).
CREATE INDEX IF NOT EXISTS idempotency_keys_created_at_idx ON idempotency_keys (created_at);

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
