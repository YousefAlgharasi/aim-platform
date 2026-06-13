# Admin Role Change Integration Flow

## Phase 2 — P2-064

**Scope:** Auth, Users, Roles only.

---

## Purpose

This document describes how the Admin Dashboard role change UI (P2-063) connects
to the backend role assignment API (P2-039) and audit logging (P2-040), forming
a complete, backend-authorised role change flow.

---

## Flow Overview

```
Admin Dashboard (browser)
  └─ RoleChangeForm (client component)
       │  user selects new role + optional reason
       │  clicks "Change Role"
       ▼
changeAdminUserRole(token, userId, roleKey, reason?)    [admin-users-api.ts]
       │  PUT /admin/users/:userId/roles
       │  Authorization: Bearer <token>
       │  Body: { roleKey, reason? }
       ▼
AdminRoleAssignmentController                           [backend — NestJS]
       │  SupabaseJwtAuthGuard  → verify JWT
       │  RoleGuard             → assert actor is ADMIN or SUPER_ADMIN
       │  @Param('userId')      → target user ID (never from JWT)
       ▼
AdminRoleAssignmentService.assignUserRole()
       │  1. Resolve actor from Supabase UID via UsersService
       │  2. Resolve target user from userId param via UsersService
       │  3. Assert actor ≠ target (self-role-grant forbidden)
       │  4. Resolve role by key via RolesService
       │  5. Assert actor may assign role (only super_admin can assign super_admin)
       │  6. Replace user's existing roles in transaction:
       │       DELETE old role assignments
       │       INSERT new role assignment (ON CONFLICT: update assigned_by/at)
       │  7. Audit log via AuthLoggingService:
       │       event: 'role_assigned'
       │       metadata: { roleId, roleKey, assignedAt, previousRoleIds, reason? }
       ▼
ApiResponseInterceptor wraps result:
  { success: true, data: AdminRoleAssignmentResponse, meta: { ... } }
       ▼
adminApiClient.put() unwraps envelope → returns AdminRoleAssignmentResponse:
  { userId, role: { id, key, name, ... }, assignedByUserId, assignedAt }
       ▼
RoleChangeForm renders success message using result.role.key
```

---

## Security Boundaries

| Layer | Responsibility |
|---|---|
| `RoleChangeForm` (browser) | UX only — presents form, shows success/error. Makes no authorization decisions. |
| `adminApiClient.put()` | HTTP transport only. Token sourced from HTTP-only cookie server-side, passed to client component as a prop. |
| `SupabaseJwtAuthGuard` | Verifies JWT signature. Rejects requests with invalid or missing token. |
| `RoleGuard` | Asserts the actor holds `ADMIN` or `SUPER_ADMIN` role in the database. Client-side role state is not trusted. |
| `AdminRoleAssignmentService` | Final authority. Enforces self-role-grant prevention, super_admin protection, and transactional role replacement. |
| `AuthLoggingService` | Records every role change event for audit purposes. |

**Backend is the final authority.** The Admin Dashboard renders backend-approved
data only. No client-side authorization decisions are made.

---

## Request/Response Contract

### Request

```
PUT /admin/users/:userId/roles
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "roleKey": "admin",
  "reason": "Promotion to content team lead"   // optional
}
```

### Success Response (HTTP 200)

```json
{
  "success": true,
  "data": {
    "userId": "<internal-aim-user-id>",
    "role": {
      "id": "<role-id>",
      "key": "admin",
      "name": "Admin",
      "description": "...",
      "isSystem": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "assignedByUserId": "<actor-internal-id>",
    "assignedAt": "2026-06-13T05:00:00.000Z"
  },
  "meta": { ... }
}
```

### Error Responses

| Status | Code | Condition |
|---|---|---|
| 401 | `UNAUTHORIZED` | JWT missing or invalid |
| 403 | `FORBIDDEN` | Actor lacks ADMIN/SUPER_ADMIN role |
| 403 | `RBAC_SELF_GRANT_FORBIDDEN` | Actor attempts to change their own role |
| 403 | `RBAC_SYSTEM_ROLE_PROTECTED` | Non-super_admin attempts to assign super_admin |
| 404 | `NOT_FOUND` | Target user not found |
| 400 | `BAD_REQUEST` | roleKey is empty |

---

## Audit Log Entry

Every successful role change is recorded by `AuthLoggingService` with:

```
event:  role_assigned
userId: <target-user-internal-id>
supabaseAuthUid: <target-supabase-uid>
actorUserId: <actor-internal-id>
metadata:
  roleId:          <new-role-id>
  roleKey:         <new-role-key>
  assignedAt:      <ISO timestamp>
  previousRoleIds: [<removed-role-ids>]
  reason:          <string | undefined>
```

Audit log entries do not include:
- JWT tokens or secrets
- IP addresses in the metadata map (handled at the HTTP logging layer if configured)
- Service-role keys or database credentials

---

## Integration Fix Applied in This Task (P2-064)

The P2-063 `AdminRoleChangeResult` type and decoder were misaligned with the
actual `AdminRoleAssignmentResponse` returned by the backend:

| Field | Old (wrong) | Fixed |
|---|---|---|
| `assignedRoleKey` | Expected from backend | Backend returns `role.key` inside `role: RoleRecord` |
| `success` | Expected from backend data | Implicit from HTTP 200 — not in data payload |
| `message` | Expected from backend data | Not returned by backend |

**Fixed in P2-064:**
- `AdminRoleChangeResult` type updated to match `AdminRoleAssignmentResponse`
- `decodeRoleChangeResult` now maps `role.id`, `role.key`, `role.name` from the nested `role` object
- `RoleChangeForm` success message now uses `result.role.key` (confirmed from backend)

---

## Files Involved

| File | Layer | Role |
|---|---|---|
| `apps/admin-dashboard/app/admin/users/[id]/role-change-form.tsx` | UI (P2-063/064) | Form, calls `changeAdminUserRole`, renders result |
| `apps/admin-dashboard/lib/api/admin-users-api.ts` | API client (P2-063/064) | `changeAdminUserRole`, corrected decoder |
| `apps/admin-dashboard/lib/api/admin-api-client.ts` | HTTP transport (P2-063) | `put()` method |
| `services/backend-api/src/features/admin/admin-role-assignment.controller.ts` | Backend (P2-039) | Route, guards |
| `services/backend-api/src/features/admin/admin-role-assignment.service.ts` | Backend (P2-039/040) | Business logic, audit logging |
| `services/backend-api/src/auth/auth-logging.service.ts` | Backend (P2-040) | Audit log writer |

---

## Non-Goals

This document does not cover:
- AIM Engine integration (out of scope for Phase 2)
- AI Teacher integration (out of scope for Phase 2)
- Onboarding, placement, lessons, or sessions (out of scope for Phase 2)
- Student Web App (out of scope for Phase 2)
- Student-facing role display logic
