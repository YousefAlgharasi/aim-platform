# Database Security Plan

## Purpose

This document defines Phase 1 database security and Row Level Security (RLS) planning notes for the AIM Platform.

The goal is to document the direction for database ownership, role-scoped access, internal service access, and future Supabase policy implementation without applying production policies yet.

This is a planning document only. It does not create database schema, migrations, Supabase policies, Prisma models, NestJS runtime guards, Flutter code, Admin Dashboard code, or AIM Engine logic.

## Phase 1 Security Position

AIM Phase 1 uses Supabase PostgreSQL as the default database and Supabase Auth as the authentication provider.

The Backend API remains the final authority for:

- identity resolution
- ownership checks
- role resolution
- authorization decisions
- learner-safe response shaping
- AIM Engine access mediation
- AI Teacher access mediation

Flutter Mobile and Admin Dashboard clients must not bypass the Backend API for protected learning, profile, progress, AIM, or administrative records.

## Source Documents

This plan aligns with:

- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/database-implementation-strategy.md`
- `docs/phase-1/identity-mapping-plan.md`
- `docs/phase-1/safe-field-exposure-contract.md`
- `packages/shared-contracts/enums/common-enums.md`

## Core Principles

1. Supabase Auth identifies the authenticated user.
2. Backend `users.auth_user_id` maps to Supabase `auth.users.id`.
3. Backend `users.id` is the internal application user identity.
4. `student_profiles.user_id` links learner profile data to backend user identity.
5. Backend-resolved identity is the only trusted source for ownership checks.
6. Backend database roles are the source of platform role truth.
7. Clients may display role-derived UI, but UI role checks are never authoritative.
8. RLS policies must not trust client-provided identity, role, ownership, or relationship data.
9. Service-role access is backend-only and must never be exposed to clients.
10. Direct client writes to protected learning records are not part of Phase 1.

## RLS Planning Scope

Phase 1 should document and prepare for RLS. It should not apply full production policy behavior until schema, migrations, identity mapping, and service access patterns are stable.

This plan covers:

- ownership policy direction
- role-scoped access direction
- internal service access direction
- protected data categories
- policy planning matrix
- forbidden access patterns
- future implementation checklist

This plan does not implement:

- SQL RLS policies
- Supabase migration files
- Prisma schema
- policy tests
- runtime authorization code
- admin approval workflows
- parent access workflows
- AI Teacher or AIM Engine runtime access

## Ownership Policy Direction

Ownership must be based on backend-resolved identity, not client input.

Recommended ownership anchors:

| Resource Category | Ownership Anchor | Notes |
|---|---|---|
| User profile | `users.id` resolved from verified `users.auth_user_id` | The client must not provide trusted `users.id`. |
| Student profile | `student_profiles.user_id` | A student profile belongs to a backend user. |
| Parent-child relationship | `user_relationships.parent_user_id` and `user_relationships.child_user_id` | Future parent access must require active relationship records. |
| Sessions | learner owner resolved through backend identity | Session ownership must not come from query parameters. |
| Submissions | learner owner resolved through backend identity | Student answers and attempts are protected learner data. |
| Progress | learner owner resolved through backend identity | Progress records must not be publicly queryable. |
| Recommendations | learner owner resolved through backend identity | Recommendations are backend-approved outputs only. |
| Weakness records | learner owner resolved through backend identity | Weakness details are sensitive learner-internal data. |
| Retention schedules | learner owner resolved through backend identity | Retention data must not expose internal AIM state broadly. |
| Notifications | target backend user owner | Notifications should be scoped to the target user. |
| Audit logs | admin/internal access only | Audit logs must not be learner-readable by default. |

## Ownership Policy Rules

Future RLS policies should follow these rules:

- A learner may read only learner-safe records that belong to their resolved backend user.
- A learner may not read another learner's sessions, submissions, progress, weakness records, recommendations, or retention schedules.
- A learner may not update backend-calculated mastery, weakness, difficulty, retention, recommendation, or internal AIM state.
- Parent access must require an active backend relationship record and must expose only parent-safe fields.
- Admin access must be scoped by backend-controlled role checks and auditability.
- Internal service access must be isolated from normal user policies.
- Protected records must include stable ownership fields where needed for policy enforcement.
- Ownership policies must not use email, display name, phone number, query string identity, or client-provided role as proof of ownership.

## Role-Scoped Access Direction

Backend role truth should come from the backend database, not untrusted client state.

Recommended role families:

| Role | Direction |
|---|---|
| `LEARNER` | Access own learner-safe data only. |
| `PARENT` | Future optional role; access child-safe data only through verified active relationship records. |
| `INSTRUCTOR` | Future optional role; no broad access unless explicit class/course ownership model is approved. |
| `CONTENT_MANAGER` | Manage approved content records only; no broad learner-private access. |
| `REVIEWER` | Access review queue items assigned or scoped to review workflows; no unrestricted learner profile browsing. |
| `ADMIN` | Administrative access through backend-controlled workflows; must be audited. |
| `SUPER_ADMIN` | Highest operational access; must be tightly controlled and audited. |

## Role Policy Rules

Future RLS and backend authorization should preserve these rules:

- Client-side role checks are for UI only.
- Backend authorization is final.
- A client-provided role must not grant database access.
- Decoded JWT claims on the client must not be treated as final authorization truth.
- Admin and elevated roles must be resolved by backend-controlled records.
- Role changes must be auditable in later implementation.
- RLS must not become the only authorization layer; backend guards and service rules remain required.
- RLS should serve as a database safety layer, not a replacement for Backend API authorization.

## Internal Service Access Direction

Internal backend services may need privileged database access for controlled operations.

Examples:

- Backend API provisioning user records after verified auth.
- Backend API writing submissions and session results.
- Backend API persisting AIM Engine outputs.
- Backend API triggering review records.
- Backend API recording audit events.
- Admin-controlled backend workflows.
- Future AI Teacher response review or safety logging.

Rules:

- Supabase service-role keys must remain server-side only.
- Service-role keys must never be bundled into Flutter, Admin Dashboard, browser code, mobile app assets, logs, or public config.
- Internal service writes must validate identity and ownership before writing protected records.
- Internal service access should use narrow service methods, not unrestricted ad hoc writes from controllers.
- Internal service operations that affect learner state should be auditable.
- AIM Engine must not receive database credentials.
- AI Teacher provider integrations must not receive database credentials.
- Clients must not call AIM Engine directly.
- Clients must not write protected AIM or progress outputs directly to the database.

## Protected Data Categories

The following categories require strict access planning:

| Category | Sensitivity | Direction |
|---|---|---|
| Auth mapping | High | Internal-only except minimal profile fields. |
| Student profiles | Medium/High | Learner-safe subset only. |
| Parent relationships | High | Backend-verified and scoped. |
| Submissions and answers | High | Owner-only and reviewer/admin workflow scoped. |
| Quiz/session attempts | High | Owner-only, backend-approved summaries. |
| Mastery and progress | High | Backend-approved output only. |
| Weakness records | High | Internal or carefully summarized; avoid exposing raw internals. |
| Recommendations | Medium/High | Backend-approved learner-facing recommendations only. |
| Retention schedules | Medium/High | Backend-approved reminders only; avoid exposing internal model details. |
| AI Teacher logs | High | Backend-only and privacy-reviewed before exposure. |
| Audit logs | High | Admin/internal only. |
| Content/catalog | Low/Medium | Public or role-scoped depending on content state. |
| Draft/unpublished content | Medium | Content-manager/admin only. |

## Policy Planning Matrix

| Table / Conceptual Area | Learner | Parent | Content Manager | Reviewer | Admin | Internal Service |
|---|---|---|---|---|---|---|
| `users` | Read own learner-safe fields | Future child-safe summary only | No direct broad access | Workflow-specific only | Controlled admin access | Controlled read/write |
| `student_profiles` | Read own safe profile | Future child-safe profile | No direct broad access | Workflow-specific only | Controlled admin access | Controlled read/write |
| `user_relationships` | Read relevant own relationship summary only | Read active child links | No | Workflow-specific only | Controlled admin access | Controlled read/write |
| `courses` / `lessons` | Read published content | Read published content | Manage content | Review content if scoped | Manage | Controlled read/write |
| `sessions` | Own sessions only | Future child-safe summaries | No | Review-scoped only | Controlled admin access | Controlled read/write |
| `submissions` | Own submissions only | Future child-safe summaries only | No | Assigned review items | Controlled admin access | Controlled read/write |
| `progress` | Own backend-approved progress | Future child-safe summary | No | Review-scoped only | Controlled admin access | Controlled read/write |
| `weakness_records` | Usually no raw access | No raw access | No | Review-scoped summary only | Controlled admin access | Controlled read/write |
| `recommendations` | Own backend-approved recommendations | Future child-safe summary | No | Review-scoped only | Controlled admin access | Controlled read/write |
| `retention_reviews` | Own reminder-safe view | Future child-safe summary | No | No by default | Controlled admin access | Controlled read/write |
| `audit_logs` | No | No | No by default | No by default | Controlled admin access | Controlled write/read |

## Direct Client Database Access Direction

Phase 1 protected learning flows should use Backend API only.

Allowed in future only if explicitly approved:

- Public read-only content with no learner-private data.
- Public metadata that cannot expose protected learner records.
- Low-risk catalog data with clear policy and caching rules.

Not allowed in Phase 1:

- Flutter direct writes to sessions, submissions, progress, mastery, weakness, recommendations, retention, or AI Teacher logs.
- Admin Dashboard direct writes using browser-side privileged credentials.
- Client-side service-role access.
- Client-side RLS bypass.
- Client-provided identity used as trusted policy input.

## Backend API and RLS Relationship

The Backend API remains the primary authorization boundary.

RLS should provide defense-in-depth:

```text
Client
  |
  | Supabase access token / app request
  v
Backend API
  |
  | verifies token, resolves user, role, ownership
  v
Backend service layer
  |
  | controlled DB operation
  v
PostgreSQL + RLS safety layer
```

The database safety layer should reject unsafe access even if a backend query is accidentally too broad.

## AIM Engine Access Implications

AIM Engine is not the identity or authorization owner.

Rules:

- AIM Engine receives only backend-approved internal identifiers and learning evidence.
- AIM Engine must not receive Supabase service-role keys.
- AIM Engine must not read/write the database directly in Phase 1 unless a future backend-owned service boundary approves it.
- AIM Engine outputs must be mediated by Backend API before persistence or client exposure.
- AIM Engine must not expose mastery, weakness, difficulty, retention, or recommendation internals directly to Flutter.
- Flutter must render backend-approved outputs only.

## AI Teacher Access Implications

AI Teacher is backend-only.

Rules:

- AI Teacher requests must be lesson-scoped.
- AI Teacher must receive safe context only.
- AI Teacher must not receive raw database credentials.
- AI Teacher must not bypass backend ownership checks.
- AI Teacher logs or outputs that include learner context must be protected.
- AI Teacher responses must pass backend validation/safety handling before delivery.

## Future RLS Implementation Checklist

Before implementing actual SQL RLS policies, confirm:

- Final Prisma schema or migration table names exist.
- `users.auth_user_id` is unique and required.
- Ownership fields exist on protected tables.
- Parent relationship table exists if parent access is in scope.
- Role source of truth is implemented in backend-controlled tables.
- Backend auth guard resolves Supabase Auth UID safely.
- Backend role/ownership guard exists and is tested.
- Service-role key usage is isolated to backend runtime config.
- Public content tables are clearly separated from protected learner tables.
- Policy tests exist for cross-user access denial.
- Policy tests exist for role-scoped access.
- Policy tests exist for internal service operations.
- No policy depends on raw client body fields.
- No policy exposes internal AIM data unintentionally.
- No policy grants Flutter direct protected write access.

## Policy Test Direction

Future policy tests should include at least:

- Learner A cannot read Learner B profile.
- Learner A cannot read Learner B sessions.
- Learner A cannot write their own mastery score.
- Learner A cannot write recommendations.
- Learner A cannot write weakness records.
- Parent cannot read a child without an active relationship.
- Content manager cannot read private learner submissions by default.
- Reviewer can access only review-scoped records.
- Admin access is controlled and auditable.
- Anonymous users cannot access protected records.
- Service-role operations are not available to clients.

## Forbidden Patterns

Do not implement or approve:

- RLS policies that trust client-provided `user_id`.
- RLS policies that trust client-provided `student_profile_id`.
- RLS policies that trust client-provided `role`.
- RLS policies that use email or display name for ownership.
- Flutter direct writes to protected learning records.
- Admin browser-side service-role usage.
- AIM Engine direct client exposure.
- AI provider keys in database-access code paths visible to clients.
- Broad `select *` exposure for learner-private tables.
- Raw weakness records exposed to clients without backend shaping.
- Speed-based direct mastery or difficulty updates.
- Any Student Web App work in Phase 1.

## Non-Goals

This document does not:

- Create database migrations.
- Create Prisma schema.
- Create SQL RLS policies.
- Create Supabase policy tests.
- Create runtime authorization code.
- Create Flutter direct database access.
- Create Admin Dashboard access logic.
- Create parent access implementation.
- Create AIM Engine database writes.
- Create AI Teacher provider integration.
- Create Student Web App scope.

## Acceptance Notes

- Ownership policy direction is defined.
- Role-scoped access direction is defined.
- Internal service access direction is defined.
- Database security plan aligns with identity mapping.
- No policies were implemented.
- No migrations were added.
- No runtime code was added.
- No secrets or credentials were added.
- Backend remains final authorization authority.
- Flutter Mobile and Admin Dashboard do not bypass Backend API for protected records.
- AIM Engine and AI Teacher remain backend-mediated.

