-- Pin search_path on the 21 trigger functions flagged by Supabase's
-- security advisor (function_search_path_mutable, WARN).
--
-- Same fix, same rationale as 20260617110000_apply_foundation_rls_policies'
-- trigger-function section: public functions with a role-mutable
-- search_path can have object resolution influenced by the caller's role
-- search_path. Pin to public plus pg_temp so resolution is fixed.
--
-- These 21 are the updated_at trigger functions created by later-phase
-- migrations (parents, notifications, operations, ai-teacher admin,
-- broadcast schedules, student_level_state) that did not carry the pin
-- the foundation migration applied to the earlier functions.

ALTER FUNCTION public.update_parent_child_links_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_parent_invitations_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_parent_consents_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_parent_notification_preferences_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_notification_templates_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_notification_preferences_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_device_tokens_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_notification_events_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_reminder_schedules_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_notification_quiet_hours_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_support_tickets_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_feature_requests_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_incident_records_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_maintenance_windows_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_release_notes_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_feature_flags_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_ai_teacher_conversations_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_ai_prompt_templates_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_ai_model_configs_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_admin_broadcast_schedules_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_student_level_state_updated_at() SET search_path = public, pg_temp;
