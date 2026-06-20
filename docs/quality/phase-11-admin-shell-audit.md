# Phase 11 — Admin Dashboard Shell Audit

**Task:** P11-006
**Depends on:** P11-003 (Admin Design System Rules), P11-004 (Admin Route and Permission Map)
**Audited path:** `apps/admin-dashboard/`
**Audit date:** Phase 11 start

---

## 1. Summary

The admin dashboard shell is a Next.js 14+ App Router application with server-side auth enforcement. Core auth flow, token handling, and role verification are solid. The shell has a working layout, navigation, and real user management pages. However, it carries significant gaps in design system compliance, navigation structure, route coverage, and RTL/accessibility readiness that must be addressed before Phase 11 features are built on top of it.

---

## 2. Structure Overview

```
apps/admin-dashboard/
  app/
    layout.tsx                    ← root layout (no auth)
    page.tsx                      ← root redirect → /admin
    globals.css                   ← ONE-OFF tokens (gap — see §5)
    admin/
      layout.tsx                  ← AUTH GUARD ✓ (server-side)
      page.tsx                    ← placeholder only
      users/
        page.tsx                  ← REAL implementation ✓
        [id]/page.tsx             ← REAL implementation ✓
        [id]/role-change-form.tsx ← REAL implementation ✓
      content/                    ← partial real + placeholder pages
      placement/                  ← real placement management pages
      audit-logs/page.tsx         ← placeholder only
      reports/page.tsx            ← placeholder only
      reviews/page.tsx            ← placeholder only
      roles/page.tsx              ← placeholder only
      settings/page.tsx           ← placeholder only
      students/page.tsx           ← placeholder only
  components/
    admin-shell-layout.tsx        ← layout wrapper ✓
    admin-navigation.tsx          ← navigation sidebar (gaps — see §6)
    admin-placeholder-page.tsx    ← dev scaffold
    admin-curriculum-placeholder-page.tsx
    content-status-workflow.tsx
  lib/
    auth/admin-auth.ts            ← auth state ✓ (backend-resolved roles)
    api/                          ← API client layer ✓
    admin-navigation.ts           ← nav items (gaps — see §6)
    admin-roles.ts                ← STALE role keys (gap — see §7)
```

---

## 3. Auth and Permission Guard — PASS ✓

| Check | Result |
|---|---|
| JWT read from HTTP-only cookie server-side | ✓ Pass |
| JWT never exposed to browser JS | ✓ Pass |
| Auth state resolved via `GET /auth/me` backend call | ✓ Pass |
| Role check performed by backend, not client | ✓ Pass |
| Unauthenticated → redirect `/admin-auth-required` | ✓ Pass |
| Unauthorized role → redirect `/admin-unauthorized` | ✓ Pass |
| Auth unavailable → redirect `/admin-auth-unavailable` | ✓ Pass |
| `supabase_auth_uid` never in response | ✓ Pass |
| Admin guard wraps entire `/admin/*` tree in `app/admin/layout.tsx` | ✓ Pass |
| Allowed roles: `admin`, `super_admin` | ✓ Pass |

**No auth gaps found.** Auth implementation is correct and must be preserved.

---

## 4. API Client Layer — PASS ✓

| Check | Result |
|---|---|
| `adminApiClient` abstracts all fetch calls | ✓ Pass |
| Base URL from env (`NEXT_PUBLIC_API_BASE_URL` or similar), not hardcoded | ✓ Pass |
| `AdminApiClientError` handles 401/403/404/5xx | ✓ Pass |
| Token passed as `Authorization: Bearer` header | ✓ Pass |
| No AI provider keys, DB credentials, or secrets in API client | ✓ Pass |
| Response decoders validate shape before use | ✓ Pass |

---

## 5. Design System Compliance — FAIL ✗

### 5.1 `globals.css` uses one-off tokens

The current `globals.css` defines custom CSS variables that do NOT match the AIM design system:

| Existing token | Issue |
|---|---|
| `--background: #f8fafc` | Not a design system token — must use `--surface` |
| `--foreground: #0f172a` | Not a design system token — must use `--text-primary` |
| `--muted: #475569` | Not a design system token — must use `--text-secondary` |
| `--card: #ffffff` | Not a design system token — must use `--surface-raised` |
| `--border: #dbe3ef` | Hardcoded hex — must use `--border` from design system |
| `--accent: #1d4ed8` | Hardcoded hex — must use `--primary` |
| `--accent-soft: #dbeafe` | Hardcoded hex — must use `--primary-soft` |

**Required fix:** Replace `globals.css` with AIM design system token imports from `docs/design/source/aim-design-system/styles.css` and use semantic aliases throughout.

### 5.2 No design system stylesheet imported

The app does not import `docs/design/source/aim-design-system/styles.css` or its compiled tokens. Phase 11 feature pages cannot use `--space-*`, `--type-*`, `--radius-*`, `--shadow-*`, or semantic color tokens until this is resolved.

**Required fix (P11-007 or P11-008):** Import the AIM design system stylesheet at the root layout level.

### 5.3 Components use ad-hoc CSS class names

`admin-badge`, `admin-table`, `admin-pagination`, `admin-error-banner`, `admin-empty-state` etc. are hand-rolled class names with no connection to design system components.

**Required fix:** Phase 11 UI tasks must replace ad-hoc classes with design system component patterns.

### 5.4 No typography tokens used

Body text, headings, and labels in existing pages use no `--type-*` tokens. Font sizes are implicit or browser defaults.

---

## 6. Navigation — PARTIAL ✗

### 6.1 Navigation items are incomplete

Current `adminNavigationItems` covers: Overview, Students, Content, Reviews, Reports, Settings, Audit Logs, Role menu.

Missing per Phase 11 capability map:
- Users (separate from Students)
- Question Bank
- Assessments / Quizzes / Exams
- Deadlines
- Assessment Results
- Placement Results
- Skill States
- Weaknesses
- Recommendations
- Session Summaries
- Activity Logs

### 6.2 Navigation uses stale role keys

`admin-navigation.ts` imports `AdminRoleKey` from `admin-roles.ts`, which defines UI-only role keys (`pilot_admin`, `content_manager`, `human_reviewer`, `project_owner`). These do not match the backend `AuthorizedRole` enum (`admin`, `super_admin`, `content_editor`, `reviewer`).

**Required fix:** Navigation role filtering must use backend-aligned roles from `admin-auth.ts` → `BackendAuthorizedRole`, not UI-only role keys.

### 6.3 Navigation does not filter by actual user role

The sidebar shows all menu groups regardless of the authenticated user's actual role. Role-based filtering must use `authContext.roles` (backend-resolved) to show/hide items.

### 6.4 Navigation label reads "Phase 1 shell"

The brand mark in `admin-navigation.tsx` reads `<small>Phase 1 shell</small>`. Must be updated for Phase 11.

---

## 7. Stale Role Definitions — FAIL ✗

`lib/admin-roles.ts` defines `AdminRoleKey` as `pilot_admin | content_manager | human_reviewer | project_owner`. These are placeholder role keys from early phases and do not match the backend `AuthorizedRole` enum.

**Required fix:** `admin-roles.ts` must be updated or replaced to use backend-aligned roles: `admin`, `super_admin`, `content_editor`, `reviewer`.

---

## 8. Route Coverage — GAPS ✗

| Route | Status | Note |
|---|---|---|
| `/admin` | Placeholder | Needs real dashboard home (P11-008) |
| `/admin/users` | ✓ Real | Users list implemented |
| `/admin/users/:id` | ✓ Real | User detail implemented |
| `/admin/content/courses` | ✓ Real | Courses implemented |
| `/admin/content/chapters` | ✓ Real | Chapters implemented |
| `/admin/content/lessons` | ✓ Real | Lessons implemented |
| `/admin/content/skills` | ✓ Real | Skills implemented |
| `/admin/content/question-bank` | ✓ Real | Question bank implemented |
| `/admin/placement/*` | ✓ Real | Placement management implemented |
| `/admin/students` | Placeholder | Needs student progress view |
| `/admin/audit-logs` | Placeholder | Needs real audit log view |
| `/admin/reports` | Placeholder | Needs basic reports |
| `/admin/reviews` | Placeholder | Needs review queue |
| `/admin/roles` | Placeholder | Needs roles view |
| `/admin/settings` | Placeholder | Out of scope for Phase 11 |
| `/admin/assessments` | Missing | Needs assessment management (P11-037+) |
| `/admin/deadlines` | Missing | Needs deadline management (P11-042) |
| `/admin/skill-states` | Missing | Needs skill state view |
| `/admin/weaknesses` | Missing | Needs weakness view |
| `/admin/recommendations` | Missing | Needs recommendation view |
| `/admin/session-summaries` | Missing | Needs session summary view |
| `/admin/activity-logs` | Missing | Needs activity log view |

---

## 9. Responsive / RTL / Accessibility — FAIL ✗

| Check | Result |
|---|---|
| RTL layout support (`dir="rtl"`) | ✗ Not implemented — hardcoded `left`/`right` in CSS |
| Arabic font (`IBM Plex Sans Arabic`) | ✗ Not imported |
| Responsive sidebar (mobile drawer) | ✗ Sidebar is always visible with no mobile behaviour |
| Touch target ≥ 44px on nav links | ✗ No `--touch-target` token used |
| Focus ring on interactive elements | ✗ No `--shadow-focus` token used |
| `aria-label` on icon-only buttons | ✓ No icon-only buttons present yet |
| `prefers-reduced-motion` | ✗ No motion tokens used at all |

---

## 10. Missing States — FAIL ✗

| State | Current | Required |
|---|---|---|
| Loading skeleton | ✗ None | Design system skeleton shimmer |
| Empty state component | Partial (plain text only) | Design system empty state with icon + message |
| Error state component | Partial (`admin-error-banner` ad-hoc) | Design system alert component |
| Forbidden (403) state | ✗ None on individual pages | Design system forbidden state |

The redirect-based forbidden state in `layout.tsx` covers shell-level auth. Individual pages still need to handle 403 from API calls gracefully.

---

## 11. Gap Summary and Required Actions

| # | Gap | Severity | Resolves in |
|---|---|---|---|
| G1 | `globals.css` uses one-off tokens, not design system | Critical | P11-007 / P11-008 |
| G2 | Design system stylesheet not imported at root | Critical | P11-007 / P11-008 |
| G3 | Ad-hoc CSS class names, no design system components | High | Each UI task (P11-009+) |
| G4 | No typography tokens (`--type-*`) used | High | Each UI task |
| G5 | Navigation items incomplete — 11 sections missing | High | P11-008 |
| G6 | Navigation uses stale UI-only role keys | High | P11-007 / P11-008 |
| G7 | Navigation does not filter by actual user role | High | P11-008 |
| G8 | Navigation label reads "Phase 1 shell" | Low | P11-008 |
| G9 | `admin-roles.ts` uses stale role keys | High | P11-007 / P11-008 |
| G10 | RTL layout not supported | High | P11-007 / P11-008 |
| G11 | Arabic font not imported | High | P11-007 / P11-008 |
| G12 | No responsive sidebar (mobile drawer) | Medium | P11-007 / P11-008 |
| G13 | No focus rings (`--shadow-focus`) | High | P11-007 / P11-008 |
| G14 | No touch targets (`--touch-target`) | High | P11-007 / P11-008 |
| G15 | Loading skeleton not implemented | High | P11-008 + each UI task |
| G16 | Empty state uses plain text only | Medium | P11-008 + each UI task |
| G17 | Error state is ad-hoc, not design system | Medium | P11-008 + each UI task |
| G18 | Per-page 403 forbidden state missing | High | P11-008 + each UI task |
| G19 | 11 routes missing entirely | High | P11-037 through P11-057 |

---

## 12. What Must Not Change

The following are working correctly and must be preserved in all Phase 11 work:

- `app/admin/layout.tsx` server-side auth guard (JWT + role check)
- `lib/auth/admin-auth.ts` backend role resolution via `/auth/me`
- `lib/api/admin-api-client.ts` and all existing API clients
- `app/admin/users/` pages (P2-060/062 implementation)
- `app/admin/users/[id]/role-change-form.tsx`
- `app/admin/content/*` existing curriculum pages
- `app/admin/placement/*` existing placement pages
- HTTP-only cookie token handling — token must never reach browser JS

---

*Audit created: Phase 11 P11-006*
*Depends on: P11-003, P11-004*
