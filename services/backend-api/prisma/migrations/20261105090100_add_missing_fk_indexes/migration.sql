-- Index the leading column of every foreign key that had none (public schema).
-- Unindexed FKs make joins on the child table and ON DELETE/UPDATE checks on the parent
-- scan the whole child table. Safe and additive; IF NOT EXISTS makes it re-runnable.

CREATE INDEX IF NOT EXISTS idx_admin_broadcast_schedules_created_by_fk ON admin_broadcast_schedules (created_by);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_resolved_lesson_id_fk ON ai_chat_sessions (resolved_lesson_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_subscription_id_fk ON checkout_sessions (subscription_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id_fk ON course_access (course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_payment_request_id_fk ON course_access (payment_request_id);
CREATE INDEX IF NOT EXISTS idx_course_payment_requests_course_id_fk ON course_payment_requests (course_id);
CREATE INDEX IF NOT EXISTS idx_course_payment_requests_receipt_image_id_fk ON course_payment_requests (receipt_image_id);
CREATE INDEX IF NOT EXISTS idx_course_payment_requests_reviewed_by_fk ON course_payment_requests (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_course_prices_updated_by_fk ON course_prices (updated_by);
CREATE INDEX IF NOT EXISTS idx_feature_flags_owner_id_fk ON feature_flags (owner_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_submitted_by_fk ON feature_requests (submitted_by);
CREATE INDEX IF NOT EXISTS idx_feature_requests_triaged_by_fk ON feature_requests (triaged_by);
CREATE INDEX IF NOT EXISTS idx_incident_records_owner_id_fk ON incident_records (owner_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_price_id_fk ON invoice_items (price_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_created_by_fk ON maintenance_windows (created_by);
CREATE INDEX IF NOT EXISTS idx_operational_status_updated_by_fk ON operational_status (updated_by);
CREATE INDEX IF NOT EXISTS idx_payment_images_uploaded_by_fk ON payment_images (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_payment_wallets_logo_image_id_fk ON payment_wallets (logo_image_id);
CREATE INDEX IF NOT EXISTS idx_payment_wallets_qr_image_id_fk ON payment_wallets (qr_image_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_topic_id_fk ON practice_attempts (topic_id);
CREATE INDEX IF NOT EXISTS idx_refunds_approved_by_fk ON refunds (approved_by);
CREATE INDEX IF NOT EXISTS idx_release_notes_created_by_fk ON release_notes (created_by);
CREATE INDEX IF NOT EXISTS idx_release_notes_published_by_fk ON release_notes (published_by);
CREATE INDEX IF NOT EXISTS idx_student_achievements_achievement_id_fk ON student_achievements (achievement_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_author_id_fk ON support_ticket_comments (author_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to_fk ON support_tickets (assigned_to);
