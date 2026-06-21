-- P17-013: Create user feedback table
-- Captures user feedback with category, optional rating, and source surface.

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users (id),

  category VARCHAR(50) NOT NULL,
  rating INT,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  source_surface VARCHAR(50) NOT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'new',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_feedback_category_check
    CHECK (category IN ('bug_report', 'suggestion', 'compliment', 'complaint', 'other')),

  CONSTRAINT user_feedback_rating_check
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),

  CONSTRAINT user_feedback_source_surface_check
    CHECK (source_surface IN ('mobile_app', 'admin_dashboard', 'parent_dashboard', 'api')),

  CONSTRAINT user_feedback_status_check
    CHECK (status IN ('new', 'under_review', 'accepted', 'declined', 'implemented'))
);
