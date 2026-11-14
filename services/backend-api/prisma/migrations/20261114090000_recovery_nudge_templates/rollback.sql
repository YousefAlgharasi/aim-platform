DELETE FROM notification_templates WHERE key = 'recovery_retry_ready' AND NOT EXISTS (SELECT 1 FROM notification_events e WHERE e.template_id = notification_templates.id);
