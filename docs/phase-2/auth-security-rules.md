# Phase 2 — Auth Security Rules

## Purpose

This document defines the security rules for Phase 2 authentication, users, profiles, roles, permissions, ownership checks, session handling, logging, and safe field exposure.

The goal is to prevent permission leakage, unsafe profile access, client-side trust mistakes, and accidental exposure of privileged credentials.

This is a documentation-only task. It does not implement backend guards, migrations, Flutter code, admin dashboard code, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- JWT/session validation rules;
- Supabase Auth UID to internal AIM user resolution;
- backend role checks;
- backend permission checks;
- backend ownership checks;
- safe session handling;
- auth/security logging;
- safe field exposure;
- Flutter/Admin client trust boundaries.

This document does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This document follows:

```text
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-api-map.md
docs/phase-2/auth-data-model-map.md
```

Core rule:

```text
Backend authorization, role checks, permission checks, and ownership checks are final.
```

Flutter Mobile and Admin Dashboard may only render backend-approved data. They must not become the security authority.

---

## Non-Negotiable Security Rules

Every Phase 2 implementation must preserve these rules:

- Do not expose Supabase service-role keys to any client.
- Do not expose database credentials to any client.
- Do not expose JWT signing secrets to any client.
- Do not expose AI provider keys to any client.
- Do not trust Flutter/Admin UI role checks as security.
- Do not trust client-supplied user IDs as proof of identity.
- Do not trust client-supplied role or permission values.
- Do not allow users to access profiles they do not own unless backend admin permission allows it.
- Do not implement admin actions without backend role/permission checks.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, recommendations, progress reports, AI Teacher, or Student Web App work.

---

## JWT and Session Validation Rules

### Required behavior

For every protected backend request:

1. Validate the incoming Supabase Auth token/session.
2. Extract the authenticated Supabase Auth UID from the verified token/session.
3. Resolve the internal AIM user by the verified Supabase UID.
4. Verify that the AIM user exists.
5. Verify that the AIM user is active/allowed.
6. Continue only after backend identity resolution succeeds.

### Forbidden behavior

The backend must not:

- accept a user ID from the request body as identity proof;
- accept a Supabase UID from query/body/header without token validation;
- trust decoded JWT content without verification;
- allow expired or invalid sessions;
- expose raw tokens in logs;
- expose refresh tokens to application logs or clients.

---

## Supabase UID to AIM User Resolution

The backend must map:

```text
Supabase Auth UID -> internal AIM users table record
```

Rules:

- `supabase_auth_uid` must be unique in the internal user model.
- A missing AIM user must be handled explicitly.
- User sync must be idempotent.
- Disabled/deleted users must not receive protected access.
- Any mismatch between Supabase identity and AIM user record must fail closed.

Fail closed means:

```text
When identity or authorization cannot be verified, deny access.
```

---

## Role Check Rules

Roles are backend-owned authorization data.

Rules:

- Role checks must happen in backend guards, middleware, services, or equivalent backend authorization logic.
- Flutter/Admin may use role labels only for UX rendering.
- Client-provided roles must be ignored.
- Role assignment changes must require backend admin permission.
- System roles must be protected from unsafe deletion or mutation.
- A user must not be able to grant roles to themselves unless a later backend task explicitly defines a safe protected flow.

Examples of role-protected actions:

| Action | Required backend authority |
|---|---|
| View admin users list | Admin role or `users.read` permission |
| Manage user status | Admin role or `users.manage` permission |
| Assign roles | Admin role and/or `roles.manage` permission |
| Manage role permissions | Admin role and/or `permissions.manage` permission |

---

## Permission Check Rules

Permissions represent backend-enforced capabilities.

Rules:

- Permission checks must happen in the backend.
- Permission keys returned to clients are display/UX state only.
- Permission data must not be accepted from client request bodies as authority.
- Permission changes require backend admin authorization.
- Permission checks must be explicit for sensitive actions.
- Missing permissions must deny access.

Example permission keys:

```text
profiles.read.own
profiles.update.own
profiles.read.any
profiles.update.any
users.read
users.manage
roles.read
roles.manage
permissions.read
permissions.manage
admin.users.read
admin.users.manage
```

---

## Ownership Check Rules

Ownership checks protect user-owned resources.

Primary Phase 2 protected resources:

| Resource | Ownership field |
|---|---|
| Student profile | `student_profiles.user_id` |
| Admin profile | `admin_profiles.user_id` |
| Current user context | internal `users.id` resolved from Supabase UID |

Rules:

- A normal user may read/update only their own profile.
- A profile ID supplied by the client does not prove ownership.
- Backend must compare the resource owner to the resolved current AIM user.
- Admin override requires backend-approved role or permission.
- Ownership failure must return a denial response without leaking sensitive data.

---

## Profile Access Rules

### Own profile

A user may access:

```text
GET /profiles/me
PATCH /profiles/me
```

only after backend identity resolution succeeds.

Allowed own-profile update fields may include:

```text
display_name
avatar_url
preferred_language
timezone
```

### Any profile

Access to another user’s profile requires backend-approved admin permission, such as:

```text
profiles.read.any
profiles.update.any
```

Forbidden profile behavior:

- allowing users to change `user_id` ownership;
- exposing internal admin notes to normal users;
- exposing deleted/disabled operational metadata when unsafe;
- trusting frontend checks as final authorization.

---

## Admin Action Rules

Admin actions must always be backend-authorized.

Examples:

| Endpoint/action | Required backend check |
|---|---|
| `GET /admin/users` | `users.read` or `users.manage` |
| `GET /admin/users/:id` | `users.read` or `users.manage` |
| `PATCH /admin/users/:id` | `users.manage` |
| `POST /roles` | `roles.manage` |
| `PATCH /roles/:id` | `roles.manage` |
| `DELETE /roles/:id` | `roles.manage` |
| `PUT /roles/:roleId/permissions` | `roles.manage` and/or `permissions.manage` |
| `PUT /users/:id/roles` | `users.manage` and/or `roles.manage` |

Admin UI must not:

- directly write privileged database records;
- store service-role credentials;
- rely on frontend route guards only;
- become the final authorization authority.

---

## Session Handling Rules

Session handling must preserve these rules:

- Store only client-safe session state in Flutter/Admin clients.
- Do not store service-role keys in clients.
- Do not store database credentials in clients.
- Do not log raw access tokens or refresh tokens.
- Treat logout as a client-side session cleanup plus optional backend audit event.
- Re-check backend authorization on each protected request.
- Do not assume an old client role cache is still valid.

If backend-side logout tracking is added, it must not expose or persist raw tokens.

---

## Safe Field Exposure Rules

Backend responses must expose only fields required for UX or task behavior.

Client-safe examples:

```text
user.id
user.email
user.status
profile.id
profile.display_name
profile.avatar_url
profile.preferred_language
roles[]
permissions[]
```

Internal-only examples:

```text
password_hash
refresh_token
service_role_key
database_url
jwt_secret
raw_provider_metadata
internal_audit_metadata
deleted_at when unsafe
privileged_admin_notes
```

Rules:

- Default to not exposing fields unless needed.
- Never expose secrets or privileged credentials.
- Never expose raw provider metadata unless a later task explicitly defines a safe subset.
- Never expose authorization internals that help bypass access controls.

---

## Logging and Audit Rules

Auth/security logging should help trace sensitive actions without exposing secrets.

Recommended audit events:

```text
auth.user_synced
auth.me_requested
auth.access_denied
auth.logout_seen
profile.read_denied
profile.update_denied
roles.assigned
roles.removed
permissions.changed
admin.user_status_changed
```

Audit logs may include:

```text
user_id
supabase_auth_uid
event_type
ip_address
user_agent
created_at
safe metadata
```

Audit logs must not include:

```text
raw access tokens
refresh tokens
password hashes
service-role keys
database credentials
JWT secrets
AI provider keys
```

---

## Flutter Mobile Boundary

Flutter Mobile may:

- start login/logout UX;
- store client-safe auth state;
- call backend protected endpoints;
- render current user/profile data returned by backend;
- hide or show UI based on backend-approved roles/permissions.

Flutter Mobile must not:

- become the source of truth for identity;
- become the source of truth for roles;
- become the source of truth for permissions;
- calculate final authorization;
- access service-role keys;
- bypass backend ownership checks;
- move AIM Engine logic into Flutter.

---

## Admin Dashboard Boundary

Admin Dashboard may:

- render backend-approved admin data;
- call backend-protected admin endpoints;
- show or hide admin UI based on backend-approved state.

Admin Dashboard must not:

- directly mutate privileged database records without backend checks;
- store service-role keys;
- rely only on frontend route guards;
- become the final admin authorization authority;
- expose internal-only data to unauthorized users.

---

## Error Handling Rules

Authorization and ownership failures must fail safely.

Rules:

- Return denial when identity is missing or invalid.
- Return denial when role/permission is missing.
- Return denial when ownership does not match.
- Avoid leaking whether a protected resource exists when unsafe.
- Log denial events with safe metadata only.
- Keep error messages clear but not overly revealing.

Example safe errors:

```text
Unauthorized
Forbidden
Resource not found or not accessible
```

---

## Out-of-Scope Security Areas

This document does not define security rules for:

- onboarding;
- placement;
- lessons;
- practice;
- sessions;
- AIM Engine;
- recommendations;
- retention;
- progress reports;
- AI Teacher;
- Student Web App.

Those areas must not be introduced by this Phase 2 task.

---

## Done Test Review

This document satisfies P2-006 when:

- `docs/phase-2/auth-security-rules.md` exists;
- it documents JWT/session validation rules;
- it documents role checks;
- it documents permission checks;
- it documents ownership checks;
- it documents safe session handling;
- it documents safe field exposure;
- it documents auth/security logging boundaries;
- it keeps backend authorization final;
- it treats Flutter/Admin UI role behavior as UX only;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
