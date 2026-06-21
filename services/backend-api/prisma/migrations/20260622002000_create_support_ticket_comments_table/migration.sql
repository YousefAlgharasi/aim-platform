-- P17-012: Create support ticket comments table
-- Comments on support tickets with public/internal visibility.

CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ticket_id UUID NOT NULL
    REFERENCES support_tickets (id) ON DELETE CASCADE,

  author_id UUID NOT NULL
    REFERENCES users (id),

  body TEXT NOT NULL,

  visibility VARCHAR(20) NOT NULL DEFAULT 'public',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT support_ticket_comments_visibility_check
    CHECK (visibility IN ('public', 'internal'))
);
