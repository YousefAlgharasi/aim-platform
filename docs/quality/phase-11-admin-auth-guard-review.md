# Phase 11 — Admin Auth and Permission Guard Review

**Task:** P11-007
**Depends on:** P11-004 (Admin Route and Permission Map), P11-006 (Admin Shell Audit)
**Review date:** Phase 11 start
**Scope:** Backend NestJS guards + Admin Dashboard (Next.js) auth enforcement

---

## 1. Summary Verdict

| Layer | Auth Guard | Role/Permission Guard | Verdict |
|---|---|---|---|
| Backend — admin/users | `SupabaseJwtAuthGuard` ✓ | `RoleGuard` + `@RequireRoles(ADMIN, SUPER_ADMIN)` ✓ | **PASS** |
| Backend — admin/role-assignment | `SupabaseJwtAuthGuard` ✓ | `RoleGuard` + `@RequireRoles(ADMIN, SUPER_ADMIN)` ✓ | **PASS** |
| Backend — curriculum (R/W) | `SupabaseJwtAuthGuard` ✓ | `PermissionGuard` + `@RequirePermissions(...)` ✓ | **PASS** |
| Backend — curriculum workflow (publish) | `SupabaseJwtAuthGuard` ✓ | `PermissionGuard` + `CONTENT_PUBLISH` ✓ | **PASS** |
| Backend — assessments (student) | `SupabaseJwtAuthGuard` ✓ | `AssessmentPermissionGuard` + `STUDENT` role ✓ | **PASS** (student-only, correct) |
| Backend — placement (student) | `SupabaseJwtAuthGuard` ✓ | `PlacementPermissionGuard` + `STUDENT` role ✓ | **PASS** (student-only, correct) |
| Admin UI shell | Server-side `/auth/me` check ✓ | `hasAdminDashboardAccess` (backend-resolved roles) ✓ | **PASS** |
| Admin UI — token handling | HTTP-only cookie, server-side only ✓ | Never sent to browser JS ✓ | **PASS** |
| Admin UI — client components | No `"use client"` components access tokens | N/A | **PASS** |
| Admin UI — fallback pages | `admin-auth-required`, `admin-unauthorized`, `admin-auth-unavailable` ✓ | N/A | **PASS** |

**No auth or permission guard failures found in existing implementation.**

---

## 2. Backend Guard Architecture

### 2.1 JWT Guard — `SupabaseJwtAuthGuard`

File: `services/backend-api/src/auth/supabase-jwt-auth.guard.ts`

**How it works:**
1. Checks for `@PublicRoute()` decorator — skips guard if present
2. Extracts `Bearer <token>` from `Authorization` header via `extractBearerToken()`
3. Missing token → throws `401 UNAUTHORIZED`
4. Calls `SupabaseJwtVerifierService.verify(token)` — validates JWT against Supabase public key
5. Sets `request.user` (type: `AuthenticatedUser`) with verified Supabase UID
6. Invalid or expired token → throws `401 UNAUTHORIZED`

**Guard is applied at controller class level on all admin controllers** — no endpoint is left unguarded.

### 2.2 Role Guard — `RoleGuard`

File: `services/backend-api/src/auth/authorization/role.guard.ts`

**How it works:**
1. Reads `@RequireRoles(...)` decorator via Reflector (handler then class)
2. No required roles → passes (open route)
3. Resolves `AuthenticatedUser` from `request.user`
4. Missing user → throws `401 UNAUTHORIZED`
5. Calls `UsersService.findBySupabaseUid(user.id)` to find internal user
6. User not found or `status !== 'active'` → throws `401 UNAUTHORIZED`
7. Calls `RolesService.getUserRoles(internalUser.id)` — **database lookup, not JWT claim**
8. No matching required role → throws `403 FORBIDDEN`

**Key security property:** Roles are resolved from the database at request time, not from the JWT payload. A client cannot forge a role by manipulating a JWT claim.

### 2.3 Permission Guard — `PermissionGuard`

File: `services/backend-api/src/auth/authorization/permission.guard.ts`

**How it works:**
1. Reads `@RequirePermissions(...)` decorator via Reflector
2. No required permissions → passes
3. Resolves internal user from Supabase UID (same as RoleGuard)
4. Calls `RolesService` to check each required permission against user's role-based permissions
5. Missing any required permission → throws `403 FORBIDDEN`

**Used on:** All curriculum CRUD and workflow endpoints.

---

## 3. Backend Guard Coverage Per Endpoint Group

### 3.1 Admin — Users (`/admin/users`)

```
Controller: AdminUsersController
Guards: @UseGuards(SupabaseJwtAuthGuard, RoleGuard) [class level]
Roles: @RequireRoles(ADMIN, SUPER_ADMIN) [class level]

GET  /admin/users       → ✓ JWT + Role guard
GET  /admin/users/:id   → ✓ JWT + Role guard
```

### 3.2 Admin — Role Assignment (`/admin/users/:userId/roles`)

```
Controller: AdminRoleAssignmentController
Guards: @UseGuards(SupabaseJwtAuthGuard, RoleGuard) [class level]
Roles: @RequireRoles(ADMIN, SUPER_ADMIN) [class level]

PUT /admin/users/:userId/roles → ✓ JWT + Role guard
```

**Gap noted:** Role assignment is scoped to `ADMIN, SUPER_ADMIN` per P11-004 mapping which requires `SUPER_ADMIN` for role changes. Current implementation allows `ADMIN` as well. This is a policy decision for the Phase 11 implementation team — document as a known divergence.

### 3.3 Curriculum — Courses (`/curriculum/courses`)

```
Controller: CoursesController
Guards: @UseGuards(SupabaseJwtAuthGuard, PermissionGuard) [class level]

GET  /curriculum/courses         → CONTENT_READ_DRAFT ✓
GET  /curriculum/courses/:id     → CONTENT_READ_DRAFT ✓
POST /curriculum/courses         → CONTENT_UPDATE ✓
PATCH /curriculum/courses/:id    → CONTENT_UPDATE ✓
```

### 3.4 Curriculum — Chapters (`/curriculum/chapters`)

```
GET  /curriculum/chapters        → CONTENT_READ_DRAFT ✓
GET  /curriculum/chapters/:id    → CONTENT_READ_DRAFT ✓
POST /curriculum/chapters        → CONTENT_UPDATE ✓
PATCH /curriculum/chapters/:id   → CONTENT_UPDATE ✓
```

### 3.5 Curriculum — Lessons (`/curriculum/lessons`)

```
GET  /curriculum/lessons                    → CONTENT_READ_DRAFT ✓
GET  /curriculum/lessons/:id               → CONTENT_READ_DRAFT ✓
POST /curriculum/lessons                   → CONTENT_UPDATE ✓
GET  /curriculum/lessons/:id/publish-validation → CONTENT_READ_DRAFT ✓
PATCH /curriculum/lessons/:id              → CONTENT_UPDATE ✓
```

### 3.6 Curriculum — Skills (`/curriculum/skills`)

```
GET  /curriculum/skills          → CONTENT_READ_DRAFT ✓
GET  /curriculum/skills/by-key/:key → CONTENT_READ_DRAFT ✓
GET  /curriculum/skills/:id      → CONTENT_READ_DRAFT ✓
POST /curriculum/skills          → CONTENT_UPDATE ✓
PATCH /curriculum/skills/:id     → CONTENT_UPDATE ✓
```

### 3.7 Question Bank (`/curriculum/questions`)

```
GET  /curriculum/questions       → CONTENT_READ_DRAFT ✓
GET  /curriculum/questions/:id   → CONTENT_READ_DRAFT ✓
POST /curriculum/questions       → CONTENT_UPDATE ✓
PATCH /curriculum/questions/:id  → CONTENT_UPDATE ✓
```

### 3.8 Content Workflow (`/curriculum/workflow`)

```
PATCH /curriculum/workflow/:type/:id/publish  → CONTENT_PUBLISH ✓
PATCH /curriculum/workflow/:type/:id/archive  → CONTENT_ARCHIVE ✓
PATCH /curriculum/workflow/:type/:id/restore  → CONTENT_RESTORE ✓
```

### 3.9 Assessments — Student-facing (`/student/assessments`)

```
All routes: @RequireRoles(STUDENT) + AssessmentPermissionGuard
→ ✓ Correctly scoped to STUDENT only — admin cannot call these
→ Phase 11 admin assessment management requires NEW admin-scoped endpoints
```

### 3.10 Placement — Student-facing (`/placement`)

```
All routes: @RequireRoles(STUDENT) + PlacementPermissionGuard
→ ✓ Correctly scoped to STUDENT only
```

---

## 4. Admin UI Auth Enforcement

### 4.1 Shell-level guard (`app/admin/layout.tsx`)

```typescript
// Correct pattern — verified ✓
const authState = await getAdminAuthState();
if (authState.status === 'unauthenticated') redirect('/admin-auth-required');
if (authState.status === 'unauthorized')    redirect('/admin-unauthorized');
if (authState.status === 'unavailable')    redirect('/admin-auth-unavailable');
```

All routes under `/admin/*` pass through this layout. No `/admin` sub-route can be reached without passing this guard.

### 4.2 Token handling

| Check | Result |
|---|---|
| Token stored in HTTP-only cookie (`aim_admin_access_token`) | ✓ |
| Token read server-side only via `cookies()` from `next/headers` | ✓ |
| Token never passed as a prop to client components | ✓ |
| No `"use client"` components found that access the token | ✓ |
| Token never appears in page URL params or query strings | ✓ |
| No `localStorage`/`sessionStorage` token storage | ✓ |

### 4.3 Role resolution

```typescript
// Correct pattern — verified ✓
// Roles come from backend /auth/me response, not from JWT parsing
const envelope = await adminApiClient.get<AdminAuthContext>('/auth/me', ...)
// hasAdminDashboardAccess checks backend-returned roles
if (!hasAdminDashboardAccess(envelope.data.roles)) → redirect unauthorized
```

The admin UI **never** decodes the JWT to extract roles. Roles are always the backend's `roles[]` array from `/auth/me`.

### 4.4 Placement admin auth (`lib/auth/placement-admin-auth.ts`)

Follows the same pattern: server-side token read → backend permission check → structured permission state returned to page. No client-side privilege computation.

---

## 5. Known Gaps and Required Actions for Phase 11

### G1 — Admin assessment endpoints do not yet exist (High)

The student-facing `/student/assessments` controller is correctly scoped to `STUDENT` role. Phase 11 needs **new** admin-scoped assessment endpoints at `/admin/assessments` protected by `ADMIN`/`SUPER_ADMIN`. These must be built in P11-037+ tasks.

**Requirement:** New `AdminAssessmentsController` with `@UseGuards(SupabaseJwtAuthGuard, RoleGuard)` + `@RequireRoles(ADMIN, SUPER_ADMIN)`.

### G2 — Deadline, results, progress, skill-state, weakness, recommendation, session, activity-log, report endpoints do not yet exist (High)

All of these are planned in P11-042 through P11-063. Each must follow the guard pattern:
```typescript
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
```

### G3 — Role assignment `super_admin` scope (Low — policy gap)

`AdminRoleAssignmentController` currently accepts `ADMIN` or `SUPER_ADMIN`. The Phase 11 route permission map (P11-004) specifies role assignment requires `SUPER_ADMIN` only. The Phase 11 backend tasks should tighten this to `@RequireRoles(SUPER_ADMIN)` for the role assignment endpoint specifically.

### G4 — Per-page 403 state in admin UI (Medium)

Individual admin pages currently handle 403 from backend API calls with ad-hoc error strings. Phase 11 UI tasks must implement the design system forbidden state component so users see a consistent, clear forbidden message rather than raw error text.

### G5 — No middleware-level route protection in Next.js (Low — acceptable)

The shell relies on the `app/admin/layout.tsx` server component guard rather than Next.js Middleware. This is acceptable because:
- All admin routes are under the `app/admin/` directory
- The layout is a React Server Component — it runs on the server on every request
- However, if Next.js ever caches the layout aggressively, this could be bypassed

**Recommendation:** Add a `middleware.ts` at the app root as a secondary check redirecting unauthenticated requests away from `/admin/*` in Phase 11 or Phase 12.

---

## 6. Requirements for All New Phase 11 Admin Endpoints

Every new backend controller added in Phase 11 must:

```typescript
// Required pattern — no exceptions
@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/<resource>')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class Admin<Resource>Controller {
  // endpoint-level overrides for scoped roles (e.g. reviewer read access)
  @Get()
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN, AuthorizedRole.REVIEWER)
  list() { ... }
}
```

Checklist for each new admin endpoint:
- [ ] `SupabaseJwtAuthGuard` present at class level
- [ ] `RoleGuard` or `PermissionGuard` present at class level
- [ ] `@RequireRoles` or `@RequirePermissions` on every handler
- [ ] No client-supplied `studentId`, `userId`, `sessionId` in body used for identity resolution
- [ ] No scores, pass/fail, or mastery values accepted in request body
- [ ] No secrets or credentials returned in response
- [ ] DTO validated with `class-validator`

---

## 7. Final Verdict

The existing auth and permission guard implementation is **correct and secure**. No existing admin endpoint is unguarded. The admin UI correctly resolves roles from the backend, not from JWT claims. The token is handled safely server-side only.

Phase 11 must ensure all **new** admin endpoints follow the same guard pattern without exception.

---

*Auth guard review created: Phase 11 P11-007*
*Depends on: P11-004, P11-006*
