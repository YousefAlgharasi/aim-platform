# Curriculum RLS and Security Plan

> Phase 3 - P3-030
> Scope: Curriculum & Content System only.

## Purpose

This document defines the row-level security (RLS) and access-control plan for Phase 3 curriculum content tables.

The goal is to keep curriculum data access aligned with Phase 2 authentication, roles, permissions, and backend authority while avoiding learner delivery, placement, practice, session, AIM runtime, progress, recommendation, AI Teacher, and Student Web App work.

## Dependencies

| Dependency | Output used |
|---|---|
| P2-035 | `docs/phase-2/permission-matrix.md` |
| P3-017 | `courses` table |
| P3-018 | `levels` table |
| P3-019 | `chapters` table |
| P3-020 | `skills` table |
| P3-021 | `objectives` table |
| P3-022 | `lessons` table |
| P3-023 | `questions` table |
| P3-024 | question choice and answer structures |
| P3-025 | `lesson_assets` table |
| P3-026 | curriculum seed strategy |
| P3-027 | `question_skills` table |
| P3-028 | `curriculum_audit_logs` table |

## Architecture Context

The NestJS backend remains the final authority for curriculum authorization. Admin dashboard and any future client must call protected backend APIs; they must not write directly to curriculum tables through Supabase client access.

The backend enforces:

- JWT authentication through the Phase 2 auth layer.
- Role checks using Phase 2 roles.
- Curriculum permission checks using the Phase 3 permission keys.
- Status lifecycle rules for draft, in review, approved, published, and archived content.
- Publish requirements, including lesson-skill linking and content validation.
- Audit logging for security-sensitive curriculum actions.

RLS is a defense-in-depth layer for direct database or PostgREST access. It must not be treated as the only authorization layer.

## Default RLS Stance

All curriculum tables should use deny-by-default RLS for direct Supabase anon and authenticated roles.

Unless a later task explicitly creates a safe public read API through Supabase, direct table access should be blocked for:

- `anon`
- `authenticated`
- any client-side role using Supabase credentials

The service role or database owner used by the backend may bypass RLS, but only the backend should use that privilege. Service-role keys and database credentials must never be exposed to client applications.

## Curriculum Tables

The plan covers these Phase 3 tables:

| Table | Direct client access | Backend access |
|---|---|---|
| `courses` | Deny | Allowed through protected curriculum APIs |
| `levels` | Deny | Allowed through protected curriculum APIs |
| `chapters` | Deny | Allowed through protected curriculum APIs |
| `skills` | Deny | Allowed through protected curriculum APIs |
| `objectives` | Deny | Allowed through protected curriculum APIs |
| `lessons` | Deny | Allowed through protected curriculum APIs |
| `lesson_skills` | Deny | Allowed through protected curriculum APIs |
| `lesson_objectives` | Deny | Allowed through protected curriculum APIs |
| `lesson_assets` | Deny | Allowed through protected curriculum APIs |
| `questions` | Deny | Allowed through protected curriculum APIs |
| `question_choices` | Deny | Allowed through protected curriculum APIs |
| `question_skills` | Deny | Allowed through protected curriculum APIs |
| `curriculum_audit_logs` | Deny | Allowed through protected admin/audit APIs only |

## Access Rules

### Published read access

Published curriculum reads must go through backend read APIs.

Backend queries must apply publication filters at query time:

- content item status must be `published`;
- all required ancestors must also be `published`;
- archived records must never be returned to learner-facing read paths;
- draft, in review, and approved-but-unpublished records must not appear in learner-facing responses.

This plan does not create learner delivery, practice, placement, or session APIs.

### Admin and reviewer read access

Admin-facing reads must go through backend APIs protected by authentication and role checks.

Allowed backend roles:

| Role | Read scope |
|---|---|
| `super_admin` | draft, in review, approved, published, archived |
| `admin` | draft, in review, approved, published, archived |
| `reviewer` | draft, in review, approved, published |
| `student` | none through admin APIs |
| `support` | none through admin APIs |

### Writes and status transitions

All curriculum writes must go through backend APIs.

| Action | Roles | Notes |
|---|---|---|
| Create content | `super_admin`, `admin` | Backend sets initial status. |
| Update content | `super_admin`, `admin` | Only editable statuses may be updated. |
| Publish content | `super_admin`, `admin` | Backend validates all publish requirements. |
| Archive content | `super_admin`, `admin` | Hard delete remains forbidden. |
| Restore archived content | `super_admin` | Must be audit logged. |
| Manage skill links | `super_admin`, `admin` | Must preserve stable skill IDs and keys. |
| Read audit logs | `super_admin`, `admin` | Audit records are never client-direct. |

Clients must not supply final authority values such as status transitions, actor IDs, audit records, ownership decisions, or publish eligibility.

## Suggested RLS Implementation Shape

If a future migration implements curriculum RLS directly, it should follow this shape:

```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_audit_logs ENABLE ROW LEVEL SECURITY;
```

No permissive policies should be added for `anon` or `authenticated` roles until a specific backend-reviewed direct-access use case exists.

For `curriculum_audit_logs`, RLS should remain full deny for direct clients. Audit reads must only be exposed through backend admin APIs.

## Backend Guard Requirements

Curriculum endpoints must use the Phase 2 and Phase 3 protection layers:

- authentication guard for every curriculum endpoint;
- admin/reviewer role guard for admin-facing reads;
- admin/super admin role guard for writes;
- super admin role guard for restore-to-draft;
- backend-owned status transitions;
- backend-owned lesson-skill and question-skill mapping validation;
- backend-owned audit logging.

Published read endpoints may use authenticated access, but must still be backend-filtered to published content only.

## Conflict Rules

Stop and document a blocker if a future task proposes any of the following:

- exposing a Supabase service-role key, database URL, JWT secret, or AI provider key;
- allowing admin UI to write directly to curriculum tables;
- allowing Flutter or any client app to bypass backend curriculum authority;
- granting direct `anon` write access to any curriculum table;
- granting direct authenticated write access to any curriculum table;
- allowing a lesson to be published without at least one linked skill;
- allowing a content API to return draft, in review, approved, or archived content through learner-facing reads;
- using display labels as primary skill identifiers;
- adding onboarding, placement, practice attempt, session, AIM runtime, progress, recommendation, AI Teacher, or Student Web App data to curriculum RLS scope.

## Verification Checklist

- RLS plan covers all Phase 3 curriculum tables.
- Default direct-access stance is deny.
- Backend remains the final authorization authority.
- Phase 2 permission matrix remains the role and permission source.
- Curriculum permission keys align with `curriculum.content.*`, `curriculum.skill_links.manage`, and `curriculum.audit.read`.
- Lesson-skill and question-skill mappings remain backend-managed.
- Audit logs remain admin-only through backend APIs.
- No secrets or credentials are included.
- No out-of-scope learner, placement, practice, session, AIM runtime, progress, recommendation, AI Teacher, or Student Web App work is introduced.
