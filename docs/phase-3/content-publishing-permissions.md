# Content Publishing Permission Rules

> Phase 3 — P3-008
> Scope: Curriculum & Content System only.

---

## 1. Overview

This document defines who can create, update, publish, archive, and view curriculum content in the AIM platform. All content actions are protected by Phase 2 roles and permissions. The backend is the final authority for all authorization decisions.

---

## 2. Roles

The following Phase 2 roles are relevant to content actions:

| Role | Key | Description |
|---|---|---|
| Super Admin | `super_admin` | Full access to all content actions including restore-to-draft |
| Admin | `admin` | Full access to create, update, publish, and archive content |
| Reviewer | `reviewer` | Read-only access to draft and published content |
| Student | `student` | Read-only access to published content only |
| Support | `support` | Read-only access to published content only |

---

## 3. Permission Matrix

| Action | super_admin | admin | reviewer | student | support |
|---|---|---|---|---|---|
| View published content | ✅ | ✅ | ✅ | ✅ | ✅ |
| View draft content | ✅ | ✅ | ✅ | ❌ | ❌ |
| View archived content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update draft content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update published content | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Archive content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Restore archived to draft | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete content (hard) | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Note:** Hard delete is not permitted for any role. Archiving is the terminal action for content removal.

> **Note:** Published content is immutable. To update published content, an admin must archive it, create a new draft, and re-publish.

---

## 4. Action Definitions

### 4.1 Create
- Initializes a new content item with `status = draft`.
- Requires `ADMIN` or `SUPER_ADMIN` role.
- The `status` field is set by the backend — clients cannot supply it.

### 4.2 Update
- Modifies fields on a draft content item.
- Requires `ADMIN` or `SUPER_ADMIN` role.
- Only `draft` content may be updated. Attempts to update `published` or `archived` content are rejected with `403 Forbidden`.

### 4.3 Publish
- Transitions content from `draft` to `published`.
- Requires `ADMIN` or `SUPER_ADMIN` role.
- Backend validates all publish requirements before executing the transition (see P3-007).
- A lesson cannot be published without at least one linked published skill — this is a hard stop.

### 4.4 Archive
- Transitions content from `draft` or `published` to `archived`.
- Requires `ADMIN` or `SUPER_ADMIN` role.
- Archived content is retained for audit purposes and is not deleted.

### 4.5 Restore to Draft
- Transitions content from `archived` to `draft`.
- Requires `SUPER_ADMIN` role only.
- Must be logged in the audit trail.
- Not available to `admin` role.

### 4.6 View (Learner-facing)
- Only `published` content is returned in learner-facing API responses.
- The backend applies `WHERE status = 'published'` at the query level.
- Cascade visibility applies: all ancestors must be published for a lesson to be visible.

### 4.7 View (Admin-facing)
- `ADMIN` and `SUPER_ADMIN` can view `draft`, `published`, and `archived` content.
- `REVIEWER` can view `draft` and `published` content (read-only).
- `STUDENT` and `SUPPORT` see only `published` content through learner-facing endpoints.

---

## 5. Endpoint Protection Rules

All content write endpoints must be protected by:
1. `SupabaseJwtAuthGuard` — validates the JWT token.
2. `RoleGuard` with `RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)` — enforces role check.

Restore-to-draft endpoint must use:
- `RequireRoles(AuthorizedRole.SUPER_ADMIN)` only.

Learner-facing read endpoints:
- Protected by `SupabaseJwtAuthGuard`.
- Filter content by `status = 'published'` at the database query level.

Admin-facing read endpoints:
- Protected by `SupabaseJwtAuthGuard` and `RoleGuard`.
- Return all statuses based on role (see Section 3).

---

## 6. Rules

1. **Backend is the final authority.** No client (admin dashboard or Flutter) may set or override content status or bypass role checks.
2. **No client-supplied status.** Create and update payloads must not accept `status` as a writable field.
3. **No unprotected content endpoints.** Every write endpoint requires authentication and role validation.
4. **Reviewers are read-only.** The `reviewer` role has no write, publish, or archive permissions.
5. **Hard delete is forbidden.** No role may permanently delete content records.
6. **Audit trail for restore.** Every restore-to-draft action must be logged with actor ID, content ID, and timestamp.

---

## 7. Out-of-Scope

- Onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime, dashboard recommendations, review/retention, progress reports, AI Teacher, Student Web App.
- Payment, subscription, or feature-flag-based access control.
- User management or role assignment (governed by Phase 2).

---

## 8. References

- `docs/phase-3/content-status-lifecycle.md` (P3-007)
- `docs/phase-2/permission-matrix.md` (P2-035)
- `docs/phase-3/curriculum-api-map.md` (P3-004)