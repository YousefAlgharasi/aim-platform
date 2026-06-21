-- P13-011: Create Device Tokens Migration
-- Branch: phase13/P13-011-device-tokens-migration
-- Dependency: P13-002 (Notification Domain Map)
-- Scope: Stores mobile push tokens, platform, device metadata, status, and
--        last-seen tracking. The backend is the sole authority over token
--        status (active/revoked/stale); clients may only submit a token for
--        registration, never an authoritative status.

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    token TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'stale')),
    device_label TEXT,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A given push token value is unique across the system
CREATE UNIQUE INDEX idx_device_tokens_token_unique
    ON device_tokens (token);

-- Lookup by user (list/manage caller's own tokens)
CREATE INDEX idx_device_tokens_user_id
    ON device_tokens (user_id);

-- Lookup active tokens by user for dispatch fan-out
CREATE INDEX idx_device_tokens_user_status
    ON device_tokens (user_id, status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_device_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_device_tokens_updated_at();
