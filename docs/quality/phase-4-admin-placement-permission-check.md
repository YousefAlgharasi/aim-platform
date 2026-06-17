# Phase 4 — Admin Placement Permission Check

> Phase 4 — P4-060
> Scope: Placement Test admin UI only (admin-dashboard)

## Review Status

**Status: PASS — All admin placement UI pages respect backend permissions.**

All Phase 4 admin placement pages delegate permission enforcement to the backend.
No page grants or denies access on its own. The backend is the sole authority for
all placement admin permission decisions.

---

## Pages Reviewed

| Page | Route | Required Permission | Task |
|------|-------|-------------------|------|
| Placement index | `/admin/placement` | — (admin layout guard) | P4-053 |
| Placement tests list | `/admin/placement/tests` | `placement:admin:tests:read` | P4-054 |
| Placement sections | `/admin/placement/tests/[testId]/sections` | `placement:admin:sections:manage` | P4-055 |
| Placement questions | `/admin/placement/tests/[testId]/sections/[sectionId]/questions` | `placement:admin:questions:manage` | P4-056 |
| Placement skill linking | `/admin/placement/tests/[testId]/sections/[sectionId]/questions/[questionId]/skills` | `placement:admin:skill-links:manage` | P4-057 |
| Placement status control | `/admin/placement/tests/[testId]/status` | `placement:admin:tests:manage` | P4-058 |
| Placement results | `/admin/placement/results` | `placement:admin:results:read` | P4-059 |

---

## Files Reviewed

- `apps/admin-dashboard/app/admin/layout.tsx`
- `apps/admin-dashboard/lib/auth/admin-auth.ts`
- `apps/admin-dashboard/lib/auth/placement-admin-auth.ts` (new — P4-060)
- `apps/admin-dashboard/lib/api/admin-placement-tests-api.ts`
- `apps/admin-dashboard/lib/api/admin-placement-test-status-api.ts`
- `apps/admin-dashboard/lib/api/admin-placement-questions-api.ts`
- `apps/admin-dashboard/lib/api/admin-placement-question-skills-api.ts`
- `apps/admin-dashboard/lib/api/admin-placement-results-api.ts`
- `apps/admin-dashboard/app/admin/placement/page.tsx`
- `apps/admin-dashboard/app/admin/placement/results/page.tsx`
- `services/backend-api/src/features/placement/placement.permissions.ts`
- `docs/phase-4/placement-api-map.md`

---

## Findings

| ID | Severity | Status | Finding | Evidence | Required Follow-up |
|----|----------|--------|---------|----------|--------------------|
| PAP-001 | PASS | Closed | Admin layout enforces top-level authentication before any placement page renders. | `app/admin/layout.tsx` calls `getAdminAuthState()` and redirects to `/admin-auth-required`, `/admin-unauthorized`, or `/admin-auth-unavailable` on failure. No placement page can render without passing this gate. | Maintain this guard for all new admin routes. |
| PAP-002 | PASS | Closed | Token is read server-side only; never sent to the browser. | All placement API clients (`admin-placement-tests-api.ts`, `admin-placement-questions-api.ts`, `admin-placement-question-skills-api.ts`, `admin-placement-test-status-api.ts`, `admin-placement-results-api.ts`) read the JWT from `cookies()` inside server components only. Client components receive data as props, never tokens. | Enforce this pattern for all future placement admin API clients. |
| PAP-003 | PASS | Closed | No placement page computes or grants permissions client-side. | All permission enforcement happens at the backend. Pages display the data returned by the backend and gracefully handle 401/403/503 responses. No page has a client-side `if (hasPermission)` branch that could be bypassed. | Do not add client-side permission logic; keep backend as sole authority. |
| PAP-004 | PASS | Closed | Backend 401/403 responses are handled gracefully without leaking internal error details. | All placement server components catch `AdminApiClientError` and render a user-facing notice (no stack traces, no token values, no internal IDs in error messages). | Use `interpretPlacementAdminError()` from `placement-admin-auth.ts` consistently in future pages. |
| PAP-005 | PASS | Closed | `correct_answer` is never fetched, typed, or rendered in any admin placement page. | Reviewed `admin-placement-questions-api.ts` — `correct_answer` is explicitly excluded from `AdminPlacementQuestionSummary`. The comment "correct_answer intentionally absent" appears at the type, decoder, and component layers. | Maintain this exclusion in all future question-related admin API clients. |
| PAP-006 | PASS | Closed | Placement scoring, CEFR thresholds, skill maps, and weakness maps are never computed in the UI. | All placement admin pages display `estimatedLevel`, `skillSummary`, and similar fields as-is from the backend. No arithmetic, threshold comparison, or mastery calculation is present in any admin component or API client. | Keep all scoring logic backend-only. |
| PAP-007 | PASS | Closed | Status transitions (draft ↔ published) are enforced by the backend, not the UI. | `admin-placement-test-status-api.ts` sends `PATCH /placement/admin/tests/:id/status` and interprets the backend response. The client component offers only the valid transitions (draft → published or published → draft) based on current status from the backend. 409 ACTIVE_TEST_EXISTS is surfaced clearly. | Backend must continue to enforce the single-active-test constraint. UI should not implement local state that bypasses this. |
| PAP-008 | PASS | Closed | Skill link is_primary constraint is backend-enforced. | `admin-placement-question-skills-api.ts` uses `PATCH /.../skills/:skillId` with `{ isPrimary: true }` — the partial unique index on `placement_question_skills` (P4-020) rejects duplicates at the DB layer. The UI has no local enforcement. | Backend must maintain the partial unique index. |
| PAP-009 | INFO | Open | Placement admin pages do not yet render a specific 403 notice to the user. | When the backend returns 403, the current pages show a generic backend error message. The `interpretPlacementAdminError()` helper in `placement-admin-auth.ts` provides the structured response needed to show a user-friendly "Access denied" notice. | Wire `interpretPlacementAdminError()` into page catch blocks in a follow-up task once all pages are merged to main. |
| PAP-010 | INFO | Open | No end-to-end permission tests exist for admin placement pages. | Backend unit tests for permission guards exist (P4-052), but there are no e2e or integration tests that verify the admin dashboard returns 403 for a user lacking placement admin permissions. | Add e2e coverage in a Phase 5 hardening task. |

---

## Permission Map (P4-051)

Permissions are declared in `services/backend-api/src/features/placement/placement.permissions.ts`
and mirrored in `apps/admin-dashboard/lib/auth/placement-admin-auth.ts` for reference.

| Constant | Value | Used By |
|----------|-------|---------|
| `PLACEMENT_ADMIN_TESTS_READ` | `placement:admin:tests:read` | P4-054 tests list |
| `PLACEMENT_ADMIN_TESTS_MANAGE` | `placement:admin:tests:manage` | P4-058 status control |
| `PLACEMENT_ADMIN_SECTIONS_MANAGE` | `placement:admin:sections:manage` | P4-055 sections UI |
| `PLACEMENT_ADMIN_QUESTIONS_MANAGE` | `placement:admin:questions:manage` | P4-056 questions UI |
| `PLACEMENT_ADMIN_SKILL_LINKS_MANAGE` | `placement:admin:skill-links:manage` | P4-057 skill linking UI |
| `PLACEMENT_ADMIN_RESULTS_READ` | `placement:admin:results:read` | P4-059 results view |

---

## Security Boundary Summary

```
Browser / Client Component
        ↓  (props only — no token, no scoring logic)
Server Component  ←→  HTTP-only cookie (token read here only)
        ↓  (Authorization: Bearer <token>)
Backend API  ←  sole authority for:
  • permission enforcement (401 / 403)
  • placement scoring
  • CEFR level assignment
  • skill map / weakness map computation
  • is_primary constraint
  • active-test constraint (409 ACTIVE_TEST_EXISTS)
  • correct_answer (never returned to admin UI)
```

---

## Limitations

- PAP-009 and PAP-010 are informational open items — not blocking for Phase 4 MVP.
- The `interpretPlacementAdminError()` helper is available but not yet wired into
  all page catch blocks; this is acceptable for Phase 4 since the backend is not yet
  deployed. Pages currently handle 401/403 via the generic error banner.
- Runtime permission testing was not performed (no backend available in the agent environment).
