# Phase 12 — Parent Linking E2E Check

**Task:** P12-073
**Date:** 2026-06-20
**Reviewer:** yo0sf

## Summary

End-to-end parent-child linking flow reviewed for completeness.

## Flow

1. **Onboarding** → `ParentOnboarding` displays welcome + invitation entry point
2. **Invitation Accept** → `ParentInvitationAccept` collects token, calls `acceptInvitation` API
3. **Backend Validation** → Backend verifies token, creates parent-child link
4. **Child Selection** → `ParentChildSelector` fetches linked children via `listChildren`
5. **Dashboard Access** → Child data pages accessible once child selected

## UI States Covered

| State | Component | Behavior |
|---|---|---|
| No token | `ParentAuthGuard` | Shows forbidden message |
| No linked children | `ParentChildSelector` | Shows empty state |
| Invalid invitation | `ParentInvitationAccept` | Shows error message |
| Successful link | `ParentInvitationAccept` | Shows success, refreshes |
| Multiple children | `ParentChildSelector` | Lists all, allows selection |

## API Endpoints Used

- `POST /api/v1/parent/invitation/accept` — accept invitation token
- `GET /api/v1/parent/children` — list linked children
- `POST /api/v1/parent/invitation` — create invitation (admin-initiated)

## Findings

- Linking flow is complete for Phase 12
- Token expiry handling deferred to Phase 13
- Re-invitation flow (expired token) not yet implemented
