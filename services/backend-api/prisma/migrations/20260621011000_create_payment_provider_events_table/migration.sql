-- P14-019: Create payment provider events table
-- Stores webhook/provider event IDs, event type, processing status, and idempotency keys.

CREATE TABLE IF NOT EXISTS payment_provider_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_event_id   TEXT NOT NULL UNIQUE,
  event_type          TEXT NOT NULL CHECK (trim(event_type) <> ''),
  provider            TEXT NOT NULL CHECK (provider IN ('stripe')),
  processing_status   TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN (
                        'pending', 'processed', 'failed', 'skipped'
                      )),
  idempotency_key     TEXT NOT NULL UNIQUE,
  payload_summary     JSONB NOT NULL DEFAULT '{}',
  error_message       TEXT,
  processed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_events_provider_event_id ON payment_provider_events(provider_event_id);
CREATE INDEX idx_provider_events_event_type ON payment_provider_events(event_type);
CREATE INDEX idx_provider_events_processing_status ON payment_provider_events(processing_status);
CREATE INDEX idx_provider_events_idempotency_key ON payment_provider_events(idempotency_key);
CREATE INDEX idx_provider_events_provider ON payment_provider_events(provider);
