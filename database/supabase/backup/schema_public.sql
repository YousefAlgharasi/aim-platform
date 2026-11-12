--
-- PostgreSQL database dump
--

\restrict iHBrIIuAiMYjui5y1qL5h4YIazjVV8Xck0bhTMxrVkYfBIlR9HHbDCwyeSeff4I

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: set_admin_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_admin_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_ai_model_configs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_ai_model_configs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_ai_prompt_templates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_ai_prompt_templates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_ai_teacher_conversations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_ai_teacher_conversations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_app_version_policies_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_app_version_policies_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_chapter_translations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_chapter_translations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_chapters_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_chapters_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_course_billing_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_course_billing_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_course_translations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_course_translations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_courses_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_courses_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_feature_flags_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_feature_flags_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_feature_requests_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_feature_requests_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_incident_records_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_incident_records_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_lesson_assets_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_lesson_assets_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_lesson_translations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_lesson_translations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_lessons_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_lessons_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_levels_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_levels_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_maintenance_windows_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_maintenance_windows_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_objectives_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_objectives_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_permissions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_permissions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_placement_questions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_placement_questions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_placement_sections_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_placement_sections_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_practice_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_practice_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_question_answers_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_question_answers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_question_bank_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_question_bank_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_question_choices_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_question_choices_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_release_notes_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_release_notes_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_roles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_roles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_skills_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_skills_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_student_level_state_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_student_level_state_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_student_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_student_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_support_tickets_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_support_tickets_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_users_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_users_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_admin_broadcast_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_admin_broadcast_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_device_tokens_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_device_tokens_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_notification_events_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_events_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_notification_preferences_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_preferences_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_notification_quiet_hours_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_quiet_hours_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_notification_templates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_templates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_parent_child_links_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_parent_child_links_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_parent_consents_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_parent_consents_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_parent_invitations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_parent_invitations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_parent_notification_preferences_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_parent_notification_preferences_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_placement_attempts_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_placement_attempts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_questions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_questions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_reminder_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reminder_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: achievement_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    category text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT achievement_definitions_category_check CHECK ((category = ANY (ARRAY['lessons'::text, 'streak'::text, 'assessment'::text, 'milestone'::text])))
);


--
-- Name: TABLE achievement_definitions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.achievement_definitions IS 'Backend-seeded catalog of achievements/badges. Clients cannot create or edit rows here.';


--
-- Name: COLUMN achievement_definitions.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.achievement_definitions.key IS 'Stable slug used to reference an achievement from backend unlock-trigger logic.';


--
-- Name: COLUMN achievement_definitions.icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.achievement_definitions.icon IS 'Icon reference rendered by the mobile badge gallery (e.g. an icon name/key, not a binary asset).';


--
-- Name: admin_broadcast_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_broadcast_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    channel text NOT NULL,
    audience text DEFAULT 'all'::text NOT NULL,
    schedule text DEFAULT 'once'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    sent_count integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_broadcast_schedules_audience_check CHECK ((audience = ANY (ARRAY['all'::text, 'free'::text, 'students'::text, 'parents'::text]))),
    CONSTRAINT admin_broadcast_schedules_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT admin_broadcast_schedules_schedule_check CHECK ((schedule = ANY (ARRAY['once'::text, 'daily'::text, 'weekly'::text, 'monthly'::text]))),
    CONSTRAINT admin_broadcast_schedules_status_check CHECK ((status = ANY (ARRAY['active'::text, 'disabled'::text, 'sent'::text])))
);


--
-- Name: admin_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_type text DEFAULT 'admin_profile'::text NOT NULL,
    display_name text,
    avatar_url text,
    department text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_profiles_profile_type_check CHECK ((profile_type = 'admin_profile'::text))
);


--
-- Name: TABLE admin_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_profiles IS 'Admin-facing profile data linked to internal AIM users. Role and permission checks remain the source of admin authority.';


--
-- Name: COLUMN admin_profiles.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_profiles.user_id IS 'Linked internal AIM user ID. Must be resolved by backend identity and authorization checks, not trusted from client input.';


--
-- Name: COLUMN admin_profiles.profile_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_profiles.profile_type IS 'Fixed discriminator for admin profile records. Does not grant roles or permissions.';


--
-- Name: COLUMN admin_profiles.department; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_profiles.department IS 'Optional safe admin grouping for profile display and operations context. Not an authorization source.';


--
-- Name: ai_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    role text NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    channel text DEFAULT 'text'::text NOT NULL,
    audio_ref text,
    audio_duration_ms integer,
    is_greeting boolean DEFAULT false NOT NULL,
    CONSTRAINT ai_chat_messages_channel_check CHECK ((channel = ANY (ARRAY['text'::text, 'voice'::text]))),
    CONSTRAINT ai_chat_messages_role_check CHECK ((role = ANY (ARRAY['student'::text, 'ai_teacher'::text]))),
    CONSTRAINT ai_chat_messages_text_not_empty_check CHECK ((char_length(TRIM(BOTH FROM text)) > 0))
);


--
-- Name: TABLE ai_chat_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_chat_messages IS 'Backend-written AI Teacher chat messages per session. Stores display-safe student messages (after input safety filtering) and AI Teacher replies (after output safety filtering). Provider raw responses, prompt internals, and AIM Engine data are never stored here.';


--
-- Name: COLUMN ai_chat_messages.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN ai_chat_messages.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.session_id IS 'FK to ai_chat_sessions(id). Backend-resolved after ownership validation. Cascades on session deletion.';


--
-- Name: COLUMN ai_chat_messages.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.student_id IS 'Denormalized student FK for fast per-student message queries. Backend-resolved from the owning session; never taken from client payload.';


--
-- Name: COLUMN ai_chat_messages.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.role IS 'Message author role. One of: student (input after safety filter), ai_teacher (output after safety filter). No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN ai_chat_messages.text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.text IS 'Display-safe message text. For student role: content after input safety filtering. For ai_teacher role: content after output safety filtering. Never contains provider raw response, internal prompt text, context snapshot data, or AIM Engine internals.';


--
-- Name: COLUMN ai_chat_messages.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.created_at IS 'ISO-8601 UTC timestamp when the backend persisted this message row.';


--
-- Name: COLUMN ai_chat_messages.channel; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.channel IS 'Origin channel of this turn: text (typed in AI Teacher chat) or voice (spoken in Voice Teacher). A non-null audio_ref is the actual signal that voice playback is available for a turn, regardless of its origin channel.';


--
-- Name: COLUMN ai_chat_messages.audio_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.audio_ref IS 'Reference to the synthesized TTS audio asset for this message, if any. Null when audio has not been synthesized (e.g. a text turn the student never asked to hear, or a greeting whose TTS call failed).';


--
-- Name: COLUMN ai_chat_messages.audio_duration_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.audio_duration_ms IS 'Duration of the audio at audio_ref, in milliseconds. Null when audio_ref is null.';


--
-- Name: COLUMN ai_chat_messages.is_greeting; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_messages.is_greeting IS 'True for the single auto-generated opening assistant message created the moment a new ai_chat_sessions row is created (P21-008). False for every other message.';


--
-- Name: ai_chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    context_ref text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_teaching_stage text DEFAULT 'greeting'::text NOT NULL,
    resolved_lesson_id uuid,
    CONSTRAINT ai_chat_sessions_context_ref_not_empty_check CHECK ((char_length(TRIM(BOTH FROM context_ref)) > 0)),
    CONSTRAINT ai_chat_sessions_lesson_teaching_stage_check CHECK ((lesson_teaching_stage = ANY (ARRAY['greeting'::text, 'teaching'::text, 'complete'::text]))),
    CONSTRAINT ai_chat_sessions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'closed'::text])))
);


--
-- Name: TABLE ai_chat_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_chat_sessions IS 'Backend-owned AI Teacher chat sessions per student. One session maps to one AI Teacher conversation. Created by the backend on POST /ai-teacher/sessions; student_id is always resolved from the authenticated JWT, never from a client-supplied value.';


--
-- Name: COLUMN ai_chat_sessions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.id IS 'Primary key. Backend-issued UUID returned to the client as the session identifier.';


--
-- Name: COLUMN ai_chat_sessions.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.student_id IS 'FK to users(id). Backend-resolved from authenticated JWT. Never accepted from the client payload. Cascades on user deletion.';


--
-- Name: COLUMN ai_chat_sessions.context_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.context_ref IS 'Lesson or topic identifier supplied by the client on session creation and validated by the backend before storage. Consumed read-only by the Context Builder (Group D) to seed lesson-aware context. Contains no mastery, level, weakness, difficulty, recommendation, or review-schedule data.';


--
-- Name: COLUMN ai_chat_sessions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.status IS 'Lifecycle status of the session. One of: active (session is open and accepting messages), closed (session ended, no further messages accepted).';


--
-- Name: COLUMN ai_chat_sessions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.created_at IS 'ISO-8601 UTC timestamp when the session was created by the backend.';


--
-- Name: COLUMN ai_chat_sessions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.updated_at IS 'ISO-8601 UTC timestamp of the last backend update to this session row (e.g. status change).';


--
-- Name: COLUMN ai_chat_sessions.lesson_teaching_stage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.lesson_teaching_stage IS 'Backend-enforced lesson-delivery stage for this chat/voice session: greeting (intro + ask to start) -> teaching (explain + periodic comprehension checks) -> complete (AI signaled [[LESSON_COMPLETE]], lesson_progress marked complete, practice unlocked).';


--
-- Name: COLUMN ai_chat_sessions.resolved_lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_chat_sessions.resolved_lesson_id IS 'The lesson this session teaches, resolved once at session start from context_ref (see CurrentLessonContextAdapter). Persisted so later turns and the completion trigger never need to re-resolve context_ref.';


--
-- Name: ai_context_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_context_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    message_id uuid NOT NULL,
    student_id uuid NOT NULL,
    context_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_context_snapshots_context_data_is_object_check CHECK ((jsonb_typeof(context_data) = 'object'::text))
);


--
-- Name: TABLE ai_context_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_context_snapshots IS 'Backend-internal audit log of Context Builder snapshots taken at AI Teacher response time. Each row records the backend-assembled context (AIM Engine read-only outputs + curriculum data) that was fed into the Prompt Builder for a given message. Never returned to Flutter. No learning decisions are computed here.';


--
-- Name: COLUMN ai_context_snapshots.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN ai_context_snapshots.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.session_id IS 'FK to ai_chat_sessions(id). Backend-resolved. Cascades on session deletion.';


--
-- Name: COLUMN ai_context_snapshots.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.message_id IS 'FK to ai_chat_messages(id) for the ai_teacher reply this snapshot was built for. Backend-resolved. Cascades on message deletion.';


--
-- Name: COLUMN ai_context_snapshots.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.student_id IS 'Denormalized student FK for fast per-student audit queries. Backend-resolved from the owning session; never taken from client payload.';


--
-- Name: COLUMN ai_context_snapshots.context_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.context_data IS 'JSONB object assembled by the Context Builder from backend-approved, read-only AIM Engine outputs and curriculum data. Must not contain AI provider keys, database credentials, service-role keys, or raw AIM Engine internal computation state. Never returned to Flutter.';


--
-- Name: COLUMN ai_context_snapshots.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_context_snapshots.created_at IS 'ISO-8601 UTC timestamp when the backend persisted this snapshot row.';


--
-- Name: ai_focus_directives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_focus_directives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    directive_text text NOT NULL,
    source text NOT NULL,
    source_id uuid,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_focus_directives_source_check CHECK ((source = ANY (ARRAY['weakness_record'::text, 'recommendation'::text, 'difficulty_decision'::text])))
);


--
-- Name: TABLE ai_focus_directives; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_focus_directives IS 'Current AI Teacher focus directive per student — a single engine-maintained sentence(s) telling the AI Teacher what to emphasize/practice, separate from lesson content (lessons.system_prompt). Superseding a directive sets active=false rather than deleting it, for an audit trail.';


--
-- Name: COLUMN ai_focus_directives.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_focus_directives.skill_id IS 'AIM-engine skill identifier. Same type/semantics as student_skill_states.skill_id/weakness_records.skill_id (text, not necessarily an FK to skills.id) — confirmed against the live schema before choosing this type.';


--
-- Name: COLUMN ai_focus_directives.directive_text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_focus_directives.directive_text IS 'The sentence(s) injected into the AI Teacher prompt, e.g. describing a weakness to address.';


--
-- Name: COLUMN ai_focus_directives.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_focus_directives.source IS 'Which AIM output triggered this directive.';


--
-- Name: COLUMN ai_focus_directives.source_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_focus_directives.source_id IS 'id of the weakness_records/recommendations/difficulty_decisions row that produced this directive, for auditability. Nullable since the source table is not enforced via FK (varies by source).';


--
-- Name: COLUMN ai_focus_directives.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_focus_directives.active IS 'Only one active directive per student should be current. Superseding sets the old row active=false instead of deleting it.';


--
-- Name: ai_model_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_model_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    provider_key_ref character varying(100) NOT NULL,
    model_id character varying(150) NOT NULL,
    tier character varying(20) DEFAULT 'standard'::character varying NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    limits jsonb DEFAULT '{}'::jsonb NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_model_configs_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('active'::character varying)::text, ('retired'::character varying)::text]))),
    CONSTRAINT ai_model_configs_tier_check CHECK (((tier)::text = ANY (ARRAY[('economy'::character varying)::text, ('standard'::character varying)::text, ('premium'::character varying)::text])))
);


--
-- Name: ai_prompt_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_prompt_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    locale character varying(10) DEFAULT 'en'::character varying NOT NULL,
    audience character varying(50) DEFAULT 'student'::character varying NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    body text NOT NULL,
    safety_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_prompt_templates_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('active'::character varying)::text, ('retired'::character varying)::text])))
);


--
-- Name: ai_provider_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_provider_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    status text NOT NULL,
    error_category text,
    latency_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_provider_logs_error_category_requires_non_success_check CHECK (((error_category IS NULL) OR (status <> 'success'::text))),
    CONSTRAINT ai_provider_logs_latency_ms_non_negative_check CHECK (((latency_ms IS NULL) OR (latency_ms >= 0))),
    CONSTRAINT ai_provider_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text, 'timeout'::text])))
);


--
-- Name: TABLE ai_provider_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_provider_logs IS 'Backend-owned observability log for AI Provider Gateway (Group F) calls. Stores only non-sensitive operational metadata for a single provider call; never the prompt text, the raw provider response, or any provider credential.';


--
-- Name: COLUMN ai_provider_logs.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.id IS 'Primary key. Backend-issued UUID for this log entry.';


--
-- Name: COLUMN ai_provider_logs.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.session_id IS 'FK to ai_chat_sessions(id). Identifies which AI Teacher session this provider call was made for. Cascades on session deletion.';


--
-- Name: COLUMN ai_provider_logs.provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.provider IS 'Name of the configured AI provider used for this call (e.g. the provider identifier from backend config). Never a credential or secret value.';


--
-- Name: COLUMN ai_provider_logs.model; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.model IS 'Model identifier used for this call, read from backend config (e.g. AI_PROVIDER_MODEL). Never a credential or secret value.';


--
-- Name: COLUMN ai_provider_logs.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.status IS 'Outcome of the provider call. One of: success, error, timeout.';


--
-- Name: COLUMN ai_provider_logs.error_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.error_category IS 'Non-internal error category for a failed call (e.g. provider_timeout, provider_error, malformed_response), per docs/phase-8/ai-teacher-error-policy.md. Null when status is success. Never a stack trace, raw error body, or secret.';


--
-- Name: COLUMN ai_provider_logs.latency_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.latency_ms IS 'Observed latency of the provider call in milliseconds, for observability only.';


--
-- Name: COLUMN ai_provider_logs.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_provider_logs.created_at IS 'ISO-8601 UTC timestamp when this log entry was recorded by the backend.';


--
-- Name: ai_safety_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_safety_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    direction text NOT NULL,
    decision text NOT NULL,
    reason_category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_safety_events_decision_check CHECK ((decision = ANY (ARRAY['allowed'::text, 'rejected'::text]))),
    CONSTRAINT ai_safety_events_direction_check CHECK ((direction = ANY (ARRAY['input'::text, 'output'::text]))),
    CONSTRAINT ai_safety_events_reason_requires_rejected_check CHECK (((reason_category IS NULL) OR (decision = 'rejected'::text)))
);


--
-- Name: TABLE ai_safety_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_safety_events IS 'Backend-written audit log of Safety Filtering decisions (input and output) for AI Teacher chat. Records that a safety check ran and its outcome, never the rejected raw message/response content.';


--
-- Name: COLUMN ai_safety_events.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.id IS 'Primary key. Backend-issued UUID for this safety event.';


--
-- Name: COLUMN ai_safety_events.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.session_id IS 'FK to ai_chat_sessions(id). Backend-resolved after ownership validation. Cascades on session deletion.';


--
-- Name: COLUMN ai_safety_events.direction; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.direction IS 'Which safety check this event records. One of: input (student message, before Context Builder), output (AI provider response, before persistence/return).';


--
-- Name: COLUMN ai_safety_events.decision; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.decision IS 'Outcome of the safety check. One of: allowed, rejected. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN ai_safety_events.reason_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.reason_category IS 'Safe, non-internal rejection category (e.g. unsafe_content, off_topic). Null when decision is allowed. Never the raw rejected text, a stack trace, or provider response body.';


--
-- Name: COLUMN ai_safety_events.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_safety_events.created_at IS 'ISO-8601 UTC timestamp when the backend recorded this safety event.';


--
-- Name: ai_teacher_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_teacher_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    scope character varying(100) DEFAULT 'general'::character varying NOT NULL,
    mode character varying(20) DEFAULT 'text'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    retain_until timestamp with time zone,
    CONSTRAINT ai_teacher_conversations_mode_check CHECK (((mode)::text = ANY (ARRAY[('text'::character varying)::text, ('voice'::character varying)::text]))),
    CONSTRAINT ai_teacher_conversations_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('archived'::character varying)::text, ('blocked'::character varying)::text])))
);


--
-- Name: ai_teacher_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    student_id uuid NOT NULL,
    rating text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_teacher_feedback_rating_check CHECK ((rating = ANY (ARRAY['helpful'::text, 'not_helpful'::text])))
);


--
-- Name: TABLE ai_teacher_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_teacher_feedback IS 'Backend-written student feedback on a single AI Teacher chat message (helpful/not helpful). Advisory only; never feeds back into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions.';


--
-- Name: COLUMN ai_teacher_feedback.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_teacher_feedback.id IS 'Primary key. Backend-issued UUID for this feedback row.';


--
-- Name: COLUMN ai_teacher_feedback.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_teacher_feedback.message_id IS 'FK to ai_chat_messages(id). Identifies the ai_teacher message being rated. Backend-resolved after ownership validation. Cascades on message deletion. One feedback row per message.';


--
-- Name: COLUMN ai_teacher_feedback.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_teacher_feedback.student_id IS 'FK to users(id). Backend-resolved from the authenticated JWT. Never accepted from a client-supplied field. Cascades on user deletion.';


--
-- Name: COLUMN ai_teacher_feedback.rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_teacher_feedback.rating IS 'Student judgment of the AI Teacher reply. One of: helpful, not_helpful. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN ai_teacher_feedback.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_teacher_feedback.created_at IS 'ISO-8601 UTC timestamp when the backend recorded this feedback.';


--
-- Name: ai_teacher_feedback_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_feedback_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    student_id uuid NOT NULL,
    rating smallint NOT NULL,
    comment text,
    escalation_flag boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_teacher_feedback_entries_rating_check CHECK ((rating = ANY (ARRAY['-1'::integer, 0, 1])))
);


--
-- Name: ai_teacher_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    prompt_template_id uuid,
    model_config_id uuid,
    redaction_status character varying(20) DEFAULT 'none'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    retain_until timestamp with time zone,
    CONSTRAINT ai_teacher_messages_redaction_status_check CHECK (((redaction_status)::text = ANY (ARRAY[('none'::character varying)::text, ('partial'::character varying)::text, ('redacted'::character varying)::text]))),
    CONSTRAINT ai_teacher_messages_role_check CHECK (((role)::text = ANY (ARRAY[('student'::character varying)::text, ('assistant'::character varying)::text, ('system'::character varying)::text])))
);


--
-- Name: ai_teacher_safety_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_teacher_safety_checks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    target_type character varying(30) NOT NULL,
    target_id uuid NOT NULL,
    category character varying(50) NOT NULL,
    severity character varying(20) DEFAULT 'low'::character varying NOT NULL,
    action character varying(20) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_teacher_safety_checks_action_check CHECK (((action)::text = ANY (ARRAY[('allowed'::character varying)::text, ('flagged'::character varying)::text, ('blocked'::character varying)::text]))),
    CONSTRAINT ai_teacher_safety_checks_severity_check CHECK (((severity)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('critical'::character varying)::text]))),
    CONSTRAINT ai_teacher_safety_checks_target_type_check CHECK (((target_type)::text = ANY (ARRAY[('message'::character varying)::text, ('voice_segment'::character varying)::text])))
);


--
-- Name: ai_usage_cost_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_usage_cost_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    event_type character varying(30) NOT NULL,
    model_config_id uuid,
    request_id character varying(100) NOT NULL,
    tokens_used integer,
    duration_seconds integer,
    cost_estimate numeric(12,6) DEFAULT 0 NOT NULL,
    quota_period character varying(20) DEFAULT 'daily'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_usage_cost_events_event_type_check CHECK (((event_type)::text = ANY (ARRAY[('text_generation'::character varying)::text, ('stt'::character varying)::text, ('tts'::character varying)::text]))),
    CONSTRAINT ai_usage_cost_events_quota_period_check CHECK (((quota_period)::text = ANY (ARRAY[('daily'::character varying)::text, ('monthly'::character varying)::text])))
);


--
-- Name: ai_voice_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_voice_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    conversation_id uuid,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    duration_seconds integer DEFAULT 0 NOT NULL,
    provider_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    transcript_ref character varying(255),
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    retain_until timestamp with time zone,
    CONSTRAINT ai_voice_sessions_duration_non_negative CHECK ((duration_seconds >= 0)),
    CONSTRAINT ai_voice_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('completed'::character varying)::text, ('blocked'::character varying)::text, ('expired'::character varying)::text])))
);


--
-- Name: aim_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aim_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    backend_request_id uuid NOT NULL,
    endpoint text NOT NULL,
    pipeline_stage text NOT NULL,
    outcome text NOT NULL,
    integration_error_code text,
    student_id uuid,
    session_id uuid,
    attempt_id uuid,
    attempt_number smallint,
    duration_ms integer,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT aim_audit_log_attempt_number_positive_check CHECK (((attempt_number IS NULL) OR (attempt_number >= 1))),
    CONSTRAINT aim_audit_log_duration_nonneg_check CHECK (((duration_ms IS NULL) OR (duration_ms >= 0))),
    CONSTRAINT aim_audit_log_metadata_is_object_check CHECK ((jsonb_typeof(metadata) = 'object'::text)),
    CONSTRAINT aim_audit_log_outcome_check CHECK ((outcome = ANY (ARRAY['success'::text, 'transient'::text, 'non_retryable'::text, 'validation_failed'::text, 'contract_violation'::text, 'breaker_open'::text, 'persistence_failed'::text, 'authorization_denied'::text]))),
    CONSTRAINT aim_audit_log_pipeline_stage_check CHECK ((pipeline_stage = ANY (ARRAY['client_entry'::text, 'pipeline_trigger'::text, 'state_assembly'::text, 'aim_engine_call'::text, 'response_validation'::text, 'persistence'::text, 'result_emission'::text, 'fallback'::text, 'audit_close_out'::text])))
);


--
-- Name: TABLE aim_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.aim_audit_log IS 'Append-only metadata log for every AIM Engine integration step (request, response, validation, persistence, failure) per docs/phase-5/aim-error-handling-policy.md. Application code must not UPDATE or DELETE rows. Written only by the backend features/aim module; the AIM Engine and clients never write here.';


--
-- Name: COLUMN aim_audit_log.request_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.request_id IS 'Backend-issued correlation id (X-Request-Id) for this AIM Engine call.';


--
-- Name: COLUMN aim_audit_log.backend_request_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.backend_request_id IS 'Backend-issued idempotency key (backendRequestId) carried through the AIM request/response envelope.';


--
-- Name: COLUMN aim_audit_log.endpoint; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.endpoint IS 'AIM Engine endpoint involved, e.g. /aim/v1/analysis or /health, per docs/phase-5/aim-engine-api-map.md.';


--
-- Name: COLUMN aim_audit_log.pipeline_stage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.pipeline_stage IS 'Backend pipeline stage this entry records, per the nine stages in docs/phase-5/backend-aim-pipeline-map.md.';


--
-- Name: COLUMN aim_audit_log.outcome; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.outcome IS 'Outcome category for this entry, per the failure taxonomy in docs/phase-5/aim-error-handling-policy.md.';


--
-- Name: COLUMN aim_audit_log.integration_error_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.integration_error_code IS 'Stable integration error code from the P5-018 catalog. Null on success outcomes.';


--
-- Name: COLUMN aim_audit_log.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.student_id IS 'Backend-resolved student id for this call, when applicable. No FK by design, consistent with other AIM-output tables.';


--
-- Name: COLUMN aim_audit_log.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.session_id IS 'Session id this call relates to, when applicable.';


--
-- Name: COLUMN aim_audit_log.attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.attempt_id IS 'Attempt id this call relates to, when applicable.';


--
-- Name: COLUMN aim_audit_log.attempt_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.attempt_number IS 'Retry attempt number for this call (1 = first attempt), when applicable.';


--
-- Name: COLUMN aim_audit_log.duration_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.duration_ms IS 'Elapsed time in milliseconds for this pipeline stage, when applicable.';


--
-- Name: COLUMN aim_audit_log.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.metadata IS 'Additional safe metadata as a JSON object. Never contains request/response bodies, service tokens, AI provider keys, or database credentials. Any sensitive field stored here requires explicit justification documented at the log call site per docs/phase-5/aim-error-handling-policy.md.';


--
-- Name: COLUMN aim_audit_log.occurred_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aim_audit_log.occurred_at IS 'When this audit entry was recorded.';


--
-- Name: analytics_access_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_access_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid,
    actor_role text NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    scope jsonb DEFAULT '{}'::jsonb NOT NULL,
    result text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_access_audit_logs_action_check CHECK ((action = ANY (ARRAY['view_dashboard'::text, 'run_report'::text, 'request_export'::text, 'access_denied'::text]))),
    CONSTRAINT analytics_access_audit_logs_actor_role_check CHECK ((actor_role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text, 'system'::text]))),
    CONSTRAINT analytics_access_audit_logs_result_check CHECK ((result = ANY (ARRAY['allowed'::text, 'denied'::text])))
);


--
-- Name: analytics_cohort_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_cohort_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cohort_id uuid NOT NULL,
    user_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_cohorts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_cohorts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    cohort_type text NOT NULL,
    definition jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_cohorts_cohort_type_check CHECK ((cohort_type = ANY (ARRAY['static'::text, 'dynamic'::text])))
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    actor_role text NOT NULL,
    actor_id uuid,
    subject_type text NOT NULL,
    subject_id uuid,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_events_actor_role_check CHECK ((actor_role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text, 'system'::text])))
);


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_attempt_id uuid NOT NULL,
    student_id uuid NOT NULL,
    item_id uuid NOT NULL,
    answer_format text NOT NULL,
    answer_value text NOT NULL,
    options_presented_count smallint,
    is_correct boolean NOT NULL,
    submitted_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT answers_answer_format_check CHECK ((answer_format = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'fill_blank'::text, 'listening_choice'::text, 'free_text'::text]))),
    CONSTRAINT answers_answer_value_non_empty_check CHECK ((length(TRIM(BOTH FROM answer_value)) > 0)),
    CONSTRAINT answers_options_count_format_consistency_check CHECK ((((answer_format = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'listening_choice'::text])) AND (options_presented_count IS NOT NULL)) OR ((answer_format = ANY (ARRAY['fill_blank'::text, 'free_text'::text])) AND (options_presented_count IS NULL)))),
    CONSTRAINT answers_options_count_non_negative_check CHECK (((options_presented_count IS NULL) OR (options_presented_count >= 0)))
);


--
-- Name: TABLE answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.answers IS 'Backend-owned normalized answer record per lesson attempt. One row per attempt. Source of answer content for AIM Engine error-pattern analysis (P5-035) and mistake detection (P5-034). is_correct is always backend-evaluated.';


--
-- Name: COLUMN answers.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN answers.lesson_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.lesson_attempt_id IS 'References the owning lesson_attempts row. UNIQUE — one answer per attempt. No FK constraint declared in this migration to avoid a forward dependency on the lesson_attempts branch (same pattern as lesson_attempts.learning_session_id in P5-032); a follow-up migration may add the FK once merge order is settled.';


--
-- Name: COLUMN answers.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.student_id IS 'Backend-resolved student id, denormalized from the owning attempt for fast per-student answer history queries without a join.';


--
-- Name: COLUMN answers.item_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.item_id IS 'Backend-issued identifier of the question or item being answered. Denormalized from the owning attempt for fast per-item answer distribution queries.';


--
-- Name: COLUMN answers.answer_format; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.answer_format IS 'Backend-classified answer format. One of: multiple_choice, true_false, fill_blank, listening_choice, free_text. Must match the answer_format on the owning lesson_attempt row.';


--
-- Name: COLUMN answers.answer_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.answer_value IS 'Backend-normalized literal answer submitted by the student. For option-based formats, the selected option identifier (e.g. "B"). For fill_blank / free_text, the written response. Behavioral input only — never an AIM-owned decision field.';


--
-- Name: COLUMN answers.options_presented_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.options_presented_count IS 'Number of answer options presented to the student. Non-null for option-based formats (multiple_choice, true_false, listening_choice); null for fill_blank and free_text. Enforced by the format-consistency constraint.';


--
-- Name: COLUMN answers.is_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.is_correct IS 'Backend-evaluated correctness using the existing scoring logic from the features/lessons service. Never trusted from a client-submitted value and never overridden by the AIM Engine.';


--
-- Name: COLUMN answers.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.submitted_at IS 'ISO-8601 UTC timestamp of when the backend recorded the answer submission. Copied from the owning lesson_attempt row for time-range queries on answers without joining lesson_attempts.';


--
-- Name: COLUMN answers.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.answers.created_at IS 'Backend-set row creation timestamp. Never updated after insert.';


--
-- Name: app_version_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_version_policies (
    platform text NOT NULL,
    min_supported_version text DEFAULT '0.0.0'::text NOT NULL,
    latest_version text DEFAULT '0.0.0'::text NOT NULL,
    store_url text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT app_version_policies_latest_version_format_check CHECK ((latest_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'::text)),
    CONSTRAINT app_version_policies_min_version_format_check CHECK ((min_supported_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'::text)),
    CONSTRAINT app_version_policies_platform_check CHECK ((platform = ANY (ARRAY['android'::text, 'ios'::text])))
);


--
-- Name: TABLE app_version_policies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.app_version_policies IS 'Per-platform mobile app version policy (minimum supported / latest version, store link). Read publicly via the backend; written by operators only.';


--
-- Name: assessment_attempt_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_attempt_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    assessment_question_link_id uuid NOT NULL,
    response_value text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE assessment_attempt_answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_attempt_answers IS 'Backend-owned record of a student response per docs/phase-10/assessment-domain-map.md (Answer entity). Never authoritative for correctness or score; carries no client-trusted grading field.';


--
-- Name: COLUMN assessment_attempt_answers.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.id IS 'Backend-generated primary key. Referenced as answerId in API contracts.';


--
-- Name: COLUMN assessment_attempt_answers.attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.attempt_id IS 'Owning attempt. Cascade-deleted with the parent attempt.';


--
-- Name: COLUMN assessment_attempt_answers.assessment_question_link_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.assessment_question_link_id IS 'Referenced assessment_questions row this answer responds to. RESTRICT delete to avoid silently dropping submitted answers.';


--
-- Name: COLUMN assessment_attempt_answers.response_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.response_value IS 'Opaque learner-submitted response; format depends on question type. Never trusted as a correctness or score signal.';


--
-- Name: COLUMN assessment_attempt_answers.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.submitted_at IS 'Backend-set when the answer is accepted.';


--
-- Name: COLUMN assessment_attempt_answers.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_attempt_answers.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempt_answers.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: assessment_attempt_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_attempt_questions (
    attempt_id uuid NOT NULL,
    assessment_question_link_id uuid NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assessment_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    status text DEFAULT 'started'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    submitted_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_attempts_attempt_number_positive_check CHECK ((attempt_number > 0)),
    CONSTRAINT assessment_attempts_status_check CHECK ((status = ANY (ARRAY['started'::text, 'in_progress'::text, 'submitted'::text, 'graded'::text, 'expired'::text, 'abandoned'::text]))),
    CONSTRAINT assessment_attempts_submitted_at_after_started_check CHECK (((submitted_at IS NULL) OR (submitted_at >= started_at)))
);


--
-- Name: TABLE assessment_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_attempts IS 'Backend-owned attempt lifecycle per docs/phase-10/assessment-domain-map.md (Attempt entity). Status transitions, eligibility, and expiry are backend-controlled; this table only persists the resulting state.';


--
-- Name: COLUMN assessment_attempts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.id IS 'Backend-generated primary key. Referenced as attemptId in API contracts.';


--
-- Name: COLUMN assessment_attempts.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.assessment_id IS 'Owning assessment. Cascade-deleted with the parent assessment.';


--
-- Name: COLUMN assessment_attempts.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.student_id IS 'Backend-resolved student id from authenticated session context. Never taken directly from a client payload.';


--
-- Name: COLUMN assessment_attempts.attempt_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.attempt_number IS 'Backend-assigned sequential attempt number per (assessment_id, student_id). Max-attempts enforcement happens in the attempt service, not via this column alone.';


--
-- Name: COLUMN assessment_attempts.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.status IS 'Lifecycle state: started, in_progress, submitted, graded, expired, abandoned. Backend-controlled; no client write path may set this directly.';


--
-- Name: COLUMN assessment_attempts.started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.started_at IS 'Backend-set when the attempt is created.';


--
-- Name: COLUMN assessment_attempts.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.submitted_at IS 'Backend-set when the attempt is submitted for grading. Null until submission.';


--
-- Name: COLUMN assessment_attempts.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.expires_at IS 'Backend-derived expiry from assessment_settings.time_limit_seconds at attempt start. Not client-writable.';


--
-- Name: COLUMN assessment_attempts.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_attempts.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_attempts.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: assessment_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    event_type text NOT NULL,
    actor_id uuid,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_audit_logs_entity_type_check CHECK ((entity_type = ANY (ARRAY['assessment'::text, 'attempt'::text, 'deadline'::text, 'result'::text])))
);


--
-- Name: TABLE assessment_audit_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_audit_logs IS 'Backend-owned, write-only audit trail per docs/phase-10/assessment-domain-map.md (Audit Log entity). Reviewer/backend use only; Flutter does not read this table in Phase 10. metadata must contain safe fields only — no secrets, credentials, or full sensitive answer payloads.';


--
-- Name: COLUMN assessment_audit_logs.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.id IS 'Backend-generated primary key.';


--
-- Name: COLUMN assessment_audit_logs.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.entity_type IS 'Domain entity this event concerns: assessment, attempt, deadline, or result.';


--
-- Name: COLUMN assessment_audit_logs.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.entity_id IS 'UUID of the referenced entity. Stored without a foreign key so the audit record survives deletion of the referenced row.';


--
-- Name: COLUMN assessment_audit_logs.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.event_type IS 'Backend-defined event name (e.g. attempt_started, attempt_submitted, attempt_graded, deadline_extended).';


--
-- Name: COLUMN assessment_audit_logs.actor_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.actor_id IS 'Backend-resolved id of the user who triggered the event, if any. Null for system-triggered events.';


--
-- Name: COLUMN assessment_audit_logs.occurred_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.occurred_at IS 'Backend-set timestamp of when the event occurred.';


--
-- Name: COLUMN assessment_audit_logs.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.metadata IS 'Safe, non-sensitive event metadata only. Must never contain secrets, service-role keys, database credentials, AI provider keys, or full sensitive answer payloads.';


--
-- Name: COLUMN assessment_audit_logs.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_audit_logs.created_at IS 'Backend-set on persistence. This table is append-only; rows are never updated.';


--
-- Name: assessment_deadlines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_deadlines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    student_id uuid,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    opens_at timestamp with time zone NOT NULL,
    closes_at timestamp with time zone NOT NULL,
    extended_closes_at timestamp with time zone,
    late_window_seconds integer,
    late_penalty_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_deadlines_extended_after_close_check CHECK (((extended_closes_at IS NULL) OR (extended_closes_at > closes_at))),
    CONSTRAINT assessment_deadlines_late_penalty_range_check CHECK (((late_penalty_percent >= (0)::numeric) AND (late_penalty_percent <= (100)::numeric))),
    CONSTRAINT assessment_deadlines_late_window_positive_check CHECK (((late_window_seconds IS NULL) OR (late_window_seconds > 0))),
    CONSTRAINT assessment_deadlines_timezone_not_blank_check CHECK ((char_length(btrim(timezone)) > 0)),
    CONSTRAINT assessment_deadlines_window_order_check CHECK ((opens_at < closes_at))
);


--
-- Name: TABLE assessment_deadlines; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_deadlines IS 'Backend-owned per-assessment (and optionally per-student) deadline windows. Status (upcoming/open/closed/missed/late/extended/expired) is backend-computed at query time and returned via GET /assessments/:id/deadline; Flutter must display it as-is without recomputing from raw timestamps. See docs/phase-10/assessment-domain-map.md §5 and assessment-authority-rules.md.';


--
-- Name: COLUMN assessment_deadlines.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.assessment_id IS 'FK to assessments.id. Each deadline belongs to exactly one assessment.';


--
-- Name: COLUMN assessment_deadlines.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.student_id IS 'NULL = global deadline for all enrolled students. Non-NULL = individual deadline extension for a specific student. The backend resolves the effective deadline per student at request time.';


--
-- Name: COLUMN assessment_deadlines.timezone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.timezone IS 'IANA timezone string recorded for admin display and audit purposes only. All deadline logic runs in UTC against the timestamptz columns.';


--
-- Name: COLUMN assessment_deadlines.opens_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.opens_at IS 'UTC timestamp from which the assessment window is open for attempts. Returned to Flutter as a raw timestamp for countdown display only; Flutter must not derive open/closed status from this column.';


--
-- Name: COLUMN assessment_deadlines.closes_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.closes_at IS 'UTC timestamp at which the standard submission window closes. Returned to Flutter for countdown display only; see opens_at rule.';


--
-- Name: COLUMN assessment_deadlines.extended_closes_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.extended_closes_at IS 'UTC timestamp of an admin-granted extension. When non-NULL the backend uses this instead of closes_at for eligibility and late-window checks. Returned to Flutter as a raw timestamp only; status derivation is backend-only.';


--
-- Name: COLUMN assessment_deadlines.late_window_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.late_window_seconds IS 'Seconds after the effective close (closes_at or extended_closes_at) during which late submissions are still accepted. NULL = no late submissions. Backend-evaluated only; NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_deadlines.late_penalty_percent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.late_penalty_percent IS 'Score deduction applied to submissions within the late window (0–100). Backend-applied during grading. NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_deadlines.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_deadlines.is_active IS 'FALSE = this deadline row has been superseded or deactivated by the backend. Inactive rows are excluded from student-facing queries.';


--
-- Name: assessment_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    section_id uuid,
    question_id uuid NOT NULL,
    "order" integer NOT NULL,
    points numeric(6,2) DEFAULT 1.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_questions_order_positive_check CHECK (("order" > 0)),
    CONSTRAINT assessment_questions_points_positive_check CHECK ((points > (0)::numeric))
);


--
-- Name: TABLE assessment_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_questions IS 'Backend-owned association between a question bank question and an assessment/section per docs/phase-10/assessment-domain-map.md (Assessment Question Link entity). Carries no correct-answer data; correctness lookup remains in question_choices.';


--
-- Name: COLUMN assessment_questions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.id IS 'Backend-generated primary key. Referenced as assessmentQuestionLinkId in API contracts.';


--
-- Name: COLUMN assessment_questions.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.assessment_id IS 'Owning assessment. Cascade-deleted with the parent assessment.';


--
-- Name: COLUMN assessment_questions.section_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.section_id IS 'Optional owning section. Null means the question is not grouped into a section.';


--
-- Name: COLUMN assessment_questions.question_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.question_id IS 'Referenced question bank item. RESTRICT delete to avoid silently dropping linked assessment content.';


--
-- Name: COLUMN assessment_questions."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions."order" IS 'Display/navigation order within the assessment. Not a scoring input.';


--
-- Name: COLUMN assessment_questions.points; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.points IS 'Backend-owned point value for this question within this assessment. Never trusted from a client write path; never exposed on question delivery.';


--
-- Name: COLUMN assessment_questions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_questions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_questions.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: assessment_result_breakdowns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_result_breakdowns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    result_id uuid NOT NULL,
    section_id uuid,
    assessment_question_link_id uuid,
    is_correct boolean,
    points_awarded numeric(6,2) NOT NULL,
    points_possible numeric(6,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_result_breakdowns_points_awarded_range_check CHECK (((points_awarded >= (0)::numeric) AND (points_awarded <= points_possible))),
    CONSTRAINT assessment_result_breakdowns_points_possible_positive_check CHECK ((points_possible > (0)::numeric))
);


--
-- Name: TABLE assessment_result_breakdowns; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_result_breakdowns IS 'Backend-owned per-section/per-question result detail per docs/phase-10/assessment-domain-map.md (Result Breakdown entity). is_correct is populated only when backend-approved post-result feedback applies.';


--
-- Name: COLUMN assessment_result_breakdowns.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.id IS 'Backend-generated primary key.';


--
-- Name: COLUMN assessment_result_breakdowns.result_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.result_id IS 'Owning result. Cascade-deleted with the parent result.';


--
-- Name: COLUMN assessment_result_breakdowns.section_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.section_id IS 'Optional related section. Nulled if the section is later removed; the breakdown row is retained for analytics.';


--
-- Name: COLUMN assessment_result_breakdowns.assessment_question_link_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.assessment_question_link_id IS 'Optional related question link. Nulled if the question link is later removed; the breakdown row is retained for analytics.';


--
-- Name: COLUMN assessment_result_breakdowns.is_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.is_correct IS 'Backend grading service output. Null unless the assessment feedback policy explicitly approves post-result feedback; never set or overridden by a client.';


--
-- Name: COLUMN assessment_result_breakdowns.points_awarded; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.points_awarded IS 'Backend grading service output. Never client-writable.';


--
-- Name: COLUMN assessment_result_breakdowns.points_possible; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.points_possible IS 'Backend grading service output. Never client-writable.';


--
-- Name: COLUMN assessment_result_breakdowns.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_result_breakdowns.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_result_breakdowns.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: assessment_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    score numeric(7,2) NOT NULL,
    max_score numeric(7,2) NOT NULL,
    passed boolean NOT NULL,
    late_penalty_applied boolean DEFAULT false NOT NULL,
    graded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_results_max_score_positive_check CHECK ((max_score > (0)::numeric)),
    CONSTRAINT assessment_results_score_range_check CHECK (((score >= (0)::numeric) AND (score <= max_score)))
);


--
-- Name: TABLE assessment_results; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_results IS 'Backend-owned authoritative result per docs/phase-10/assessment-domain-map.md (Result entity). Written exclusively by the grading/score-policy service; never client-writable or recomputable.';


--
-- Name: COLUMN assessment_results.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.id IS 'Backend-generated primary key. Referenced as resultId in API contracts.';


--
-- Name: COLUMN assessment_results.attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.attempt_id IS 'The graded attempt this result belongs to. One result per attempt, enforced by unique constraint.';


--
-- Name: COLUMN assessment_results.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.assessment_id IS 'Owning assessment, denormalized for result-history query efficiency.';


--
-- Name: COLUMN assessment_results.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.student_id IS 'Backend-resolved student id, preserved for ownership checks on result and result-history reads.';


--
-- Name: COLUMN assessment_results.score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.score IS 'Backend grading/score-policy output. Never client-writable.';


--
-- Name: COLUMN assessment_results.max_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.max_score IS 'Backend grading/score-policy output. Never client-writable.';


--
-- Name: COLUMN assessment_results.passed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.passed IS 'Backend score-policy pass/fail determination. Never recomputed or overridden by Flutter.';


--
-- Name: COLUMN assessment_results.late_penalty_applied; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.late_penalty_applied IS 'Backend score-policy flag indicating a late-submission penalty was applied to score. Never client-writable.';


--
-- Name: COLUMN assessment_results.graded_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.graded_at IS 'Backend-set when grading completes.';


--
-- Name: COLUMN assessment_results.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_results.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_results.updated_at IS 'Backend-set on every update to this record (e.g. manual regrade by backend service only).';


--
-- Name: assessment_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    title text NOT NULL,
    "order" integer NOT NULL,
    weight numeric(4,3) DEFAULT 1.000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_sections_order_positive_check CHECK (("order" > 0)),
    CONSTRAINT assessment_sections_title_not_blank_check CHECK ((char_length(btrim(title)) > 0)),
    CONSTRAINT assessment_sections_weight_range_check CHECK (((weight >= 0.000) AND (weight <= 1.000)))
);


--
-- Name: TABLE assessment_sections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_sections IS 'Backend-owned grouping of questions within an assessment per docs/phase-10/assessment-domain-map.md (Assessment Section entity). weight is internal score-policy configuration, never exposed to Flutter as a scoring unit.';


--
-- Name: COLUMN assessment_sections.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.id IS 'Backend-generated primary key.';


--
-- Name: COLUMN assessment_sections.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.assessment_id IS 'Owning assessment. Cascade-deleted with the parent assessment.';


--
-- Name: COLUMN assessment_sections.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.title IS 'Display title shown to students and admins (e.g. "Listening", "Grammar").';


--
-- Name: COLUMN assessment_sections."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections."order" IS 'Display/navigation order within the assessment. Not a scoring input.';


--
-- Name: COLUMN assessment_sections.weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.weight IS 'Internal backend score-policy weight for this section. Never returned to Flutter.';


--
-- Name: COLUMN assessment_sections.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessment_sections.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_sections.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: assessment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    time_limit_seconds integer,
    max_attempts integer DEFAULT 1 NOT NULL,
    allow_retake boolean DEFAULT false NOT NULL,
    randomize_questions boolean DEFAULT false NOT NULL,
    randomize_options boolean DEFAULT false NOT NULL,
    grading_mode text DEFAULT 'auto'::text NOT NULL,
    pass_threshold numeric(5,2) DEFAULT 60.00 NOT NULL,
    late_submission_window_seconds integer,
    late_penalty_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    result_visibility text DEFAULT 'immediate'::text NOT NULL,
    feedback_policy text DEFAULT 'none'::text NOT NULL,
    visible_from timestamp with time zone,
    visible_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    questions_per_attempt integer,
    CONSTRAINT assessment_settings_feedback_policy_check CHECK ((feedback_policy = ANY (ARRAY['none'::text, 'after_submission'::text, 'after_deadline'::text, 'after_review'::text]))),
    CONSTRAINT assessment_settings_grading_mode_check CHECK ((grading_mode = ANY (ARRAY['auto'::text, 'manual'::text]))),
    CONSTRAINT assessment_settings_late_penalty_range_check CHECK (((late_penalty_percent >= (0)::numeric) AND (late_penalty_percent <= (100)::numeric))),
    CONSTRAINT assessment_settings_late_window_positive_check CHECK (((late_submission_window_seconds IS NULL) OR (late_submission_window_seconds > 0))),
    CONSTRAINT assessment_settings_max_attempts_positive_check CHECK ((max_attempts >= 1)),
    CONSTRAINT assessment_settings_pass_threshold_range_check CHECK (((pass_threshold >= (0)::numeric) AND (pass_threshold <= (100)::numeric))),
    CONSTRAINT assessment_settings_questions_per_attempt_check CHECK (((questions_per_attempt IS NULL) OR (questions_per_attempt >= 1))),
    CONSTRAINT assessment_settings_result_visibility_check CHECK ((result_visibility = ANY (ARRAY['immediate'::text, 'after_deadline'::text, 'manual'::text]))),
    CONSTRAINT assessment_settings_time_limit_positive_check CHECK (((time_limit_seconds IS NULL) OR (time_limit_seconds > 0))),
    CONSTRAINT assessment_settings_visible_window_check CHECK (((visible_from IS NULL) OR (visible_until IS NULL) OR (visible_from < visible_until)))
);


--
-- Name: TABLE assessment_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessment_settings IS 'Backend-owned per-assessment settings: duration, attempt limits, randomization, grading mode, late policy, and visibility. Flutter never receives grading mode, pass threshold, late penalty, or raw attempt-eligibility fields. See docs/phase-10/assessment-authority-rules.md.';


--
-- Name: COLUMN assessment_settings.assessment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.assessment_id IS 'One-to-one FK to assessments.id. Each assessment has exactly one settings row.';


--
-- Name: COLUMN assessment_settings.time_limit_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.time_limit_seconds IS 'Time allowed for the attempt in seconds, backend-enforced. NULL = no limit. The backend returns this to Flutter as an informational field only; Flutter must not enforce it locally.';


--
-- Name: COLUMN assessment_settings.max_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.max_attempts IS 'Maximum number of attempts a student may make. Backend-evaluated at attempt-start; Flutter must not compute eligibility from this value.';


--
-- Name: COLUMN assessment_settings.allow_retake; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.allow_retake IS 'Whether students may attempt again after a passing result. Backend-evaluated only.';


--
-- Name: COLUMN assessment_settings.randomize_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.randomize_questions IS 'Whether the backend randomizes question order on each delivery.';


--
-- Name: COLUMN assessment_settings.randomize_options; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.randomize_options IS 'Whether the backend randomizes option order within each question on delivery.';


--
-- Name: COLUMN assessment_settings.grading_mode; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.grading_mode IS 'auto: backend grades immediately on submission. manual: backend grades after admin review. NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_settings.pass_threshold; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.pass_threshold IS 'Minimum score percentage for a passing result. Backend-enforced grading policy. NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_settings.late_submission_window_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.late_submission_window_seconds IS 'Seconds after deadline close during which late submissions are still accepted (with penalty). NULL = no late submissions. Backend-evaluated only; NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_settings.late_penalty_percent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.late_penalty_percent IS 'Score deduction applied to late submissions (0–100). Backend-applied during grading. NEVER returned to Flutter.';


--
-- Name: COLUMN assessment_settings.result_visibility; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.result_visibility IS 'Controls when the backend exposes the graded result to Flutter: immediate (on grading), after_deadline (when deadline closes), manual (admin-released).';


--
-- Name: COLUMN assessment_settings.feedback_policy; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.feedback_policy IS 'Controls when the backend includes isCorrect in result breakdown responses: none, after_submission, after_deadline, or after_review. Backend-enforced; Flutter must not show correctness when isCorrect is absent from the response.';


--
-- Name: COLUMN assessment_settings.visible_from; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.visible_from IS 'Optional timestamp from which this assessment is visible to students. Backend-evaluated.';


--
-- Name: COLUMN assessment_settings.visible_until; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessment_settings.visible_until IS 'Optional timestamp after which this assessment is hidden from students. Backend-evaluated.';


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    chapter_id uuid,
    course_id uuid,
    CONSTRAINT assessments_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT assessments_title_not_blank_check CHECK ((char_length(btrim(title)) > 0)),
    CONSTRAINT assessments_type_check CHECK ((type = ANY (ARRAY['quiz'::text, 'exam'::text])))
);


--
-- Name: TABLE assessments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assessments IS 'Backend-owned quiz/exam definition per docs/phase-10/assessment-domain-map.md (Assessment entity). Grading, scoring, deadline, and attempt state are owned by separate tables.';


--
-- Name: COLUMN assessments.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.id IS 'Backend-generated primary key.';


--
-- Name: COLUMN assessments.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.type IS 'Assessment kind: quiz or exam.';


--
-- Name: COLUMN assessments.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.title IS 'Display title shown to students and admins.';


--
-- Name: COLUMN assessments.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.description IS 'Optional display description shown to students and admins.';


--
-- Name: COLUMN assessments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.status IS 'Lifecycle state: draft, published, or archived. Backend-controlled; no client write path may set this directly without admin authorization.';


--
-- Name: COLUMN assessments.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.created_by IS 'Backend-resolved id of the admin/staff user who created this assessment. Never taken directly from an unauthenticated client payload.';


--
-- Name: COLUMN assessments.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN assessments.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assessments.updated_at IS 'Backend-set on every update to this record.';


--
-- Name: auth_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    supabase_auth_uid uuid,
    event_type text NOT NULL,
    actor_user_id uuid,
    ip_address text,
    user_agent text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_audit_logs_event_type_check CHECK ((event_type = ANY (ARRAY['login'::text, 'logout'::text, 'token_validated'::text, 'token_rejected'::text, 'user_created'::text, 'user_status_changed'::text, 'role_assigned'::text, 'role_removed'::text, 'profile_updated'::text, 'profile_access_denied'::text, 'access_denied'::text, 'password_reset_requested'::text, 'email_changed'::text])))
);


--
-- Name: TABLE auth_audit_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.auth_audit_logs IS 'Append-only security audit log for auth and role events. Records must not be updated or deleted by application code. Backend authorization is required to access log data.';


--
-- Name: COLUMN auth_audit_logs.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.user_id IS 'Internal AIM user ID of the subject of the event. Nullable to support pre-registration and failed-login events.';


--
-- Name: COLUMN auth_audit_logs.supabase_auth_uid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.supabase_auth_uid IS 'Supabase Auth UID recorded for events where an internal user record may not yet exist.';


--
-- Name: COLUMN auth_audit_logs.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.event_type IS 'Stable event key identifying the security-relevant action being logged.';


--
-- Name: COLUMN auth_audit_logs.actor_user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.actor_user_id IS 'Internal AIM user ID of the admin or system actor performing the action, if distinct from the subject.';


--
-- Name: COLUMN auth_audit_logs.ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.ip_address IS 'Client IP address for security traceability. Must not be exposed to non-admin clients.';


--
-- Name: COLUMN auth_audit_logs.user_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.user_agent IS 'Client user agent string for security traceability. Must not be exposed to non-admin clients.';


--
-- Name: COLUMN auth_audit_logs.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_audit_logs.metadata IS 'Additional structured event context. Must not contain secrets, credentials, or privileged backend configuration.';


--
-- Name: billing_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    actor_id uuid,
    actor_type text NOT NULL,
    changes jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_audit_logs_action_check CHECK ((TRIM(BOTH FROM action) <> ''::text)),
    CONSTRAINT billing_audit_logs_actor_type_check CHECK ((actor_type = ANY (ARRAY['user'::text, 'system'::text, 'provider'::text, 'admin'::text]))),
    CONSTRAINT billing_audit_logs_entity_type_check CHECK ((entity_type = ANY (ARRAY['product'::text, 'price'::text, 'plan'::text, 'subscription'::text, 'checkout_session'::text, 'payment'::text, 'invoice'::text, 'refund'::text, 'coupon'::text, 'promotion_code'::text, 'entitlement'::text, 'provider_event'::text])))
);


--
-- Name: billing_entitlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_entitlements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid,
    subscription_id uuid,
    feature_key text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    source text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_entitlements_feature_key_check CHECK ((TRIM(BOTH FROM feature_key) <> ''::text)),
    CONSTRAINT billing_entitlements_source_check CHECK ((source = ANY (ARRAY['subscription'::text, 'payment'::text, 'admin_grant'::text, 'promotion'::text]))),
    CONSTRAINT billing_entitlements_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'revoked'::text]))),
    CONSTRAINT chk_entitlements_usage_limit CHECK (((usage_limit IS NULL) OR (usage_count <= usage_limit)))
);


--
-- Name: billing_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price_id uuid NOT NULL,
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    plan_type text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_plans_name_check CHECK ((TRIM(BOTH FROM name) <> ''::text)),
    CONSTRAINT billing_plans_plan_type_check CHECK ((plan_type = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text, 'enterprise'::text]))),
    CONSTRAINT billing_plans_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])))
);


--
-- Name: billing_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL,
    billing_interval text NOT NULL,
    provider_price_id text,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_prices_amount_check CHECK ((amount >= 0)),
    CONSTRAINT billing_prices_billing_interval_check CHECK ((billing_interval = ANY (ARRAY['month'::text, 'year'::text, 'one_time'::text]))),
    CONSTRAINT billing_prices_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT billing_prices_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])))
);


--
-- Name: billing_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    product_type text NOT NULL,
    provider_product_id text,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_products_name_check CHECK ((TRIM(BOTH FROM name) <> ''::text)),
    CONSTRAINT billing_products_product_type_check CHECK ((product_type = ANY (ARRAY['course'::text, 'subscription'::text, 'feature'::text, 'addon'::text]))),
    CONSTRAINT billing_products_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])))
);


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    score_snapshot jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE certificates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.certificates IS 'Backend-issued record that a student completed a course, with a score snapshot taken at issuance. Never client-writable.';


--
-- Name: chapter_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chapter_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chapter_id uuid NOT NULL,
    locale character varying(10) NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chapter_translations_locale_format_check CHECK (((locale)::text ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text))
);


--
-- Name: TABLE chapter_translations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chapter_translations IS 'Per-locale chapter title/description. One row per (chapter_id, locale); the en row mirrors chapters.title/description. Backend-owned, never client-writable.';


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level_id uuid NOT NULL,
    title text NOT NULL,
    slug text,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chapters_sort_order_check CHECK ((sort_order >= 0)),
    CONSTRAINT chapters_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE chapters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chapters IS 'Ordered chapter groupings for lessons within a curriculum level. Backend is the source of truth for status, ordering, and metadata. Do not store learner progress, placement, mastery, session, or AIM runtime data here.';


--
-- Name: COLUMN chapters.level_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chapters.level_id IS 'Parent level reference. Cascade delete is restricted — chapters must be removed explicitly.';


--
-- Name: COLUMN chapters.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chapters.sort_order IS 'Display ordering within the parent level. Backend-owned.';


--
-- Name: COLUMN chapters.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chapters.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';


--
-- Name: checkout_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkout_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    price_id uuid NOT NULL,
    subscription_id uuid,
    provider_session_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    checkout_url text,
    success_url text,
    cancel_url text,
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT checkout_sessions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'expired'::text, 'failed'::text])))
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    discount_type text NOT NULL,
    discount_value integer NOT NULL,
    currency text,
    max_redemptions integer,
    times_redeemed integer DEFAULT 0 NOT NULL,
    valid_from timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_coupons_fixed_amount_currency CHECK (((discount_type <> 'fixed_amount'::text) OR (currency IS NOT NULL))),
    CONSTRAINT chk_coupons_redemption_limit CHECK (((max_redemptions IS NULL) OR (times_redeemed <= max_redemptions))),
    CONSTRAINT chk_coupons_validity_period CHECK (((valid_until IS NULL) OR (valid_until > valid_from))),
    CONSTRAINT coupons_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT coupons_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > 0)),
    CONSTRAINT coupons_name_check CHECK ((TRIM(BOTH FROM name) <> ''::text)),
    CONSTRAINT coupons_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'disabled'::text])))
);


--
-- Name: course_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    payment_request_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    failed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_access_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'failed'::text, 'revoked'::text]))),
    CONSTRAINT course_access_window_check CHECK ((expires_at > starts_at))
);


--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_enrollments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'switched'::text])))
);


--
-- Name: TABLE course_enrollments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.course_enrollments IS 'Backend-owned record of which course a student is currently enrolled in. At most one active row per student — see course_enrollments_one_active_per_student_idx.';


--
-- Name: COLUMN course_enrollments.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.course_enrollments.student_id IS 'Backend-resolved student id from authenticated session context. Never taken from a client payload.';


--
-- Name: COLUMN course_enrollments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.course_enrollments.status IS 'active = the student''s current course. switched = a prior enrollment replaced when the student started a different course.';


--
-- Name: course_enrollments_backup_20261105; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_enrollments_backup_20261105 (
    id uuid,
    student_id uuid,
    course_id uuid,
    status text,
    enrolled_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: course_payment_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_payment_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    transaction_number text NOT NULL,
    receipt_image_id uuid NOT NULL,
    original_amount numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_note text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_payment_requests_amount_check CHECK (((amount >= (0)::numeric) AND (original_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric))),
    CONSTRAINT course_payment_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT course_payment_requests_transaction_check CHECK ((length(TRIM(BOTH FROM transaction_number)) > 0))
);


--
-- Name: course_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_prices (
    course_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'YER'::text NOT NULL,
    discount_type text DEFAULT 'none'::text NOT NULL,
    discount_value numeric(12,2) DEFAULT 0 NOT NULL,
    discount_starts_at timestamp with time zone,
    discount_ends_at timestamp with time zone,
    access_days integer DEFAULT 30 NOT NULL,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_prices_access_days_check CHECK (((access_days >= 1) AND (access_days <= 365))),
    CONSTRAINT course_prices_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT course_prices_currency_check CHECK ((currency = ANY (ARRAY['YER'::text, 'SAR'::text, 'USD'::text]))),
    CONSTRAINT course_prices_discount_type_check CHECK ((discount_type = ANY (ARRAY['none'::text, 'percent'::text, 'fixed'::text]))),
    CONSTRAINT course_prices_discount_value_check CHECK (((discount_value >= (0)::numeric) AND ((discount_type <> 'percent'::text) OR (discount_value <= (100)::numeric)) AND ((discount_type <> 'fixed'::text) OR (discount_value <= amount)))),
    CONSTRAINT course_prices_discount_window_check CHECK (((discount_starts_at IS NULL) OR (discount_ends_at IS NULL) OR (discount_ends_at > discount_starts_at)))
);


--
-- Name: course_prices_backup_20261104; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_prices_backup_20261104 (
    course_id uuid,
    amount numeric(12,2),
    currency text,
    discount_type text,
    discount_value numeric(12,2),
    discount_starts_at timestamp with time zone,
    discount_ends_at timestamp with time zone,
    access_days integer,
    updated_by uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: course_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    locale character varying(10) NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_translations_locale_format_check CHECK (((locale)::text ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text))
);


--
-- Name: TABLE course_translations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.course_translations IS 'Per-locale course title/description. One row per (course_id, locale); the en row mirrors courses.title/description. Backend-owned, never client-writable.';


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    track_slug text DEFAULT 'english'::text NOT NULL,
    cefr_code text,
    cefr_rank smallint,
    CONSTRAINT courses_cefr_rank_positive CHECK (((cefr_rank IS NULL) OR (cefr_rank > 0))),
    CONSTRAINT courses_sort_order_check CHECK ((sort_order >= 0)),
    CONSTRAINT courses_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE courses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.courses IS 'Top-level curriculum courses. Backend is the source of truth for status, ordering, and metadata. Do not store learner progress, placement, mastery, session, or AIM runtime data here.';


--
-- Name: COLUMN courses.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.slug IS 'Optional unique URL-safe identifier. Backend-generated or backend-validated only.';


--
-- Name: COLUMN courses.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.sort_order IS 'Display ordering within the curriculum course list. Backend-owned.';


--
-- Name: COLUMN courses.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';


--
-- Name: COLUMN courses.track_slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.track_slug IS 'Subject/track this course belongs to. Only ''english'' exists today — read this column, do not hardcode it in gating logic.';


--
-- Name: COLUMN courses.cefr_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.cefr_code IS 'CEFR level code (A1, A2, B1, ...). NULL for non-CEFR/legacy courses excluded from gating.';


--
-- Name: COLUMN courses.cefr_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.cefr_rank IS 'Numeric rank matching cefr_code (1 = A1, 2 = A2, ...) for comparison against a student''s computed level. NULL when cefr_code is NULL.';


--
-- Name: curriculum_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curriculum_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    event_type text NOT NULL,
    previous_status text,
    new_status text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT curriculum_audit_logs_entity_type_check CHECK ((entity_type = ANY (ARRAY['course'::text, 'level'::text, 'chapter'::text, 'lesson'::text, 'skill'::text, 'objective'::text, 'lesson_asset'::text, 'question'::text, 'lesson_skill_mapping'::text, 'lesson_objective_mapping'::text, 'question_skill_mapping'::text]))),
    CONSTRAINT curriculum_audit_logs_event_type_check CHECK ((event_type = ANY (ARRAY['created'::text, 'updated'::text, 'status_changed'::text, 'published'::text, 'archived'::text, 'restored'::text, 'skill_linked'::text, 'skill_unlinked'::text, 'objective_linked'::text, 'objective_unlinked'::text, 'asset_attached'::text, 'asset_removed'::text])))
);


--
-- Name: TABLE curriculum_audit_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.curriculum_audit_logs IS 'Append-only audit log for curriculum content management actions. Records must not be updated or deleted by application code. Backend authorization is required to access log data. No onboarding, placement, session, AIM runtime, or learner delivery events.';


--
-- Name: COLUMN curriculum_audit_logs.actor_user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.actor_user_id IS 'Internal AIM user ID of the admin or content manager performing the action. Nullable to support system-initiated events.';


--
-- Name: COLUMN curriculum_audit_logs.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.entity_type IS 'Type of curriculum entity affected by the event.';


--
-- Name: COLUMN curriculum_audit_logs.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.entity_id IS 'UUID of the curriculum entity affected by the event.';


--
-- Name: COLUMN curriculum_audit_logs.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.event_type IS 'Stable event key identifying the curriculum management action being logged.';


--
-- Name: COLUMN curriculum_audit_logs.previous_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.previous_status IS 'Content status before the event, for status change events. Nullable for non-status events.';


--
-- Name: COLUMN curriculum_audit_logs.new_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.new_status IS 'Content status after the event, for status change events. Nullable for non-status events.';


--
-- Name: COLUMN curriculum_audit_logs.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.curriculum_audit_logs.metadata IS 'Additional structured event context. Must not contain secrets, credentials, or privileged backend configuration.';


--
-- Name: daily_challenge_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_challenge_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    challenge_type text NOT NULL,
    target_count smallint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT daily_challenge_templates_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['lessons'::text, 'streak'::text]))),
    CONSTRAINT daily_challenge_templates_target_count_check CHECK (((target_count >= 1) AND (target_count <= 20)))
);


--
-- Name: TABLE daily_challenge_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.daily_challenge_templates IS 'Backend-seeded pool of daily challenge templates. One is deterministically selected per student per day by the backend.';


--
-- Name: dashboard_widgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_widgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dashboard_key text NOT NULL,
    widget_type text NOT NULL,
    metric_definition_id uuid,
    report_definition_id uuid,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dashboard_widgets_display_order CHECK ((display_order >= 0)),
    CONSTRAINT dashboard_widgets_check CHECK (((metric_definition_id IS NOT NULL) OR (report_definition_id IS NOT NULL))),
    CONSTRAINT dashboard_widgets_dashboard_key_check CHECK ((dashboard_key = ANY (ARRAY['admin_overview'::text, 'parent_summary'::text, 'student_summary'::text]))),
    CONSTRAINT dashboard_widgets_widget_type_check CHECK ((widget_type = ANY (ARRAY['kpi'::text, 'chart'::text, 'table'::text])))
);


--
-- Name: deadline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deadline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deadline_id uuid NOT NULL,
    event_type text NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT deadline_events_event_type_check CHECK ((event_type = ANY (ARRAY['opened'::text, 'closed'::text, 'late'::text, 'extended'::text, 'submitted'::text, 'missed'::text, 'expired'::text]))),
    CONSTRAINT deadline_events_metadata_is_object_check CHECK ((jsonb_typeof(metadata) = 'object'::text))
);


--
-- Name: TABLE deadline_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.deadline_events IS 'Immutable append-only audit log of deadline state transitions. Rows are INSERT-only from backend services; no client write path exists. Flutter does not consume this table directly. See docs/phase-10/assessment-domain-map.md §6 (Deadline Event).';


--
-- Name: COLUMN deadline_events.deadline_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.deadline_events.deadline_id IS 'FK to assessment_deadlines.id. Each event belongs to exactly one deadline.';


--
-- Name: COLUMN deadline_events.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.deadline_events.event_type IS 'Type of deadline state transition: opened, closed, late, extended, submitted, missed, or expired. Backend-set; no client write path.';


--
-- Name: COLUMN deadline_events.occurred_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.deadline_events.occurred_at IS 'UTC timestamp of the transition, set by the backend. Never accepted from a client payload.';


--
-- Name: COLUMN deadline_events.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.deadline_events.metadata IS 'Safe, non-sensitive JSONB context for the event (e.g. actor_id, reason, student_id, attempt_id). Must never contain secrets, credentials, correct answers, score thresholds, grading policy, or raw personal data beyond UUIDs.';


--
-- Name: device_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    platform text NOT NULL,
    token text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    device_label text,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT device_tokens_platform_check CHECK ((platform = ANY (ARRAY['ios'::text, 'android'::text]))),
    CONSTRAINT device_tokens_status_check CHECK ((status = ANY (ARRAY['active'::text, 'revoked'::text, 'stale'::text])))
);


--
-- Name: difficulty_decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.difficulty_decisions (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    current_difficulty smallint NOT NULL,
    previous_difficulty smallint NOT NULL,
    rationale text NOT NULL,
    based_on_attempt_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    decided_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT difficulty_decisions_based_on_attempt_ids_is_array_check CHECK ((jsonb_typeof(based_on_attempt_ids) = 'array'::text)),
    CONSTRAINT difficulty_decisions_current_difficulty_range_check CHECK (((current_difficulty >= 1) AND (current_difficulty <= 4))),
    CONSTRAINT difficulty_decisions_previous_difficulty_range_check CHECK (((previous_difficulty >= 1) AND (previous_difficulty <= 4))),
    CONSTRAINT difficulty_decisions_rationale_check CHECK ((rationale = ANY (ARRAY['mastery_increase'::text, 'mastery_decrease'::text, 'consistent_performance'::text, 'insufficient_data_hold'::text]))),
    CONSTRAINT difficulty_decisions_step_constraint_check CHECK ((abs((current_difficulty - previous_difficulty)) <= 1))
);


--
-- Name: TABLE difficulty_decisions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.difficulty_decisions IS 'AIM Engine current-state difficulty decision: one row per (student_id, skill_id). Values mirror the validated AimDifficultyDecisionOutput per P5-014 contract. This is a current-state table, not a decision-history table; full history lives in the AIM audit log.';


--
-- Name: COLUMN difficulty_decisions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.id IS 'Set equal to the AIM Engine-issued decisionId on the persisted update. Changes on every new decision for this (student_id, skill_id) pair.';


--
-- Name: COLUMN difficulty_decisions.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN difficulty_decisions.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.skill_id IS 'Skill key from the curriculum skill taxonomy. Copied from the validated AimDifficultyDecisionOutput.';


--
-- Name: COLUMN difficulty_decisions.current_difficulty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.current_difficulty IS 'Difficulty level (1-4, locked Phase 0/1 scale) governing the student''s next presented item for this skill. The backend content-selection logic reads this column. Exclusively an AIM Engine output.';


--
-- Name: COLUMN difficulty_decisions.previous_difficulty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.previous_difficulty IS 'Difficulty level in effect immediately before the current decision, retained for audit and trend display.';


--
-- Name: COLUMN difficulty_decisions.rationale; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.rationale IS 'Coarse, fixed-enum category describing why the decision was made: mastery_increase, mastery_decrease, consistent_performance, or insufficient_data_hold. Never a free-text explanation, to avoid leaking algorithm internals.';


--
-- Name: COLUMN difficulty_decisions.based_on_attempt_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.based_on_attempt_ids IS 'JSONB array of attempt UUIDs that informed this decision. Copied from the validated AimDifficultyDecisionOutput on every update.';


--
-- Name: COLUMN difficulty_decisions.decided_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.decided_at IS 'When the AIM Engine made this decision, copied from the validated AimDifficultyDecisionOutput.';


--
-- Name: COLUMN difficulty_decisions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.created_at IS 'Backend-set on first persistence for this (student_id, skill_id) pair. Never updated after.';


--
-- Name: COLUMN difficulty_decisions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.difficulty_decisions.updated_at IS 'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';


--
-- Name: error_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    pattern_type text NOT NULL,
    pattern_code text,
    supporting_mistake_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    occurrence_count integer DEFAULT 1 NOT NULL,
    confidence numeric(4,3) DEFAULT 0.500 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deactivated_at timestamp with time zone,
    first_seen_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT error_patterns_confidence_range_check CHECK (((confidence >= 0.000) AND (confidence <= 1.000))),
    CONSTRAINT error_patterns_deactivated_after_first_seen_check CHECK (((deactivated_at IS NULL) OR (deactivated_at >= first_seen_at))),
    CONSTRAINT error_patterns_deactivated_at_consistency_check CHECK ((((is_active = false) AND (deactivated_at IS NOT NULL)) OR ((is_active = true) AND (deactivated_at IS NULL)))),
    CONSTRAINT error_patterns_first_before_last_check CHECK ((first_seen_at <= last_seen_at)),
    CONSTRAINT error_patterns_occurrence_count_positive_check CHECK ((occurrence_count >= 1)),
    CONSTRAINT error_patterns_pattern_code_non_empty_check CHECK (((pattern_code IS NULL) OR (length(TRIM(BOTH FROM pattern_code)) > 0))),
    CONSTRAINT error_patterns_pattern_type_check CHECK ((pattern_type = ANY (ARRAY['phonetic_confusion'::text, 'grammar_rule_misapplication'::text, 'vocabulary_confound'::text, 'reading_inference_error'::text, 'listening_discrimination_error'::text]))),
    CONSTRAINT error_patterns_skill_id_non_empty_check CHECK ((length(TRIM(BOTH FROM skill_id)) > 0)),
    CONSTRAINT error_patterns_supporting_mistake_ids_is_array_check CHECK ((jsonb_typeof(supporting_mistake_ids) = 'array'::text))
);


--
-- Name: TABLE error_patterns; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.error_patterns IS 'Backend-classified error pattern records: one row per (student, skill, pattern_type). Aggregates evidence from mistakes (P5-034) to identify systematic misconceptions. Sent to the AIM Engine as known_error_patterns context (docs/aim-engine/boundary-and-io-contract.md). AIM Engine reads this table; it never writes to it.';


--
-- Name: COLUMN error_patterns.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN error_patterns.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.student_id IS 'Backend-resolved student id from authenticated session context. Never taken from wire payload.';


--
-- Name: COLUMN error_patterns.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.skill_id IS 'Curriculum skill key resolved by the backend from skill-mapping data. Never accepted verbatim from a client-supplied value.';


--
-- Name: COLUMN error_patterns.pattern_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.pattern_type IS 'Machine-readable error category. One of the Phase 5 initial set enforced by CHECK. Extensible in future migrations as new classifiers are added.';


--
-- Name: COLUMN error_patterns.pattern_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.pattern_code IS 'Optional sub-classification within pattern_type set by the backend classifier (e.g. "confounds_b_p_phonemes"). Null when no sub-code applies.';


--
-- Name: COLUMN error_patterns.supporting_mistake_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.supporting_mistake_ids IS 'JSONB array of UUID strings referencing mistakes table rows (P5-034) that provide evidence for this pattern. Append-only — never replaced on update.';


--
-- Name: COLUMN error_patterns.occurrence_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.occurrence_count IS 'Backend-counted total incorrect submissions across all supporting mistakes. Incremented on each update. Never decremented, never from a client counter.';


--
-- Name: COLUMN error_patterns.confidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.confidence IS 'Backend-computed probability in [0.0, 1.0] that this pattern is a real systematic error rather than noise. Updated by the classifier on each evidence addition. Never used to compute mastery, difficulty, or level.';


--
-- Name: COLUMN error_patterns.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.is_active IS 'TRUE while the pattern is current. Set FALSE when the pattern has not recurred recently or when the AIM Engine signals the student has overcome it. Inactive rows are retained for audit history.';


--
-- Name: COLUMN error_patterns.deactivated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.deactivated_at IS 'ISO-8601 UTC timestamp of when the pattern was deactivated. Non-null iff is_active = FALSE, enforced by constraint.';


--
-- Name: COLUMN error_patterns.first_seen_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.first_seen_at IS 'ISO-8601 UTC timestamp of when this pattern was first classified. Set on row creation, never updated.';


--
-- Name: COLUMN error_patterns.last_seen_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.last_seen_at IS 'ISO-8601 UTC timestamp of the most recent evidence addition for this pattern. Updated on each supporting mistake addition.';


--
-- Name: COLUMN error_patterns.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.created_at IS 'Backend-set row creation timestamp. Never updated after insert.';


--
-- Name: COLUMN error_patterns.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.error_patterns.updated_at IS 'Backend-set on every update. Used by AIM state assembly to page through recent changes.';


--
-- Name: export_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.export_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requested_by_user_id uuid NOT NULL,
    requested_role text NOT NULL,
    report_run_id uuid,
    export_type text NOT NULL,
    scope jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    file_ref text,
    denial_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT chk_export_jobs_completed_has_file CHECK (((status <> 'completed'::text) OR (file_ref IS NOT NULL))),
    CONSTRAINT chk_export_jobs_denied_has_reason CHECK (((status <> 'denied'::text) OR (denial_reason IS NOT NULL))),
    CONSTRAINT export_jobs_export_type_check CHECK ((export_type = ANY (ARRAY['csv'::text, 'json'::text, 'pdf'::text]))),
    CONSTRAINT export_jobs_requested_role_check CHECK ((requested_role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text, 'system'::text]))),
    CONSTRAINT export_jobs_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'denied'::text])))
);


--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flag_key character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    enabled boolean DEFAULT false NOT NULL,
    rollout_percentage integer DEFAULT 0 NOT NULL,
    audience jsonb DEFAULT '{}'::jsonb NOT NULL,
    owner_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feature_flags_rollout_percentage_check CHECK (((rollout_percentage >= 0) AND (rollout_percentage <= 100)))
);


--
-- Name: feature_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submitted_by uuid NOT NULL,
    title character varying(300) NOT NULL,
    description text NOT NULL,
    status character varying(30) DEFAULT 'new'::character varying NOT NULL,
    priority character varying(20),
    vote_count integer DEFAULT 0 NOT NULL,
    triage_notes text,
    triaged_by uuid,
    triaged_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feature_requests_priority_check CHECK (((priority IS NULL) OR ((priority)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('critical'::character varying)::text])))),
    CONSTRAINT feature_requests_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('under_review'::character varying)::text, ('planned'::character varying)::text, ('in_progress'::character varying)::text, ('completed'::character varying)::text, ('declined'::character varying)::text])))
);


--
-- Name: idempotency_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idempotency_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    scope text NOT NULL,
    idem_key text NOT NULL,
    request_hash text NOT NULL,
    state text DEFAULT 'in_progress'::text NOT NULL,
    response_status integer,
    response_body jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT idempotency_keys_state_check CHECK ((state = ANY (ARRAY['in_progress'::text, 'completed'::text])))
);


--
-- Name: incident_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    description text NOT NULL,
    severity character varying(20) NOT NULL,
    status character varying(30) DEFAULT 'investigating'::character varying NOT NULL,
    impact text,
    started_at timestamp with time zone NOT NULL,
    resolved_at timestamp with time zone,
    owner_id uuid,
    postmortem_url text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT incident_records_severity_check CHECK (((severity)::text = ANY (ARRAY[('minor'::character varying)::text, ('major'::character varying)::text, ('critical'::character varying)::text]))),
    CONSTRAINT incident_records_status_check CHECK (((status)::text = ANY (ARRAY[('investigating'::character varying)::text, ('identified'::character varying)::text, ('monitoring'::character varying)::text, ('resolved'::character varying)::text, ('postmortem'::character varying)::text])))
);


--
-- Name: initial_learning_path; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initial_learning_path (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_result_id uuid NOT NULL,
    priority integer NOT NULL,
    entry_type text NOT NULL,
    skill_code text,
    skill_id uuid,
    skill_key text,
    skill_name text NOT NULL,
    estimated_level text NOT NULL,
    source text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT initial_learning_path_entry_type_check CHECK ((entry_type = ANY (ARRAY['section'::text, 'skill'::text]))),
    CONSTRAINT initial_learning_path_estimated_level_check CHECK ((estimated_level = ANY (ARRAY['A1'::text, 'A2'::text, 'B1'::text]))),
    CONSTRAINT initial_learning_path_priority_check CHECK ((priority > 0)),
    CONSTRAINT initial_learning_path_section_requires_skill_code CHECK (((entry_type <> 'section'::text) OR (skill_code IS NOT NULL))),
    CONSTRAINT initial_learning_path_skill_requires_skill_id CHECK (((entry_type <> 'skill'::text) OR ((skill_id IS NOT NULL) AND (skill_key IS NOT NULL)))),
    CONSTRAINT initial_learning_path_source_check CHECK ((source = ANY (ARRAY['weakness_map'::text, 'fallback'::text])))
);


--
-- Name: TABLE initial_learning_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.initial_learning_path IS 'Ordered list of curriculum entry points derived from a completed placement result. Written once by the backend after result finalisation. Immutable after creation. Scope: Phase 4 Placement Test only. Not lesson delivery or progress dashboard.';


--
-- Name: COLUMN initial_learning_path.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.id IS 'Primary key — UUID generated by backend.';


--
-- Name: COLUMN initial_learning_path.placement_result_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.placement_result_id IS 'Foreign key to placement_results — the result this path belongs to.';


--
-- Name: COLUMN initial_learning_path.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.priority IS 'Rank order within the path. 1 = highest priority. Must be positive and unique per placement_result_id.';


--
-- Name: COLUMN initial_learning_path.entry_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.entry_type IS 'Type of curriculum entry point: section (skill code area) or skill (specific skill record).';


--
-- Name: COLUMN initial_learning_path.skill_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.skill_code IS 'Section skill code for section-type entries (e.g. grammar, vocabulary). Null for skill-type entries.';


--
-- Name: COLUMN initial_learning_path.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.skill_id IS 'FK to skills table for skill-type entries. Null for section-type entries. Never exposed to Flutter — internal identifier only.';


--
-- Name: COLUMN initial_learning_path.skill_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.skill_key IS 'Dot-delimited stable skill key from P3-006 (e.g. grammar.past_simple.forms). Null for section-type entries. Never exposed to Flutter — internal identifier only.';


--
-- Name: COLUMN initial_learning_path.skill_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.skill_name IS 'Human-readable display name. The only name field returned to Flutter.';


--
-- Name: COLUMN initial_learning_path.estimated_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.estimated_level IS 'CEFR level annotation from placement_results: A1, A2, or B1. Informational only — does not alter priority order.';


--
-- Name: COLUMN initial_learning_path.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.source IS 'Derivation source: weakness_map (from ranked weakness entries) or fallback (applied when weakness map is empty). Internal metadata — never exposed to Flutter.';


--
-- Name: COLUMN initial_learning_path.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.initial_learning_path.created_at IS 'Timestamp when the path entry was written by the backend — never modified.';


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    price_id uuid,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_amount integer NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoice_items_amount_check CHECK ((amount >= 0)),
    CONSTRAINT invoice_items_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT invoice_items_description_check CHECK ((TRIM(BOTH FROM description) <> ''::text)),
    CONSTRAINT invoice_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT invoice_items_unit_amount_check CHECK ((unit_amount >= 0))
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    provider_invoice_id text,
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal integer DEFAULT 0 NOT NULL,
    tax integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    currency text NOT NULL,
    invoice_url text,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    due_date timestamp with time zone,
    paid_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_invoices_period CHECK (((period_start IS NULL) OR (period_end IS NULL) OR (period_end > period_start))),
    CONSTRAINT invoices_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'open'::text, 'paid'::text, 'void'::text, 'uncollectible'::text]))),
    CONSTRAINT invoices_subtotal_check CHECK ((subtotal >= 0)),
    CONSTRAINT invoices_tax_check CHECK ((tax >= 0)),
    CONSTRAINT invoices_total_check CHECK ((total >= 0))
);


--
-- Name: learning_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    session_type text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    current_level text NOT NULL,
    level_source text NOT NULL,
    level_set_at timestamp with time zone NOT NULL,
    skill_focus_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    placement_result_id uuid,
    placement_completed_at timestamp with time zone,
    contract_version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_sessions_activity_timestamps_check CHECK ((started_at <= last_activity_at)),
    CONSTRAINT learning_sessions_closed_at_after_started_check CHECK (((closed_at IS NULL) OR (closed_at >= started_at))),
    CONSTRAINT learning_sessions_closed_status_requires_closed_at_check CHECK ((((status = 'active'::text) AND (closed_at IS NULL)) OR ((status = ANY (ARRAY['closed'::text, 'abandoned'::text])) AND (closed_at IS NOT NULL)))),
    CONSTRAINT learning_sessions_level_source_check CHECK ((level_source = ANY (ARRAY['placement'::text, 'aim_engine'::text]))),
    CONSTRAINT learning_sessions_placement_pair_consistency_check CHECK ((((placement_result_id IS NULL) AND (placement_completed_at IS NULL)) OR ((placement_result_id IS NOT NULL) AND (placement_completed_at IS NOT NULL)))),
    CONSTRAINT learning_sessions_session_type_check CHECK ((session_type = ANY (ARRAY['lesson_practice'::text, 'review_practice'::text, 'placement_followup'::text, 'adaptive_drill'::text]))),
    CONSTRAINT learning_sessions_skill_focus_ids_is_array_check CHECK ((jsonb_typeof(skill_focus_ids) = 'array'::text)),
    CONSTRAINT learning_sessions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'closed'::text, 'abandoned'::text])))
);


--
-- Name: TABLE learning_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.learning_sessions IS 'Backend-owned learning session records. One row per session; backend assembles AimSessionInput (P5-009) from this row plus derived behavioral signals at AIM call time.';


--
-- Name: COLUMN learning_sessions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.id IS 'Primary key. Backend-issued UUID surfaced to the AIM Engine as sessionId.';


--
-- Name: COLUMN learning_sessions.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.student_id IS 'Backend-resolved student id from authenticated session context. Never taken from a client payload.';


--
-- Name: COLUMN learning_sessions.session_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.session_type IS 'Backend-classified session type per P5-009. Client intent is mapped to one of the four allowed values by the backend, never trusted verbatim.';


--
-- Name: COLUMN learning_sessions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.status IS 'Lifecycle status of the session. active until the backend closes or abandons it.';


--
-- Name: COLUMN learning_sessions.started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.started_at IS 'ISO-8601 UTC timestamp of when the backend opened the session.';


--
-- Name: COLUMN learning_sessions.last_activity_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.last_activity_at IS 'ISO-8601 UTC timestamp of the most recent backend-recorded activity in the session. Maintained by the backend session service.';


--
-- Name: COLUMN learning_sessions.closed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.closed_at IS 'ISO-8601 UTC timestamp of when the backend closed or abandoned the session. Null while active.';


--
-- Name: COLUMN learning_sessions.current_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.current_level IS 'Snapshot of the student backend-persisted level at session entry. Read-only context for the AIM Engine; clients never set this.';


--
-- Name: COLUMN learning_sessions.level_source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.level_source IS 'Origin of current_level. One of placement, aim_engine.';


--
-- Name: COLUMN learning_sessions.level_set_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.level_set_at IS 'ISO-8601 UTC timestamp of when current_level was last set by its source.';


--
-- Name: COLUMN learning_sessions.skill_focus_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.skill_focus_ids IS 'JSONB array of curriculum skill keys this session is associated with. Resolved by the backend from curriculum data; clients never submit raw skill keys here.';


--
-- Name: COLUMN learning_sessions.placement_result_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.placement_result_id IS 'Optional reference to the Phase 4 placement result that bootstrapped this students AIM state. Null once the AIM Engine has stable skill-state history.';


--
-- Name: COLUMN learning_sessions.placement_completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.placement_completed_at IS 'ISO-8601 UTC timestamp when the referenced placement completed. Paired with placement_result_id by the consistency check constraint.';


--
-- Name: COLUMN learning_sessions.contract_version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.contract_version IS 'The AIM contract version the backend will declare to the AIM Engine when assembling AimSessionInput for this session.';


--
-- Name: COLUMN learning_sessions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.created_at IS 'Backend-set on row creation. Never updated after.';


--
-- Name: COLUMN learning_sessions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.learning_sessions.updated_at IS 'Backend-set on every write to this row. Maintained by the backend session service, not by clients.';


--
-- Name: lesson_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    url text,
    mime_type text,
    size_bytes bigint,
    duration_seconds integer,
    alt_text text,
    thumbnail_url text,
    "order" integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_assets_duration_check CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))),
    CONSTRAINT lesson_assets_order_check CHECK (("order" > 0)),
    CONSTRAINT lesson_assets_size_bytes_check CHECK (((size_bytes IS NULL) OR (size_bytes >= 0))),
    CONSTRAINT lesson_assets_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT lesson_assets_title_nonempty_check CHECK ((char_length(TRIM(BOTH FROM title)) > 0)),
    CONSTRAINT lesson_assets_type_check CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'audio'::text, 'video'::text, 'document'::text, 'vocabulary'::text, 'exercise'::text, 'external_reference'::text])))
);


--
-- Name: TABLE lesson_assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_assets IS 'Content assets attached to lessons (images, audio, video, documents, external references). Backend is the source of truth for status, ordering, and lesson linkage. An asset cannot be published while its parent lesson is in draft status — enforced at the backend. Do not store learner progress, delivery state, mastery, session, or AIM runtime data here. Never store storage upload credentials, CDN signing keys, or service-role tokens here.';


--
-- Name: COLUMN lesson_assets.lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_assets.lesson_id IS 'Parent lesson reference. Set on creation only — cannot be changed. Cascade delete is restricted; assets must be archived or removed explicitly (no hard delete).';


--
-- Name: COLUMN lesson_assets.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_assets.type IS 'Asset type. Set on creation only — cannot be changed. Allowed values: text, image, audio, video, document, vocabulary, exercise, external_reference.';


--
-- Name: COLUMN lesson_assets."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_assets."order" IS 'Display order within the parent lesson. Must be a positive integer, unique per lesson. Backend ensures uniqueness; clients must not rely on local ordering.';


--
-- Name: COLUMN lesson_assets.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_assets.status IS 'Backend-owned content lifecycle status. Allowed values: draft, published, archived. An image asset must have alt_text set before it can be published (backend enforced).';


--
-- Name: COLUMN lesson_assets.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_assets.metadata IS 'Type-specific metadata object (e.g. width_px/height_px/format for image, bitrate_kbps/transcript_url for audio, captions_url for video). See P3-013 lesson asset contract.';


--
-- Name: lesson_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    learning_session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_type text NOT NULL,
    skill_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    presented_difficulty smallint NOT NULL,
    answer_format text NOT NULL,
    answer_value text NOT NULL,
    options_presented_count smallint,
    is_correct boolean NOT NULL,
    attempt_number_for_item integer NOT NULL,
    started_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone NOT NULL,
    response_time_ms integer NOT NULL,
    answer_change_count integer DEFAULT 0 NOT NULL,
    hesitation_before_submit_ms integer,
    used_hint boolean DEFAULT false NOT NULL,
    abandoned_first_then_retried boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_attempts_answer_change_count_non_negative_check CHECK ((answer_change_count >= 0)),
    CONSTRAINT lesson_attempts_answer_format_check CHECK ((answer_format = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'fill_blank'::text, 'listening_choice'::text, 'free_text'::text]))),
    CONSTRAINT lesson_attempts_attempt_number_positive_check CHECK ((attempt_number_for_item >= 1)),
    CONSTRAINT lesson_attempts_hesitation_non_negative_check CHECK (((hesitation_before_submit_ms IS NULL) OR (hesitation_before_submit_ms >= 0))),
    CONSTRAINT lesson_attempts_item_type_check CHECK ((item_type = ANY (ARRAY['lesson_question'::text, 'practice_question'::text, 'review_question'::text, 'drill_question'::text]))),
    CONSTRAINT lesson_attempts_options_count_format_consistency_check CHECK ((((answer_format = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'listening_choice'::text])) AND (options_presented_count IS NOT NULL)) OR ((answer_format = ANY (ARRAY['fill_blank'::text, 'free_text'::text])) AND (options_presented_count IS NULL)))),
    CONSTRAINT lesson_attempts_options_count_non_negative_check CHECK (((options_presented_count IS NULL) OR (options_presented_count >= 0))),
    CONSTRAINT lesson_attempts_presented_difficulty_range_check CHECK (((presented_difficulty >= 1) AND (presented_difficulty <= 4))),
    CONSTRAINT lesson_attempts_response_time_non_negative_check CHECK ((response_time_ms >= 0)),
    CONSTRAINT lesson_attempts_skill_ids_is_array_check CHECK ((jsonb_typeof(skill_ids) = 'array'::text)),
    CONSTRAINT lesson_attempts_started_before_submitted_check CHECK ((started_at <= submitted_at))
);


--
-- Name: TABLE lesson_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_attempts IS 'Backend-owned attempt records. Source of AimAttemptInput entries (P5-010) assembled by the backend for POST /aim/v1/analysis.';


--
-- Name: COLUMN lesson_attempts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.id IS 'Primary key. Backend-issued UUID surfaced to the AIM Engine as attemptId.';


--
-- Name: COLUMN lesson_attempts.learning_session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.learning_session_id IS 'References the owning learning session. Must match the sessionId carried in the accompanying session input segment when sent to the AIM Engine. No FK constraint declared in this migration to avoid a forward dependency on the still-unmerged learning_sessions migration; downstream migration may add the FK once both tables are merged in order.';


--
-- Name: COLUMN lesson_attempts.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.student_id IS 'Backend-resolved student id, denormalized from the owning session for fast per-student queries.';


--
-- Name: COLUMN lesson_attempts.item_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.item_id IS 'Backend-issued identifier of the question, lesson item, or practice item attempted.';


--
-- Name: COLUMN lesson_attempts.item_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.item_type IS 'Backend-classified item type. One of lesson_question, practice_question, review_question, drill_question. Must be consistent with the owning session sessionType.';


--
-- Name: COLUMN lesson_attempts.skill_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.skill_ids IS 'JSONB array of curriculum skill keys linked to the item, resolved by the backend from curriculum skill-mapping data. Never accepted verbatim from the client.';


--
-- Name: COLUMN lesson_attempts.presented_difficulty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.presented_difficulty IS 'Backend-recorded difficulty level (1-4, Phase 0/1 locked scale) at which the item was presented for this attempt. Informational context only; the AIM Engine decides the next difficulty separately (P5-014).';


--
-- Name: COLUMN lesson_attempts.answer_format; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.answer_format IS 'Backend-classified answer format. One of multiple_choice, true_false, fill_blank, listening_choice, free_text.';


--
-- Name: COLUMN lesson_attempts.answer_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.answer_value IS 'Backend-normalized literal answer content submitted by the student. Raw input only; not itself an AIM-owned decision field.';


--
-- Name: COLUMN lesson_attempts.options_presented_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.options_presented_count IS 'Number of answer options presented for option-based formats. Null for fill_blank and free_text per the format-consistency check.';


--
-- Name: COLUMN lesson_attempts.is_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.is_correct IS 'Backend-evaluated correctness. Always computed by backend scoring logic; never trusted from a client-submitted value.';


--
-- Name: COLUMN lesson_attempts.attempt_number_for_item; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.attempt_number_for_item IS 'Backend-counted ordinal of this attempt for this item within the session. 1 for the first try. Never trusted from a client counter.';


--
-- Name: COLUMN lesson_attempts.started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.started_at IS 'ISO-8601 UTC timestamp of when the item was presented to the student.';


--
-- Name: COLUMN lesson_attempts.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.submitted_at IS 'ISO-8601 UTC timestamp of when the backend recorded the answer submission.';


--
-- Name: COLUMN lesson_attempts.response_time_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.response_time_ms IS 'submitted_at minus started_at in milliseconds, computed by the backend. Behavioral context only; must never feed mastery, level, or difficulty logic.';


--
-- Name: COLUMN lesson_attempts.answer_change_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.answer_change_count IS 'Backend-counted number of times the student changed their selected or written answer before submission.';


--
-- Name: COLUMN lesson_attempts.hesitation_before_submit_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.hesitation_before_submit_ms IS 'Raw time between first interaction and final submission, in milliseconds, when distinct from response_time_ms. Null when not separately tracked.';


--
-- Name: COLUMN lesson_attempts.used_hint; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.used_hint IS 'Whether a backend-provided hint was shown before submission.';


--
-- Name: COLUMN lesson_attempts.abandoned_first_then_retried; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.abandoned_first_then_retried IS 'Whether the student navigated away from the item before returning to complete it.';


--
-- Name: COLUMN lesson_attempts.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_attempts.created_at IS 'Backend-set on row creation. Never updated after.';


--
-- Name: lesson_objectives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_objectives (
    lesson_id uuid NOT NULL,
    objective_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE lesson_objectives; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_objectives IS 'Mapping between lessons and the learning objectives they declare. Backend is the source of truth for this mapping; clients must not write to it directly. Used for curriculum content coverage and planning only — must not be used for learner mastery, progress, placement, session, or AIM runtime data. Does not replace the lesson_skills mapping: every lesson must still be linkable to one or more skills.';


--
-- Name: COLUMN lesson_objectives.lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_objectives.lesson_id IS 'Lesson declaring the objective. Cascade-deleted with the lesson.';


--
-- Name: COLUMN lesson_objectives.objective_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_objectives.objective_id IS 'Objective declared by the lesson. An objective referenced here cannot be hard-deleted.';


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    percent smallint DEFAULT 0 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    last_active_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_progress_completed_consistency_check CHECK ((((completed = true) AND (completed_at IS NOT NULL)) OR ((completed = false) AND (completed_at IS NULL)))),
    CONSTRAINT lesson_progress_percent_range_check CHECK (((percent >= 0) AND (percent <= 100)))
);


--
-- Name: TABLE lesson_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_progress IS 'Backend-owned per-student lesson completion tracking. One row per (student_id, lesson_id) pair.';


--
-- Name: COLUMN lesson_progress.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.student_id IS 'JWT-resolved Supabase auth uid of the student (matches users.supabase_auth_uid, the same convention used by learning_sessions.student_id and lesson_attempts.student_id). Never accepted from client input.';


--
-- Name: COLUMN lesson_progress.lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.lesson_id IS 'References the lesson being tracked.';


--
-- Name: COLUMN lesson_progress.percent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.percent IS 'Backend-clamped progress percent (0-100) within the lesson. Informational only — completion is set exclusively via the complete endpoint.';


--
-- Name: COLUMN lesson_progress.completed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.completed IS 'Whether the student has completed this lesson. Only ever set TRUE by the backend complete endpoint.';


--
-- Name: COLUMN lesson_progress.started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.started_at IS 'Backend-set on first progress event for this (student, lesson) pair.';


--
-- Name: COLUMN lesson_progress.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.completed_at IS 'Backend-set timestamp of completion. NULL while completed = FALSE.';


--
-- Name: COLUMN lesson_progress.last_active_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_progress.last_active_at IS 'Backend-updated on every progress or completion event. Used to compute the student lastActiveAt summary.';


--
-- Name: lesson_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_questions (
    lesson_id uuid NOT NULL,
    question_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_skills (
    lesson_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE lesson_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_skills IS 'Maps lessons to one or more skills. CRITICAL: A lesson cannot be published without at least one row here pointing to a published skill. Enforced by the backend publish endpoint (P3-006, P3-039). Cascade delete on lesson removal; RESTRICT on skill removal to prevent orphaned lesson-skill links.';


--
-- Name: COLUMN lesson_skills.lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_skills.lesson_id IS 'Parent lesson reference. Cascade-deleted when the lesson is deleted.';


--
-- Name: COLUMN lesson_skills.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lesson_skills.skill_id IS 'Linked skill reference. RESTRICT prevents deleting a skill that is still linked to lessons.';


--
-- Name: lesson_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    locale character varying(10) NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_translations_locale_format_check CHECK (((locale)::text ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text))
);


--
-- Name: TABLE lesson_translations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lesson_translations IS 'Per-locale lesson title/description. One row per (lesson_id, locale); the en row mirrors lessons.title/description. Backend-owned, never client-writable.';


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chapter_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    xp_value integer DEFAULT 0 NOT NULL,
    system_prompt text,
    teaching_outline jsonb,
    explanation jsonb,
    CONSTRAINT lessons_description_nonempty_check CHECK ((char_length(TRIM(BOTH FROM description)) > 0)),
    CONSTRAINT lessons_sort_order_check CHECK ((sort_order >= 0)),
    CONSTRAINT lessons_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT lessons_title_nonempty_check CHECK ((char_length(TRIM(BOTH FROM title)) > 0)),
    CONSTRAINT lessons_xp_value_check CHECK ((xp_value >= 0))
);


--
-- Name: TABLE lessons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lessons IS 'Curriculum lessons linked to chapters. Backend is the source of truth for status, ordering, and hierarchy references. CRITICAL: A lesson cannot be published without at least one linked published skill — enforced at the backend publish endpoint (P3-006). Do not store learner progress, delivery state, mastery, session, or AIM runtime data here.';


--
-- Name: COLUMN lessons.chapter_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.chapter_id IS 'Parent chapter reference. Set on creation only — cannot be changed. Cascade delete is restricted; lessons must be archived or removed explicitly.';


--
-- Name: COLUMN lessons.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.sort_order IS 'Display ordering within the parent chapter. Backend ensures uniqueness per chapter. Clients must not rely on local ordering.';


--
-- Name: COLUMN lessons.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived. Publishing requires at least one linked published skill (backend enforced).';


--
-- Name: COLUMN lessons.xp_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.xp_value IS 'Gamification points awarded to the student on lesson completion. Backend-owned, display-only — never read by the AIM Engine, mastery scoring, weakness detection, or recommendation logic. Defaults to 0 for existing lessons.';


--
-- Name: COLUMN lessons.system_prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.system_prompt IS 'Optional admin-authored AI Teacher instructions specific to this lesson (what the lesson should be about, what to focus on). Injected into the AI Teacher prompt context alongside title/description when a chat session''s contextRef references this lesson. Null means no lesson-specific instructions beyond title/description.';


--
-- Name: levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    code text,
    slug text,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT levels_sort_order_check CHECK ((sort_order >= 0)),
    CONSTRAINT levels_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE levels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.levels IS 'Ordered learner levels within a course. Backend is the source of truth for status, ordering, and metadata. Do not store learner progress, placement, mastery, session, or AIM runtime data here.';


--
-- Name: COLUMN levels.course_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.levels.course_id IS 'Parent course reference. Cascade delete is restricted — levels must be removed explicitly.';


--
-- Name: COLUMN levels.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.levels.code IS 'Optional short code for the level (e.g. A1, B2). Editorial metadata only; not a mastery or placement signal.';


--
-- Name: COLUMN levels.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.levels.sort_order IS 'Display ordering within the parent course. Backend-owned.';


--
-- Name: COLUMN levels.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.levels.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';


--
-- Name: maintenance_windows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_windows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    type character varying(20) NOT NULL,
    status character varying(30) DEFAULT 'scheduled'::character varying NOT NULL,
    affected_services text[] DEFAULT '{}'::text[] NOT NULL,
    scheduled_start timestamp with time zone NOT NULL,
    scheduled_end timestamp with time zone NOT NULL,
    actual_start timestamp with time zone,
    actual_end timestamp with time zone,
    user_message text,
    created_by uuid NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT maintenance_windows_status_check CHECK (((status)::text = ANY (ARRAY[('scheduled'::character varying)::text, ('in_progress'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text]))),
    CONSTRAINT maintenance_windows_type_check CHECK (((type)::text = ANY (ARRAY[('planned'::character varying)::text, ('emergency'::character varying)::text, ('routine'::character varying)::text, ('upgrade'::character varying)::text])))
);


--
-- Name: metric_aggregates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metric_aggregates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_definition_id uuid NOT NULL,
    scope_type text NOT NULL,
    scope_id uuid,
    period_type text NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    value numeric NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_metric_aggregates_period CHECK ((period_end > period_start)),
    CONSTRAINT metric_aggregates_period_type_check CHECK ((period_type = ANY (ARRAY['day'::text, 'week'::text, 'month'::text]))),
    CONSTRAINT metric_aggregates_scope_type_check CHECK ((scope_type = ANY (ARRAY['platform'::text, 'cohort'::text, 'role'::text, 'student'::text, 'parent'::text])))
);


--
-- Name: metric_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metric_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    domain text NOT NULL,
    value_type text NOT NULL,
    aggregation_method text NOT NULL,
    source_event_types text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT metric_definitions_domain_check CHECK ((domain = ANY (ARRAY['learning'::text, 'placement'::text, 'curriculum'::text, 'assessment'::text, 'notification'::text, 'billing'::text, 'user'::text, 'operations'::text]))),
    CONSTRAINT metric_definitions_value_type_check CHECK ((value_type = ANY (ARRAY['count'::text, 'rate'::text, 'sum'::text, 'average'::text, 'distinct_count'::text])))
);


--
-- Name: mistake_resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mistake_resolutions (
    student_id uuid NOT NULL,
    item_id uuid NOT NULL,
    resolved_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mistakes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mistakes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    item_id uuid NOT NULL,
    skill_id text NOT NULL,
    occurrence_count integer DEFAULT 1 NOT NULL,
    answer_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    resolved_at timestamp with time zone,
    first_seen_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mistakes_answer_ids_is_array_check CHECK ((jsonb_typeof(answer_ids) = 'array'::text)),
    CONSTRAINT mistakes_first_before_last_check CHECK ((first_seen_at <= last_seen_at)),
    CONSTRAINT mistakes_occurrence_count_positive_check CHECK ((occurrence_count >= 1)),
    CONSTRAINT mistakes_resolved_after_first_seen_check CHECK (((resolved_at IS NULL) OR (resolved_at >= first_seen_at))),
    CONSTRAINT mistakes_resolved_at_consistency_check CHECK ((((is_resolved = true) AND (resolved_at IS NOT NULL)) OR ((is_resolved = false) AND (resolved_at IS NULL)))),
    CONSTRAINT mistakes_skill_id_non_empty_check CHECK ((length(TRIM(BOTH FROM skill_id)) > 0))
);


--
-- Name: TABLE mistakes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mistakes IS 'Backend-owned mistake records: one row per (student, item, skill) incorrect-answer instance. Accumulates incorrect submission evidence across attempts. Feeds AIM Engine weakness detection (P5-013) and error-pattern analysis (P5-035). AIM Engine reads this table as behavioral context; it never writes to it.';


--
-- Name: COLUMN mistakes.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN mistakes.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.student_id IS 'Backend-resolved student id from authenticated session context. Never taken from wire payload.';


--
-- Name: COLUMN mistakes.item_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.item_id IS 'Backend-issued identifier of the question or item the student answered incorrectly.';


--
-- Name: COLUMN mistakes.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.skill_id IS 'Curriculum skill key resolved by the backend from skill-mapping data for the item. Never accepted verbatim from a client-supplied value.';


--
-- Name: COLUMN mistakes.occurrence_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.occurrence_count IS 'Backend-counted number of incorrect submissions for this (student, item, skill) triple. Starts at 1 on row creation and is incremented on each subsequent incorrect answer. Never decremented, never trusted from a client counter.';


--
-- Name: COLUMN mistakes.answer_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.answer_ids IS 'JSONB array of UUID strings referencing the incorrect answers table rows (P5-033) that contributed to this mistake record. Append-only — never replaced on update. Provides the AIM Engine with the evidence trail for this mistake instance.';


--
-- Name: COLUMN mistakes.is_resolved; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.is_resolved IS 'Set TRUE only by backend persistence logic acting on an AIM Engine weakness-resolved output. Clients must never set this field directly. FALSE by default.';


--
-- Name: COLUMN mistakes.resolved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.resolved_at IS 'ISO-8601 UTC timestamp of when the mistake was marked resolved. Non-null iff is_resolved = TRUE, enforced by constraint.';


--
-- Name: COLUMN mistakes.first_seen_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.first_seen_at IS 'ISO-8601 UTC timestamp of the first incorrect submission for this triple. Set on row creation and never updated.';


--
-- Name: COLUMN mistakes.last_seen_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.last_seen_at IS 'ISO-8601 UTC timestamp of the most recent incorrect submission. Updated on each subsequent incorrect answer for this triple.';


--
-- Name: COLUMN mistakes.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.created_at IS 'Backend-set row creation timestamp. Never updated after insert.';


--
-- Name: COLUMN mistakes.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mistakes.updated_at IS 'Backend-set on every update (occurrence_count increment, resolution). Used by the AIM Engine state assembly service to page through recent changes.';


--
-- Name: notification_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_type text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    retain_until timestamp with time zone,
    CONSTRAINT notification_audit_logs_actor_type_check CHECK ((actor_type = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text, 'system'::text]))),
    CONSTRAINT notification_audit_logs_entity_type_check CHECK ((entity_type = ANY (ARRAY['notification_template'::text, 'notification_preference'::text, 'device_token'::text, 'notification_event'::text, 'reminder_schedule'::text, 'notification_delivery_attempt'::text, 'notification_digest'::text, 'notification_quiet_hours'::text])))
);


--
-- Name: notification_delivery_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_delivery_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_event_id uuid NOT NULL,
    channel text NOT NULL,
    provider text NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    retain_until timestamp with time zone,
    CONSTRAINT chk_delivery_attempts_channel CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT notification_delivery_attempts_attempt_number_check CHECK ((attempt_number > 0)),
    CONSTRAINT notification_delivery_attempts_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT notification_delivery_attempts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])))
);


--
-- Name: notification_digests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_digests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    recipient_type text NOT NULL,
    period text NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    event_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    state text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_notification_digests_period_order CHECK ((period_end > period_start)),
    CONSTRAINT notification_digests_period_check CHECK ((period = ANY (ARRAY['daily'::text, 'weekly'::text]))),
    CONSTRAINT notification_digests_recipient_type_check CHECK ((recipient_type = ANY (ARRAY['student'::text, 'parent'::text]))),
    CONSTRAINT notification_digests_state_check CHECK ((state = ANY (ARRAY['pending'::text, 'sent'::text])))
);


--
-- Name: notification_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    recipient_type text NOT NULL,
    template_id uuid NOT NULL,
    category text NOT NULL,
    channel text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    state text DEFAULT 'scheduled'::text NOT NULL,
    read_at timestamp with time zone,
    dismissed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    retain_until timestamp with time zone,
    CONSTRAINT notification_events_category_check CHECK ((category = ANY (ARRAY['learning_reminder'::text, 'deadline_reminder'::text, 'progress_update'::text, 'assessment_result'::text, 'parent_summary'::text, 'system_alert'::text]))),
    CONSTRAINT notification_events_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT notification_events_recipient_type_check CHECK ((recipient_type = ANY (ARRAY['student'::text, 'parent'::text]))),
    CONSTRAINT notification_events_state_check CHECK ((state = ANY (ARRAY['scheduled'::text, 'queued'::text, 'sent'::text, 'failed'::text, 'delivered'::text, 'dismissed'::text, 'read'::text])))
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_type text NOT NULL,
    channel text NOT NULL,
    category text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_preferences_category_check CHECK ((category = ANY (ARRAY['learning_reminder'::text, 'deadline_reminder'::text, 'progress_update'::text, 'assessment_result'::text, 'parent_summary'::text, 'system_alert'::text]))),
    CONSTRAINT notification_preferences_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT notification_preferences_user_type_check CHECK ((user_type = ANY (ARRAY['student'::text, 'parent'::text])))
);


--
-- Name: notification_quiet_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_quiet_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_type text NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    timezone text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_quiet_hours_user_type_check CHECK ((user_type = ANY (ARRAY['student'::text, 'parent'::text])))
);


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    channel text NOT NULL,
    locale text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    title_template text NOT NULL,
    body_template text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_templates_category_check CHECK ((category = ANY (ARRAY['learning_reminder'::text, 'deadline_reminder'::text, 'progress_update'::text, 'assessment_result'::text, 'parent_summary'::text, 'system_alert'::text]))),
    CONSTRAINT notification_templates_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text]))),
    CONSTRAINT notification_templates_locale_check CHECK ((locale = ANY (ARRAY['en'::text, 'ar'::text]))),
    CONSTRAINT notification_templates_status_check CHECK ((status = ANY (ARRAY['active'::text, 'disabled'::text])))
);


--
-- Name: objective_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objective_skills (
    objective_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE objective_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.objective_skills IS 'Mapping between objectives and related skills. Used for content coverage tracking and curriculum planning only. Must not be used for learner mastery, placement, or recommendation pipelines.';


--
-- Name: objectives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objectives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text,
    title text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT objectives_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT objectives_title_nonempty_check CHECK ((char_length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: TABLE objectives; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.objectives IS 'Learning objectives as first-class curriculum content records. Backend is the source of truth for status, key, and skill links. Do not store learner mastery, progress, placement, session, or AIM runtime data here.';


--
-- Name: COLUMN objectives.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.objectives.key IS 'Optional stable machine-readable objective key. Recommended format: objective.domain.topic.action (e.g. objective.grammar.past_simple.recognize_forms). Unique when provided. Changing this key requires an explicit migration.';


--
-- Name: COLUMN objectives.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.objectives.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';


--
-- Name: operational_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operational_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    component character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'operational'::character varying NOT NULL,
    description text,
    updated_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: operations_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operations_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT operations_audit_logs_resource_type_check CHECK (((resource_type)::text = ANY (ARRAY[('support_ticket'::character varying)::text, ('feedback'::character varying)::text, ('feature_request'::character varying)::text, ('incident'::character varying)::text, ('maintenance_window'::character varying)::text, ('release_note'::character varying)::text, ('operational_status'::character varying)::text, ('feature_flag'::character varying)::text])))
);


--
-- Name: parent_access_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_access_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: parent_child_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_child_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    relationship_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    linked_at timestamp with time zone,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_parent_child_links_active_linked_at CHECK (((status <> 'active'::text) OR (linked_at IS NOT NULL))),
    CONSTRAINT chk_parent_child_links_revoked_revoked_at CHECK (((status <> 'revoked'::text) OR (revoked_at IS NOT NULL))),
    CONSTRAINT parent_child_links_relationship_type_check CHECK ((relationship_type = ANY (ARRAY['parent'::text, 'guardian'::text, 'other'::text]))),
    CONSTRAINT parent_child_links_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'revoked'::text])))
);


--
-- Name: parent_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_consents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_child_link_id uuid NOT NULL,
    consent_type text NOT NULL,
    status text DEFAULT 'granted'::text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    granted_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_parent_consents_revoked_revoked_at CHECK (((status <> 'revoked'::text) OR (revoked_at IS NOT NULL))),
    CONSTRAINT parent_consents_consent_type_check CHECK ((consent_type = ANY (ARRAY['progress_view'::text, 'assessment_view'::text, 'activity_view'::text, 'report_view'::text, 'full_access'::text]))),
    CONSTRAINT parent_consents_status_check CHECK ((status = ANY (ARRAY['granted'::text, 'revoked'::text])))
);


--
-- Name: parent_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_email text,
    child_id uuid,
    invitation_code text NOT NULL,
    relationship_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_parent_invitations_accepted_accepted_at CHECK (((status <> 'accepted'::text) OR (accepted_at IS NOT NULL))),
    CONSTRAINT chk_parent_invitations_has_target CHECK (((child_email IS NOT NULL) OR (child_id IS NOT NULL))),
    CONSTRAINT parent_invitations_relationship_type_check CHECK ((relationship_type = ANY (ARRAY['parent'::text, 'guardian'::text, 'other'::text]))),
    CONSTRAINT parent_invitations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: parent_notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    channel text NOT NULL,
    category text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT parent_notification_preferences_category_check CHECK ((category = ANY (ARRAY['progress_update'::text, 'assessment_result'::text, 'deadline_reminder'::text, 'weekly_summary'::text, 'system_alert'::text]))),
    CONSTRAINT parent_notification_preferences_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text])))
);


--
-- Name: payment_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purpose text NOT NULL,
    content_type text NOT NULL,
    byte_size integer NOT NULL,
    data bytea NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_images_content_type_check CHECK ((content_type = ANY (ARRAY['image/png'::text, 'image/jpeg'::text, 'image/webp'::text]))),
    CONSTRAINT payment_images_purpose_check CHECK ((purpose = ANY (ARRAY['wallet_logo'::text, 'wallet_qr'::text, 'receipt'::text]))),
    CONSTRAINT payment_images_size_check CHECK (((byte_size > 0) AND (byte_size <= 5242880)))
);


--
-- Name: payment_provider_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_provider_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_event_id text NOT NULL,
    event_type text NOT NULL,
    provider text NOT NULL,
    processing_status text DEFAULT 'pending'::text NOT NULL,
    idempotency_key text NOT NULL,
    payload_summary jsonb DEFAULT '{}'::jsonb NOT NULL,
    error_message text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_provider_events_event_type_check CHECK ((TRIM(BOTH FROM event_type) <> ''::text)),
    CONSTRAINT payment_provider_events_processing_status_check CHECK ((processing_status = ANY (ARRAY['pending'::text, 'processed'::text, 'failed'::text, 'skipped'::text]))),
    CONSTRAINT payment_provider_events_provider_check CHECK ((provider = 'stripe'::text))
);


--
-- Name: payment_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    account_name text,
    account_number text,
    instructions text,
    logo_image_id uuid,
    qr_image_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_wallets_name_check CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    checkout_session_id uuid,
    subscription_id uuid,
    amount integer NOT NULL,
    currency text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider_payment_id text,
    payment_method_type text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_check CHECK ((amount >= 0)),
    CONSTRAINT payments_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT payments_payment_method_type_check CHECK ((payment_method_type = ANY (ARRAY['card'::text, 'bank_transfer'::text, 'wallet'::text, 'other'::text]))),
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'refunded'::text, 'partially_refunded'::text])))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    scope text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT permissions_key_check CHECK ((key = ANY (ARRAY['profiles.read.own'::text, 'profiles.update.own'::text, 'profiles.read.any'::text, 'profiles.update.any'::text, 'users.read'::text, 'users.manage'::text, 'roles.read'::text, 'roles.manage'::text, 'permissions.read'::text, 'permissions.manage'::text, 'admin.users.read'::text, 'admin.users.manage'::text, 'auth.audit.read'::text, 'curriculum.content.read.published'::text, 'curriculum.content.read.draft'::text, 'curriculum.content.read.archived'::text, 'curriculum.content.create'::text, 'curriculum.content.update'::text, 'curriculum.content.publish'::text, 'curriculum.content.archive'::text, 'curriculum.content.restore'::text, 'curriculum.skill_links.manage'::text, 'curriculum.audit.read'::text]))),
    CONSTRAINT permissions_scope_check CHECK ((scope = ANY (ARRAY['profiles'::text, 'users'::text, 'roles'::text, 'permissions'::text, 'admin.users'::text, 'auth.audit'::text, 'curriculum'::text])))
);


--
-- Name: TABLE permissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.permissions IS 'Backend-owned AIM permission definitions enforced by backend guards and services.';


--
-- Name: COLUMN permissions.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.permissions.key IS 'Stable shared permission key. Backend must enforce the full permission key.';


--
-- Name: COLUMN permissions.scope; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.permissions.scope IS 'Permission grouping value for backend organization and approved UX display only.';


--
-- Name: placement_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_attempt_id uuid NOT NULL,
    placement_question_id uuid NOT NULL,
    answer_value text NOT NULL,
    is_correct boolean,
    skill_code text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    audio_asset_ref text,
    transcript text,
    ai_score numeric(4,2),
    ai_feedback text,
    graded_at timestamp with time zone,
    CONSTRAINT placement_answers_ai_score_range CHECK (((ai_score IS NULL) OR ((ai_score >= (0)::numeric) AND (ai_score <= (10)::numeric)))),
    CONSTRAINT placement_answers_answer_value_check CHECK ((length(TRIM(BOTH FROM answer_value)) > 0)),
    CONSTRAINT placement_answers_skill_code_check CHECK ((skill_code = ANY (ARRAY['grammar'::text, 'vocabulary'::text, 'reading'::text, 'listening'::text, 'writing'::text, 'speaking'::text])))
);


--
-- Name: TABLE placement_answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_answers IS 'Stores answers submitted by students during a placement attempt. One answer per question per attempt.';


--
-- Name: COLUMN placement_answers.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.id IS 'Primary key — UUID generated by backend.';


--
-- Name: COLUMN placement_answers.placement_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.placement_attempt_id IS 'Foreign key to placement_attempts — the attempt this answer belongs to.';


--
-- Name: COLUMN placement_answers.placement_question_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.placement_question_id IS 'Foreign key to placement_questions — the question being answered.';


--
-- Name: COLUMN placement_answers.answer_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.answer_value IS 'The student submitted answer. Format depends on question type per P4-012 contract.';


--
-- Name: COLUMN placement_answers.is_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.is_correct IS 'Evaluated by backend only after attempt submission. Null during active attempt.';


--
-- Name: COLUMN placement_answers.skill_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.skill_code IS 'Inherited from the parent question skill_code. Backend-controlled.';


--
-- Name: COLUMN placement_answers.audio_asset_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.audio_asset_ref IS 'Storage reference for a speaking answer''s recorded audio (mirrors voice-teacher''s VoiceAudioAsset pattern). Null for non-speaking answers.';


--
-- Name: COLUMN placement_answers.transcript; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.transcript IS 'STT transcript of a speaking answer''s audio_asset_ref, produced by the same STT pipeline used for voice teacher. Null for non-speaking answers.';


--
-- Name: COLUMN placement_answers.ai_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.ai_score IS 'AI-graded score 0-10 for writing/speaking answers. Null for objectively-scored question types and until grading completes.';


--
-- Name: COLUMN placement_answers.ai_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.ai_feedback IS 'Brief AI-generated feedback text for writing/speaking answers. Never exposed with internal mastery/weighting data -- student-safe text only.';


--
-- Name: COLUMN placement_answers.graded_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_answers.graded_at IS 'Timestamp AI grading completed for this answer. Null until graded.';


--
-- Name: placement_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    placement_test_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    submitted_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    duration_seconds integer DEFAULT 2700 NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT placement_attempts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'submitted'::text, 'completed'::text, 'abandoned'::text])))
);


--
-- Name: TABLE placement_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_attempts IS 'Tracks each student placement test attempt. One active attempt per student per test allowed at a time.';


--
-- Name: COLUMN placement_attempts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.id IS 'Primary key — UUID generated by backend.';


--
-- Name: COLUMN placement_attempts.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.student_id IS 'Foreign key to students table — set by backend on attempt start.';


--
-- Name: COLUMN placement_attempts.placement_test_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.placement_test_id IS 'Foreign key to placement_tests — the test this attempt belongs to.';


--
-- Name: COLUMN placement_attempts.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.status IS 'Attempt lifecycle status. Transitions: active -> submitted -> completed. active -> abandoned on timeout.';


--
-- Name: COLUMN placement_attempts.started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.started_at IS 'Timestamp when the attempt was started — set by backend.';


--
-- Name: COLUMN placement_attempts.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.submitted_at IS 'Timestamp when the student submitted the attempt — null until submitted.';


--
-- Name: COLUMN placement_attempts.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.completed_at IS 'Timestamp when backend completed evaluation — null until completed.';


--
-- Name: COLUMN placement_attempts.duration_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.duration_seconds IS 'Total time budget for the whole attempt, in seconds. Backend-owned; set at attempt start.';


--
-- Name: COLUMN placement_attempts.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_attempts.expires_at IS 'started_at + duration_seconds, computed and stored at attempt start. Backend rejects/auto-completes answer submission once now() passes this timestamp. Client renders its countdown from this timestamp, never from a client-local timer alone.';


--
-- Name: placement_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_attempt_id uuid,
    student_id uuid NOT NULL,
    event_type text NOT NULL,
    event_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT placement_audit_log_event_type_check CHECK ((event_type = ANY (ARRAY['attempt_started'::text, 'answer_submitted'::text, 'attempt_submitted'::text, 'attempt_completed'::text, 'attempt_abandoned'::text, 'result_generated'::text, 'path_assigned'::text, 'section_completed'::text])))
);


--
-- Name: TABLE placement_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_audit_log IS 'Audit trail for placement lifecycle events. Supports debugging and accountability.';


--
-- Name: COLUMN placement_audit_log.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.id IS 'Primary key — UUID generated by backend.';


--
-- Name: COLUMN placement_audit_log.placement_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.placement_attempt_id IS 'Foreign key to placement_attempts — nullable in case attempt is deleted.';


--
-- Name: COLUMN placement_audit_log.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.student_id IS 'Student who triggered the event — denormalized for fast lookup.';


--
-- Name: COLUMN placement_audit_log.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.event_type IS 'Type of placement lifecycle event. One of the allowed values.';


--
-- Name: COLUMN placement_audit_log.event_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.event_data IS 'JSONB payload with event-specific details for debugging.';


--
-- Name: COLUMN placement_audit_log.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_audit_log.created_at IS 'Timestamp when the event was recorded — set by backend.';


--
-- Name: placement_question_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_question_skills (
    placement_question_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE placement_question_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_question_skills IS 'Maps placement questions to one or more skills they assess. The primary skill link (is_primary = true) drives skill map and weakness map computation during backend placement scoring. CRITICAL: A placement question must have exactly one row with is_primary = true before it can be activated in a live placement test. Enforced by the backend activation endpoint — not by this migration alone. Cascade delete on question removal; RESTRICT on skill removal to prevent orphaned links. Flutter/client must never use this table to compute scores, skill maps, or weakness maps — all scoring is backend-only.';


--
-- Name: COLUMN placement_question_skills.placement_question_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_question_skills.placement_question_id IS 'Foreign key to placement_questions. Cascade-deletes when the question is removed.';


--
-- Name: COLUMN placement_question_skills.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_question_skills.skill_id IS 'Foreign key to skills (P3-020). RESTRICT-deletes to prevent orphaned skill links.';


--
-- Name: COLUMN placement_question_skills.is_primary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_question_skills.is_primary IS 'True if this skill is the primary skill assessed by the question. At most one row per question may be true (enforced by partial unique index). Exactly one true row is required before the question is activated — backend-enforced.';


--
-- Name: placement_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_section_id uuid NOT NULL,
    question_type text NOT NULL,
    prompt text NOT NULL,
    media_url text,
    order_index integer NOT NULL,
    correct_answer text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    listening_script text,
    CONSTRAINT placement_questions_correct_answer_not_empty CHECK ((char_length(TRIM(BOTH FROM correct_answer)) > 0)),
    CONSTRAINT placement_questions_order_index_positive CHECK ((order_index > 0)),
    CONSTRAINT placement_questions_prompt_not_empty CHECK ((char_length(TRIM(BOTH FROM prompt)) > 0)),
    CONSTRAINT placement_questions_type_check CHECK ((question_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'fill_blank'::text, 'listening_choice'::text, 'writing'::text, 'speaking'::text])))
);


--
-- Name: TABLE placement_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_questions IS 'Placement test question bank. Stores questions separately from runtime attempt records. Backend is the sole authority for question data. correct_answer is server-side only and must never be exposed to students or Flutter clients. Do not store learner attempts, answers, results, mastery, session state, or AIM runtime data here.';


--
-- Name: COLUMN placement_questions.placement_section_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.placement_section_id IS 'Foreign key to placement_sections. A question belongs to exactly one section.';


--
-- Name: COLUMN placement_questions.question_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.question_type IS 'Placement question type. Allowed values: multiple_choice, true_false, fill_blank, listening_choice. Backend-validated; clients may not set arbitrary values.';


--
-- Name: COLUMN placement_questions.prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.prompt IS 'Question text shown to the student. Non-empty string. Backend-owned.';


--
-- Name: COLUMN placement_questions.media_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.media_url IS 'Optional media asset URL. Required by backend when question_type = listening_choice. Null for all other question types unless an image is supplied.';


--
-- Name: COLUMN placement_questions.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.order_index IS 'Display order within the placement section. Must be a positive integer, unique per section. Backend enforces uniqueness at create and update endpoints.';


--
-- Name: COLUMN placement_questions.correct_answer; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.correct_answer IS 'Server-side answer key for objectively-scored question types. Never exposed to students or clients. For question_type = writing/speaking this column is not used for scoring (AI-graded instead) and holds a placeholder value only.';


--
-- Name: COLUMN placement_questions.listening_script; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_questions.listening_script IS 'The actual line(s) to be read aloud for a listening_choice question -- distinct from prompt (which holds only the on-screen instructions and answer options). TTS synthesizes audio from this field. NULL for non-listening question types, and for listening_choice rows that have not been scripted yet (audio is unavailable until this is set).';


--
-- Name: placement_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_attempt_id uuid NOT NULL,
    student_id uuid NOT NULL,
    estimated_level text NOT NULL,
    skill_mastery_map jsonb DEFAULT '{}'::jsonb NOT NULL,
    weakness_map jsonb DEFAULT '{}'::jsonb NOT NULL,
    initial_path_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT placement_results_estimated_level_check CHECK ((estimated_level = ANY (ARRAY['beginner'::text, 'elementary'::text, 'intermediate'::text, 'upper_intermediate'::text, 'advanced'::text])))
);


--
-- Name: TABLE placement_results; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_results IS 'Stores backend-computed placement results after attempt completion. One result per attempt.';


--
-- Name: COLUMN placement_results.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.id IS 'Primary key — UUID generated by backend.';


--
-- Name: COLUMN placement_results.placement_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.placement_attempt_id IS 'Foreign key to placement_attempts — unique, one result per attempt.';


--
-- Name: COLUMN placement_results.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.student_id IS 'Foreign key to students table — denormalized for fast lookup.';


--
-- Name: COLUMN placement_results.estimated_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.estimated_level IS 'Backend-computed placement level. Flutter must never calculate or infer this value.';


--
-- Name: COLUMN placement_results.skill_mastery_map; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.skill_mastery_map IS 'JSONB object with per-skill mastery data. Computed by backend per P4-014 contract.';


--
-- Name: COLUMN placement_results.weakness_map; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.weakness_map IS 'JSONB object listing skill weaknesses by priority. Computed by backend per P4-014 contract.';


--
-- Name: COLUMN placement_results.initial_path_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_results.initial_path_id IS 'UUID of the learning path assigned by backend based on level and weaknesses. Null until assigned.';


--
-- Name: placement_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_test_id uuid NOT NULL,
    title text NOT NULL,
    skill_code text NOT NULL,
    order_index integer NOT NULL,
    total_questions integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT placement_sections_order_index_positive CHECK ((order_index > 0)),
    CONSTRAINT placement_sections_skill_code_check CHECK ((skill_code = ANY (ARRAY['grammar'::text, 'vocabulary'::text, 'reading'::text, 'listening'::text, 'writing'::text, 'speaking'::text]))),
    CONSTRAINT placement_sections_title_not_empty CHECK ((char_length(TRIM(BOTH FROM title)) > 0)),
    CONSTRAINT placement_sections_total_questions_non_negative CHECK ((total_questions >= 0))
);


--
-- Name: TABLE placement_sections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_sections IS 'Placement test sections (grammar, vocabulary, reading, listening). Backend is the sole authority for section data and total_questions. Do not store learner progress, placement attempts, answers, results, mastery, session state, or AIM runtime data here.';


--
-- Name: COLUMN placement_sections.placement_test_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_sections.placement_test_id IS 'Foreign key to placement_tests. A section belongs to exactly one test.';


--
-- Name: COLUMN placement_sections.skill_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_sections.skill_code IS 'Placement section type. Allowed values: grammar, vocabulary, reading, listening. Backend-validated; clients may not set arbitrary values.';


--
-- Name: COLUMN placement_sections.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_sections.order_index IS 'Display order within the placement test. Must be a positive integer, unique per test. Backend enforces uniqueness at create and update endpoints.';


--
-- Name: COLUMN placement_sections.total_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_sections.total_questions IS 'Backend-computed count of questions linked to this section. Never written directly by clients or admin API callers.';


--
-- Name: placement_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    estimated_minutes integer DEFAULT 20 NOT NULL,
    total_sections integer DEFAULT 0 NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published_at timestamp with time zone,
    CONSTRAINT placement_tests_estimated_minutes_check CHECK ((estimated_minutes > 0)),
    CONSTRAINT placement_tests_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT placement_tests_total_sections_check CHECK ((total_sections >= 0)),
    CONSTRAINT placement_tests_version_check CHECK ((version >= 0))
);


--
-- Name: TABLE placement_tests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.placement_tests IS 'Stores placement test definitions for the AIM Phase 4 placement flow. Only one test may have status = ''published'' at a time (enforced by placement_tests_one_published_idx and the backend publish endpoint). total_sections is computed by the backend — clients must not write it. Status transitions are backend-controlled only (P4-009 Section 2.2). Scope: Placement Test phase only. No AIM Engine runtime, no lesson delivery.';


--
-- Name: COLUMN placement_tests.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.id IS 'Primary key UUID. Set by backend on creation; never writable by clients.';


--
-- Name: COLUMN placement_tests.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.title IS 'Human-readable placement test title. Required, non-empty string (P4-009 Section 5).';


--
-- Name: COLUMN placement_tests.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.description IS 'Optional short description shown to the student before starting the test.';


--
-- Name: COLUMN placement_tests.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.status IS 'Lifecycle status: draft | published | archived. Backend-controlled only. Transitions: draft→published→archived, draft→archived. published→draft and archived→* are forbidden (P4-009 Section 2.2).';


--
-- Name: COLUMN placement_tests.estimated_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.estimated_minutes IS 'Estimated test duration in minutes. Must be a positive integer. Set by admin at creation; readable by students via the active-test endpoint.';


--
-- Name: COLUMN placement_tests.total_sections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.total_sections IS 'Count of sections linked to this test. Computed by the backend from placement_sections — clients must never write this column.';


--
-- Name: COLUMN placement_tests.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.version IS 'Auto-incremented by the backend on each publish transition. Not exposed to students.';


--
-- Name: COLUMN placement_tests.published_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_tests.published_at IS 'Timestamp when the test was last transitioned to published status. Set by backend only; not exposed to students.';


--
-- Name: practice_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    kind text NOT NULL,
    status text DEFAULT 'started'::text NOT NULL,
    answer_text text,
    score integer,
    feedback jsonb,
    xp_awarded integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT practice_attempts_kind_check CHECK ((kind = ANY (ARRAY['speaking'::text, 'writing'::text]))),
    CONSTRAINT practice_attempts_score_check CHECK (((score IS NULL) OR ((score >= 0) AND (score <= 100)))),
    CONSTRAINT practice_attempts_status_check CHECK ((status = ANY (ARRAY['started'::text, 'completed'::text]))),
    CONSTRAINT practice_attempts_xp_check CHECK ((xp_awarded >= 0))
);


--
-- Name: TABLE practice_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.practice_attempts IS 'A student try at a practice topic. xp_awarded counts toward XP; score is display-only.';


--
-- Name: practice_topic_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_topic_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    locale character varying(10) NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT practice_topic_translations_locale_format_check CHECK (((locale)::text ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text))
);


--
-- Name: TABLE practice_topic_translations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.practice_topic_translations IS 'Per-locale topic title/description. One row per (topic_id, locale); readers fall back to en.';


--
-- Name: practice_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kind text NOT NULL,
    level_code text,
    xp_reward integer DEFAULT 20 NOT NULL,
    time_limit_seconds integer,
    min_words integer,
    ai_prompt text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT practice_topics_kind_check CHECK ((kind = ANY (ARRAY['speaking'::text, 'writing'::text]))),
    CONSTRAINT practice_topics_min_words_check CHECK (((min_words IS NULL) OR ((min_words >= 1) AND (min_words <= 1000)))),
    CONSTRAINT practice_topics_time_check CHECK (((time_limit_seconds IS NULL) OR ((time_limit_seconds >= 30) AND (time_limit_seconds <= 7200)))),
    CONSTRAINT practice_topics_xp_check CHECK (((xp_reward >= 0) AND (xp_reward <= 1000)))
);


--
-- Name: TABLE practice_topics; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.practice_topics IS 'Admin-managed Practice Speaking / Write a Paragraph topics. ai_prompt is backend-only.';


--
-- Name: promotion_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    code text NOT NULL,
    max_redemptions integer,
    times_redeemed integer DEFAULT 0 NOT NULL,
    eligible_user_ids uuid[],
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_promotion_codes_redemption_limit CHECK (((max_redemptions IS NULL) OR (times_redeemed <= max_redemptions))),
    CONSTRAINT promotion_codes_code_check CHECK ((TRIM(BOTH FROM code) <> ''::text)),
    CONSTRAINT promotion_codes_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'disabled'::text])))
);


--
-- Name: question_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    answer_type text NOT NULL,
    value jsonb NOT NULL,
    explanation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_answers_answer_type_check CHECK ((answer_type = ANY (ARRAY['fill_blank'::text, 'short_text'::text, 'ordered_sequence'::text, 'matched_pairs'::text])))
);


--
-- Name: TABLE question_answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.question_answers IS 'Type-specific correct answer metadata for question_bank items. One record per question. Used for fill_in_the_blank, short_answer, ordering, matching. Cascade-deleted when the parent question is deleted.';


--
-- Name: COLUMN question_answers.value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_answers.value IS 'Type-specific answer value as JSONB. Schema varies by answer_type: fill_blank, short_text, ordered_sequence, matched_pairs. Must not expose learner data, secrets, or AIM internals.';


--
-- Name: question_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_bank (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    stem text NOT NULL,
    rich_stem jsonb,
    difficulty text NOT NULL,
    explanation text,
    hint text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    listening_script text,
    CONSTRAINT question_bank_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'elementary'::text, 'intermediate'::text, 'upper_intermediate'::text, 'advanced'::text]))),
    CONSTRAINT question_bank_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT question_bank_stem_nonempty_check CHECK ((char_length(TRIM(BOTH FROM stem)) > 0)),
    CONSTRAINT question_bank_type_check CHECK ((type = ANY (ARRAY['multiple_choice'::text, 'multiple_select'::text, 'true_false'::text, 'fill_in_the_blank'::text, 'short_answer'::text, 'ordering'::text, 'matching'::text, 'listening_choice'::text])))
);


--
-- Name: TABLE question_bank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.question_bank IS 'Reusable curriculum question items. Backend is the source of truth for status, type, and skill links. A question cannot be published without at least one linked published skill — enforced at the backend publish endpoint (P3-014). is_correct must never be exposed to learner-facing clients during active sessions. Do not store learner responses, attempt history, mastery, session, or AIM runtime data here.';


--
-- Name: COLUMN question_bank.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_bank.type IS 'Question type — set on creation and immutable. Allowed: multiple_choice, multiple_select, true_false, fill_in_the_blank, short_answer, ordering, matching.';


--
-- Name: COLUMN question_bank.rich_stem; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_bank.rich_stem IS 'Optional structured/rich-text version of the stem. Stored as JSONB. Must not contain learner data, secrets, or provider keys.';


--
-- Name: COLUMN question_bank.difficulty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_bank.difficulty IS 'Difficulty label. Allowed: beginner, elementary, intermediate, upper_intermediate, advanced.';


--
-- Name: COLUMN question_bank.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_bank.status IS 'Backend-owned content lifecycle status. Allowed: draft, published, archived. Publish requires at least one linked published skill (backend enforced).';


--
-- Name: question_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_choices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    text text NOT NULL,
    rich_text jsonb,
    is_correct boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    explanation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_choices_sort_order_check CHECK ((sort_order >= 0)),
    CONSTRAINT question_choices_text_nonempty_check CHECK ((char_length(TRIM(BOTH FROM text)) > 0))
);


--
-- Name: TABLE question_choices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.question_choices IS 'Answer choices for question_bank items. is_correct must not be returned to learner-facing clients during active sessions. Cascade-deleted when the parent question is deleted.';


--
-- Name: COLUMN question_choices.is_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_choices.is_correct IS 'Whether this choice is a correct answer. For multiple_choice: exactly one true. For multiple_select: one or more true. For true_false: exactly one true. Not used for ordering/matching — see question_answers table.';


--
-- Name: question_skill_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_skill_links (
    question_id uuid NOT NULL,
    skill_key text NOT NULL
);


--
-- Name: question_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_skills (
    question_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_primary boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE question_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.question_skills IS 'Maps reusable question bank items to one or more skills they assess or develop. Backend is the source of truth for question-skill mappings. Do not store learner mastery, placement, practice attempt, session, progress, or AIM runtime data here.';


--
-- Name: COLUMN question_skills.question_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_skills.question_id IS 'Parent question reference. Cascade-deleted when the question is deleted.';


--
-- Name: COLUMN question_skills.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.question_skills.skill_id IS 'Linked skill reference. RESTRICT prevents deleting a skill that is still linked to question bank items. Skill display labels must not be used as identifiers.';


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text,
    type text NOT NULL,
    difficulty text,
    prompt text NOT NULL,
    explanation text,
    status text DEFAULT 'draft'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT questions_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'expert'::text]))),
    CONSTRAINT questions_prompt_check CHECK ((TRIM(BOTH FROM prompt) <> ''::text)),
    CONSTRAINT questions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT questions_type_check CHECK ((type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'fill_in_blank'::text, 'matching'::text, 'ordering'::text, 'short_answer'::text])))
);


--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendations (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    kind text NOT NULL,
    target_skill_id text NOT NULL,
    target_lesson_id uuid,
    rank smallint NOT NULL,
    reason text NOT NULL,
    based_on_weakness_id uuid,
    generated_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT recommendations_expires_after_generated_check CHECK (((expires_at IS NULL) OR (expires_at > generated_at))),
    CONSTRAINT recommendations_kind_check CHECK ((kind = ANY (ARRAY['lesson'::text, 'targeted_practice'::text, 'review_session'::text]))),
    CONSTRAINT recommendations_lesson_kind_consistency_check CHECK (((kind <> 'lesson'::text) OR (target_lesson_id IS NOT NULL))),
    CONSTRAINT recommendations_rank_positive_check CHECK ((rank >= 1)),
    CONSTRAINT recommendations_reason_check CHECK ((reason = ANY (ARRAY['addresses_weakness'::text, 'reinforces_recent_skill'::text, 'next_in_sequence'::text, 'review_due'::text]))),
    CONSTRAINT recommendations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'superseded'::text, 'expired'::text, 'dismissed'::text]))),
    CONSTRAINT recommendations_weakness_reason_consistency_check CHECK (((reason <> 'addresses_weakness'::text) OR (based_on_weakness_id IS NOT NULL)))
);


--
-- Name: TABLE recommendations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recommendations IS 'AIM Engine ranked recommendations referencing existing curriculum content. Values mirror the validated AimRecommendationOutput per P5-015 contract. Each new AIM response replaces the active set for a student; rank is only meaningful within one generated set.';


--
-- Name: COLUMN recommendations.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.id IS 'Set equal to the AIM Engine-issued recommendationId on persistence.';


--
-- Name: COLUMN recommendations.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN recommendations.kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.kind IS 'Category of recommended action: lesson, targeted_practice, or review_session.';


--
-- Name: COLUMN recommendations.target_skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.target_skill_id IS 'Skill key from the curriculum skill taxonomy that this recommendation targets.';


--
-- Name: COLUMN recommendations.target_lesson_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.target_lesson_id IS 'Specific existing lesson reference, present when kind = lesson. Null for kind values that do not reference a single lesson. References an existing, published lesson at validation time.';


--
-- Name: COLUMN recommendations.rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.rank IS 'Position within the ranked set returned in one AIM response. Rank 1 is the top recommendation. Unique within one generated set, not across the table.';


--
-- Name: COLUMN recommendations.reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.reason IS 'Coarse, fixed-enum category describing why this recommendation was produced. Never a free-text explanation.';


--
-- Name: COLUMN recommendations.based_on_weakness_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.based_on_weakness_id IS 'References a weakness_records id when reason = addresses_weakness. No DB-level FK by design; validated by the backend persistence service at write time.';


--
-- Name: COLUMN recommendations.generated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.generated_at IS 'When the AIM Engine generated this recommendation.';


--
-- Name: COLUMN recommendations.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.expires_at IS 'When this recommendation is no longer current. Null means no explicit expiry; remains current until superseded, dismissed, or naturally expired by backend sweep.';


--
-- Name: COLUMN recommendations.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.status IS 'Backend-managed lifecycle status: active, superseded, expired, or dismissed. The only field on this table not sourced from the AIM Engine wire output.';


--
-- Name: COLUMN recommendations.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN recommendations.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recommendations.updated_at IS 'Backend-set on every persistence write for this record, including status transitions.';


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider_refund_id text,
    requested_by uuid NOT NULL,
    approved_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT refunds_amount_check CHECK ((amount > 0)),
    CONSTRAINT refunds_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT refunds_reason_check CHECK ((TRIM(BOTH FROM reason) <> ''::text)),
    CONSTRAINT refunds_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'canceled'::text, 'denied'::text])))
);


--
-- Name: release_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.release_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    version character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    body text,
    audience character varying(30) DEFAULT 'all'::character varying NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    published_at timestamp with time zone,
    published_by uuid,
    created_by uuid NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT release_notes_audience_check CHECK (((audience)::text = ANY (ARRAY[('all'::character varying)::text, ('students'::character varying)::text, ('parents'::character varying)::text, ('admins'::character varying)::text, ('internal'::character varying)::text]))),
    CONSTRAINT release_notes_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text])))
);


--
-- Name: reminder_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    owner_type text NOT NULL,
    kind text NOT NULL,
    cadence text NOT NULL,
    next_run_at timestamp with time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reminder_schedules_kind_check CHECK ((kind = ANY (ARRAY['learning_plan'::text, 'review'::text, 'deadline'::text, 'streak'::text, 'custom'::text]))),
    CONSTRAINT reminder_schedules_owner_type_check CHECK ((owner_type = ANY (ARRAY['student'::text, 'parent'::text]))),
    CONSTRAINT reminder_schedules_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: report_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    allowed_roles text[] DEFAULT '{}'::text[] NOT NULL,
    parameters_schema jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT report_definitions_category_check CHECK ((category = ANY (ARRAY['learning'::text, 'curriculum'::text, 'assessment'::text, 'notification'::text, 'billing'::text, 'user'::text, 'admin'::text, 'parent'::text, 'student'::text])))
);


--
-- Name: report_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_definition_id uuid NOT NULL,
    requested_by_user_id uuid NOT NULL,
    requested_role text NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    result_ref text,
    error_message text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    result_data jsonb,
    CONSTRAINT chk_report_runs_completed_has_result CHECK (((status <> 'completed'::text) OR (result_data IS NOT NULL))),
    CONSTRAINT chk_report_runs_failed_has_error CHECK (((status <> 'failed'::text) OR (error_message IS NOT NULL))),
    CONSTRAINT chk_report_runs_timing CHECK (((started_at IS NULL) OR (completed_at IS NULL) OR (completed_at >= started_at))),
    CONSTRAINT report_runs_requested_role_check CHECK ((requested_role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text, 'system'::text]))),
    CONSTRAINT report_runs_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: review_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_schedules (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    due_at timestamp with time zone NOT NULL,
    interval_days numeric(6,2) NOT NULL,
    repetition_count integer DEFAULT 0 NOT NULL,
    based_on_attempt_id uuid NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT review_schedules_interval_days_positive_check CHECK ((interval_days > (0)::numeric)),
    CONSTRAINT review_schedules_repetition_count_nonneg_check CHECK ((repetition_count >= 0)),
    CONSTRAINT review_schedules_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'due'::text, 'completed'::text, 'rescheduled'::text])))
);


--
-- Name: TABLE review_schedules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.review_schedules IS 'AIM Engine spaced-repetition schedule: one current row per active schedule instance (id = AIM-issued scheduleId). Values mirror the validated AimReviewScheduleOutput per P5-016 contract. Not a cycle-history table; cycle closures are recorded in the AIM audit log.';


--
-- Name: COLUMN review_schedules.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.id IS 'Set equal to the AIM Engine-issued scheduleId. Stable across reschedules of the same underlying spaced-repetition item.';


--
-- Name: COLUMN review_schedules.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN review_schedules.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.skill_id IS 'Skill key from the curriculum skill taxonomy that this review schedule applies to.';


--
-- Name: COLUMN review_schedules.due_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.due_at IS 'When this skill is next due for review, as decided by the AIM Engine. Exclusively an AIM Engine output.';


--
-- Name: COLUMN review_schedules.interval_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.interval_days IS 'Interval, in days, between the previous review and due_at. Included for transparency and audit; not independently used by the backend to recompute due_at.';


--
-- Name: COLUMN review_schedules.repetition_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.repetition_count IS 'Number of successful spaced-repetition cycles completed for this schedule instance so far. A value lower than the currently stored count on an update is a contract violation rejected at the service layer.';


--
-- Name: COLUMN review_schedules.based_on_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.based_on_attempt_id IS 'The most recent attempt id that triggered this scheduling decision.';


--
-- Name: COLUMN review_schedules.scheduled_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.scheduled_at IS 'When the AIM Engine made this scheduling decision.';


--
-- Name: COLUMN review_schedules.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.status IS 'Backend-computed lifecycle status: pending, due, completed, or rescheduled. Mechanically derived from due_at and repetition_count deltas per P5-016. Never accepted from the AIM Engine wire output.';


--
-- Name: COLUMN review_schedules.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN review_schedules.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.review_schedules.updated_at IS 'Backend-set on every persistence write for this record, including status transitions.';


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE role_permissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.role_permissions IS 'Backend-owned mapping between roles and permissions. Clients must not mutate mappings directly.';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT roles_key_check CHECK ((key = ANY (ARRAY['student'::text, 'admin'::text, 'super_admin'::text, 'reviewer'::text, 'support'::text])))
);


--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.roles IS 'Backend-owned AIM role definitions. Backend authorization remains final authority.';


--
-- Name: COLUMN roles.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.roles.key IS 'Stable shared role key. Must not be treated as authorization authority by clients.';


--
-- Name: COLUMN roles.is_system; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.roles.is_system IS 'Marks protected system roles that require backend safeguards for unsafe mutation or deletion.';


--
-- Name: saved_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_words (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    word text NOT NULL,
    meaning text,
    context text,
    source text DEFAULT 'manual'::text NOT NULL,
    box smallint DEFAULT 1 NOT NULL,
    next_review_at timestamp with time zone DEFAULT now() NOT NULL,
    last_reviewed_at timestamp with time zone,
    times_correct integer DEFAULT 0 NOT NULL,
    times_wrong integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT saved_words_box_check CHECK (((box >= 1) AND (box <= 6))),
    CONSTRAINT saved_words_context_check CHECK (((context IS NULL) OR (char_length(context) <= 300))),
    CONSTRAINT saved_words_meaning_check CHECK (((meaning IS NULL) OR (char_length(meaning) <= 200))),
    CONSTRAINT saved_words_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'chat'::text, 'lesson'::text, 'voice'::text, 'library'::text]))),
    CONSTRAINT saved_words_word_check CHECK (((char_length(btrim(word)) >= 1) AND (char_length(btrim(word)) <= 60)))
);


--
-- Name: session_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    learning_session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    event_type text NOT NULL,
    item_id uuid,
    response_time_ms integer,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT session_events_event_type_check CHECK ((event_type = ANY (ARRAY['item_presented'::text, 'item_submitted'::text, 'hesitation'::text, 'retry'::text, 'idle_gap'::text]))),
    CONSTRAINT session_events_occurred_at_not_after_recorded_at_check CHECK ((occurred_at <= recorded_at)),
    CONSTRAINT session_events_payload_is_object_check CHECK ((jsonb_typeof(payload) = 'object'::text)),
    CONSTRAINT session_events_response_time_non_negative_check CHECK (((response_time_ms IS NULL) OR (response_time_ms >= 0)))
);


--
-- Name: TABLE session_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.session_events IS 'Backend-recorded raw behavioral event log per learning session. Aggregated by the backend into AimSessionBehavioralContext (P5-009) at AIM call time. Never sent to the AIM Engine row-by-row.';


--
-- Name: COLUMN session_events.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.id IS 'Primary key. Backend-issued UUID.';


--
-- Name: COLUMN session_events.learning_session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.learning_session_id IS 'Foreign key to learning_sessions. Cascades on session deletion.';


--
-- Name: COLUMN session_events.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.student_id IS 'Backend-resolved student id, denormalized from the owning session for fast per-student queries. Never taken from client payload without session ownership validation.';


--
-- Name: COLUMN session_events.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.event_type IS 'Raw behavioral signal category. One of item_presented, item_submitted, hesitation, retry, idle_gap. Never a mastery, level, weakness, difficulty, recommendation, review-schedule, retention, or frustration value.';


--
-- Name: COLUMN session_events.item_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.item_id IS 'Optional reference to the lesson or practice item this event relates to. Null for session-level events such as idle_gap.';


--
-- Name: COLUMN session_events.response_time_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.response_time_ms IS 'Raw timing signal in milliseconds, present for item_submitted events. Behavioral context only; must never feed mastery, level, or difficulty logic in any layer.';


--
-- Name: COLUMN session_events.payload; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.payload IS 'Backend-validated JSONB payload carrying event-specific raw detail (for example answer_change_count for a hesitation event). No secrets or credentials may be stored here.';


--
-- Name: COLUMN session_events.occurred_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.occurred_at IS 'ISO-8601 UTC timestamp of when the underlying client action occurred, as reported by the client and accepted by the backend after validation.';


--
-- Name: COLUMN session_events.recorded_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_events.recorded_at IS 'ISO-8601 UTC timestamp of when the backend persisted this event row. Always at or after occurred_at.';


--
-- Name: session_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_questions (
    session_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    question_id uuid NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    session_id uuid NOT NULL,
    items_attempted integer NOT NULL,
    items_correct integer NOT NULL,
    skills_touched jsonb DEFAULT '[]'::jsonb NOT NULL,
    overall_mastery_shift text NOT NULL,
    frustration_level text NOT NULL,
    engagement_level text NOT NULL,
    signal_basis jsonb DEFAULT '[]'::jsonb NOT NULL,
    closed_out_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT session_summaries_engagement_level_check CHECK ((engagement_level = ANY (ARRAY['low'::text, 'typical'::text, 'high'::text]))),
    CONSTRAINT session_summaries_frustration_level_check CHECK ((frustration_level = ANY (ARRAY['none'::text, 'low'::text, 'moderate'::text, 'elevated'::text]))),
    CONSTRAINT session_summaries_items_correct_bound_check CHECK ((items_correct <= items_attempted)),
    CONSTRAINT session_summaries_items_nonneg_check CHECK (((items_attempted >= 0) AND (items_correct >= 0))),
    CONSTRAINT session_summaries_overall_mastery_shift_check CHECK ((overall_mastery_shift = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text, 'mixed'::text]))),
    CONSTRAINT session_summaries_signal_basis_is_array_check CHECK ((jsonb_typeof(signal_basis) = 'array'::text)),
    CONSTRAINT session_summaries_skills_touched_is_array_check CHECK ((jsonb_typeof(skills_touched) = 'array'::text))
);


--
-- Name: TABLE session_summaries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.session_summaries IS 'AIM Engine closing snapshot of a learning session, including educational behavioral signals. At most one row per session_id. Values mirror the validated AimSessionSummaryOutput per P5-017 contract. frustration_level and engagement_level are coarse educational signals only, never clinical or diagnostic.';


--
-- Name: COLUMN session_summaries.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN session_summaries.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.session_id IS 'References the learning session this summary closes out. Unique: a later summary for the same session overwrites this row rather than inserting a second one.';


--
-- Name: COLUMN session_summaries.items_attempted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.items_attempted IS 'Total items attempted in the session as of this summary.';


--
-- Name: COLUMN session_summaries.items_correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.items_correct IS 'Total items answered correctly in the session as of this summary. Always <= items_attempted.';


--
-- Name: COLUMN session_summaries.skills_touched; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.skills_touched IS 'JSONB array of distinct skill keys involved in the session.';


--
-- Name: COLUMN session_summaries.overall_mastery_shift; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.overall_mastery_shift IS 'Coarse directional summary of how the session affected mastery across skills_touched. Descriptive only; authoritative per-skill values remain in student_skill_states.';


--
-- Name: COLUMN session_summaries.frustration_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.frustration_level IS 'Coarse, educational-only signal: none, low, moderate, or elevated. Never a clinical or psychological assessment. No more granular or free-text representation exists in this schema by design.';


--
-- Name: COLUMN session_summaries.engagement_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.engagement_level IS 'Coarse, educational-only signal: low, typical, or high.';


--
-- Name: COLUMN session_summaries.signal_basis; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.signal_basis IS 'JSONB array of fixed-enum categories describing the coarse evidence behind frustration_level and engagement_level (e.g. repeated_incorrect_streak, increased_hesitation). Never a free-text explanation.';


--
-- Name: COLUMN session_summaries.closed_out_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.closed_out_at IS 'When the AIM Engine determined the session reached a summarizable close-out point.';


--
-- Name: COLUMN session_summaries.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.created_at IS 'Backend-set on first persistence for this session_id. Never updated after.';


--
-- Name: COLUMN session_summaries.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.session_summaries.updated_at IS 'Backend-set on every persistence write for this record.';


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    description text,
    domain text NOT NULL,
    parent_skill_id uuid,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT skills_domain_check CHECK ((domain = ANY (ARRAY['grammar'::text, 'vocabulary'::text, 'reading'::text, 'listening'::text, 'speaking'::text, 'writing'::text, 'pronunciation'::text, 'functional_language'::text]))),
    CONSTRAINT skills_key_format_check CHECK ((key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'::text)),
    CONSTRAINT skills_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.skills IS 'Stable skill taxonomy used by lessons and questions. Backend is the source of truth for skill keys, domain, and status. Do not store learner mastery, placement, session, progress, or AIM runtime data here.';


--
-- Name: COLUMN skills.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skills.key IS 'Stable machine-readable identifier. Must be lowercase dot-delimited (e.g. grammar.past_simple.forms). Display labels must not be used as primary identifiers. Changing this key requires an explicit migration.';


--
-- Name: COLUMN skills.domain; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skills.domain IS 'Skill family grouping. Editorial metadata only — not a mastery or level signal.';


--
-- Name: COLUMN skills.parent_skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skills.parent_skill_id IS 'Optional parent skill for taxonomy hierarchy. Cascade delete is restricted.';


--
-- Name: COLUMN skills.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skills.status IS 'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';


--
-- Name: streak_freezes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streak_freezes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    frozen_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE streak_freezes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.streak_freezes IS 'Days a student covered with a streak freeze. Counted as part of the streak chain but not as active days.';


--
-- Name: student_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    unlocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE student_achievements; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.student_achievements IS 'Backend-owned per-student achievement unlock state. One row per (student_id, achievement_id) pair once first referenced; unlocked_at NULL means locked.';


--
-- Name: COLUMN student_achievements.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_achievements.student_id IS 'JWT-resolved Supabase auth uid of the student (same convention as lesson_progress.student_id). Never accepted from client input.';


--
-- Name: COLUMN student_achievements.unlocked_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_achievements.unlocked_at IS 'Backend-set timestamp of when the achievement was unlocked. NULL while locked. Only ever written by backend unlock-trigger logic, never by client requests.';


--
-- Name: student_learning_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_learning_goals (
    student_id uuid NOT NULL,
    daily_goal_lessons smallint DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_learning_goals_daily_goal_lessons_check CHECK (((daily_goal_lessons >= 1) AND (daily_goal_lessons <= 20)))
);


--
-- Name: TABLE student_learning_goals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.student_learning_goals IS 'Backend-owned per-student daily lesson goal. One row per student, defaulted lazily on first read.';


--
-- Name: student_level_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_level_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    track_slug text DEFAULT 'english'::text NOT NULL,
    current_cefr_rank smallint NOT NULL,
    max_unlocked_cefr_rank smallint NOT NULL,
    source text NOT NULL,
    last_computed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_level_state_source_check CHECK ((source = ANY (ARRAY['placement'::text, 'aim_engine'::text, 'scratch'::text])))
);


--
-- Name: TABLE student_level_state; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.student_level_state IS 'Current, engine-maintained proficiency level per student per track. One row per (student_id, track_slug), upserted in place. Not a history/audit log — see aim_context_snapshots-style tables for that.';


--
-- Name: COLUMN student_level_state.track_slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_level_state.track_slug IS 'Subject/track this state belongs to. Only ''english'' exists today — read this column, do not hardcode it.';


--
-- Name: COLUMN student_level_state.current_cefr_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_level_state.current_cefr_rank IS 'Engine''s current best estimate of the student''s level, as a rank matching courses.cefr_rank (1 = A1, 2 = A2, ...).';


--
-- Name: COLUMN student_level_state.max_unlocked_cefr_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_level_state.max_unlocked_cefr_rank IS 'The actual gating ceiling. Usually equal to current_cefr_rank, but only advances once a course is completed, not merely recommended (see P20-011).';


--
-- Name: COLUMN student_level_state.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_level_state.source IS 'Which computation produced this row: ''placement'' (initial placement test) or ''aim_engine'' (later recompute).';


--
-- Name: student_level_state_backup_20261104; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_level_state_backup_20261104 (
    id uuid,
    student_id uuid,
    track_slug text,
    current_cefr_rank smallint,
    max_unlocked_cefr_rank smallint,
    source text,
    last_computed_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_type text DEFAULT 'student_profile'::text NOT NULL,
    display_name text,
    avatar_url text,
    preferred_language text,
    timezone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    placement_decision text,
    CONSTRAINT student_profiles_placement_decision_check CHECK (((placement_decision IS NULL) OR (placement_decision = ANY (ARRAY['take_placement'::text, 'start_from_scratch'::text])))),
    CONSTRAINT student_profiles_profile_type_check CHECK ((profile_type = 'student_profile'::text))
);


--
-- Name: TABLE student_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.student_profiles IS 'Student-facing profile data linked to internal AIM users. Backend ownership checks remain final authority.';


--
-- Name: COLUMN student_profiles.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_profiles.user_id IS 'Owner internal AIM user ID. Must be resolved by the backend from a verified Supabase Auth UID, not trusted from client input.';


--
-- Name: COLUMN student_profiles.profile_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_profiles.profile_type IS 'Fixed discriminator for student profile records. Does not grant roles or permissions.';


--
-- Name: COLUMN student_profiles.placement_decision; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_profiles.placement_decision IS 'Records the student''s one-time choice on first login between taking the placement test and starting from scratch (level 1 / default curriculum). Null until the student makes a choice; once set it is never shown again.';


--
-- Name: student_skill_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_skill_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    mastery_score numeric(4,3) NOT NULL,
    mastery_confidence numeric(4,3) NOT NULL,
    mastery_trend text NOT NULL,
    previous_mastery_score numeric(4,3),
    last_attempt_id uuid NOT NULL,
    last_evaluated_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_skill_states_mastery_confidence_range_check CHECK (((mastery_confidence >= 0.000) AND (mastery_confidence <= 1.000))),
    CONSTRAINT student_skill_states_mastery_score_range_check CHECK (((mastery_score >= 0.000) AND (mastery_score <= 1.000))),
    CONSTRAINT student_skill_states_mastery_trend_check CHECK ((mastery_trend = ANY (ARRAY['improving'::text, 'stable'::text, 'declining'::text, 'insufficient_data'::text]))),
    CONSTRAINT student_skill_states_previous_mastery_score_range_check CHECK (((previous_mastery_score IS NULL) OR ((previous_mastery_score >= 0.000) AND (previous_mastery_score <= 1.000))))
);


--
-- Name: TABLE student_skill_states; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.student_skill_states IS 'AIM Engine persisted memory: one row per (student_id, skill_id). Values mirror the validated AimSkillStateOutput per P5-012 contract.';


--
-- Name: COLUMN student_skill_states.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.id IS 'Backend-generated primary key. Set on first persistence and never overwritten.';


--
-- Name: COLUMN student_skill_states.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN student_skill_states.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.skill_id IS 'Skill key from the curriculum skill taxonomy. Copied from the validated AimSkillStateOutput.';


--
-- Name: COLUMN student_skill_states.mastery_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.mastery_score IS 'AIM Engine mastery estimate in the 0.000-1.000 inclusive range. Sole source of mastery; never computed elsewhere.';


--
-- Name: COLUMN student_skill_states.mastery_confidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.mastery_confidence IS 'AIM Engine confidence in mastery_score in the 0.000-1.000 inclusive range. Descriptive context only; low confidence does not reduce mastery_score authority.';


--
-- Name: COLUMN student_skill_states.mastery_trend; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.mastery_trend IS 'Directional trend since the prior persisted state. One of improving, stable, declining, insufficient_data.';


--
-- Name: COLUMN student_skill_states.previous_mastery_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.previous_mastery_score IS 'Backend-captured snapshot of mastery_score immediately before the current update. Null on first persistence.';


--
-- Name: COLUMN student_skill_states.last_attempt_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.last_attempt_id IS 'Attempt UUID that informed this evaluation. Copied from the validated AimSkillStateOutput.';


--
-- Name: COLUMN student_skill_states.last_evaluated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.last_evaluated_at IS 'AIM Engine evaluation timestamp copied from the validated AimSkillStateOutput.evaluatedAt.';


--
-- Name: COLUMN student_skill_states.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN student_skill_states.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.student_skill_states.updated_at IS 'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';


--
-- Name: study_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_plans (
    student_id uuid NOT NULL,
    goal text NOT NULL,
    daily_minutes smallint NOT NULL,
    reminder_time time without time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT study_plans_daily_minutes_check CHECK (((daily_minutes >= 5) AND (daily_minutes <= 180))),
    CONSTRAINT study_plans_goal_check CHECK ((goal = ANY (ARRAY['work'::text, 'study'::text, 'travel'::text, 'fun'::text, 'other'::text])))
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    provider_subscription_id text,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    canceled_at timestamp with time zone,
    trial_start timestamp with time zone,
    trial_end timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_subscriptions_period CHECK (((current_period_start IS NULL) OR (current_period_end IS NULL) OR (current_period_end > current_period_start))),
    CONSTRAINT chk_subscriptions_trial_period CHECK (((trial_start IS NULL) OR (trial_end IS NULL) OR (trial_end > trial_start))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'expired'::text, 'trialing'::text, 'paused'::text, 'incomplete'::text])))
);


--
-- Name: support_ticket_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_ticket_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    author_id uuid NOT NULL,
    body text NOT NULL,
    visibility character varying(20) DEFAULT 'public'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_ticket_comments_visibility_check CHECK (((visibility)::text = ANY (ARRAY[('public'::character varying)::text, ('internal'::character varying)::text])))
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid NOT NULL,
    category character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    status character varying(30) DEFAULT 'open'::character varying NOT NULL,
    assigned_to uuid,
    subject character varying(500) NOT NULL,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_category_check CHECK (((category)::text = ANY (ARRAY[('bug_report'::character varying)::text, ('account_issue'::character varying)::text, ('learning_issue'::character varying)::text, ('billing_issue'::character varying)::text, ('general'::character varying)::text, ('other'::character varying)::text]))),
    CONSTRAINT support_tickets_severity_check CHECK (((severity)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('critical'::character varying)::text]))),
    CONSTRAINT support_tickets_status_check CHECK (((status)::text = ANY (ARRAY[('open'::character varying)::text, ('in_progress'::character varying)::text, ('waiting_on_user'::character varying)::text, ('resolved'::character varying)::text, ('closed'::character varying)::text])))
);


--
-- Name: tts_audio_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tts_audio_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid,
    language text NOT NULL,
    content_hash text NOT NULL,
    voice_config_hash text NOT NULL,
    status text DEFAULT 'generating'::text NOT NULL,
    storage_path text,
    mime_type text,
    size_bytes bigint,
    duration_ms integer,
    lease_owner text,
    lease_expires_at timestamp with time zone,
    attempt_count integer DEFAULT 0 NOT NULL,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tts_audio_assets_ready_has_file CHECK (((status <> 'ready'::text) OR ((storage_path IS NOT NULL) AND (mime_type IS NOT NULL) AND (size_bytes > 0)))),
    CONSTRAINT tts_audio_assets_status_check CHECK ((status = ANY (ARRAY['generating'::text, 'ready'::text, 'failed'::text])))
);


--
-- Name: TABLE tts_audio_assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tts_audio_assets IS 'Metadata for generated TTS audio kept in the private Supabase Storage bucket. Identity = (content_hash, language, voice_config_hash). Rows are servable only when status = ready AND the Storage object exists. Never client-writable.';


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category character varying(50) NOT NULL,
    rating integer,
    title character varying(300) NOT NULL,
    body text NOT NULL,
    source_surface character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'new'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_feedback_category_check CHECK (((category)::text = ANY (ARRAY[('bug_report'::character varying)::text, ('suggestion'::character varying)::text, ('compliment'::character varying)::text, ('complaint'::character varying)::text, ('other'::character varying)::text]))),
    CONSTRAINT user_feedback_rating_check CHECK (((rating IS NULL) OR ((rating >= 1) AND (rating <= 5)))),
    CONSTRAINT user_feedback_source_surface_check CHECK (((source_surface)::text = ANY (ARRAY[('mobile_app'::character varying)::text, ('admin_dashboard'::character varying)::text, ('parent_dashboard'::character varying)::text, ('api'::character varying)::text]))),
    CONSTRAINT user_feedback_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('under_review'::character varying)::text, ('accepted'::character varying)::text, ('declined'::character varying)::text, ('implemented'::character varying)::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE user_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_roles IS 'Backend-owned junction table assigning roles to internal AIM users. Backend authorization remains final authority for role membership.';


--
-- Name: COLUMN user_roles.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_roles.user_id IS 'Internal AIM user receiving the role assignment. Must be resolved from a verified Supabase Auth UID by the backend.';


--
-- Name: COLUMN user_roles.role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_roles.role_id IS 'Backend-owned role being assigned. Clients must not treat this value as a trust boundary.';


--
-- Name: COLUMN user_roles.assigned_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_roles.assigned_by IS 'Internal AIM user ID of the admin who performed the assignment. Nullable to support system-generated assignments.';


--
-- Name: COLUMN user_roles.assigned_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_roles.assigned_at IS 'Timestamp of role assignment for audit context.';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supabase_auth_uid uuid NOT NULL,
    email text,
    phone text,
    user_type text DEFAULT 'student'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text, 'disabled'::text, 'deleted'::text]))),
    CONSTRAINT users_user_type_check CHECK ((user_type = ANY (ARRAY['student'::text, 'admin'::text, 'reviewer'::text, 'support'::text, 'system'::text])))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'Internal AIM users table linked to Supabase Auth UID. Backend authorization remains final authority.';


--
-- Name: COLUMN users.supabase_auth_uid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.supabase_auth_uid IS 'Verified Supabase Auth UID mapped to an internal AIM user. Must not be trusted from client input.';


--
-- Name: vocabulary_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_words (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    word text NOT NULL,
    translation_ar text NOT NULL,
    example_sentence text NOT NULL,
    part_of_speech text,
    level text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vocabulary_words_example_sentence_check CHECK (((char_length(btrim(example_sentence)) >= 1) AND (char_length(btrim(example_sentence)) <= 300))),
    CONSTRAINT vocabulary_words_level_check CHECK ((level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT vocabulary_words_part_of_speech_check CHECK (((part_of_speech IS NULL) OR (part_of_speech = ANY (ARRAY['noun'::text, 'verb'::text, 'adjective'::text, 'adverb'::text, 'preposition'::text, 'conjunction'::text, 'pronoun'::text, 'phrase'::text])))),
    CONSTRAINT vocabulary_words_translation_ar_check CHECK (((char_length(btrim(translation_ar)) >= 1) AND (char_length(btrim(translation_ar)) <= 200))),
    CONSTRAINT vocabulary_words_word_check CHECK (((char_length(btrim(word)) >= 1) AND (char_length(btrim(word)) <= 60)))
);


--
-- Name: voice_audio_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_audio_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    student_id uuid NOT NULL,
    storage_key text NOT NULL,
    content_type text NOT NULL,
    duration_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ai_chat_message_id uuid,
    CONSTRAINT voice_audio_assets_content_type_not_empty_check CHECK ((char_length(TRIM(BOTH FROM content_type)) > 0)),
    CONSTRAINT voice_audio_assets_duration_ms_non_negative_check CHECK (((duration_ms IS NULL) OR (duration_ms >= 0))),
    CONSTRAINT voice_audio_assets_exactly_one_message_ref_check CHECK ((((message_id IS NOT NULL) AND (ai_chat_message_id IS NULL)) OR ((message_id IS NULL) AND (ai_chat_message_id IS NOT NULL)))),
    CONSTRAINT voice_audio_assets_storage_key_not_empty_check CHECK ((char_length(TRIM(BOTH FROM storage_key)) > 0))
);


--
-- Name: TABLE voice_audio_assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_audio_assets IS 'Backend-written metadata for voice turn reply audio that lives in backend-managed storage (docs/phase-9/voice-privacy-policy.md Voice Storage Rules). One row per synthesized audio asset for a voice_messages turn. This row''s id is the opaque audioRef returned to the client; raw audio bytes are never stored in this table.';


--
-- Name: COLUMN voice_audio_assets.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.id IS 'Primary key. Backend-issued UUID; this is the opaque audioRef value returned to the client and resolved via the audio stream endpoint.';


--
-- Name: COLUMN voice_audio_assets.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.message_id IS 'Legacy FK to voice_messages(id). Null on every row created after P21-021b -- kept only for historical rows written before this migration. Exactly one of message_id/ai_chat_message_id is set per row (see voice_audio_assets_exactly_one_message_ref_check).';


--
-- Name: COLUMN voice_audio_assets.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.student_id IS 'Denormalized student FK for fast ownership checks on audio retrieval (only the owning student may resolve this audioRef). Backend-resolved from the owning message/session; never taken from client payload.';


--
-- Name: COLUMN voice_audio_assets.storage_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.storage_key IS 'Internal backend-managed storage reference (e.g. object storage key) for the raw audio bytes. Never returned to the client; only this row''s id (the audioRef) crosses the API boundary.';


--
-- Name: COLUMN voice_audio_assets.content_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.content_type IS 'MIME type of the stored audio (e.g. audio/mpeg). Used for serving the correct Content-Type on the audio stream endpoint.';


--
-- Name: COLUMN voice_audio_assets.duration_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.duration_ms IS 'Duration of the audio in milliseconds, if known. Playback metadata only; not a learning-decision value.';


--
-- Name: COLUMN voice_audio_assets.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.created_at IS 'ISO-8601 UTC timestamp when the backend persisted this audio asset row.';


--
-- Name: COLUMN voice_audio_assets.ai_chat_message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_audio_assets.ai_chat_message_id IS 'FK to ai_chat_messages(id) -- the placeholder student-turn row AudioUploadService creates for a new voice submission (P21-021b). Exactly one of message_id/ai_chat_message_id is set per row.';


--
-- Name: voice_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    rating text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_feedback_rating_check CHECK ((rating = ANY (ARRAY['helpful'::text, 'not_helpful'::text])))
);


--
-- Name: TABLE voice_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_feedback IS 'Backend-written student feedback on a single AI Teacher voice message (helpful/not helpful). Advisory only; never feeds back into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions. Flutter never writes directly to this table.';


--
-- Name: COLUMN voice_feedback.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.id IS 'Primary key. Backend-issued UUID for this feedback row.';


--
-- Name: COLUMN voice_feedback.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.message_id IS 'FK to voice_messages(id). Identifies the AI Teacher voice message being rated. Backend-resolved after session/message ownership validation. Cascades on message deletion. Enforced unique: one feedback row per message.';


--
-- Name: COLUMN voice_feedback.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.session_id IS 'FK to voice_sessions(id). Denormalised from the referenced voice_messages row for efficient per-session lookups. Backend-resolved; never accepted from a client-supplied field. Cascades on session deletion.';


--
-- Name: COLUMN voice_feedback.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.student_id IS 'FK to users(id). Backend-resolved from the authenticated JWT. Never accepted from a client-supplied field. Cascades on user deletion.';


--
-- Name: COLUMN voice_feedback.rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.rating IS 'Student judgment of the AI Teacher voice reply. One of: helpful, not_helpful. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN voice_feedback.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_feedback.created_at IS 'ISO-8601 UTC timestamp when the backend recorded this feedback.';


--
-- Name: voice_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    transcript text,
    reply text,
    audio_ref text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_messages_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'transcribed'::text, 'replied'::text, 'synthesized'::text, 'failed'::text])))
);


--
-- Name: TABLE voice_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_messages IS 'Backend-written AI Teacher Voice Mode turns per session, matching the Turn Contract in docs/phase-9/voice-session-contract.md. Each row is one voice turn (student utterance + AI Teacher reply). transcript/reply/audio_ref are populated progressively as the turn moves through its lifecycle and may be NULL until their producing step completes. Flutter never writes directly to this table.';


--
-- Name: COLUMN voice_messages.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.id IS 'Primary key. Backend-issued UUID returned to the client as turnId.';


--
-- Name: COLUMN voice_messages.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.session_id IS 'FK to voice_sessions(id). Backend-resolved after session ownership validation. Cascades on session deletion.';


--
-- Name: COLUMN voice_messages.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.student_id IS 'Denormalized student FK for fast per-student queries. Backend-resolved from the owning session; never taken from client payload.';


--
-- Name: COLUMN voice_messages.transcript; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.transcript IS 'STT Gateway output for this turn: the mapped, already safety-filtered transcript text. NULL until the transcription step completes. Never contains provider raw response data, confidence scores, or internal prompt content.';


--
-- Name: COLUMN voice_messages.reply; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.reply IS 'AI Teacher reply for this turn: already output-safety-filtered text. NULL until the AI Teacher reply step completes. Never contains provider raw response data or AIM Engine internals.';


--
-- Name: COLUMN voice_messages.audio_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.audio_ref IS 'Opaque reference to the synthesized reply audio, resolved via the audio stream endpoint. NULL until TTS synthesis completes or if the turn ends without audio. Never a raw file path, provider audio URL, or filesystem location.';


--
-- Name: COLUMN voice_messages.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.status IS 'Turn lifecycle status, matching VoiceTurnStatus. One of: pending, transcribed, replied, synthesized, failed. A lifecycle flag only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN voice_messages.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_messages.created_at IS 'ISO-8601 UTC timestamp when the backend created this turn row.';


--
-- Name: voice_provider_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_provider_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    provider_type text NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    status text NOT NULL,
    error_category text,
    latency_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_provider_logs_error_category_requires_non_success_check CHECK (((error_category IS NULL) OR (status <> 'success'::text))),
    CONSTRAINT voice_provider_logs_latency_ms_non_negative_check CHECK (((latency_ms IS NULL) OR (latency_ms >= 0))),
    CONSTRAINT voice_provider_logs_provider_type_check CHECK ((provider_type = ANY (ARRAY['stt'::text, 'tts'::text]))),
    CONSTRAINT voice_provider_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text, 'timeout'::text])))
);


--
-- Name: TABLE voice_provider_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_provider_logs IS 'Backend-owned observability log for STT Gateway and TTS Gateway calls made during a voice turn. Stores only non-sensitive operational metadata for a single provider call; never raw audio, raw transcript text, the raw provider response, or any provider credential.';


--
-- Name: COLUMN voice_provider_logs.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.id IS 'Primary key. Backend-issued UUID for this log entry.';


--
-- Name: COLUMN voice_provider_logs.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.message_id IS 'FK to voice_messages(id). Identifies which voice turn this provider call was made for. Cascades on message deletion.';


--
-- Name: COLUMN voice_provider_logs.provider_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.provider_type IS 'Which voice gateway made this call. One of: stt (Speech-to-Text Gateway), tts (Text-to-Speech Gateway).';


--
-- Name: COLUMN voice_provider_logs.provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.provider IS 'Name of the configured STT/TTS provider used for this call (e.g. the provider identifier from backend config). Never a credential or secret value.';


--
-- Name: COLUMN voice_provider_logs.model; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.model IS 'Model identifier used for this call, read from backend config (e.g. STT_PROVIDER_MODEL / TTS_PROVIDER_MODEL). Never a credential or secret value.';


--
-- Name: COLUMN voice_provider_logs.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.status IS 'Outcome of the provider call. One of: success, error, timeout.';


--
-- Name: COLUMN voice_provider_logs.error_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.error_category IS 'Non-internal error category for a failed call (e.g. STT_LOW_CONFIDENCE, STT_PROVIDER_CALL_FAILED), per docs/phase-9/voice-error-policy.md. Null when status is success. Never a stack trace, raw error body, or secret.';


--
-- Name: COLUMN voice_provider_logs.latency_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.latency_ms IS 'Observed latency of the provider call in milliseconds, for observability only.';


--
-- Name: COLUMN voice_provider_logs.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_provider_logs.created_at IS 'ISO-8601 UTC timestamp when this log entry was recorded by the backend.';


--
-- Name: voice_safety_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_safety_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    message_id uuid,
    direction text NOT NULL,
    decision text NOT NULL,
    reason_category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_safety_events_decision_check CHECK ((decision = ANY (ARRAY['allowed'::text, 'rejected'::text]))),
    CONSTRAINT voice_safety_events_direction_check CHECK ((direction = ANY (ARRAY['input'::text, 'output'::text]))),
    CONSTRAINT voice_safety_events_reason_requires_rejected_check CHECK (((reason_category IS NULL) OR (decision = 'rejected'::text)))
);


--
-- Name: TABLE voice_safety_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_safety_events IS 'Backend-written audit log of Safety Filtering decisions (input and output) for AI Teacher Voice Mode. Records that a safety check ran and its outcome, never the rejected raw audio/transcript/response content. Flutter never writes directly to this table.';


--
-- Name: COLUMN voice_safety_events.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.id IS 'Primary key. Backend-issued UUID for this safety event.';


--
-- Name: COLUMN voice_safety_events.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.session_id IS 'FK to voice_sessions(id). Backend-resolved after session ownership validation. Cascades on session deletion.';


--
-- Name: COLUMN voice_safety_events.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.message_id IS 'Optional FK to voice_messages(id) linking this safety event to a specific voice turn. Backend-resolved only. Set to NULL if the referenced message is deleted.';


--
-- Name: COLUMN voice_safety_events.direction; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.direction IS 'Which safety check this event records. One of: input (student audio/transcript, before AI processing), output (AI provider response / TTS output, before persistence/return).';


--
-- Name: COLUMN voice_safety_events.decision; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.decision IS 'Outcome of the safety check. One of: allowed, rejected. A filter outcome only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN voice_safety_events.reason_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.reason_category IS 'Safe, non-internal rejection category (e.g. unsafe_content, off_topic). Null when decision is allowed. Never the raw rejected text, a stack trace, or provider response body.';


--
-- Name: COLUMN voice_safety_events.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_safety_events.created_at IS 'ISO-8601 UTC timestamp when the backend recorded this safety event.';


--
-- Name: voice_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    context_ref text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_sessions_context_ref_not_empty_check CHECK ((char_length(TRIM(BOTH FROM context_ref)) > 0)),
    CONSTRAINT voice_sessions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])))
);


--
-- Name: TABLE voice_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_sessions IS 'Backend-owned AI Teacher Voice Mode sessions per student. One session maps to one voice conversation, matching docs/phase-9/voice-session-contract.md. Created by the backend on session start; student_id is always resolved from the authenticated JWT, never from a client-supplied value.';


--
-- Name: COLUMN voice_sessions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.id IS 'Primary key. Backend-issued UUID returned to the client as sessionId.';


--
-- Name: COLUMN voice_sessions.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.student_id IS 'FK to users(id). Backend-resolved from authenticated JWT. Never accepted from the client payload. Cascades on user deletion.';


--
-- Name: COLUMN voice_sessions.context_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.context_ref IS 'Lesson or topic identifier supplied by the client on session creation and validated by the backend before storage. Consumed read-only by the Context Builder to seed lesson-aware context. Contains no mastery, level, weakness, difficulty, recommendation, or review-schedule data.';


--
-- Name: COLUMN voice_sessions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.status IS 'Lifecycle status of the session, matching the Session Contract. One of: active (session is open and accepting turns), ended (session closed, no further turns accepted).';


--
-- Name: COLUMN voice_sessions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.created_at IS 'ISO-8601 UTC timestamp when the session was created by the backend.';


--
-- Name: COLUMN voice_sessions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_sessions.updated_at IS 'ISO-8601 UTC timestamp of the last backend update to this session row (e.g. status change).';


--
-- Name: voice_transcripts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_transcripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    session_id uuid NOT NULL,
    transcript_text text NOT NULL,
    language_code text,
    confidence numeric(4,3),
    segments jsonb,
    provider_ref uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_transcripts_confidence_range_check CHECK (((confidence IS NULL) OR ((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))))
);


--
-- Name: TABLE voice_transcripts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.voice_transcripts IS 'Backend-written detailed STT transcript records for AI Teacher Voice Mode turns. Each row holds the full structured STT Gateway output (mapped, safety-filtered) for one voice turn. Observability/quality data only; never feeds into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions. Flutter never writes directly to this table.';


--
-- Name: COLUMN voice_transcripts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.id IS 'Primary key. Backend-issued UUID for this transcript record.';


--
-- Name: COLUMN voice_transcripts.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.message_id IS 'FK to voice_messages(id). Links this transcript to its voice turn. Backend-resolved after session/message ownership validation. Cascades on message deletion. Enforced unique: one transcript row per turn.';


--
-- Name: COLUMN voice_transcripts.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.session_id IS 'FK to voice_sessions(id). Denormalised from the referenced voice_message for efficient per-session queries. Backend-resolved; never accepted from a client-supplied field. Cascades on session deletion.';


--
-- Name: COLUMN voice_transcripts.transcript_text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.transcript_text IS 'Full mapped, safety-filtered transcript text from the STT Gateway, per docs/phase-9/stt-output-contract.md. Never contains raw provider response bodies, confidence arrays, or internal prompt content.';


--
-- Name: COLUMN voice_transcripts.language_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.language_code IS 'BCP-47 language tag detected or confirmed by the STT Gateway (e.g. ar, en-US). Observability field only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';


--
-- Name: COLUMN voice_transcripts.confidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.confidence IS 'Overall STT confidence score in range [0, 1], as reported by the provider and mapped by the STT Gateway. Advisory quality signal only; never used as a mastery, level, or difficulty decision.';


--
-- Name: COLUMN voice_transcripts.segments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.segments IS 'Optional JSONB array of word- or phrase-level timing segments returned by the STT provider and mapped/filtered by the STT Gateway. NULL if the provider did not return segment data or the gateway did not map it. Never contains raw provider response payloads, API keys, or AIM Engine internals.';


--
-- Name: COLUMN voice_transcripts.provider_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.provider_ref IS 'Opaque UUID reference to the voice_provider_logs(id) row for the STT call that produced this transcript. Backend-resolved for observability linkage only; never a provider API key or credential.';


--
-- Name: COLUMN voice_transcripts.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.voice_transcripts.created_at IS 'ISO-8601 UTC timestamp when the backend recorded this transcript.';


--
-- Name: weakness_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weakness_records (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    skill_id text NOT NULL,
    severity text NOT NULL,
    status text NOT NULL,
    trigger_attempt_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    detected_at timestamp with time zone NOT NULL,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT weakness_records_resolved_at_after_detected_check CHECK (((resolved_at IS NULL) OR (resolved_at >= detected_at))),
    CONSTRAINT weakness_records_resolved_at_consistency_check CHECK ((((status = 'resolved'::text) AND (resolved_at IS NOT NULL)) OR ((status = ANY (ARRAY['open'::text, 'improving'::text])) AND (resolved_at IS NULL)))),
    CONSTRAINT weakness_records_severity_check CHECK ((severity = ANY (ARRAY['emerging'::text, 'developing'::text, 'critical'::text]))),
    CONSTRAINT weakness_records_status_check CHECK ((status = ANY (ARRAY['open'::text, 'improving'::text, 'resolved'::text]))),
    CONSTRAINT weakness_records_trigger_attempt_ids_is_array_check CHECK ((jsonb_typeof(trigger_attempt_ids) = 'array'::text))
);


--
-- Name: TABLE weakness_records; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.weakness_records IS 'AIM Engine identified weaknesses: one row per weakness instance (id = AIM-issued weaknessId). Values mirror the validated AimWeaknessRecordOutput per P5-013 contract. Separate from and unmodified by the Phase 4 placement-time weakness map.';


--
-- Name: COLUMN weakness_records.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.id IS 'Set equal to the AIM Engine-issued weaknessId on first persistence. Stable across updates to the same weakness instance. A recurring weakness after resolution gets a new id, never reopens an old row.';


--
-- Name: COLUMN weakness_records.student_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.student_id IS 'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';


--
-- Name: COLUMN weakness_records.skill_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.skill_id IS 'Skill key from the curriculum skill taxonomy. Copied from the validated AimWeaknessRecordOutput.';


--
-- Name: COLUMN weakness_records.severity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.severity IS 'Current severity tier: emerging, developing, or critical. Exclusively an AIM Engine output. critical is Phase 5 only and never produced by the Phase 4 placement snapshot.';


--
-- Name: COLUMN weakness_records.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.status IS 'Lifecycle status: open, improving, or resolved. Exclusively an AIM Engine output.';


--
-- Name: COLUMN weakness_records.trigger_attempt_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.trigger_attempt_ids IS 'JSONB array of attempt UUIDs that contributed evidence to this weakness. Backend appends new entries from each update rather than replacing the list, preserving full evidence history.';


--
-- Name: COLUMN weakness_records.detected_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.detected_at IS 'When this weakness instance was first detected, copied from the validated AimWeaknessRecordOutput on first persistence. Never updated after.';


--
-- Name: COLUMN weakness_records.resolved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.resolved_at IS 'Set when status transitions to resolved. Null while open or improving. Copied from the validated AimWeaknessRecordOutput on every update.';


--
-- Name: COLUMN weakness_records.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.created_at IS 'Backend-set on first persistence. Never updated after.';


--
-- Name: COLUMN weakness_records.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weakness_records.updated_at IS 'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';


--
-- Name: xp_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.xp_levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level smallint NOT NULL,
    min_xp integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT xp_levels_level_check CHECK ((level >= 1)),
    CONSTRAINT xp_levels_min_xp_check CHECK ((min_xp >= 0))
);


--
-- Name: TABLE xp_levels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.xp_levels IS 'Backend-seeded XP level curve. min_xp is the total XP required to reach that level. Clients cannot create or edit rows here.';


--
-- Name: COLUMN xp_levels.min_xp; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.xp_levels.min_xp IS 'Total lifetime XP (sum of completed lesson xp_value) required to reach this level.';


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: achievement_definitions achievement_definitions_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_key_key UNIQUE (key);


--
-- Name: achievement_definitions achievement_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_pkey PRIMARY KEY (id);


--
-- Name: admin_broadcast_schedules admin_broadcast_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_broadcast_schedules
    ADD CONSTRAINT admin_broadcast_schedules_pkey PRIMARY KEY (id);


--
-- Name: admin_profiles admin_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_pkey PRIMARY KEY (id);


--
-- Name: admin_profiles admin_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_key UNIQUE (user_id);


--
-- Name: ai_chat_messages ai_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_chat_sessions ai_chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_sessions
    ADD CONSTRAINT ai_chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: ai_context_snapshots ai_context_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_context_snapshots
    ADD CONSTRAINT ai_context_snapshots_pkey PRIMARY KEY (id);


--
-- Name: ai_focus_directives ai_focus_directives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_focus_directives
    ADD CONSTRAINT ai_focus_directives_pkey PRIMARY KEY (id);


--
-- Name: ai_model_configs ai_model_configs_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_model_configs
    ADD CONSTRAINT ai_model_configs_name_key UNIQUE (name);


--
-- Name: ai_model_configs ai_model_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_model_configs
    ADD CONSTRAINT ai_model_configs_pkey PRIMARY KEY (id);


--
-- Name: ai_prompt_templates ai_prompt_templates_name_version_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_templates
    ADD CONSTRAINT ai_prompt_templates_name_version_unique UNIQUE (name, version);


--
-- Name: ai_prompt_templates ai_prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_templates
    ADD CONSTRAINT ai_prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: ai_provider_logs ai_provider_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_logs
    ADD CONSTRAINT ai_provider_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_safety_events ai_safety_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_safety_events
    ADD CONSTRAINT ai_safety_events_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_audit_logs ai_teacher_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_audit_logs
    ADD CONSTRAINT ai_teacher_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_conversations ai_teacher_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_conversations
    ADD CONSTRAINT ai_teacher_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_feedback_entries ai_teacher_feedback_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback_entries
    ADD CONSTRAINT ai_teacher_feedback_entries_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_feedback ai_teacher_feedback_message_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback
    ADD CONSTRAINT ai_teacher_feedback_message_id_unique UNIQUE (message_id);


--
-- Name: ai_teacher_feedback ai_teacher_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback
    ADD CONSTRAINT ai_teacher_feedback_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_messages ai_teacher_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_messages
    ADD CONSTRAINT ai_teacher_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_teacher_safety_checks ai_teacher_safety_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_safety_checks
    ADD CONSTRAINT ai_teacher_safety_checks_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_cost_events ai_usage_cost_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_cost_events
    ADD CONSTRAINT ai_usage_cost_events_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_cost_events ai_usage_cost_events_request_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_cost_events
    ADD CONSTRAINT ai_usage_cost_events_request_id_unique UNIQUE (request_id);


--
-- Name: ai_voice_sessions ai_voice_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_voice_sessions
    ADD CONSTRAINT ai_voice_sessions_pkey PRIMARY KEY (id);


--
-- Name: aim_audit_log aim_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aim_audit_log
    ADD CONSTRAINT aim_audit_log_pkey PRIMARY KEY (id);


--
-- Name: analytics_access_audit_logs analytics_access_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_access_audit_logs
    ADD CONSTRAINT analytics_access_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: analytics_cohort_members analytics_cohort_members_cohort_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohort_members
    ADD CONSTRAINT analytics_cohort_members_cohort_id_user_id_key UNIQUE (cohort_id, user_id);


--
-- Name: analytics_cohort_members analytics_cohort_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohort_members
    ADD CONSTRAINT analytics_cohort_members_pkey PRIMARY KEY (id);


--
-- Name: analytics_cohorts analytics_cohorts_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohorts
    ADD CONSTRAINT analytics_cohorts_key_key UNIQUE (key);


--
-- Name: analytics_cohorts analytics_cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohorts
    ADD CONSTRAINT analytics_cohorts_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: answers answers_lesson_attempt_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_lesson_attempt_id_unique UNIQUE (lesson_attempt_id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: app_version_policies app_version_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_policies
    ADD CONSTRAINT app_version_policies_pkey PRIMARY KEY (platform);


--
-- Name: assessment_attempt_answers assessment_attempt_answers_attempt_question_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_answers
    ADD CONSTRAINT assessment_attempt_answers_attempt_question_unique UNIQUE (attempt_id, assessment_question_link_id);


--
-- Name: assessment_attempt_answers assessment_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_answers
    ADD CONSTRAINT assessment_attempt_answers_pkey PRIMARY KEY (id);


--
-- Name: assessment_attempt_questions assessment_attempt_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_questions
    ADD CONSTRAINT assessment_attempt_questions_pkey PRIMARY KEY (attempt_id, assessment_question_link_id);


--
-- Name: assessment_attempts assessment_attempts_assessment_student_attempt_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessment_student_attempt_unique UNIQUE (assessment_id, student_id, attempt_number);


--
-- Name: assessment_attempts assessment_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id);


--
-- Name: assessment_audit_logs assessment_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_audit_logs
    ADD CONSTRAINT assessment_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: assessment_deadlines assessment_deadlines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_deadlines
    ADD CONSTRAINT assessment_deadlines_pkey PRIMARY KEY (id);


--
-- Name: assessment_questions assessment_questions_assessment_order_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_order_unique UNIQUE (assessment_id, "order");


--
-- Name: assessment_questions assessment_questions_assessment_question_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_question_unique UNIQUE (assessment_id, question_id);


--
-- Name: assessment_questions assessment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);


--
-- Name: assessment_result_breakdowns assessment_result_breakdowns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_result_breakdowns
    ADD CONSTRAINT assessment_result_breakdowns_pkey PRIMARY KEY (id);


--
-- Name: assessment_results assessment_results_attempt_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_attempt_unique UNIQUE (attempt_id);


--
-- Name: assessment_results assessment_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_pkey PRIMARY KEY (id);


--
-- Name: assessment_sections assessment_sections_assessment_order_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sections
    ADD CONSTRAINT assessment_sections_assessment_order_unique UNIQUE (assessment_id, "order");


--
-- Name: assessment_sections assessment_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sections
    ADD CONSTRAINT assessment_sections_pkey PRIMARY KEY (id);


--
-- Name: assessment_settings assessment_settings_assessment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_settings
    ADD CONSTRAINT assessment_settings_assessment_id_key UNIQUE (assessment_id);


--
-- Name: assessment_settings assessment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_settings
    ADD CONSTRAINT assessment_settings_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: auth_audit_logs auth_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_audit_logs
    ADD CONSTRAINT auth_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: billing_audit_logs billing_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_audit_logs
    ADD CONSTRAINT billing_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: billing_entitlements billing_entitlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_entitlements
    ADD CONSTRAINT billing_entitlements_pkey PRIMARY KEY (id);


--
-- Name: billing_plans billing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_pkey PRIMARY KEY (id);


--
-- Name: billing_prices billing_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_prices
    ADD CONSTRAINT billing_prices_pkey PRIMARY KEY (id);


--
-- Name: billing_prices billing_prices_provider_price_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_prices
    ADD CONSTRAINT billing_prices_provider_price_id_key UNIQUE (provider_price_id);


--
-- Name: billing_products billing_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_products
    ADD CONSTRAINT billing_products_pkey PRIMARY KEY (id);


--
-- Name: billing_products billing_products_provider_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_products
    ADD CONSTRAINT billing_products_provider_product_id_key UNIQUE (provider_product_id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_student_course_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_student_course_unique UNIQUE (student_id, course_id);


--
-- Name: chapter_translations chapter_translations_chapter_locale_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapter_translations
    ADD CONSTRAINT chapter_translations_chapter_locale_key UNIQUE (chapter_id, locale);


--
-- Name: chapter_translations chapter_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapter_translations
    ADD CONSTRAINT chapter_translations_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_slug_level_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_slug_level_unique UNIQUE (level_id, slug);


--
-- Name: checkout_sessions checkout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_sessions
    ADD CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id);


--
-- Name: checkout_sessions checkout_sessions_provider_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_sessions
    ADD CONSTRAINT checkout_sessions_provider_session_id_key UNIQUE (provider_session_id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: course_access course_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_access
    ADD CONSTRAINT course_access_pkey PRIMARY KEY (id);


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: course_payment_requests course_payment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_pkey PRIMARY KEY (id);


--
-- Name: course_prices course_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prices
    ADD CONSTRAINT course_prices_pkey PRIMARY KEY (course_id);


--
-- Name: course_translations course_translations_course_locale_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_translations
    ADD CONSTRAINT course_translations_course_locale_key UNIQUE (course_id, locale);


--
-- Name: course_translations course_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_translations
    ADD CONSTRAINT course_translations_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: courses courses_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);


--
-- Name: curriculum_audit_logs curriculum_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_audit_logs
    ADD CONSTRAINT curriculum_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: daily_challenge_templates daily_challenge_templates_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_templates
    ADD CONSTRAINT daily_challenge_templates_key_key UNIQUE (key);


--
-- Name: daily_challenge_templates daily_challenge_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_templates
    ADD CONSTRAINT daily_challenge_templates_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widgets dashboard_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id);


--
-- Name: deadline_events deadline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deadline_events
    ADD CONSTRAINT deadline_events_pkey PRIMARY KEY (id);


--
-- Name: device_tokens device_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_pkey PRIMARY KEY (id);


--
-- Name: difficulty_decisions difficulty_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difficulty_decisions
    ADD CONSTRAINT difficulty_decisions_pkey PRIMARY KEY (id);


--
-- Name: difficulty_decisions difficulty_decisions_student_skill_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difficulty_decisions
    ADD CONSTRAINT difficulty_decisions_student_skill_unique UNIQUE (student_id, skill_id);


--
-- Name: error_patterns error_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_patterns
    ADD CONSTRAINT error_patterns_pkey PRIMARY KEY (id);


--
-- Name: error_patterns error_patterns_student_skill_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_patterns
    ADD CONSTRAINT error_patterns_student_skill_type_unique UNIQUE (student_id, skill_id, pattern_type);


--
-- Name: export_jobs export_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_jobs
    ADD CONSTRAINT export_jobs_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_flag_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_flag_key_key UNIQUE (flag_key);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: feature_requests feature_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_requests
    ADD CONSTRAINT feature_requests_pkey PRIMARY KEY (id);


--
-- Name: idempotency_keys idempotency_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idempotency_keys
    ADD CONSTRAINT idempotency_keys_pkey PRIMARY KEY (id);


--
-- Name: idempotency_keys idempotency_keys_user_scope_key_uq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idempotency_keys
    ADD CONSTRAINT idempotency_keys_user_scope_key_uq UNIQUE (user_id, scope, idem_key);


--
-- Name: incident_records incident_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_records
    ADD CONSTRAINT incident_records_pkey PRIMARY KEY (id);


--
-- Name: initial_learning_path initial_learning_path_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initial_learning_path
    ADD CONSTRAINT initial_learning_path_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_provider_invoice_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_provider_invoice_id_key UNIQUE (provider_invoice_id);


--
-- Name: learning_sessions learning_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT learning_sessions_pkey PRIMARY KEY (id);


--
-- Name: lesson_assets lesson_assets_lesson_order_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_assets
    ADD CONSTRAINT lesson_assets_lesson_order_unique UNIQUE (lesson_id, "order");


--
-- Name: lesson_assets lesson_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_assets
    ADD CONSTRAINT lesson_assets_pkey PRIMARY KEY (id);


--
-- Name: lesson_attempts lesson_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_attempts
    ADD CONSTRAINT lesson_attempts_pkey PRIMARY KEY (id);


--
-- Name: lesson_objectives lesson_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_objectives
    ADD CONSTRAINT lesson_objectives_pkey PRIMARY KEY (lesson_id, objective_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_student_lesson_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_lesson_unique UNIQUE (student_id, lesson_id);


--
-- Name: lesson_questions lesson_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_questions
    ADD CONSTRAINT lesson_questions_pkey PRIMARY KEY (lesson_id, question_id);


--
-- Name: lesson_skills lesson_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_skills
    ADD CONSTRAINT lesson_skills_pkey PRIMARY KEY (lesson_id, skill_id);


--
-- Name: lesson_translations lesson_translations_lesson_locale_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_translations
    ADD CONSTRAINT lesson_translations_lesson_locale_key UNIQUE (lesson_id, locale);


--
-- Name: lesson_translations lesson_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_translations
    ADD CONSTRAINT lesson_translations_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: levels levels_slug_course_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_slug_course_unique UNIQUE (course_id, slug);


--
-- Name: maintenance_windows maintenance_windows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_windows
    ADD CONSTRAINT maintenance_windows_pkey PRIMARY KEY (id);


--
-- Name: metric_aggregates metric_aggregates_metric_definition_id_scope_type_scope_id__key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metric_aggregates
    ADD CONSTRAINT metric_aggregates_metric_definition_id_scope_type_scope_id__key UNIQUE (metric_definition_id, scope_type, scope_id, period_type, period_start);


--
-- Name: metric_aggregates metric_aggregates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metric_aggregates
    ADD CONSTRAINT metric_aggregates_pkey PRIMARY KEY (id);


--
-- Name: metric_definitions metric_definitions_key_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metric_definitions
    ADD CONSTRAINT metric_definitions_key_version_key UNIQUE (key, version);


--
-- Name: metric_definitions metric_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metric_definitions
    ADD CONSTRAINT metric_definitions_pkey PRIMARY KEY (id);


--
-- Name: mistake_resolutions mistake_resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mistake_resolutions
    ADD CONSTRAINT mistake_resolutions_pkey PRIMARY KEY (student_id, item_id);


--
-- Name: mistakes mistakes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mistakes
    ADD CONSTRAINT mistakes_pkey PRIMARY KEY (id);


--
-- Name: mistakes mistakes_student_item_skill_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mistakes
    ADD CONSTRAINT mistakes_student_item_skill_unique UNIQUE (student_id, item_id, skill_id);


--
-- Name: notification_audit_logs notification_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_audit_logs
    ADD CONSTRAINT notification_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_delivery_attempts notification_delivery_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_attempts
    ADD CONSTRAINT notification_delivery_attempts_pkey PRIMARY KEY (id);


--
-- Name: notification_digests notification_digests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digests
    ADD CONSTRAINT notification_digests_pkey PRIMARY KEY (id);


--
-- Name: notification_events notification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_quiet_hours notification_quiet_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_quiet_hours
    ADD CONSTRAINT notification_quiet_hours_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: objective_skills objective_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objective_skills
    ADD CONSTRAINT objective_skills_pkey PRIMARY KEY (objective_id, skill_id);


--
-- Name: objectives objectives_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_key_key UNIQUE (key);


--
-- Name: objectives objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_pkey PRIMARY KEY (id);


--
-- Name: operational_status operational_status_component_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_status
    ADD CONSTRAINT operational_status_component_key UNIQUE (component);


--
-- Name: operational_status operational_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_status
    ADD CONSTRAINT operational_status_pkey PRIMARY KEY (id);


--
-- Name: operations_audit_logs operations_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operations_audit_logs
    ADD CONSTRAINT operations_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: parent_access_audit_logs parent_access_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_access_audit_logs
    ADD CONSTRAINT parent_access_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: parent_child_links parent_child_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_child_links
    ADD CONSTRAINT parent_child_links_pkey PRIMARY KEY (id);


--
-- Name: parent_consents parent_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_consents
    ADD CONSTRAINT parent_consents_pkey PRIMARY KEY (id);


--
-- Name: parent_invitations parent_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_invitations
    ADD CONSTRAINT parent_invitations_pkey PRIMARY KEY (id);


--
-- Name: parent_notification_preferences parent_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_notification_preferences
    ADD CONSTRAINT parent_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: payment_images payment_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_images
    ADD CONSTRAINT payment_images_pkey PRIMARY KEY (id);


--
-- Name: payment_provider_events payment_provider_events_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_provider_events
    ADD CONSTRAINT payment_provider_events_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: payment_provider_events payment_provider_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_provider_events
    ADD CONSTRAINT payment_provider_events_pkey PRIMARY KEY (id);


--
-- Name: payment_provider_events payment_provider_events_provider_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_provider_events
    ADD CONSTRAINT payment_provider_events_provider_event_id_key UNIQUE (provider_event_id);


--
-- Name: payment_wallets payment_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_wallets
    ADD CONSTRAINT payment_wallets_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_provider_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_provider_payment_id_key UNIQUE (provider_payment_id);


--
-- Name: permissions permissions_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_key_key UNIQUE (key);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: placement_answers placement_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_answers
    ADD CONSTRAINT placement_answers_pkey PRIMARY KEY (id);


--
-- Name: placement_attempts placement_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_attempts
    ADD CONSTRAINT placement_attempts_pkey PRIMARY KEY (id);


--
-- Name: placement_audit_log placement_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_audit_log
    ADD CONSTRAINT placement_audit_log_pkey PRIMARY KEY (id);


--
-- Name: placement_question_skills placement_question_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_question_skills
    ADD CONSTRAINT placement_question_skills_pkey PRIMARY KEY (placement_question_id, skill_id);


--
-- Name: placement_questions placement_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_questions
    ADD CONSTRAINT placement_questions_pkey PRIMARY KEY (id);


--
-- Name: placement_questions placement_questions_unique_order_per_section; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_questions
    ADD CONSTRAINT placement_questions_unique_order_per_section UNIQUE (placement_section_id, order_index);


--
-- Name: placement_results placement_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_results
    ADD CONSTRAINT placement_results_pkey PRIMARY KEY (id);


--
-- Name: placement_results placement_results_placement_attempt_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_results
    ADD CONSTRAINT placement_results_placement_attempt_id_key UNIQUE (placement_attempt_id);


--
-- Name: placement_sections placement_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_sections
    ADD CONSTRAINT placement_sections_pkey PRIMARY KEY (id);


--
-- Name: placement_sections placement_sections_unique_order_per_test; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_sections
    ADD CONSTRAINT placement_sections_unique_order_per_test UNIQUE (placement_test_id, order_index);


--
-- Name: placement_tests placement_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_tests
    ADD CONSTRAINT placement_tests_pkey PRIMARY KEY (id);


--
-- Name: practice_attempts practice_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_attempts
    ADD CONSTRAINT practice_attempts_pkey PRIMARY KEY (id);


--
-- Name: practice_topic_translations practice_topic_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_topic_translations
    ADD CONSTRAINT practice_topic_translations_pkey PRIMARY KEY (id);


--
-- Name: practice_topic_translations practice_topic_translations_topic_locale_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_topic_translations
    ADD CONSTRAINT practice_topic_translations_topic_locale_key UNIQUE (topic_id, locale);


--
-- Name: practice_topics practice_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_topics
    ADD CONSTRAINT practice_topics_pkey PRIMARY KEY (id);


--
-- Name: promotion_codes promotion_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_codes
    ADD CONSTRAINT promotion_codes_code_key UNIQUE (code);


--
-- Name: promotion_codes promotion_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_codes
    ADD CONSTRAINT promotion_codes_pkey PRIMARY KEY (id);


--
-- Name: question_answers question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_answers
    ADD CONSTRAINT question_answers_pkey PRIMARY KEY (id);


--
-- Name: question_answers question_answers_question_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_answers
    ADD CONSTRAINT question_answers_question_id_unique UNIQUE (question_id);


--
-- Name: question_bank question_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bank
    ADD CONSTRAINT question_bank_pkey PRIMARY KEY (id);


--
-- Name: question_choices question_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT question_choices_pkey PRIMARY KEY (id);


--
-- Name: question_skill_links question_skill_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skill_links
    ADD CONSTRAINT question_skill_links_pkey PRIMARY KEY (question_id, skill_key);


--
-- Name: question_skills question_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skills
    ADD CONSTRAINT question_skills_pkey PRIMARY KEY (question_id, skill_id);


--
-- Name: questions questions_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_key_key UNIQUE (key);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_provider_refund_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_provider_refund_id_key UNIQUE (provider_refund_id);


--
-- Name: release_notes release_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_notes
    ADD CONSTRAINT release_notes_pkey PRIMARY KEY (id);


--
-- Name: reminder_schedules reminder_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_schedules
    ADD CONSTRAINT reminder_schedules_pkey PRIMARY KEY (id);


--
-- Name: report_definitions report_definitions_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_definitions
    ADD CONSTRAINT report_definitions_key_key UNIQUE (key);


--
-- Name: report_definitions report_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_definitions
    ADD CONSTRAINT report_definitions_pkey PRIMARY KEY (id);


--
-- Name: report_runs report_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_runs
    ADD CONSTRAINT report_runs_pkey PRIMARY KEY (id);


--
-- Name: review_schedules review_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_schedules
    ADD CONSTRAINT review_schedules_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_key_key UNIQUE (key);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: saved_words saved_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_words
    ADD CONSTRAINT saved_words_pkey PRIMARY KEY (id);


--
-- Name: session_events session_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_events
    ADD CONSTRAINT session_events_pkey PRIMARY KEY (id);


--
-- Name: session_questions session_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_questions
    ADD CONSTRAINT session_questions_pkey PRIMARY KEY (session_id, lesson_id, question_id);


--
-- Name: session_summaries session_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_summaries
    ADD CONSTRAINT session_summaries_pkey PRIMARY KEY (id);


--
-- Name: session_summaries session_summaries_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_summaries
    ADD CONSTRAINT session_summaries_session_id_unique UNIQUE (session_id);


--
-- Name: skills skills_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_key_key UNIQUE (key);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: streak_freezes streak_freezes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_freezes
    ADD CONSTRAINT streak_freezes_pkey PRIMARY KEY (id);


--
-- Name: streak_freezes streak_freezes_student_date_uq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_freezes
    ADD CONSTRAINT streak_freezes_student_date_uq UNIQUE (student_id, frozen_date);


--
-- Name: student_achievements student_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_pkey PRIMARY KEY (id);


--
-- Name: student_achievements student_achievements_student_achievement_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_student_achievement_unique UNIQUE (student_id, achievement_id);


--
-- Name: student_learning_goals student_learning_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_learning_goals
    ADD CONSTRAINT student_learning_goals_pkey PRIMARY KEY (student_id);


--
-- Name: student_level_state student_level_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_level_state
    ADD CONSTRAINT student_level_state_pkey PRIMARY KEY (id);


--
-- Name: student_level_state student_level_state_student_track_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_level_state
    ADD CONSTRAINT student_level_state_student_track_key UNIQUE (student_id, track_slug);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_skill_states student_skill_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skill_states
    ADD CONSTRAINT student_skill_states_pkey PRIMARY KEY (id);


--
-- Name: student_skill_states student_skill_states_student_skill_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skill_states
    ADD CONSTRAINT student_skill_states_student_skill_unique UNIQUE (student_id, skill_id);


--
-- Name: study_plans study_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT study_plans_pkey PRIMARY KEY (student_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_provider_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_provider_subscription_id_key UNIQUE (provider_subscription_id);


--
-- Name: support_ticket_comments support_ticket_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_comments
    ADD CONSTRAINT support_ticket_comments_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: tts_audio_assets tts_audio_assets_identity_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tts_audio_assets
    ADD CONSTRAINT tts_audio_assets_identity_unique UNIQUE (content_hash, language, voice_config_hash);


--
-- Name: tts_audio_assets tts_audio_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tts_audio_assets
    ADD CONSTRAINT tts_audio_assets_pkey PRIMARY KEY (id);


--
-- Name: tts_audio_assets tts_audio_assets_storage_path_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tts_audio_assets
    ADD CONSTRAINT tts_audio_assets_storage_path_unique UNIQUE (storage_path);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_unique UNIQUE (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_supabase_auth_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_supabase_auth_uid_key UNIQUE (supabase_auth_uid);


--
-- Name: vocabulary_words vocabulary_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_words
    ADD CONSTRAINT vocabulary_words_pkey PRIMARY KEY (id);


--
-- Name: voice_audio_assets voice_audio_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_audio_assets
    ADD CONSTRAINT voice_audio_assets_pkey PRIMARY KEY (id);


--
-- Name: voice_feedback voice_feedback_message_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_feedback
    ADD CONSTRAINT voice_feedback_message_id_unique UNIQUE (message_id);


--
-- Name: voice_feedback voice_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_feedback
    ADD CONSTRAINT voice_feedback_pkey PRIMARY KEY (id);


--
-- Name: voice_messages voice_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_messages
    ADD CONSTRAINT voice_messages_pkey PRIMARY KEY (id);


--
-- Name: voice_provider_logs voice_provider_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_provider_logs
    ADD CONSTRAINT voice_provider_logs_pkey PRIMARY KEY (id);


--
-- Name: voice_safety_events voice_safety_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_safety_events
    ADD CONSTRAINT voice_safety_events_pkey PRIMARY KEY (id);


--
-- Name: voice_sessions voice_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_sessions
    ADD CONSTRAINT voice_sessions_pkey PRIMARY KEY (id);


--
-- Name: voice_transcripts voice_transcripts_message_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_transcripts
    ADD CONSTRAINT voice_transcripts_message_id_unique UNIQUE (message_id);


--
-- Name: voice_transcripts voice_transcripts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_transcripts
    ADD CONSTRAINT voice_transcripts_pkey PRIMARY KEY (id);


--
-- Name: weakness_records weakness_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weakness_records
    ADD CONSTRAINT weakness_records_pkey PRIMARY KEY (id);


--
-- Name: xp_levels xp_levels_level_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_levels
    ADD CONSTRAINT xp_levels_level_key UNIQUE (level);


--
-- Name: xp_levels xp_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_levels
    ADD CONSTRAINT xp_levels_pkey PRIMARY KEY (id);


--
-- Name: achievement_definitions_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX achievement_definitions_is_active_idx ON public.achievement_definitions USING btree (is_active);


--
-- Name: admin_profiles_department_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_profiles_department_idx ON public.admin_profiles USING btree (department);


--
-- Name: admin_profiles_profile_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_profiles_profile_type_idx ON public.admin_profiles USING btree (profile_type);


--
-- Name: admin_profiles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_profiles_user_id_idx ON public.admin_profiles USING btree (user_id);


--
-- Name: ai_chat_messages_session_id_created_at_desc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_messages_session_id_created_at_desc_idx ON public.ai_chat_messages USING btree (session_id, created_at DESC);


--
-- Name: ai_chat_messages_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_messages_session_id_created_at_idx ON public.ai_chat_messages USING btree (session_id, created_at);


--
-- Name: ai_chat_messages_session_id_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_messages_session_id_role_idx ON public.ai_chat_messages USING btree (session_id, role);


--
-- Name: ai_chat_messages_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_messages_student_id_created_at_idx ON public.ai_chat_messages USING btree (student_id, created_at DESC);


--
-- Name: ai_chat_sessions_one_active_per_context; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ai_chat_sessions_one_active_per_context ON public.ai_chat_sessions USING btree (student_id, context_ref) WHERE (status = 'active'::text);


--
-- Name: ai_chat_sessions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_status_idx ON public.ai_chat_sessions USING btree (status);


--
-- Name: ai_chat_sessions_student_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_student_id_active_idx ON public.ai_chat_sessions USING btree (student_id) WHERE (status = 'active'::text);


--
-- Name: ai_chat_sessions_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_student_id_created_at_idx ON public.ai_chat_sessions USING btree (student_id, created_at DESC);


--
-- Name: ai_chat_sessions_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_student_id_idx ON public.ai_chat_sessions USING btree (student_id);


--
-- Name: ai_chat_sessions_student_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_student_id_status_idx ON public.ai_chat_sessions USING btree (student_id, status);


--
-- Name: ai_chat_sessions_student_id_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_sessions_student_id_updated_at_idx ON public.ai_chat_sessions USING btree (student_id, updated_at DESC);


--
-- Name: ai_context_snapshots_message_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ai_context_snapshots_message_id_idx ON public.ai_context_snapshots USING btree (message_id);


--
-- Name: ai_context_snapshots_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_context_snapshots_session_id_idx ON public.ai_context_snapshots USING btree (session_id);


--
-- Name: ai_context_snapshots_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_context_snapshots_student_id_created_at_idx ON public.ai_context_snapshots USING btree (student_id, created_at DESC);


--
-- Name: ai_focus_directives_student_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_focus_directives_student_id_active_idx ON public.ai_focus_directives USING btree (student_id, active);


--
-- Name: ai_provider_logs_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_provider_logs_session_id_created_at_idx ON public.ai_provider_logs USING btree (session_id, created_at DESC);


--
-- Name: ai_provider_logs_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_provider_logs_session_id_idx ON public.ai_provider_logs USING btree (session_id);


--
-- Name: ai_provider_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_provider_logs_status_idx ON public.ai_provider_logs USING btree (status);


--
-- Name: ai_safety_events_decision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_safety_events_decision_idx ON public.ai_safety_events USING btree (decision);


--
-- Name: ai_safety_events_direction_decision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_safety_events_direction_decision_idx ON public.ai_safety_events USING btree (direction, decision);


--
-- Name: ai_safety_events_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_safety_events_session_id_created_at_idx ON public.ai_safety_events USING btree (session_id, created_at DESC);


--
-- Name: ai_teacher_feedback_rating_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_teacher_feedback_rating_idx ON public.ai_teacher_feedback USING btree (rating);


--
-- Name: ai_teacher_feedback_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_teacher_feedback_student_id_created_at_idx ON public.ai_teacher_feedback USING btree (student_id, created_at DESC);


--
-- Name: aim_audit_log_backend_request_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_backend_request_id_idx ON public.aim_audit_log USING btree (backend_request_id);


--
-- Name: aim_audit_log_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_occurred_at_idx ON public.aim_audit_log USING btree (occurred_at);


--
-- Name: aim_audit_log_outcome_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_outcome_idx ON public.aim_audit_log USING btree (outcome);


--
-- Name: aim_audit_log_pipeline_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_pipeline_stage_idx ON public.aim_audit_log USING btree (pipeline_stage);


--
-- Name: aim_audit_log_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_session_id_idx ON public.aim_audit_log USING btree (session_id);


--
-- Name: aim_audit_log_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_audit_log_student_id_idx ON public.aim_audit_log USING btree (student_id);


--
-- Name: aim_idx_aal_request_stage_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_aal_request_stage_occurred_at ON public.aim_audit_log USING btree (backend_request_id, pipeline_stage, occurred_at);


--
-- Name: aim_idx_aal_student_outcome_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_aal_student_outcome_occurred_at ON public.aim_audit_log USING btree (student_id, outcome, occurred_at DESC) WHERE (outcome <> 'success'::text);


--
-- Name: aim_idx_ans_student_item_incorrect_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_ans_student_item_incorrect_submitted_at ON public.answers USING btree (student_id, item_id, submitted_at) WHERE (is_correct = false);


--
-- Name: aim_idx_dd_student_skill_decided_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_dd_student_skill_decided_at ON public.difficulty_decisions USING btree (student_id, skill_id, decided_at DESC);


--
-- Name: aim_idx_ep_student_skill_active_confidence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_ep_student_skill_active_confidence ON public.error_patterns USING btree (student_id, skill_id, confidence DESC) WHERE (is_active = true);


--
-- Name: aim_idx_la_session_item_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_la_session_item_submitted_at ON public.lesson_attempts USING btree (learning_session_id, item_id, submitted_at);


--
-- Name: aim_idx_la_session_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_la_session_submitted_at ON public.lesson_attempts USING btree (learning_session_id, submitted_at DESC);


--
-- Name: aim_idx_mis_student_skill_unresolved_recent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_mis_student_skill_unresolved_recent ON public.mistakes USING btree (student_id, skill_id, last_seen_at DESC) WHERE (is_resolved = false);


--
-- Name: aim_idx_rec_student_active_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_rec_student_active_rank ON public.recommendations USING btree (student_id, rank) WHERE (status = 'active'::text);


--
-- Name: aim_idx_rec_student_reason_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_rec_student_reason_active ON public.recommendations USING btree (student_id, reason) WHERE (status = 'active'::text);


--
-- Name: aim_idx_rs_student_due_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_rs_student_due_at ON public.review_schedules USING btree (student_id, due_at) WHERE (status = ANY (ARRAY['pending'::text, 'due'::text]));


--
-- Name: aim_idx_se_session_type_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_se_session_type_occurred_at ON public.session_events USING btree (learning_session_id, event_type, occurred_at);


--
-- Name: aim_idx_ss_student_closed_out_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_ss_student_closed_out_at ON public.session_summaries USING btree (student_id, closed_out_at DESC);


--
-- Name: aim_idx_sss_student_last_evaluated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_sss_student_last_evaluated ON public.student_skill_states USING btree (student_id, last_evaluated_at DESC);


--
-- Name: aim_idx_sss_student_skill_upsert; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_sss_student_skill_upsert ON public.student_skill_states USING btree (student_id, skill_id) WHERE (skill_id IS NOT NULL);


--
-- Name: aim_idx_wr_student_open_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_wr_student_open_severity ON public.weakness_records USING btree (student_id, severity, detected_at DESC) WHERE (status = ANY (ARRAY['open'::text, 'improving'::text]));


--
-- Name: aim_idx_wr_student_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX aim_idx_wr_student_updated_at ON public.weakness_records USING btree (student_id, updated_at DESC);


--
-- Name: answers_incorrect_student_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_incorrect_student_item_idx ON public.answers USING btree (student_id, item_id) WHERE (is_correct = false);


--
-- Name: answers_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_item_id_idx ON public.answers USING btree (item_id);


--
-- Name: answers_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_student_id_idx ON public.answers USING btree (student_id);


--
-- Name: answers_student_id_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_student_id_item_id_idx ON public.answers USING btree (student_id, item_id);


--
-- Name: answers_submitted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_submitted_at_idx ON public.answers USING btree (submitted_at);


--
-- Name: assessment_attempt_answers_attempt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempt_answers_attempt_id_idx ON public.assessment_attempt_answers USING btree (attempt_id);


--
-- Name: assessment_attempt_answers_question_link_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempt_answers_question_link_id_idx ON public.assessment_attempt_answers USING btree (assessment_question_link_id);


--
-- Name: assessment_attempt_questions_link_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempt_questions_link_idx ON public.assessment_attempt_questions USING btree (assessment_question_link_id);


--
-- Name: assessment_attempts_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempts_assessment_id_idx ON public.assessment_attempts USING btree (assessment_id);


--
-- Name: assessment_attempts_assessment_id_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempts_assessment_id_student_id_idx ON public.assessment_attempts USING btree (assessment_id, student_id);


--
-- Name: assessment_attempts_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempts_expires_at_idx ON public.assessment_attempts USING btree (expires_at);


--
-- Name: assessment_attempts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempts_status_idx ON public.assessment_attempts USING btree (status);


--
-- Name: assessment_attempts_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_attempts_student_id_idx ON public.assessment_attempts USING btree (student_id);


--
-- Name: assessment_audit_logs_actor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_audit_logs_actor_id_idx ON public.assessment_audit_logs USING btree (actor_id);


--
-- Name: assessment_audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_audit_logs_entity_type_entity_id_idx ON public.assessment_audit_logs USING btree (entity_type, entity_id);


--
-- Name: assessment_audit_logs_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_audit_logs_event_type_idx ON public.assessment_audit_logs USING btree (event_type);


--
-- Name: assessment_audit_logs_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_audit_logs_occurred_at_idx ON public.assessment_audit_logs USING btree (occurred_at);


--
-- Name: assessment_deadlines_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_deadlines_assessment_id_idx ON public.assessment_deadlines USING btree (assessment_id);


--
-- Name: assessment_deadlines_global_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX assessment_deadlines_global_unique_idx ON public.assessment_deadlines USING btree (assessment_id) WHERE ((student_id IS NULL) AND (is_active = true));


--
-- Name: assessment_deadlines_per_student_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX assessment_deadlines_per_student_unique_idx ON public.assessment_deadlines USING btree (assessment_id, student_id) WHERE ((student_id IS NOT NULL) AND (is_active = true));


--
-- Name: assessment_deadlines_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_deadlines_student_id_idx ON public.assessment_deadlines USING btree (student_id) WHERE (student_id IS NOT NULL);


--
-- Name: assessment_deadlines_window_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_deadlines_window_idx ON public.assessment_deadlines USING btree (opens_at, closes_at) WHERE (is_active = true);


--
-- Name: assessment_questions_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_questions_assessment_id_idx ON public.assessment_questions USING btree (assessment_id);


--
-- Name: assessment_questions_assessment_id_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_questions_assessment_id_order_idx ON public.assessment_questions USING btree (assessment_id, "order");


--
-- Name: assessment_questions_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_questions_question_id_idx ON public.assessment_questions USING btree (question_id);


--
-- Name: assessment_questions_section_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_questions_section_id_idx ON public.assessment_questions USING btree (section_id);


--
-- Name: assessment_result_breakdowns_question_link_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_result_breakdowns_question_link_id_idx ON public.assessment_result_breakdowns USING btree (assessment_question_link_id);


--
-- Name: assessment_result_breakdowns_result_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_result_breakdowns_result_id_idx ON public.assessment_result_breakdowns USING btree (result_id);


--
-- Name: assessment_result_breakdowns_section_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_result_breakdowns_section_id_idx ON public.assessment_result_breakdowns USING btree (section_id);


--
-- Name: assessment_results_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_results_assessment_id_idx ON public.assessment_results USING btree (assessment_id);


--
-- Name: assessment_results_attempt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_results_attempt_id_idx ON public.assessment_results USING btree (attempt_id);


--
-- Name: assessment_results_graded_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_results_graded_at_idx ON public.assessment_results USING btree (graded_at);


--
-- Name: assessment_results_student_id_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_results_student_id_assessment_id_idx ON public.assessment_results USING btree (student_id, assessment_id);


--
-- Name: assessment_results_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_results_student_id_idx ON public.assessment_results USING btree (student_id);


--
-- Name: assessment_sections_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_sections_assessment_id_idx ON public.assessment_sections USING btree (assessment_id);


--
-- Name: assessment_sections_assessment_id_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_sections_assessment_id_order_idx ON public.assessment_sections USING btree (assessment_id, "order");


--
-- Name: assessment_settings_assessment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_settings_assessment_id_idx ON public.assessment_settings USING btree (assessment_id);


--
-- Name: assessment_settings_visible_window_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessment_settings_visible_window_idx ON public.assessment_settings USING btree (visible_from, visible_until) WHERE ((visible_from IS NOT NULL) OR (visible_until IS NOT NULL));


--
-- Name: assessments_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_created_by_idx ON public.assessments USING btree (created_by);


--
-- Name: assessments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_status_idx ON public.assessments USING btree (status);


--
-- Name: assessments_status_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_status_type_idx ON public.assessments USING btree (status, type);


--
-- Name: assessments_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_type_idx ON public.assessments USING btree (type);


--
-- Name: auth_audit_logs_actor_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_audit_logs_actor_user_id_idx ON public.auth_audit_logs USING btree (actor_user_id);


--
-- Name: auth_audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_audit_logs_created_at_idx ON public.auth_audit_logs USING btree (created_at DESC);


--
-- Name: auth_audit_logs_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_audit_logs_event_type_idx ON public.auth_audit_logs USING btree (event_type);


--
-- Name: auth_audit_logs_supabase_auth_uid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_audit_logs_supabase_auth_uid_idx ON public.auth_audit_logs USING btree (supabase_auth_uid);


--
-- Name: auth_audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_audit_logs_user_id_idx ON public.auth_audit_logs USING btree (user_id);


--
-- Name: chapters_level_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chapters_level_id_idx ON public.chapters USING btree (level_id);


--
-- Name: chapters_level_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chapters_level_sort_order_idx ON public.chapters USING btree (level_id, sort_order);


--
-- Name: chapters_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chapters_status_idx ON public.chapters USING btree (status);


--
-- Name: course_access_one_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX course_access_one_active_idx ON public.course_access USING btree (student_id, course_id) WHERE (status = 'active'::text);


--
-- Name: course_access_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_access_student_idx ON public.course_access USING btree (student_id, course_id, created_at DESC);


--
-- Name: course_enrollments_course_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_enrollments_course_id_idx ON public.course_enrollments USING btree (course_id);


--
-- Name: course_enrollments_one_active_per_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX course_enrollments_one_active_per_student_idx ON public.course_enrollments USING btree (student_id) WHERE (status = 'active'::text);


--
-- Name: course_enrollments_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_enrollments_student_id_idx ON public.course_enrollments USING btree (student_id);


--
-- Name: course_payment_requests_one_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX course_payment_requests_one_pending_idx ON public.course_payment_requests USING btree (student_id, course_id) WHERE (status = 'pending'::text);


--
-- Name: course_payment_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_payment_requests_status_idx ON public.course_payment_requests USING btree (status, created_at DESC);


--
-- Name: course_payment_requests_transaction_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX course_payment_requests_transaction_idx ON public.course_payment_requests USING btree (wallet_id, lower(TRIM(BOTH FROM transaction_number))) WHERE (status = ANY (ARRAY['pending'::text, 'approved'::text]));


--
-- Name: courses_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_slug_idx ON public.courses USING btree (slug) WHERE (slug IS NOT NULL);


--
-- Name: courses_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_sort_order_idx ON public.courses USING btree (sort_order);


--
-- Name: courses_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_status_idx ON public.courses USING btree (status);


--
-- Name: courses_track_slug_cefr_rank_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX courses_track_slug_cefr_rank_key ON public.courses USING btree (track_slug, cefr_rank) WHERE (cefr_rank IS NOT NULL);


--
-- Name: curriculum_audit_logs_actor_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_actor_user_id_idx ON public.curriculum_audit_logs USING btree (actor_user_id);


--
-- Name: curriculum_audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_created_at_idx ON public.curriculum_audit_logs USING btree (created_at DESC);


--
-- Name: curriculum_audit_logs_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_entity_id_idx ON public.curriculum_audit_logs USING btree (entity_id);


--
-- Name: curriculum_audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_entity_type_entity_id_idx ON public.curriculum_audit_logs USING btree (entity_type, entity_id);


--
-- Name: curriculum_audit_logs_entity_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_entity_type_idx ON public.curriculum_audit_logs USING btree (entity_type);


--
-- Name: curriculum_audit_logs_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_audit_logs_event_type_idx ON public.curriculum_audit_logs USING btree (event_type);


--
-- Name: daily_challenge_templates_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX daily_challenge_templates_is_active_idx ON public.daily_challenge_templates USING btree (is_active);


--
-- Name: deadline_events_deadline_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deadline_events_deadline_id_idx ON public.deadline_events USING btree (deadline_id, occurred_at);


--
-- Name: deadline_events_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deadline_events_event_type_idx ON public.deadline_events USING btree (event_type);


--
-- Name: deadline_events_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deadline_events_occurred_at_idx ON public.deadline_events USING btree (occurred_at);


--
-- Name: difficulty_decisions_decided_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX difficulty_decisions_decided_at_idx ON public.difficulty_decisions USING btree (decided_at);


--
-- Name: difficulty_decisions_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX difficulty_decisions_skill_id_idx ON public.difficulty_decisions USING btree (skill_id);


--
-- Name: difficulty_decisions_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX difficulty_decisions_student_id_idx ON public.difficulty_decisions USING btree (student_id);


--
-- Name: difficulty_decisions_student_id_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX difficulty_decisions_student_id_skill_id_idx ON public.difficulty_decisions USING btree (student_id, skill_id);


--
-- Name: error_patterns_skill_id_pattern_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_patterns_skill_id_pattern_type_idx ON public.error_patterns USING btree (skill_id, pattern_type);


--
-- Name: error_patterns_student_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_patterns_student_id_active_idx ON public.error_patterns USING btree (student_id) WHERE (is_active = true);


--
-- Name: error_patterns_student_id_confidence_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_patterns_student_id_confidence_idx ON public.error_patterns USING btree (student_id, confidence DESC) WHERE (is_active = true);


--
-- Name: error_patterns_student_id_last_seen_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_patterns_student_id_last_seen_at_idx ON public.error_patterns USING btree (student_id, last_seen_at DESC);


--
-- Name: error_patterns_student_id_skill_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_patterns_student_id_skill_id_active_idx ON public.error_patterns USING btree (student_id, skill_id) WHERE (is_active = true);


--
-- Name: idempotency_keys_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idempotency_keys_created_at_idx ON public.idempotency_keys USING btree (created_at);


--
-- Name: idx_admin_broadcast_schedules_created_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_broadcast_schedules_created_by_fk ON public.admin_broadcast_schedules USING btree (created_by);


--
-- Name: idx_admin_broadcast_status_next; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_broadcast_status_next ON public.admin_broadcast_schedules USING btree (status, next_run_at) WHERE (status = 'active'::text);


--
-- Name: idx_ai_chat_sessions_resolved_lesson_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_sessions_resolved_lesson_id_fk ON public.ai_chat_sessions USING btree (resolved_lesson_id);


--
-- Name: idx_ai_model_configs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_model_configs_status ON public.ai_model_configs USING btree (status);


--
-- Name: idx_ai_prompt_templates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompt_templates_status ON public.ai_prompt_templates USING btree (status);


--
-- Name: idx_ai_teacher_audit_logs_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_audit_logs_actor ON public.ai_teacher_audit_logs USING btree (actor_id);


--
-- Name: idx_ai_teacher_audit_logs_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_audit_logs_resource ON public.ai_teacher_audit_logs USING btree (resource_type, resource_id);


--
-- Name: idx_ai_teacher_conversations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_conversations_status ON public.ai_teacher_conversations USING btree (status);


--
-- Name: idx_ai_teacher_conversations_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_conversations_student ON public.ai_teacher_conversations USING btree (student_id);


--
-- Name: idx_ai_teacher_feedback_entries_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_feedback_entries_message ON public.ai_teacher_feedback_entries USING btree (message_id);


--
-- Name: idx_ai_teacher_feedback_entries_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_feedback_entries_student ON public.ai_teacher_feedback_entries USING btree (student_id);


--
-- Name: idx_ai_teacher_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_messages_conversation ON public.ai_teacher_messages USING btree (conversation_id);


--
-- Name: idx_ai_teacher_messages_model_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_messages_model_config ON public.ai_teacher_messages USING btree (model_config_id);


--
-- Name: idx_ai_teacher_messages_prompt_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_messages_prompt_template ON public.ai_teacher_messages USING btree (prompt_template_id);


--
-- Name: idx_ai_teacher_safety_checks_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_safety_checks_action ON public.ai_teacher_safety_checks USING btree (action);


--
-- Name: idx_ai_teacher_safety_checks_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_teacher_safety_checks_target ON public.ai_teacher_safety_checks USING btree (target_type, target_id);


--
-- Name: idx_ai_usage_cost_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_cost_events_created_at ON public.ai_usage_cost_events USING btree (created_at);


--
-- Name: idx_ai_usage_cost_events_model_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_cost_events_model_config ON public.ai_usage_cost_events USING btree (model_config_id);


--
-- Name: idx_ai_usage_cost_events_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_cost_events_student ON public.ai_usage_cost_events USING btree (student_id);


--
-- Name: idx_ai_voice_sessions_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_voice_sessions_conversation ON public.ai_voice_sessions USING btree (conversation_id);


--
-- Name: idx_ai_voice_sessions_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_voice_sessions_student ON public.ai_voice_sessions USING btree (student_id);


--
-- Name: idx_analytics_access_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_access_audit_logs_action ON public.analytics_access_audit_logs USING btree (action);


--
-- Name: idx_analytics_access_audit_logs_actor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_access_audit_logs_actor_user_id ON public.analytics_access_audit_logs USING btree (actor_user_id);


--
-- Name: idx_analytics_access_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_access_audit_logs_created_at ON public.analytics_access_audit_logs USING btree (created_at);


--
-- Name: idx_analytics_access_audit_logs_role_result; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_access_audit_logs_role_result ON public.analytics_access_audit_logs USING btree (actor_role, result);


--
-- Name: idx_analytics_access_audit_logs_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_access_audit_logs_target ON public.analytics_access_audit_logs USING btree (target_type, target_id);


--
-- Name: idx_analytics_cohort_members_cohort_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_cohort_members_cohort_id ON public.analytics_cohort_members USING btree (cohort_id);


--
-- Name: idx_analytics_cohort_members_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_cohort_members_user_id ON public.analytics_cohort_members USING btree (user_id);


--
-- Name: idx_analytics_cohorts_cohort_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_cohorts_cohort_type ON public.analytics_cohorts USING btree (cohort_type);


--
-- Name: idx_analytics_cohorts_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_cohorts_is_active ON public.analytics_cohorts USING btree (is_active);


--
-- Name: idx_analytics_events_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_actor_id ON public.analytics_events USING btree (actor_id);


--
-- Name: idx_analytics_events_actor_role_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_actor_role_type ON public.analytics_events USING btree (actor_role, event_type);


--
-- Name: idx_analytics_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_event_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_analytics_events_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_occurred_at ON public.analytics_events USING btree (occurred_at);


--
-- Name: idx_analytics_events_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_subject ON public.analytics_events USING btree (subject_type, subject_id);


--
-- Name: idx_assessments_chapter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_chapter_id ON public.assessments USING btree (chapter_id) WHERE (chapter_id IS NOT NULL);


--
-- Name: idx_assessments_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_course_id ON public.assessments USING btree (course_id) WHERE (course_id IS NOT NULL);


--
-- Name: idx_billing_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_action ON public.billing_audit_logs USING btree (action);


--
-- Name: idx_billing_audit_logs_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_actor_id ON public.billing_audit_logs USING btree (actor_id);


--
-- Name: idx_billing_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_created_at ON public.billing_audit_logs USING btree (created_at);


--
-- Name: idx_billing_audit_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_entity ON public.billing_audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_billing_audit_logs_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_entity_id ON public.billing_audit_logs USING btree (entity_id);


--
-- Name: idx_billing_audit_logs_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_audit_logs_entity_type ON public.billing_audit_logs USING btree (entity_type);


--
-- Name: idx_billing_entitlements_feature_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_feature_key ON public.billing_entitlements USING btree (feature_key);


--
-- Name: idx_billing_entitlements_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_plan_id ON public.billing_entitlements USING btree (plan_id);


--
-- Name: idx_billing_entitlements_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_status ON public.billing_entitlements USING btree (status);


--
-- Name: idx_billing_entitlements_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_subscription_id ON public.billing_entitlements USING btree (subscription_id);


--
-- Name: idx_billing_entitlements_user_feature; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_user_feature ON public.billing_entitlements USING btree (user_id, feature_key);


--
-- Name: idx_billing_entitlements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_user_id ON public.billing_entitlements USING btree (user_id);


--
-- Name: idx_billing_entitlements_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_entitlements_user_status ON public.billing_entitlements USING btree (user_id, status);


--
-- Name: idx_billing_plans_plan_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_plans_plan_type ON public.billing_plans USING btree (plan_type);


--
-- Name: idx_billing_plans_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_plans_price_id ON public.billing_plans USING btree (price_id);


--
-- Name: idx_billing_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_plans_status ON public.billing_plans USING btree (status);


--
-- Name: idx_billing_prices_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_prices_product_id ON public.billing_prices USING btree (product_id);


--
-- Name: idx_billing_prices_provider_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_prices_provider_price_id ON public.billing_prices USING btree (provider_price_id);


--
-- Name: idx_billing_prices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_prices_status ON public.billing_prices USING btree (status);


--
-- Name: idx_billing_products_product_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_products_product_type ON public.billing_products USING btree (product_type);


--
-- Name: idx_billing_products_provider_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_products_provider_product_id ON public.billing_products USING btree (provider_product_id);


--
-- Name: idx_billing_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_products_status ON public.billing_products USING btree (status);


--
-- Name: idx_certificates_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_course_id ON public.certificates USING btree (course_id);


--
-- Name: idx_certificates_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_student_id ON public.certificates USING btree (student_id);


--
-- Name: idx_checkout_sessions_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_price_id ON public.checkout_sessions USING btree (price_id);


--
-- Name: idx_checkout_sessions_provider_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_provider_session_id ON public.checkout_sessions USING btree (provider_session_id);


--
-- Name: idx_checkout_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_status ON public.checkout_sessions USING btree (status);


--
-- Name: idx_checkout_sessions_subscription_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_subscription_id_fk ON public.checkout_sessions USING btree (subscription_id);


--
-- Name: idx_checkout_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_user_id ON public.checkout_sessions USING btree (user_id);


--
-- Name: idx_checkout_sessions_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkout_sessions_user_status ON public.checkout_sessions USING btree (user_id, status);


--
-- Name: idx_coupons_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_status ON public.coupons USING btree (status);


--
-- Name: idx_course_access_course_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_access_course_id_fk ON public.course_access USING btree (course_id);


--
-- Name: idx_course_access_payment_request_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_access_payment_request_id_fk ON public.course_access USING btree (payment_request_id);


--
-- Name: idx_course_payment_requests_course_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_payment_requests_course_id_fk ON public.course_payment_requests USING btree (course_id);


--
-- Name: idx_course_payment_requests_receipt_image_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_payment_requests_receipt_image_id_fk ON public.course_payment_requests USING btree (receipt_image_id);


--
-- Name: idx_course_payment_requests_reviewed_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_payment_requests_reviewed_by_fk ON public.course_payment_requests USING btree (reviewed_by);


--
-- Name: idx_course_prices_updated_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_prices_updated_by_fk ON public.course_prices USING btree (updated_by);


--
-- Name: idx_dashboard_widgets_dashboard_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dashboard_widgets_dashboard_key ON public.dashboard_widgets USING btree (dashboard_key);


--
-- Name: idx_dashboard_widgets_metric_definition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dashboard_widgets_metric_definition_id ON public.dashboard_widgets USING btree (metric_definition_id);


--
-- Name: idx_dashboard_widgets_report_definition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dashboard_widgets_report_definition_id ON public.dashboard_widgets USING btree (report_definition_id);


--
-- Name: idx_delivery_attempts_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_attempts_event ON public.notification_delivery_attempts USING btree (notification_event_id, attempt_number);


--
-- Name: idx_delivery_attempts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_attempts_status ON public.notification_delivery_attempts USING btree (status, created_at);


--
-- Name: idx_device_tokens_token_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_device_tokens_token_unique ON public.device_tokens USING btree (token);


--
-- Name: idx_device_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_tokens_user_id ON public.device_tokens USING btree (user_id);


--
-- Name: idx_device_tokens_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_tokens_user_status ON public.device_tokens USING btree (user_id, status);


--
-- Name: idx_export_jobs_report_run_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_export_jobs_report_run_id ON public.export_jobs USING btree (report_run_id);


--
-- Name: idx_export_jobs_requested_by_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_export_jobs_requested_by_user_id ON public.export_jobs USING btree (requested_by_user_id);


--
-- Name: idx_export_jobs_role_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_export_jobs_role_status ON public.export_jobs USING btree (requested_role, status);


--
-- Name: idx_export_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_export_jobs_status ON public.export_jobs USING btree (status);


--
-- Name: idx_feature_flags_owner_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_flags_owner_id_fk ON public.feature_flags USING btree (owner_id);


--
-- Name: idx_feature_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_requests_status ON public.feature_requests USING btree (status);


--
-- Name: idx_feature_requests_submitted_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_requests_submitted_by_fk ON public.feature_requests USING btree (submitted_by);


--
-- Name: idx_feature_requests_triaged_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_requests_triaged_by_fk ON public.feature_requests USING btree (triaged_by);


--
-- Name: idx_incident_records_owner_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incident_records_owner_id_fk ON public.incident_records USING btree (owner_id);


--
-- Name: idx_incident_records_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incident_records_status ON public.incident_records USING btree (status);


--
-- Name: idx_invoice_items_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);


--
-- Name: idx_invoice_items_price_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_price_id_fk ON public.invoice_items USING btree (price_id);


--
-- Name: idx_invoices_provider_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_provider_invoice_id ON public.invoices USING btree (provider_invoice_id);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_invoices_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_subscription_id ON public.invoices USING btree (subscription_id);


--
-- Name: idx_invoices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);


--
-- Name: idx_invoices_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_user_status ON public.invoices USING btree (user_id, status);


--
-- Name: idx_maintenance_windows_created_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_windows_created_by_fk ON public.maintenance_windows USING btree (created_by);


--
-- Name: idx_maintenance_windows_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_windows_status ON public.maintenance_windows USING btree (status);


--
-- Name: idx_metric_aggregates_definition_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_aggregates_definition_period ON public.metric_aggregates USING btree (metric_definition_id, period_type, period_start);


--
-- Name: idx_metric_aggregates_metric_definition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_aggregates_metric_definition_id ON public.metric_aggregates USING btree (metric_definition_id);


--
-- Name: idx_metric_aggregates_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_aggregates_period ON public.metric_aggregates USING btree (period_type, period_start, period_end);


--
-- Name: idx_metric_aggregates_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_aggregates_scope ON public.metric_aggregates USING btree (scope_type, scope_id);


--
-- Name: idx_metric_definitions_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_definitions_domain ON public.metric_definitions USING btree (domain);


--
-- Name: idx_metric_definitions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metric_definitions_is_active ON public.metric_definitions USING btree (is_active);


--
-- Name: idx_notification_audit_logs_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_audit_logs_actor ON public.notification_audit_logs USING btree (actor_id, created_at DESC);


--
-- Name: idx_notification_audit_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_audit_logs_entity ON public.notification_audit_logs USING btree (entity_type, entity_id, created_at DESC);


--
-- Name: idx_notification_audit_logs_retain_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_audit_logs_retain_until ON public.notification_audit_logs USING btree (retain_until) WHERE (retain_until IS NOT NULL);


--
-- Name: idx_notification_delivery_attempts_retain_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_delivery_attempts_retain_until ON public.notification_delivery_attempts USING btree (retain_until) WHERE (retain_until IS NOT NULL);


--
-- Name: idx_notification_digests_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_digests_recipient ON public.notification_digests USING btree (recipient_id, period_start DESC);


--
-- Name: idx_notification_digests_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_digests_state ON public.notification_digests USING btree (state, period_end);


--
-- Name: idx_notification_digests_unique_period; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notification_digests_unique_period ON public.notification_digests USING btree (recipient_id, period, period_start);


--
-- Name: idx_notification_events_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_recipient ON public.notification_events USING btree (recipient_id, created_at DESC);


--
-- Name: idx_notification_events_retain_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_retain_until ON public.notification_events USING btree (retain_until) WHERE (retain_until IS NOT NULL);


--
-- Name: idx_notification_events_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_state ON public.notification_events USING btree (state, created_at);


--
-- Name: idx_notification_events_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_template_id ON public.notification_events USING btree (template_id);


--
-- Name: idx_notification_preferences_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notification_preferences_unique ON public.notification_preferences USING btree (user_id, channel, category);


--
-- Name: idx_notification_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);


--
-- Name: idx_notification_quiet_hours_user_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notification_quiet_hours_user_unique ON public.notification_quiet_hours USING btree (user_id);


--
-- Name: idx_notification_templates_category_channel_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_templates_category_channel_status ON public.notification_templates USING btree (category, channel, status);


--
-- Name: idx_notification_templates_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notification_templates_unique ON public.notification_templates USING btree (key, channel, locale);


--
-- Name: idx_operational_status_updated_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_operational_status_updated_by_fk ON public.operational_status USING btree (updated_by);


--
-- Name: idx_operations_audit_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_operations_audit_actor ON public.operations_audit_logs USING btree (actor_id);


--
-- Name: idx_operations_audit_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_operations_audit_resource ON public.operations_audit_logs USING btree (resource_type, resource_id);


--
-- Name: idx_parent_access_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_action ON public.parent_access_audit_logs USING btree (action);


--
-- Name: idx_parent_access_audit_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_child_id ON public.parent_access_audit_logs USING btree (child_id);


--
-- Name: idx_parent_access_audit_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_created_at ON public.parent_access_audit_logs USING btree (created_at);


--
-- Name: idx_parent_access_audit_parent_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_parent_child ON public.parent_access_audit_logs USING btree (parent_id, child_id);


--
-- Name: idx_parent_access_audit_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_parent_id ON public.parent_access_audit_logs USING btree (parent_id);


--
-- Name: idx_parent_access_audit_recent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_access_audit_recent ON public.parent_access_audit_logs USING btree (created_at DESC);


--
-- Name: idx_parent_child_links_active_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_child_links_active_unique ON public.parent_child_links USING btree (parent_id, child_id) WHERE (status = 'active'::text);


--
-- Name: idx_parent_child_links_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_child_links_child_id ON public.parent_child_links USING btree (child_id);


--
-- Name: idx_parent_child_links_guard_check; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_child_links_guard_check ON public.parent_child_links USING btree (parent_id, child_id, status);


--
-- Name: idx_parent_child_links_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_child_links_parent_id ON public.parent_child_links USING btree (parent_id);


--
-- Name: idx_parent_child_links_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_child_links_status ON public.parent_child_links USING btree (status);


--
-- Name: idx_parent_consents_active_by_link; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_consents_active_by_link ON public.parent_consents USING btree (parent_child_link_id) WHERE (status = 'granted'::text);


--
-- Name: idx_parent_consents_active_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_consents_active_unique ON public.parent_consents USING btree (parent_child_link_id, consent_type) WHERE (status = 'granted'::text);


--
-- Name: idx_parent_consents_guard_check; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_consents_guard_check ON public.parent_consents USING btree (parent_child_link_id, consent_type, status);


--
-- Name: idx_parent_consents_link_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_consents_link_id ON public.parent_consents USING btree (parent_child_link_id);


--
-- Name: idx_parent_consents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_consents_status ON public.parent_consents USING btree (status);


--
-- Name: idx_parent_invitations_code_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_invitations_code_lookup ON public.parent_invitations USING btree (invitation_code) WHERE (status = 'pending'::text);


--
-- Name: idx_parent_invitations_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_invitations_code_unique ON public.parent_invitations USING btree (invitation_code);


--
-- Name: idx_parent_invitations_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_invitations_expires_at ON public.parent_invitations USING btree (expires_at) WHERE (status = 'pending'::text);


--
-- Name: idx_parent_invitations_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_invitations_parent_id ON public.parent_invitations USING btree (parent_id);


--
-- Name: idx_parent_invitations_pending_by_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_invitations_pending_by_parent ON public.parent_invitations USING btree (parent_id) WHERE (status = 'pending'::text);


--
-- Name: idx_parent_invitations_pending_child_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_invitations_pending_child_unique ON public.parent_invitations USING btree (parent_id, child_id) WHERE ((status = 'pending'::text) AND (child_id IS NOT NULL));


--
-- Name: idx_parent_invitations_pending_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_invitations_pending_unique ON public.parent_invitations USING btree (parent_id, child_email) WHERE ((status = 'pending'::text) AND (child_email IS NOT NULL));


--
-- Name: idx_parent_invitations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_invitations_status ON public.parent_invitations USING btree (status);


--
-- Name: idx_parent_notif_prefs_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_notif_prefs_enabled ON public.parent_notification_preferences USING btree (parent_id) WHERE (enabled = true);


--
-- Name: idx_parent_notif_prefs_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_notif_prefs_parent_id ON public.parent_notification_preferences USING btree (parent_id);


--
-- Name: idx_parent_notif_prefs_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_parent_notif_prefs_unique ON public.parent_notification_preferences USING btree (parent_id, channel, category);


--
-- Name: idx_payment_images_uploaded_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_images_uploaded_by_fk ON public.payment_images USING btree (uploaded_by);


--
-- Name: idx_payment_wallets_logo_image_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_wallets_logo_image_id_fk ON public.payment_wallets USING btree (logo_image_id);


--
-- Name: idx_payment_wallets_qr_image_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_wallets_qr_image_id_fk ON public.payment_wallets USING btree (qr_image_id);


--
-- Name: idx_payments_checkout_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_checkout_session_id ON public.payments USING btree (checkout_session_id);


--
-- Name: idx_payments_provider_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_provider_payment_id ON public.payments USING btree (provider_payment_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_subscription_id ON public.payments USING btree (subscription_id);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_payments_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_user_status ON public.payments USING btree (user_id, status);


--
-- Name: idx_practice_attempts_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_practice_attempts_student ON public.practice_attempts USING btree (student_id, created_at DESC);


--
-- Name: idx_practice_attempts_student_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_practice_attempts_student_topic ON public.practice_attempts USING btree (student_id, topic_id);


--
-- Name: idx_practice_attempts_topic_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_practice_attempts_topic_id_fk ON public.practice_attempts USING btree (topic_id);


--
-- Name: idx_practice_topics_kind_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_practice_topics_kind_active ON public.practice_topics USING btree (kind, is_active, sort_order);


--
-- Name: idx_promotion_codes_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promotion_codes_code ON public.promotion_codes USING btree (code);


--
-- Name: idx_promotion_codes_coupon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promotion_codes_coupon_id ON public.promotion_codes USING btree (coupon_id);


--
-- Name: idx_promotion_codes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promotion_codes_status ON public.promotion_codes USING btree (status);


--
-- Name: idx_provider_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_event_type ON public.payment_provider_events USING btree (event_type);


--
-- Name: idx_provider_events_idempotency_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_idempotency_key ON public.payment_provider_events USING btree (idempotency_key);


--
-- Name: idx_provider_events_processing_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_processing_status ON public.payment_provider_events USING btree (processing_status);


--
-- Name: idx_provider_events_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_provider ON public.payment_provider_events USING btree (provider);


--
-- Name: idx_provider_events_provider_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_provider_event_id ON public.payment_provider_events USING btree (provider_event_id);


--
-- Name: idx_provider_events_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_events_status_created ON public.payment_provider_events USING btree (processing_status, created_at);


--
-- Name: idx_qskill_skill_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qskill_skill_key ON public.question_skill_links USING btree (skill_key);


--
-- Name: idx_questions_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_key ON public.questions USING btree (key) WHERE (key IS NOT NULL);


--
-- Name: idx_questions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_status ON public.questions USING btree (status);


--
-- Name: idx_questions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_type ON public.questions USING btree (type);


--
-- Name: idx_refunds_approved_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_approved_by_fk ON public.refunds USING btree (approved_by);


--
-- Name: idx_refunds_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_payment_id ON public.refunds USING btree (payment_id);


--
-- Name: idx_refunds_provider_refund_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_provider_refund_id ON public.refunds USING btree (provider_refund_id);


--
-- Name: idx_refunds_requested_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_requested_by ON public.refunds USING btree (requested_by);


--
-- Name: idx_refunds_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_status ON public.refunds USING btree (status);


--
-- Name: idx_refunds_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_status_created ON public.refunds USING btree (status, created_at);


--
-- Name: idx_release_notes_created_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_release_notes_created_by_fk ON public.release_notes USING btree (created_by);


--
-- Name: idx_release_notes_published_by_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_release_notes_published_by_fk ON public.release_notes USING btree (published_by);


--
-- Name: idx_release_notes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_release_notes_status ON public.release_notes USING btree (status);


--
-- Name: idx_reminder_schedules_next_run; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminder_schedules_next_run ON public.reminder_schedules USING btree (status, next_run_at);


--
-- Name: idx_reminder_schedules_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminder_schedules_owner ON public.reminder_schedules USING btree (owner_id, status);


--
-- Name: idx_report_definitions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_definitions_category ON public.report_definitions USING btree (category);


--
-- Name: idx_report_definitions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_definitions_is_active ON public.report_definitions USING btree (is_active);


--
-- Name: idx_report_runs_definition_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_runs_definition_status ON public.report_runs USING btree (report_definition_id, status);


--
-- Name: idx_report_runs_report_definition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_runs_report_definition_id ON public.report_runs USING btree (report_definition_id);


--
-- Name: idx_report_runs_requested_by_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_runs_requested_by_user_id ON public.report_runs USING btree (requested_by_user_id);


--
-- Name: idx_report_runs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_runs_status ON public.report_runs USING btree (status);


--
-- Name: idx_student_achievements_achievement_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_achievements_achievement_id_fk ON public.student_achievements USING btree (achievement_id);


--
-- Name: idx_subscriptions_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions USING btree (plan_id);


--
-- Name: idx_subscriptions_provider_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_provider_subscription_id ON public.subscriptions USING btree (provider_subscription_id);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_subscriptions_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);


--
-- Name: idx_support_ticket_comments_author_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_comments_author_id_fk ON public.support_ticket_comments USING btree (author_id);


--
-- Name: idx_support_ticket_comments_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_comments_ticket ON public.support_ticket_comments USING btree (ticket_id);


--
-- Name: idx_support_tickets_assigned_to_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_assigned_to_fk ON public.support_tickets USING btree (assigned_to);


--
-- Name: idx_support_tickets_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_requester ON public.support_tickets USING btree (requester_id);


--
-- Name: idx_support_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_tts_audio_assets_generating_lease; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tts_audio_assets_generating_lease ON public.tts_audio_assets USING btree (lease_expires_at) WHERE (status = 'generating'::text);


--
-- Name: idx_tts_audio_assets_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tts_audio_assets_question_id ON public.tts_audio_assets USING btree (question_id);


--
-- Name: idx_user_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_status ON public.user_feedback USING btree (status);


--
-- Name: idx_user_feedback_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_user ON public.user_feedback USING btree (user_id);


--
-- Name: initial_learning_path_entry_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_entry_type_idx ON public.initial_learning_path USING btree (entry_type);


--
-- Name: initial_learning_path_result_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_result_id_idx ON public.initial_learning_path USING btree (placement_result_id);


--
-- Name: initial_learning_path_result_priority_asc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_result_priority_asc_idx ON public.initial_learning_path USING btree (placement_result_id, priority);


--
-- Name: initial_learning_path_result_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX initial_learning_path_result_priority_idx ON public.initial_learning_path USING btree (placement_result_id, priority);


--
-- Name: initial_learning_path_result_priority_ordered_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_result_priority_ordered_idx ON public.initial_learning_path USING btree (placement_result_id, priority);


--
-- Name: initial_learning_path_skill_id_entry_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_skill_id_entry_type_idx ON public.initial_learning_path USING btree (skill_id, entry_type) WHERE (skill_id IS NOT NULL);


--
-- Name: initial_learning_path_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX initial_learning_path_skill_id_idx ON public.initial_learning_path USING btree (skill_id) WHERE (skill_id IS NOT NULL);


--
-- Name: learning_sessions_last_activity_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_last_activity_at_idx ON public.learning_sessions USING btree (last_activity_at);


--
-- Name: learning_sessions_placement_result_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_placement_result_id_idx ON public.learning_sessions USING btree (placement_result_id);


--
-- Name: learning_sessions_session_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_session_type_idx ON public.learning_sessions USING btree (session_type);


--
-- Name: learning_sessions_started_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_started_at_idx ON public.learning_sessions USING btree (started_at);


--
-- Name: learning_sessions_status_active_partial_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_status_active_partial_idx ON public.learning_sessions USING btree (student_id, last_activity_at) WHERE (status = 'active'::text);


--
-- Name: learning_sessions_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_student_id_idx ON public.learning_sessions USING btree (student_id);


--
-- Name: learning_sessions_student_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_sessions_student_id_status_idx ON public.learning_sessions USING btree (student_id, status);


--
-- Name: lesson_assets_lesson_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_assets_lesson_id_idx ON public.lesson_assets USING btree (lesson_id);


--
-- Name: lesson_assets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_assets_status_idx ON public.lesson_assets USING btree (status);


--
-- Name: lesson_assets_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_assets_type_idx ON public.lesson_assets USING btree (type);


--
-- Name: lesson_attempts_is_correct_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_is_correct_idx ON public.lesson_attempts USING btree (is_correct);


--
-- Name: lesson_attempts_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_item_id_idx ON public.lesson_attempts USING btree (item_id);


--
-- Name: lesson_attempts_learning_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_learning_session_id_idx ON public.lesson_attempts USING btree (learning_session_id);


--
-- Name: lesson_attempts_learning_session_id_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_learning_session_id_item_id_idx ON public.lesson_attempts USING btree (learning_session_id, item_id);


--
-- Name: lesson_attempts_skill_ids_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_skill_ids_gin_idx ON public.lesson_attempts USING gin (skill_ids);


--
-- Name: lesson_attempts_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_student_id_idx ON public.lesson_attempts USING btree (student_id);


--
-- Name: lesson_attempts_submitted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_attempts_submitted_at_idx ON public.lesson_attempts USING btree (submitted_at);


--
-- Name: lesson_objectives_objective_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_objectives_objective_id_idx ON public.lesson_objectives USING btree (objective_id);


--
-- Name: lesson_progress_lesson_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_lesson_id_idx ON public.lesson_progress USING btree (lesson_id);


--
-- Name: lesson_progress_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_student_id_idx ON public.lesson_progress USING btree (student_id);


--
-- Name: lesson_progress_student_id_last_active_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_student_id_last_active_at_idx ON public.lesson_progress USING btree (student_id, last_active_at DESC);


--
-- Name: lesson_questions_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_questions_question_id_idx ON public.lesson_questions USING btree (question_id);


--
-- Name: lesson_skills_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_skills_skill_id_idx ON public.lesson_skills USING btree (skill_id);


--
-- Name: lessons_chapter_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_chapter_id_idx ON public.lessons USING btree (chapter_id);


--
-- Name: lessons_chapter_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_chapter_sort_order_idx ON public.lessons USING btree (chapter_id, sort_order);


--
-- Name: lessons_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_status_idx ON public.lessons USING btree (status);


--
-- Name: levels_course_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX levels_course_id_idx ON public.levels USING btree (course_id);


--
-- Name: levels_course_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX levels_course_sort_order_idx ON public.levels USING btree (course_id, sort_order);


--
-- Name: levels_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX levels_status_idx ON public.levels USING btree (status);


--
-- Name: mistakes_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mistakes_item_id_idx ON public.mistakes USING btree (item_id);


--
-- Name: mistakes_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mistakes_student_id_idx ON public.mistakes USING btree (student_id);


--
-- Name: mistakes_student_id_last_seen_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mistakes_student_id_last_seen_at_idx ON public.mistakes USING btree (student_id, last_seen_at DESC);


--
-- Name: mistakes_student_id_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mistakes_student_id_skill_id_idx ON public.mistakes USING btree (student_id, skill_id);


--
-- Name: mistakes_student_id_unresolved_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mistakes_student_id_unresolved_idx ON public.mistakes USING btree (student_id) WHERE (is_resolved = false);


--
-- Name: objective_skills_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX objective_skills_skill_id_idx ON public.objective_skills USING btree (skill_id);


--
-- Name: objectives_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX objectives_key_idx ON public.objectives USING btree (key) WHERE (key IS NOT NULL);


--
-- Name: objectives_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX objectives_status_idx ON public.objectives USING btree (status);


--
-- Name: permissions_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_key_idx ON public.permissions USING btree (key);


--
-- Name: permissions_scope_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_scope_idx ON public.permissions USING btree (scope);


--
-- Name: placement_answers_attempt_correct_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_attempt_correct_idx ON public.placement_answers USING btree (placement_attempt_id) WHERE (is_correct = true);


--
-- Name: placement_answers_attempt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_attempt_id_idx ON public.placement_answers USING btree (placement_attempt_id);


--
-- Name: placement_answers_attempt_question_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX placement_answers_attempt_question_unique_idx ON public.placement_answers USING btree (placement_attempt_id, placement_question_id);


--
-- Name: placement_answers_attempt_skill_correct_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_attempt_skill_correct_idx ON public.placement_answers USING btree (placement_attempt_id, skill_code, is_correct);


--
-- Name: placement_answers_attempt_skill_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_attempt_skill_idx ON public.placement_answers USING btree (placement_attempt_id, skill_code);


--
-- Name: placement_answers_is_correct_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_is_correct_idx ON public.placement_answers USING btree (is_correct);


--
-- Name: placement_answers_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_question_id_idx ON public.placement_answers USING btree (placement_question_id);


--
-- Name: placement_answers_skill_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_answers_skill_code_idx ON public.placement_answers USING btree (skill_code);


--
-- Name: placement_attempts_active_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX placement_attempts_active_unique_idx ON public.placement_attempts USING btree (student_id, placement_test_id) WHERE (status = 'active'::text);


--
-- Name: placement_attempts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_status_idx ON public.placement_attempts USING btree (status);


--
-- Name: placement_attempts_student_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_student_active_idx ON public.placement_attempts USING btree (student_id) WHERE (status = 'active'::text);


--
-- Name: placement_attempts_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_student_id_idx ON public.placement_attempts USING btree (student_id);


--
-- Name: placement_attempts_student_started_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_student_started_at_idx ON public.placement_attempts USING btree (student_id, started_at DESC);


--
-- Name: placement_attempts_student_test_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_student_test_idx ON public.placement_attempts USING btree (student_id, placement_test_id);


--
-- Name: placement_attempts_test_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_test_id_idx ON public.placement_attempts USING btree (placement_test_id);


--
-- Name: placement_attempts_test_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_test_status_idx ON public.placement_attempts USING btree (placement_test_id, status);


--
-- Name: placement_audit_log_attempt_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_attempt_created_at_idx ON public.placement_audit_log USING btree (placement_attempt_id, created_at DESC) WHERE (placement_attempt_id IS NOT NULL);


--
-- Name: placement_audit_log_attempt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_attempt_id_idx ON public.placement_audit_log USING btree (placement_attempt_id);


--
-- Name: placement_audit_log_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_created_at_idx ON public.placement_audit_log USING btree (created_at);


--
-- Name: placement_audit_log_event_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_event_type_created_at_idx ON public.placement_audit_log USING btree (event_type, created_at DESC);


--
-- Name: placement_audit_log_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_event_type_idx ON public.placement_audit_log USING btree (event_type);


--
-- Name: placement_audit_log_student_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_student_created_at_idx ON public.placement_audit_log USING btree (student_id, created_at DESC);


--
-- Name: placement_audit_log_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_audit_log_student_id_idx ON public.placement_audit_log USING btree (student_id);


--
-- Name: placement_question_skills_one_primary_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX placement_question_skills_one_primary_idx ON public.placement_question_skills USING btree (placement_question_id) WHERE (is_primary = true);


--
-- Name: placement_question_skills_primary_by_skill_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_question_skills_primary_by_skill_idx ON public.placement_question_skills USING btree (skill_id) WHERE (is_primary = true);


--
-- Name: placement_question_skills_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_question_skills_question_id_idx ON public.placement_question_skills USING btree (placement_question_id);


--
-- Name: placement_question_skills_question_primary_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_question_skills_question_primary_idx ON public.placement_question_skills USING btree (placement_question_id, skill_id) WHERE (is_primary = true);


--
-- Name: placement_question_skills_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_question_skills_skill_id_idx ON public.placement_question_skills USING btree (skill_id);


--
-- Name: placement_questions_section_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_questions_section_id_idx ON public.placement_questions USING btree (placement_section_id);


--
-- Name: placement_questions_section_order_delivery_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_questions_section_order_delivery_idx ON public.placement_questions USING btree (placement_section_id, order_index);


--
-- Name: placement_questions_section_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_questions_section_order_idx ON public.placement_questions USING btree (placement_section_id, order_index);


--
-- Name: placement_questions_section_type_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_questions_section_type_order_idx ON public.placement_questions USING btree (placement_section_id, question_type, order_index);


--
-- Name: placement_questions_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_questions_type_idx ON public.placement_questions USING btree (question_type);


--
-- Name: placement_results_attempt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_attempt_id_idx ON public.placement_results USING btree (placement_attempt_id);


--
-- Name: placement_results_estimated_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_estimated_level_idx ON public.placement_results USING btree (estimated_level);


--
-- Name: placement_results_initial_path_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_initial_path_id_idx ON public.placement_results USING btree (initial_path_id);


--
-- Name: placement_results_level_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_level_created_at_idx ON public.placement_results USING btree (estimated_level, created_at DESC);


--
-- Name: placement_results_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_student_id_idx ON public.placement_results USING btree (student_id);


--
-- Name: placement_results_student_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_results_student_level_idx ON public.placement_results USING btree (student_id, estimated_level);


--
-- Name: placement_sections_skill_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_sections_skill_code_idx ON public.placement_sections USING btree (skill_code);


--
-- Name: placement_sections_test_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_sections_test_id_idx ON public.placement_sections USING btree (placement_test_id);


--
-- Name: placement_sections_test_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_sections_test_order_idx ON public.placement_sections USING btree (placement_test_id, order_index);


--
-- Name: placement_tests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_tests_created_at_idx ON public.placement_tests USING btree (created_at DESC);


--
-- Name: placement_tests_one_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX placement_tests_one_published_idx ON public.placement_tests USING btree (status) WHERE (status = 'published'::text);


--
-- Name: placement_tests_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_tests_status_created_at_idx ON public.placement_tests USING btree (status, created_at DESC);


--
-- Name: placement_tests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_tests_status_idx ON public.placement_tests USING btree (status);


--
-- Name: question_answers_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_answers_question_id_idx ON public.question_answers USING btree (question_id);


--
-- Name: question_bank_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_bank_created_by_idx ON public.question_bank USING btree (created_by);


--
-- Name: question_bank_difficulty_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_bank_difficulty_idx ON public.question_bank USING btree (difficulty);


--
-- Name: question_bank_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_bank_status_idx ON public.question_bank USING btree (status);


--
-- Name: question_bank_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_bank_type_idx ON public.question_bank USING btree (type);


--
-- Name: question_choices_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_choices_question_id_idx ON public.question_choices USING btree (question_id);


--
-- Name: question_choices_question_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_choices_question_sort_order_idx ON public.question_choices USING btree (question_id, sort_order);


--
-- Name: question_skills_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_skills_skill_id_idx ON public.question_skills USING btree (skill_id);


--
-- Name: recommendations_active_student_rank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_active_student_rank_idx ON public.recommendations USING btree (student_id, rank) WHERE (status = 'active'::text);


--
-- Name: recommendations_based_on_weakness_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_based_on_weakness_id_idx ON public.recommendations USING btree (based_on_weakness_id);


--
-- Name: recommendations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_status_idx ON public.recommendations USING btree (status);


--
-- Name: recommendations_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_student_id_idx ON public.recommendations USING btree (student_id);


--
-- Name: recommendations_target_lesson_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_target_lesson_id_idx ON public.recommendations USING btree (target_lesson_id);


--
-- Name: recommendations_target_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommendations_target_skill_id_idx ON public.recommendations USING btree (target_skill_id);


--
-- Name: review_schedules_due_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX review_schedules_due_at_idx ON public.review_schedules USING btree (due_at);


--
-- Name: review_schedules_due_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX review_schedules_due_student_idx ON public.review_schedules USING btree (student_id, due_at) WHERE (status = ANY (ARRAY['pending'::text, 'due'::text]));


--
-- Name: review_schedules_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX review_schedules_skill_id_idx ON public.review_schedules USING btree (skill_id);


--
-- Name: review_schedules_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX review_schedules_status_idx ON public.review_schedules USING btree (status);


--
-- Name: review_schedules_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX review_schedules_student_id_idx ON public.review_schedules USING btree (student_id);


--
-- Name: role_permissions_permission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions USING btree (permission_id);


--
-- Name: role_permissions_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_role_id_idx ON public.role_permissions USING btree (role_id);


--
-- Name: roles_is_system_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_is_system_idx ON public.roles USING btree (is_system);


--
-- Name: roles_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_key_idx ON public.roles USING btree (key);


--
-- Name: saved_words_due_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX saved_words_due_idx ON public.saved_words USING btree (student_id, next_review_at);


--
-- Name: saved_words_student_word_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX saved_words_student_word_uq ON public.saved_words USING btree (student_id, lower(btrim(word)));


--
-- Name: session_events_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_events_event_type_idx ON public.session_events USING btree (event_type);


--
-- Name: session_events_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_events_item_id_idx ON public.session_events USING btree (item_id);


--
-- Name: session_events_learning_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_events_learning_session_id_idx ON public.session_events USING btree (learning_session_id);


--
-- Name: session_events_learning_session_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_events_learning_session_id_occurred_at_idx ON public.session_events USING btree (learning_session_id, occurred_at);


--
-- Name: session_events_student_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_events_student_id_occurred_at_idx ON public.session_events USING btree (student_id, occurred_at);


--
-- Name: session_questions_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_questions_question_id_idx ON public.session_questions USING btree (question_id);


--
-- Name: session_summaries_closed_out_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_summaries_closed_out_at_idx ON public.session_summaries USING btree (closed_out_at);


--
-- Name: session_summaries_frustration_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_summaries_frustration_level_idx ON public.session_summaries USING btree (frustration_level);


--
-- Name: session_summaries_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_summaries_student_id_idx ON public.session_summaries USING btree (student_id);


--
-- Name: skills_domain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skills_domain_idx ON public.skills USING btree (domain);


--
-- Name: skills_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skills_key_idx ON public.skills USING btree (key);


--
-- Name: skills_parent_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skills_parent_skill_id_idx ON public.skills USING btree (parent_skill_id) WHERE (parent_skill_id IS NOT NULL);


--
-- Name: skills_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skills_status_idx ON public.skills USING btree (status);


--
-- Name: streak_freezes_student_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX streak_freezes_student_created_idx ON public.streak_freezes USING btree (student_id, created_at DESC);


--
-- Name: student_achievements_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_achievements_student_id_idx ON public.student_achievements USING btree (student_id);


--
-- Name: student_level_state_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_level_state_student_id_idx ON public.student_level_state USING btree (student_id);


--
-- Name: student_profiles_profile_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_profiles_profile_type_idx ON public.student_profiles USING btree (profile_type);


--
-- Name: student_profiles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_profiles_user_id_idx ON public.student_profiles USING btree (user_id);


--
-- Name: student_skill_states_last_evaluated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_skill_states_last_evaluated_at_idx ON public.student_skill_states USING btree (last_evaluated_at);


--
-- Name: student_skill_states_mastery_trend_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_skill_states_mastery_trend_idx ON public.student_skill_states USING btree (mastery_trend);


--
-- Name: student_skill_states_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_skill_states_skill_id_idx ON public.student_skill_states USING btree (skill_id);


--
-- Name: student_skill_states_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_skill_states_student_id_idx ON public.student_skill_states USING btree (student_id);


--
-- Name: student_skill_states_student_id_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_skill_states_student_id_skill_id_idx ON public.student_skill_states USING btree (student_id, skill_id);


--
-- Name: uniq_ai_model_configs_active_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uniq_ai_model_configs_active_name ON public.ai_model_configs USING btree (name) WHERE ((status)::text = 'active'::text);


--
-- Name: uniq_ai_prompt_templates_active_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uniq_ai_prompt_templates_active_name ON public.ai_prompt_templates USING btree (name) WHERE ((status)::text = 'active'::text);


--
-- Name: user_roles_assigned_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_assigned_at_idx ON public.user_roles USING btree (assigned_at);


--
-- Name: user_roles_assigned_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_assigned_by_idx ON public.user_roles USING btree (assigned_by);


--
-- Name: user_roles_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_role_id_idx ON public.user_roles USING btree (role_id);


--
-- Name: user_roles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_user_id_idx ON public.user_roles USING btree (user_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_supabase_auth_uid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_supabase_auth_uid_idx ON public.users USING btree (supabase_auth_uid);


--
-- Name: users_user_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_user_type_idx ON public.users USING btree (user_type);


--
-- Name: vocabulary_words_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vocabulary_words_level_idx ON public.vocabulary_words USING btree (level, is_active, sort_order, word);


--
-- Name: vocabulary_words_word_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vocabulary_words_word_uq ON public.vocabulary_words USING btree (lower(btrim(word)));


--
-- Name: voice_audio_assets_ai_chat_message_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX voice_audio_assets_ai_chat_message_id_key ON public.voice_audio_assets USING btree (ai_chat_message_id);


--
-- Name: voice_audio_assets_message_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX voice_audio_assets_message_id_key ON public.voice_audio_assets USING btree (message_id);


--
-- Name: voice_audio_assets_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_audio_assets_student_id_created_at_idx ON public.voice_audio_assets USING btree (student_id, created_at DESC);


--
-- Name: voice_feedback_rating_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_feedback_rating_idx ON public.voice_feedback USING btree (rating);


--
-- Name: voice_feedback_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_feedback_session_id_created_at_idx ON public.voice_feedback USING btree (session_id, created_at DESC);


--
-- Name: voice_feedback_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_feedback_student_id_created_at_idx ON public.voice_feedback USING btree (student_id, created_at DESC);


--
-- Name: voice_messages_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_messages_session_id_created_at_idx ON public.voice_messages USING btree (session_id, created_at);


--
-- Name: voice_messages_session_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_messages_session_id_status_idx ON public.voice_messages USING btree (session_id, status);


--
-- Name: voice_messages_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_messages_student_id_created_at_idx ON public.voice_messages USING btree (student_id, created_at DESC);


--
-- Name: voice_provider_logs_message_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_provider_logs_message_id_created_at_idx ON public.voice_provider_logs USING btree (message_id, created_at DESC);


--
-- Name: voice_provider_logs_message_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_provider_logs_message_id_idx ON public.voice_provider_logs USING btree (message_id);


--
-- Name: voice_provider_logs_provider_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_provider_logs_provider_type_idx ON public.voice_provider_logs USING btree (provider_type);


--
-- Name: voice_provider_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_provider_logs_status_idx ON public.voice_provider_logs USING btree (status);


--
-- Name: voice_safety_events_decision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_safety_events_decision_idx ON public.voice_safety_events USING btree (decision);


--
-- Name: voice_safety_events_direction_decision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_safety_events_direction_decision_idx ON public.voice_safety_events USING btree (direction, decision);


--
-- Name: voice_safety_events_message_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_safety_events_message_id_idx ON public.voice_safety_events USING btree (message_id) WHERE (message_id IS NOT NULL);


--
-- Name: voice_safety_events_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_safety_events_session_id_created_at_idx ON public.voice_safety_events USING btree (session_id, created_at DESC);


--
-- Name: voice_sessions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_sessions_status_idx ON public.voice_sessions USING btree (status);


--
-- Name: voice_sessions_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_sessions_student_id_created_at_idx ON public.voice_sessions USING btree (student_id, created_at DESC);


--
-- Name: voice_sessions_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_sessions_student_id_idx ON public.voice_sessions USING btree (student_id);


--
-- Name: voice_sessions_student_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_sessions_student_id_status_idx ON public.voice_sessions USING btree (student_id, status);


--
-- Name: voice_transcripts_language_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_transcripts_language_code_idx ON public.voice_transcripts USING btree (language_code) WHERE (language_code IS NOT NULL);


--
-- Name: voice_transcripts_provider_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_transcripts_provider_ref_idx ON public.voice_transcripts USING btree (provider_ref) WHERE (provider_ref IS NOT NULL);


--
-- Name: voice_transcripts_session_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_transcripts_session_id_created_at_idx ON public.voice_transcripts USING btree (session_id, created_at);


--
-- Name: weakness_records_active_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_active_student_idx ON public.weakness_records USING btree (student_id, detected_at) WHERE (status = ANY (ARRAY['open'::text, 'improving'::text]));


--
-- Name: weakness_records_detected_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_detected_at_idx ON public.weakness_records USING btree (detected_at);


--
-- Name: weakness_records_severity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_severity_idx ON public.weakness_records USING btree (severity);


--
-- Name: weakness_records_skill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_skill_id_idx ON public.weakness_records USING btree (skill_id);


--
-- Name: weakness_records_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_student_id_idx ON public.weakness_records USING btree (student_id);


--
-- Name: weakness_records_student_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weakness_records_student_id_status_idx ON public.weakness_records USING btree (student_id, status);


--
-- Name: xp_levels_min_xp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX xp_levels_min_xp_idx ON public.xp_levels USING btree (min_xp);


--
-- Name: admin_profiles admin_profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER admin_profiles_set_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.set_admin_profiles_updated_at();


--
-- Name: ai_model_configs ai_model_configs_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ai_model_configs_set_updated_at BEFORE UPDATE ON public.ai_model_configs FOR EACH ROW EXECUTE FUNCTION public.set_ai_model_configs_updated_at();


--
-- Name: ai_prompt_templates ai_prompt_templates_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ai_prompt_templates_set_updated_at BEFORE UPDATE ON public.ai_prompt_templates FOR EACH ROW EXECUTE FUNCTION public.set_ai_prompt_templates_updated_at();


--
-- Name: ai_teacher_conversations ai_teacher_conversations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ai_teacher_conversations_set_updated_at BEFORE UPDATE ON public.ai_teacher_conversations FOR EACH ROW EXECUTE FUNCTION public.set_ai_teacher_conversations_updated_at();


--
-- Name: app_version_policies app_version_policies_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER app_version_policies_set_updated_at BEFORE UPDATE ON public.app_version_policies FOR EACH ROW EXECUTE FUNCTION public.set_app_version_policies_updated_at();


--
-- Name: chapter_translations chapter_translations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER chapter_translations_set_updated_at BEFORE UPDATE ON public.chapter_translations FOR EACH ROW EXECUTE FUNCTION public.set_chapter_translations_updated_at();


--
-- Name: chapters chapters_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER chapters_set_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.set_chapters_updated_at();


--
-- Name: course_access course_access_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER course_access_set_updated_at BEFORE UPDATE ON public.course_access FOR EACH ROW EXECUTE FUNCTION public.set_course_billing_updated_at();


--
-- Name: course_payment_requests course_payment_requests_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER course_payment_requests_set_updated_at BEFORE UPDATE ON public.course_payment_requests FOR EACH ROW EXECUTE FUNCTION public.set_course_billing_updated_at();


--
-- Name: course_prices course_prices_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER course_prices_set_updated_at BEFORE UPDATE ON public.course_prices FOR EACH ROW EXECUTE FUNCTION public.set_course_billing_updated_at();


--
-- Name: course_translations course_translations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER course_translations_set_updated_at BEFORE UPDATE ON public.course_translations FOR EACH ROW EXECUTE FUNCTION public.set_course_translations_updated_at();


--
-- Name: courses courses_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_courses_updated_at();


--
-- Name: feature_flags feature_flags_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER feature_flags_set_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.set_feature_flags_updated_at();


--
-- Name: feature_requests feature_requests_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER feature_requests_set_updated_at BEFORE UPDATE ON public.feature_requests FOR EACH ROW EXECUTE FUNCTION public.set_feature_requests_updated_at();


--
-- Name: incident_records incident_records_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER incident_records_set_updated_at BEFORE UPDATE ON public.incident_records FOR EACH ROW EXECUTE FUNCTION public.set_incident_records_updated_at();


--
-- Name: lesson_assets lesson_assets_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lesson_assets_set_updated_at BEFORE UPDATE ON public.lesson_assets FOR EACH ROW EXECUTE FUNCTION public.set_lesson_assets_updated_at();


--
-- Name: lesson_translations lesson_translations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lesson_translations_set_updated_at BEFORE UPDATE ON public.lesson_translations FOR EACH ROW EXECUTE FUNCTION public.set_lesson_translations_updated_at();


--
-- Name: lessons lessons_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lessons_set_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_lessons_updated_at();


--
-- Name: levels levels_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER levels_set_updated_at BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.set_levels_updated_at();


--
-- Name: maintenance_windows maintenance_windows_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER maintenance_windows_set_updated_at BEFORE UPDATE ON public.maintenance_windows FOR EACH ROW EXECUTE FUNCTION public.set_maintenance_windows_updated_at();


--
-- Name: objectives objectives_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER objectives_set_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION public.set_objectives_updated_at();


--
-- Name: payment_wallets payment_wallets_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_wallets_set_updated_at BEFORE UPDATE ON public.payment_wallets FOR EACH ROW EXECUTE FUNCTION public.set_course_billing_updated_at();


--
-- Name: permissions permissions_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER permissions_set_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.set_permissions_updated_at();


--
-- Name: placement_attempts placement_attempts_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER placement_attempts_updated_at_trigger BEFORE UPDATE ON public.placement_attempts FOR EACH ROW EXECUTE FUNCTION public.update_placement_attempts_updated_at();


--
-- Name: placement_questions placement_questions_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER placement_questions_set_updated_at BEFORE UPDATE ON public.placement_questions FOR EACH ROW EXECUTE FUNCTION public.set_placement_questions_updated_at();


--
-- Name: placement_sections placement_sections_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER placement_sections_set_updated_at BEFORE UPDATE ON public.placement_sections FOR EACH ROW EXECUTE FUNCTION public.set_placement_sections_updated_at();


--
-- Name: practice_topic_translations practice_topic_translations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER practice_topic_translations_set_updated_at BEFORE UPDATE ON public.practice_topic_translations FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();


--
-- Name: practice_topics practice_topics_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER practice_topics_set_updated_at BEFORE UPDATE ON public.practice_topics FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();


--
-- Name: question_answers question_answers_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_answers_set_updated_at BEFORE UPDATE ON public.question_answers FOR EACH ROW EXECUTE FUNCTION public.set_question_answers_updated_at();


--
-- Name: question_bank question_bank_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_bank_set_updated_at BEFORE UPDATE ON public.question_bank FOR EACH ROW EXECUTE FUNCTION public.set_question_bank_updated_at();


--
-- Name: question_choices question_choices_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_choices_set_updated_at BEFORE UPDATE ON public.question_choices FOR EACH ROW EXECUTE FUNCTION public.set_question_choices_updated_at();


--
-- Name: release_notes release_notes_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER release_notes_set_updated_at BEFORE UPDATE ON public.release_notes FOR EACH ROW EXECUTE FUNCTION public.set_release_notes_updated_at();


--
-- Name: roles roles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER roles_set_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_roles_updated_at();


--
-- Name: skills skills_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER skills_set_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_skills_updated_at();


--
-- Name: student_level_state student_level_state_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER student_level_state_set_updated_at BEFORE UPDATE ON public.student_level_state FOR EACH ROW EXECUTE FUNCTION public.set_student_level_state_updated_at();


--
-- Name: student_profiles student_profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER student_profiles_set_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.set_student_profiles_updated_at();


--
-- Name: support_tickets support_tickets_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER support_tickets_set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_support_tickets_updated_at();


--
-- Name: admin_broadcast_schedules trg_admin_broadcast_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_broadcast_schedules_updated_at BEFORE UPDATE ON public.admin_broadcast_schedules FOR EACH ROW EXECUTE FUNCTION public.update_admin_broadcast_schedules_updated_at();


--
-- Name: device_tokens trg_device_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_device_tokens_updated_at BEFORE UPDATE ON public.device_tokens FOR EACH ROW EXECUTE FUNCTION public.update_device_tokens_updated_at();


--
-- Name: notification_events trg_notification_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notification_events_updated_at BEFORE UPDATE ON public.notification_events FOR EACH ROW EXECUTE FUNCTION public.update_notification_events_updated_at();


--
-- Name: notification_preferences trg_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_notification_preferences_updated_at();


--
-- Name: notification_quiet_hours trg_notification_quiet_hours_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notification_quiet_hours_updated_at BEFORE UPDATE ON public.notification_quiet_hours FOR EACH ROW EXECUTE FUNCTION public.update_notification_quiet_hours_updated_at();


--
-- Name: notification_templates trg_notification_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_notification_templates_updated_at();


--
-- Name: parent_child_links trg_parent_child_links_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_child_links_updated_at BEFORE UPDATE ON public.parent_child_links FOR EACH ROW EXECUTE FUNCTION public.update_parent_child_links_updated_at();


--
-- Name: parent_consents trg_parent_consents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_consents_updated_at BEFORE UPDATE ON public.parent_consents FOR EACH ROW EXECUTE FUNCTION public.update_parent_consents_updated_at();


--
-- Name: parent_invitations trg_parent_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_invitations_updated_at BEFORE UPDATE ON public.parent_invitations FOR EACH ROW EXECUTE FUNCTION public.update_parent_invitations_updated_at();


--
-- Name: parent_notification_preferences trg_parent_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_notification_preferences_updated_at BEFORE UPDATE ON public.parent_notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_parent_notification_preferences_updated_at();


--
-- Name: questions trg_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_questions_updated_at();


--
-- Name: reminder_schedules trg_reminder_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reminder_schedules_updated_at BEFORE UPDATE ON public.reminder_schedules FOR EACH ROW EXECUTE FUNCTION public.update_reminder_schedules_updated_at();


--
-- Name: users users_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_users_updated_at();


--
-- Name: admin_broadcast_schedules admin_broadcast_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_broadcast_schedules
    ADD CONSTRAINT admin_broadcast_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_chat_messages ai_chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE;


--
-- Name: ai_chat_sessions ai_chat_sessions_resolved_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_sessions
    ADD CONSTRAINT ai_chat_sessions_resolved_lesson_id_fkey FOREIGN KEY (resolved_lesson_id) REFERENCES public.lessons(id);


--
-- Name: ai_chat_sessions ai_chat_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_sessions
    ADD CONSTRAINT ai_chat_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_context_snapshots ai_context_snapshots_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_context_snapshots
    ADD CONSTRAINT ai_context_snapshots_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE;


--
-- Name: ai_context_snapshots ai_context_snapshots_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_context_snapshots
    ADD CONSTRAINT ai_context_snapshots_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE;


--
-- Name: ai_focus_directives ai_focus_directives_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_focus_directives
    ADD CONSTRAINT ai_focus_directives_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: ai_provider_logs ai_provider_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_logs
    ADD CONSTRAINT ai_provider_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE;


--
-- Name: ai_safety_events ai_safety_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_safety_events
    ADD CONSTRAINT ai_safety_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE;


--
-- Name: ai_teacher_audit_logs ai_teacher_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_audit_logs
    ADD CONSTRAINT ai_teacher_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: ai_teacher_conversations ai_teacher_conversations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_conversations
    ADD CONSTRAINT ai_teacher_conversations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: ai_teacher_feedback_entries ai_teacher_feedback_entries_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback_entries
    ADD CONSTRAINT ai_teacher_feedback_entries_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ai_teacher_messages(id) ON DELETE CASCADE;


--
-- Name: ai_teacher_feedback_entries ai_teacher_feedback_entries_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback_entries
    ADD CONSTRAINT ai_teacher_feedback_entries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: ai_teacher_feedback ai_teacher_feedback_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback
    ADD CONSTRAINT ai_teacher_feedback_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE;


--
-- Name: ai_teacher_feedback ai_teacher_feedback_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_feedback
    ADD CONSTRAINT ai_teacher_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_teacher_messages ai_teacher_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_messages
    ADD CONSTRAINT ai_teacher_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_teacher_conversations(id) ON DELETE CASCADE;


--
-- Name: ai_teacher_messages ai_teacher_messages_model_config_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_messages
    ADD CONSTRAINT ai_teacher_messages_model_config_fk FOREIGN KEY (model_config_id) REFERENCES public.ai_model_configs(id);


--
-- Name: ai_teacher_messages ai_teacher_messages_prompt_template_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_teacher_messages
    ADD CONSTRAINT ai_teacher_messages_prompt_template_fk FOREIGN KEY (prompt_template_id) REFERENCES public.ai_prompt_templates(id);


--
-- Name: ai_usage_cost_events ai_usage_cost_events_model_config_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_cost_events
    ADD CONSTRAINT ai_usage_cost_events_model_config_fk FOREIGN KEY (model_config_id) REFERENCES public.ai_model_configs(id);


--
-- Name: ai_usage_cost_events ai_usage_cost_events_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_cost_events
    ADD CONSTRAINT ai_usage_cost_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: ai_voice_sessions ai_voice_sessions_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_voice_sessions
    ADD CONSTRAINT ai_voice_sessions_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_teacher_conversations(id) ON DELETE SET NULL;


--
-- Name: ai_voice_sessions ai_voice_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_voice_sessions
    ADD CONSTRAINT ai_voice_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: analytics_access_audit_logs analytics_access_audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_access_audit_logs
    ADD CONSTRAINT analytics_access_audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: analytics_cohort_members analytics_cohort_members_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohort_members
    ADD CONSTRAINT analytics_cohort_members_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.analytics_cohorts(id) ON DELETE CASCADE;


--
-- Name: analytics_cohort_members analytics_cohort_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_cohort_members
    ADD CONSTRAINT analytics_cohort_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assessment_attempt_answers assessment_attempt_answers_assessment_question_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_answers
    ADD CONSTRAINT assessment_attempt_answers_assessment_question_link_id_fkey FOREIGN KEY (assessment_question_link_id) REFERENCES public.assessment_questions(id) ON DELETE RESTRICT;


--
-- Name: assessment_attempt_answers assessment_attempt_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_answers
    ADD CONSTRAINT assessment_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;


--
-- Name: assessment_attempt_questions assessment_attempt_questions_assessment_question_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_questions
    ADD CONSTRAINT assessment_attempt_questions_assessment_question_link_id_fkey FOREIGN KEY (assessment_question_link_id) REFERENCES public.assessment_questions(id) ON DELETE CASCADE;


--
-- Name: assessment_attempt_questions assessment_attempt_questions_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempt_questions
    ADD CONSTRAINT assessment_attempt_questions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;


--
-- Name: assessment_attempts assessment_attempts_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_deadlines assessment_deadlines_assessment_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_deadlines
    ADD CONSTRAINT assessment_deadlines_assessment_fk FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_questions assessment_questions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_questions assessment_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE RESTRICT;


--
-- Name: assessment_questions assessment_questions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.assessment_sections(id) ON DELETE CASCADE;


--
-- Name: assessment_result_breakdowns assessment_result_breakdowns_assessment_question_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_result_breakdowns
    ADD CONSTRAINT assessment_result_breakdowns_assessment_question_link_id_fkey FOREIGN KEY (assessment_question_link_id) REFERENCES public.assessment_questions(id) ON DELETE SET NULL;


--
-- Name: assessment_result_breakdowns assessment_result_breakdowns_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_result_breakdowns
    ADD CONSTRAINT assessment_result_breakdowns_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.assessment_results(id) ON DELETE CASCADE;


--
-- Name: assessment_result_breakdowns assessment_result_breakdowns_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_result_breakdowns
    ADD CONSTRAINT assessment_result_breakdowns_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.assessment_sections(id) ON DELETE SET NULL;


--
-- Name: assessment_results assessment_results_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_results assessment_results_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;


--
-- Name: assessment_sections assessment_sections_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sections
    ADD CONSTRAINT assessment_sections_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_settings assessment_settings_assessment_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_settings
    ADD CONSTRAINT assessment_settings_assessment_fk FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL;


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: auth_audit_logs auth_audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_audit_logs
    ADD CONSTRAINT auth_audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: auth_audit_logs auth_audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_audit_logs
    ADD CONSTRAINT auth_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: billing_entitlements billing_entitlements_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_entitlements
    ADD CONSTRAINT billing_entitlements_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.billing_plans(id) ON DELETE SET NULL;


--
-- Name: billing_entitlements billing_entitlements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_entitlements
    ADD CONSTRAINT billing_entitlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: billing_plans billing_plans_price_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.billing_prices(id) ON DELETE RESTRICT;


--
-- Name: billing_prices billing_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_prices
    ADD CONSTRAINT billing_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.billing_products(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: chapter_translations chapter_translations_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapter_translations
    ADD CONSTRAINT chapter_translations_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: chapters chapters_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE RESTRICT;


--
-- Name: checkout_sessions checkout_sessions_price_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_sessions
    ADD CONSTRAINT checkout_sessions_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.billing_prices(id) ON DELETE RESTRICT;


--
-- Name: checkout_sessions checkout_sessions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_sessions
    ADD CONSTRAINT checkout_sessions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: checkout_sessions checkout_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_sessions
    ADD CONSTRAINT checkout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_access course_access_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_access
    ADD CONSTRAINT course_access_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_access course_access_payment_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_access
    ADD CONSTRAINT course_access_payment_request_id_fkey FOREIGN KEY (payment_request_id) REFERENCES public.course_payment_requests(id) ON DELETE SET NULL;


--
-- Name: course_access course_access_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_access
    ADD CONSTRAINT course_access_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_payment_requests course_payment_requests_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_payment_requests course_payment_requests_receipt_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_receipt_image_id_fkey FOREIGN KEY (receipt_image_id) REFERENCES public.payment_images(id) ON DELETE RESTRICT;


--
-- Name: course_payment_requests course_payment_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: course_payment_requests course_payment_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_payment_requests course_payment_requests_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_requests
    ADD CONSTRAINT course_payment_requests_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.payment_wallets(id) ON DELETE RESTRICT;


--
-- Name: course_prices course_prices_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prices
    ADD CONSTRAINT course_prices_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_prices course_prices_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prices
    ADD CONSTRAINT course_prices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: course_translations course_translations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_translations
    ADD CONSTRAINT course_translations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: curriculum_audit_logs curriculum_audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_audit_logs
    ADD CONSTRAINT curriculum_audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dashboard_widgets dashboard_widgets_metric_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_metric_definition_id_fkey FOREIGN KEY (metric_definition_id) REFERENCES public.metric_definitions(id) ON DELETE CASCADE;


--
-- Name: dashboard_widgets dashboard_widgets_report_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_report_definition_id_fkey FOREIGN KEY (report_definition_id) REFERENCES public.report_definitions(id) ON DELETE CASCADE;


--
-- Name: deadline_events deadline_events_deadline_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deadline_events
    ADD CONSTRAINT deadline_events_deadline_fk FOREIGN KEY (deadline_id) REFERENCES public.assessment_deadlines(id) ON DELETE CASCADE;


--
-- Name: export_jobs export_jobs_report_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_jobs
    ADD CONSTRAINT export_jobs_report_run_id_fkey FOREIGN KEY (report_run_id) REFERENCES public.report_runs(id) ON DELETE SET NULL;


--
-- Name: export_jobs export_jobs_requested_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_jobs
    ADD CONSTRAINT export_jobs_requested_by_user_id_fkey FOREIGN KEY (requested_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feature_flags feature_flags_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: feature_requests feature_requests_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_requests
    ADD CONSTRAINT feature_requests_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: feature_requests feature_requests_triaged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_requests
    ADD CONSTRAINT feature_requests_triaged_by_fkey FOREIGN KEY (triaged_by) REFERENCES public.users(id);


--
-- Name: billing_entitlements fk_billing_entitlements_subscription; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_entitlements
    ADD CONSTRAINT fk_billing_entitlements_subscription FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: device_tokens fk_device_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT fk_device_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_audit_logs fk_notification_audit_logs_actor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_audit_logs
    ADD CONSTRAINT fk_notification_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_digests fk_notification_digests_recipient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digests
    ADD CONSTRAINT fk_notification_digests_recipient FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_events fk_notification_events_recipient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT fk_notification_events_recipient FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_preferences fk_notification_preferences_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT fk_notification_preferences_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_quiet_hours fk_notification_quiet_hours_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_quiet_hours
    ADD CONSTRAINT fk_notification_quiet_hours_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_consents fk_parent_consents_link; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_consents
    ADD CONSTRAINT fk_parent_consents_link FOREIGN KEY (parent_child_link_id) REFERENCES public.parent_child_links(id) ON DELETE CASCADE;


--
-- Name: reminder_schedules fk_reminder_schedules_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_schedules
    ADD CONSTRAINT fk_reminder_schedules_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: incident_records incident_records_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_records
    ADD CONSTRAINT incident_records_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: initial_learning_path initial_learning_path_placement_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initial_learning_path
    ADD CONSTRAINT initial_learning_path_placement_result_id_fkey FOREIGN KEY (placement_result_id) REFERENCES public.placement_results(id) ON DELETE CASCADE;


--
-- Name: initial_learning_path initial_learning_path_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initial_learning_path
    ADD CONSTRAINT initial_learning_path_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE SET NULL;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_price_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.billing_prices(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: learning_sessions learning_sessions_placement_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT learning_sessions_placement_result_id_fkey FOREIGN KEY (placement_result_id) REFERENCES public.placement_results(id) ON DELETE SET NULL;


--
-- Name: lesson_assets lesson_assets_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_assets
    ADD CONSTRAINT lesson_assets_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE RESTRICT;


--
-- Name: lesson_objectives lesson_objectives_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_objectives
    ADD CONSTRAINT lesson_objectives_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_objectives lesson_objectives_objective_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_objectives
    ADD CONSTRAINT lesson_objectives_objective_id_fkey FOREIGN KEY (objective_id) REFERENCES public.objectives(id) ON DELETE RESTRICT;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_questions lesson_questions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_questions
    ADD CONSTRAINT lesson_questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_questions lesson_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_questions
    ADD CONSTRAINT lesson_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;


--
-- Name: lesson_skills lesson_skills_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_skills
    ADD CONSTRAINT lesson_skills_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_skills lesson_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_skills
    ADD CONSTRAINT lesson_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT;


--
-- Name: lesson_translations lesson_translations_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_translations
    ADD CONSTRAINT lesson_translations_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE RESTRICT;


--
-- Name: levels levels_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;


--
-- Name: maintenance_windows maintenance_windows_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_windows
    ADD CONSTRAINT maintenance_windows_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: metric_aggregates metric_aggregates_metric_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metric_aggregates
    ADD CONSTRAINT metric_aggregates_metric_definition_id_fkey FOREIGN KEY (metric_definition_id) REFERENCES public.metric_definitions(id) ON DELETE CASCADE;


--
-- Name: mistake_resolutions mistake_resolutions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mistake_resolutions
    ADD CONSTRAINT mistake_resolutions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_delivery_attempts notification_delivery_attempts_notification_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_attempts
    ADD CONSTRAINT notification_delivery_attempts_notification_event_id_fkey FOREIGN KEY (notification_event_id) REFERENCES public.notification_events(id) ON DELETE CASCADE;


--
-- Name: notification_events notification_events_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE RESTRICT;


--
-- Name: objective_skills objective_skills_objective_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objective_skills
    ADD CONSTRAINT objective_skills_objective_id_fkey FOREIGN KEY (objective_id) REFERENCES public.objectives(id) ON DELETE CASCADE;


--
-- Name: objective_skills objective_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objective_skills
    ADD CONSTRAINT objective_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT;


--
-- Name: operational_status operational_status_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_status
    ADD CONSTRAINT operational_status_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: operations_audit_logs operations_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operations_audit_logs
    ADD CONSTRAINT operations_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: payment_images payment_images_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_images
    ADD CONSTRAINT payment_images_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payment_wallets payment_wallets_logo_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_wallets
    ADD CONSTRAINT payment_wallets_logo_image_id_fkey FOREIGN KEY (logo_image_id) REFERENCES public.payment_images(id) ON DELETE SET NULL;


--
-- Name: payment_wallets payment_wallets_qr_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_wallets
    ADD CONSTRAINT payment_wallets_qr_image_id_fkey FOREIGN KEY (qr_image_id) REFERENCES public.payment_images(id) ON DELETE SET NULL;


--
-- Name: payments payments_checkout_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_checkout_session_id_fkey FOREIGN KEY (checkout_session_id) REFERENCES public.checkout_sessions(id) ON DELETE SET NULL;


--
-- Name: payments payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: placement_answers placement_answers_placement_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_answers
    ADD CONSTRAINT placement_answers_placement_attempt_id_fkey FOREIGN KEY (placement_attempt_id) REFERENCES public.placement_attempts(id) ON DELETE CASCADE;


--
-- Name: placement_answers placement_answers_placement_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_answers
    ADD CONSTRAINT placement_answers_placement_question_id_fkey FOREIGN KEY (placement_question_id) REFERENCES public.placement_questions(id) ON DELETE CASCADE;


--
-- Name: placement_attempts placement_attempts_placement_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_attempts
    ADD CONSTRAINT placement_attempts_placement_test_id_fkey FOREIGN KEY (placement_test_id) REFERENCES public.placement_tests(id) ON DELETE CASCADE;


--
-- Name: placement_audit_log placement_audit_log_placement_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_audit_log
    ADD CONSTRAINT placement_audit_log_placement_attempt_id_fkey FOREIGN KEY (placement_attempt_id) REFERENCES public.placement_attempts(id) ON DELETE SET NULL;


--
-- Name: placement_question_skills placement_question_skills_placement_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_question_skills
    ADD CONSTRAINT placement_question_skills_placement_question_id_fkey FOREIGN KEY (placement_question_id) REFERENCES public.placement_questions(id) ON DELETE CASCADE;


--
-- Name: placement_question_skills placement_question_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_question_skills
    ADD CONSTRAINT placement_question_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT;


--
-- Name: placement_questions placement_questions_placement_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_questions
    ADD CONSTRAINT placement_questions_placement_section_id_fkey FOREIGN KEY (placement_section_id) REFERENCES public.placement_sections(id) ON DELETE CASCADE;


--
-- Name: placement_results placement_results_placement_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_results
    ADD CONSTRAINT placement_results_placement_attempt_id_fkey FOREIGN KEY (placement_attempt_id) REFERENCES public.placement_attempts(id) ON DELETE CASCADE;


--
-- Name: placement_sections placement_sections_placement_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_sections
    ADD CONSTRAINT placement_sections_placement_test_id_fkey FOREIGN KEY (placement_test_id) REFERENCES public.placement_tests(id) ON DELETE CASCADE;


--
-- Name: practice_attempts practice_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_attempts
    ADD CONSTRAINT practice_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: practice_attempts practice_attempts_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_attempts
    ADD CONSTRAINT practice_attempts_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.practice_topics(id) ON DELETE CASCADE;


--
-- Name: practice_topic_translations practice_topic_translations_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_topic_translations
    ADD CONSTRAINT practice_topic_translations_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.practice_topics(id) ON DELETE CASCADE;


--
-- Name: promotion_codes promotion_codes_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_codes
    ADD CONSTRAINT promotion_codes_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: question_answers question_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_answers
    ADD CONSTRAINT question_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;


--
-- Name: question_choices question_choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT question_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;


--
-- Name: question_skill_links question_skill_links_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skill_links
    ADD CONSTRAINT question_skill_links_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_skills question_skills_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skills
    ADD CONSTRAINT question_skills_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;


--
-- Name: question_skills question_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skills
    ADD CONSTRAINT question_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT;


--
-- Name: recommendations recommendations_target_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_target_lesson_id_fkey FOREIGN KEY (target_lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- Name: refunds refunds_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE RESTRICT;


--
-- Name: refunds refunds_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: release_notes release_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_notes
    ADD CONSTRAINT release_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: release_notes release_notes_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_notes
    ADD CONSTRAINT release_notes_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id);


--
-- Name: report_runs report_runs_report_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_runs
    ADD CONSTRAINT report_runs_report_definition_id_fkey FOREIGN KEY (report_definition_id) REFERENCES public.report_definitions(id) ON DELETE CASCADE;


--
-- Name: report_runs report_runs_requested_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_runs
    ADD CONSTRAINT report_runs_requested_by_user_id_fkey FOREIGN KEY (requested_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: saved_words saved_words_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_words
    ADD CONSTRAINT saved_words_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: session_events session_events_learning_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_events
    ADD CONSTRAINT session_events_learning_session_id_fkey FOREIGN KEY (learning_session_id) REFERENCES public.learning_sessions(id) ON DELETE CASCADE;


--
-- Name: session_questions session_questions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_questions
    ADD CONSTRAINT session_questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: session_questions session_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_questions
    ADD CONSTRAINT session_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;


--
-- Name: session_questions session_questions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_questions
    ADD CONSTRAINT session_questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.learning_sessions(id) ON DELETE CASCADE;


--
-- Name: skills skills_parent_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_parent_skill_id_fkey FOREIGN KEY (parent_skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT;


--
-- Name: student_achievements student_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievement_definitions(id) ON DELETE CASCADE;


--
-- Name: student_level_state student_level_state_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_level_state
    ADD CONSTRAINT student_level_state_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: study_plans study_plans_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT study_plans_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.billing_plans(id) ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: support_ticket_comments support_ticket_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_comments
    ADD CONSTRAINT support_ticket_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: support_ticket_comments support_ticket_comments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_comments
    ADD CONSTRAINT support_ticket_comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: tts_audio_assets tts_audio_assets_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tts_audio_assets
    ADD CONSTRAINT tts_audio_assets_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.placement_questions(id) ON DELETE SET NULL;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voice_audio_assets voice_audio_assets_ai_chat_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_audio_assets
    ADD CONSTRAINT voice_audio_assets_ai_chat_message_id_fkey FOREIGN KEY (ai_chat_message_id) REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE;


--
-- Name: voice_audio_assets voice_audio_assets_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_audio_assets
    ADD CONSTRAINT voice_audio_assets_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.voice_messages(id) ON DELETE CASCADE;


--
-- Name: voice_feedback voice_feedback_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_feedback
    ADD CONSTRAINT voice_feedback_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.voice_messages(id) ON DELETE CASCADE;


--
-- Name: voice_feedback voice_feedback_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_feedback
    ADD CONSTRAINT voice_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.voice_sessions(id) ON DELETE CASCADE;


--
-- Name: voice_feedback voice_feedback_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_feedback
    ADD CONSTRAINT voice_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voice_messages voice_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_messages
    ADD CONSTRAINT voice_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.voice_sessions(id) ON DELETE CASCADE;


--
-- Name: voice_provider_logs voice_provider_logs_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_provider_logs
    ADD CONSTRAINT voice_provider_logs_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.voice_messages(id) ON DELETE CASCADE;


--
-- Name: voice_safety_events voice_safety_events_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_safety_events
    ADD CONSTRAINT voice_safety_events_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.voice_messages(id) ON DELETE SET NULL;


--
-- Name: voice_safety_events voice_safety_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_safety_events
    ADD CONSTRAINT voice_safety_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.voice_sessions(id) ON DELETE CASCADE;


--
-- Name: voice_sessions voice_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_sessions
    ADD CONSTRAINT voice_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voice_transcripts voice_transcripts_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_transcripts
    ADD CONSTRAINT voice_transcripts_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.voice_messages(id) ON DELETE CASCADE;


--
-- Name: voice_transcripts voice_transcripts_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_transcripts
    ADD CONSTRAINT voice_transcripts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.voice_sessions(id) ON DELETE CASCADE;


--
-- Name: _prisma_migrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: achievement_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_broadcast_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_broadcast_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_chat_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_context_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_context_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_focus_directives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_focus_directives ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_model_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_prompt_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_provider_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_provider_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_safety_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_safety_events ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_feedback_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_feedback_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_teacher_safety_checks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_teacher_safety_checks ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_usage_cost_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_usage_cost_events ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_voice_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_voice_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: aim_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aim_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: aim_audit_log aim_audit_log_deny_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aim_audit_log_deny_delete ON public.aim_audit_log AS RESTRICTIVE FOR DELETE TO authenticated USING (false);


--
-- Name: aim_audit_log aim_audit_log_deny_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aim_audit_log_deny_update ON public.aim_audit_log AS RESTRICTIVE FOR UPDATE TO authenticated USING (false);


--
-- Name: analytics_access_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_access_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_cohort_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_cohort_members ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_cohorts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_cohorts ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

--
-- Name: app_version_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_version_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_attempt_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_attempt_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_attempt_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_attempt_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_deadlines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_deadlines ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_result_breakdowns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_result_breakdowns ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: auth_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: auth_audit_logs auth_audit_logs_deny_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_audit_logs_deny_delete ON public.auth_audit_logs AS RESTRICTIVE FOR DELETE TO authenticated USING (false);


--
-- Name: auth_audit_logs auth_audit_logs_deny_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_audit_logs_deny_update ON public.auth_audit_logs AS RESTRICTIVE FOR UPDATE TO authenticated USING (false);


--
-- Name: billing_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: billing_entitlements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_entitlements ENABLE ROW LEVEL SECURITY;

--
-- Name: billing_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: billing_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: billing_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_products ENABLE ROW LEVEL SECURITY;

--
-- Name: certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: chapter_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chapter_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: chapters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

--
-- Name: checkout_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: course_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;

--
-- Name: course_enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: course_payment_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_payment_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: course_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: course_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: curriculum_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.curriculum_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: curriculum_audit_logs curriculum_audit_logs_deny_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curriculum_audit_logs_deny_delete ON public.curriculum_audit_logs AS RESTRICTIVE FOR DELETE TO authenticated USING (false);


--
-- Name: curriculum_audit_logs curriculum_audit_logs_deny_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curriculum_audit_logs_deny_update ON public.curriculum_audit_logs AS RESTRICTIVE FOR UPDATE TO authenticated USING (false);


--
-- Name: daily_challenge_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_challenge_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: dashboard_widgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

--
-- Name: deadline_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deadline_events ENABLE ROW LEVEL SECURITY;

--
-- Name: device_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: difficulty_decisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.difficulty_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: error_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: export_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: idempotency_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: incident_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incident_records ENABLE ROW LEVEL SECURITY;

--
-- Name: initial_learning_path; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.initial_learning_path ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_objectives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_objectives ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

--
-- Name: maintenance_windows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;

--
-- Name: metric_aggregates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.metric_aggregates ENABLE ROW LEVEL SECURITY;

--
-- Name: metric_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: mistake_resolutions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mistake_resolutions ENABLE ROW LEVEL SECURITY;

--
-- Name: mistakes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_delivery_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_digests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_digests ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_quiet_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_quiet_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: objective_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.objective_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: objectives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

--
-- Name: operational_status; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.operational_status ENABLE ROW LEVEL SECURITY;

--
-- Name: operations_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.operations_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_access_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_access_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_child_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_consents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_consents ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_images ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_provider_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_provider_events ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_wallets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_wallets ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions permissions_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY permissions_select_authenticated ON public.permissions FOR SELECT TO authenticated USING (true);


--
-- Name: placement_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_audit_log placement_audit_log_deny_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY placement_audit_log_deny_delete ON public.placement_audit_log AS RESTRICTIVE FOR DELETE TO authenticated USING (false);


--
-- Name: placement_audit_log placement_audit_log_deny_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY placement_audit_log_deny_update ON public.placement_audit_log AS RESTRICTIVE FOR UPDATE TO authenticated USING (false);


--
-- Name: placement_question_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_question_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_tests ENABLE ROW LEVEL SECURITY;

--
-- Name: practice_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: practice_topic_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.practice_topic_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: practice_topics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.practice_topics ENABLE ROW LEVEL SECURITY;

--
-- Name: promotion_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: question_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: question_bank; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

--
-- Name: question_choices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_choices ENABLE ROW LEVEL SECURITY;

--
-- Name: question_skill_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_skill_links ENABLE ROW LEVEL SECURITY;

--
-- Name: question_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: refunds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

--
-- Name: release_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: reminder_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: report_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: report_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: review_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions role_permissions_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_select_authenticated ON public.role_permissions FOR SELECT TO authenticated USING (true);


--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: roles roles_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_select_authenticated ON public.roles FOR SELECT TO authenticated USING (true);


--
-- Name: saved_words; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;

--
-- Name: session_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

--
-- Name: session_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: session_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

--
-- Name: streak_freezes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

--
-- Name: student_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: student_learning_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_learning_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: student_level_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_level_state ENABLE ROW LEVEL SECURITY;

--
-- Name: student_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: student_profiles student_profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY student_profiles_select_own ON public.student_profiles FOR SELECT TO authenticated USING ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.supabase_auth_uid = auth.uid()))));


--
-- Name: student_skill_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_skill_states ENABLE ROW LEVEL SECURITY;

--
-- Name: study_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: support_ticket_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: tts_audio_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tts_audio_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: user_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles user_roles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_select_own ON public.user_roles FOR SELECT TO authenticated USING ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.supabase_auth_uid = auth.uid()))));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_own ON public.users FOR SELECT TO authenticated USING ((supabase_auth_uid = auth.uid()));


--
-- Name: vocabulary_words; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_audio_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_audio_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_provider_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_provider_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_safety_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_safety_events ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_transcripts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

--
-- Name: weakness_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weakness_records ENABLE ROW LEVEL SECURITY;

--
-- Name: xp_levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.xp_levels ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict iHBrIIuAiMYjui5y1qL5h4YIazjVV8Xck0bhTMxrVkYfBIlR9HHbDCwyeSeff4I

