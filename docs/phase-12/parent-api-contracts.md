# Phase 12 — Parent API Contracts

**Date:** 2026-06-20
**Task:** P12-040
**Dependencies:** P12-031..P12-039 (implemented parent endpoints)

---

## 1. Purpose

This document is the as-built contract for every parent-facing endpoint
implemented in `services/backend-api/src/features/parents/parents.controller.ts`.
It supersedes the earlier planning document
(`docs/phase-12/parent-api-contract-map.md`) wherever the two disagree —
this file reflects what is actually shipped and is the source of truth for
parent frontend implementation.

All endpoints are namespaced under:

```
/api/v1/parent
```

All endpoints require:

```
Authorization: Bearer <supabase-jwt>
```

enforced by `SupabaseJwtAuthGuard`. Endpoints under `children/:childId/...`
additionally require `ParentChildAccessGuard` (an active parent-child link,
and — where noted — a granted consent of the listed type or `full_access`).
The backend remains the sole authority for child access, consent, progress,
assessment results, and AIM outputs; no parent endpoint accepts or trusts
client-submitted versions of any of those.

Response bodies below are the JSON shape returned directly by each
endpoint (NestJS default serialization of the listed entity/DTO) — there is
no `data`/`meta` envelope.

---

## 2. Children

### GET /api/v1/parent/children

**Guards:** Auth
**Description:** Lists the authenticated parent's non-revoked linked children.
**Response:** `ParentChildSummaryEntity[]`

```json
[
  {
    "childId": "uuid",
    "displayName": "string",
    "relationshipType": "parent | guardian | other",
    "linkStatus": "pending | active | revoked"
  }
]
```

---

## 3. Dashboard Summary

### GET /api/v1/parent/dashboard-summary

**Guards:** Auth
**Description:** Aggregate, backend-prepared summary across all linked children.
**Response:** `ParentDashboardSummaryDto`

```json
{
  "parentId": "uuid",
  "children": [
    {
      "childId": "uuid",
      "displayName": "string",
      "progressLabel": "string | null",
      "hasOpenWeaknesses": "boolean | null",
      "upcomingDeadlineCount": "number | null",
      "lastUpdatedAt": "ISO-8601"
    }
  ]
}
```

`progressLabel`, `hasOpenWeaknesses`, and `upcomingDeadlineCount` are `null`
when the parent has not been granted the consent required to view that
data for a given child.

---

## 4. Child Progress

### GET /api/v1/parent/children/:childId/progress

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Response:** `ParentChildProgressEntity`

```json
{
  "childId": "uuid",
  "skillStates": [
    {
      "skillId": "uuid",
      "masteryScore": 0,
      "masteryConfidence": 0,
      "masteryTrend": "string",
      "lastEvaluatedAt": "ISO-8601"
    }
  ],
  "weaknesses": [
    {
      "weaknessId": "uuid",
      "skillId": "uuid",
      "severity": "string",
      "status": "string",
      "detectedAt": "ISO-8601",
      "resolvedAt": "ISO-8601 | null"
    }
  ],
  "recommendations": [
    {
      "id": "uuid",
      "kind": "string",
      "targetSkillId": "uuid",
      "rank": 0,
      "reason": "string",
      "generatedAt": "ISO-8601",
      "status": "string"
    }
  ],
  "reviewSchedules": [
    {
      "scheduleId": "uuid",
      "skillId": "uuid",
      "dueAt": "ISO-8601",
      "status": "string"
    }
  ],
  "retrievedAt": "ISO-8601"
}
```

Every field is a pass-through of values already computed and persisted by
the AIM pipeline (Phase 5). No mastery, weakness, score, or recommendation
is computed in this endpoint.

---

## 5. Child Assessments

### GET /api/v1/parent/children/:childId/assessments

**Guards:** Auth + Link + Consent(`assessment_view` | `full_access`)
**Response:** `ParentAssessmentSummaryEntity`

```json
{
  "childId": "uuid",
  "results": [
    {
      "resultId": "uuid",
      "attemptId": "uuid",
      "assessmentId": "uuid",
      "assessmentTitle": "string",
      "attemptNumber": 0,
      "score": 0,
      "maxScore": 0,
      "passed": true,
      "latePenaltyApplied": false,
      "gradedAt": "ISO-8601",
      "submittedAt": "ISO-8601 | null"
    }
  ],
  "upcomingAssessments": [
    {
      "assessmentId": "uuid",
      "assessmentTitle": "string",
      "deadlineId": "uuid",
      "opensAt": "ISO-8601",
      "closesAt": "ISO-8601",
      "extendedClosesAt": "ISO-8601 | null",
      "status": "string"
    }
  ],
  "retrievedAt": "ISO-8601"
}
```

Every field is a pass-through of values already computed and persisted by
the Phase 10 assessment pipeline. No score, pass/fail, or deadline status
is computed here.

---

## 6. Child Activity

### GET /api/v1/parent/children/:childId/activity

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Response:** `ParentActivitySummaryEntity`

```json
{
  "childId": "uuid",
  "recentSessions": [
    {
      "sessionId": "uuid",
      "itemsAttempted": 0,
      "itemsCorrect": 0,
      "skillsTouched": ["uuid"],
      "overallMasteryShift": "string",
      "closedOutAt": "ISO-8601 | null",
      "updatedAt": "ISO-8601"
    }
  ],
  "lastActiveAt": "ISO-8601 | null",
  "retrievedAt": "ISO-8601"
}
```

**Note:** this endpoint is gated on `progress_view` consent (not
`activity_view`), matching the underlying service's consent check. The
`activity_view` enum value exists in `PARENT_CONSENT_TYPES` for forward
compatibility but is not currently used by any endpoint.

---

## 7. Child Reports

### GET /api/v1/parent/children/:childId/reports

**Guards:** Auth + Link (any granted consent type satisfies access; see
`ParentReportService.getReportForParent`, which requires `progress_view`,
`assessment_view`, or `full_access`)
**Query params:** `period` — `weekly` (default) | `monthly`
**Response:** `ParentChildReportEntity`

```json
{
  "id": "string",
  "parentId": "uuid",
  "childId": "uuid",
  "reportType": "weekly | monthly",
  "generatedAt": "ISO-8601",
  "summary": "string",
  "dataUrl": null
}
```

`summary` is backend-composed text built from already-computed progress
and assessment counts. `dataUrl` is reserved for future export support and
is always `null` today.

---

## 8. Invitations

### POST /api/v1/parent/invitations

**Guards:** Auth
**Body:** `CreateParentInvitationRequestDto`

```json
{
  "childEmail": "string (required if childId omitted)",
  "childId": "uuid (required if childEmail omitted)",
  "relationshipType": "parent | guardian | other"
}
```

**Response:** `ParentInvitationEntity` (see shape below), `status: "pending"`.

### POST /api/v1/parent/invitations/accept

**Guards:** Auth (caller is the accepting child)
**Body:** `AcceptParentInvitationRequestDto`

```json
{ "invitationCode": "string" }
```

**Response:** `ParentInvitationEntity`, `status: "accepted"`. Establishes
an active `parent_child_link` as a side effect. Fails if the invitation
code is unknown, already used, or expired.

### POST /api/v1/parent/invitations/:invitationId/revoke

**Guards:** Auth (caller must be the invitation's owning parent)
**Response:** `ParentInvitationEntity`, `status: "cancelled"`.

### GET /api/v1/parent/invitations

**Guards:** Auth
**Response:** `ParentInvitationEntity[]` — all invitations created by the
authenticated parent.

**`ParentInvitationEntity` shape:**

```json
{
  "id": "uuid",
  "parentId": "uuid",
  "childEmail": "string | null",
  "childId": "uuid | null",
  "invitationCode": "string",
  "relationshipType": "parent | guardian | other",
  "status": "pending | accepted | rejected | expired | cancelled",
  "expiresAt": "ISO-8601",
  "acceptedAt": "ISO-8601 | null",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

Invitation codes are generated server-side (`crypto.randomBytes(16)`) and
expire 7 days after creation. The backend is the sole authority for
invitation status transitions.

---

## 9. Consent

Consent represents the child's own grant of visibility to a parent. Only
the **child party** of a parent-child link may grant or revoke consent on
that link; either party (parent or child) may read it.

### POST /api/v1/parent/consents

**Guards:** Auth (caller must be the child party of `parentChildLinkId`)
**Body:** `GrantParentConsentRequestDto`

```json
{
  "parentChildLinkId": "uuid",
  "consentType": "progress_view | assessment_view | activity_view | report_view | full_access"
}
```

**Response:** `ParentConsentEntity`, `status: "granted"`.

### POST /api/v1/parent/consents/revoke

**Guards:** Auth (caller must be the child party of `parentChildLinkId`)
**Body:** `RevokeParentConsentRequestDto` (same shape as grant)
**Response:** `ParentConsentEntity`, `status: "revoked"`. 404 if no active
consent of that type exists on the link.

### GET /api/v1/parent/links/:linkId/consents

**Guards:** Auth (caller must be the parent or child party of `linkId`)
**Response:** `ParentConsentEntity[]`

**`ParentConsentEntity` shape:**

```json
{
  "id": "uuid",
  "parentChildLinkId": "uuid",
  "consentType": "progress_view | assessment_view | activity_view | report_view | full_access",
  "status": "granted | revoked",
  "grantedAt": "ISO-8601",
  "revokedAt": "ISO-8601 | null",
  "grantedBy": "uuid",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

---

## 10. Notification Preferences

Preference storage only — no notification is ever sent by these endpoints
or their backing service. This is Phase 13 readiness storage.

### GET /api/v1/parent/notification-preferences

**Guards:** Auth
**Response:** `ParentNotificationPreferenceEntity[]` — all of the
authenticated parent's stored preferences.

### PATCH /api/v1/parent/notification-preferences

**Guards:** Auth
**Body:** `UpdateParentNotificationPreferenceRequestDto`

```json
{
  "channel": "email | sms | push",
  "category": "progress_update | assessment_result | deadline_reminder | weekly_summary | system_alert",
  "enabled": true
}
```

**Response:** `ParentNotificationPreferenceEntity` — the upserted row.

**`ParentNotificationPreferenceEntity` shape:**

```json
{
  "id": "uuid",
  "parentId": "uuid",
  "channel": "email | sms | push",
  "category": "progress_update | assessment_result | deadline_reminder | weekly_summary | system_alert",
  "enabled": true,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

---

## 11. Error Behavior

All endpoints use standard NestJS exception responses (no custom envelope):

```json
{
  "statusCode": 403,
  "message": "string",
  "error": "Forbidden"
}
```

| HTTP Status | Thrown by | Cause |
|---|---|---|
| 401 | `SupabaseJwtAuthGuard` | Missing or invalid JWT |
| 403 | `ParentChildAccessGuard` | No active link, or required consent not granted |
| 403 | Controller (`assertChildOwnsLink`, link-ownership checks) | Caller is not the child/parent party of the link |
| 404 | `ParentConsentService.revokeConsentByType` | No active consent of that type exists on the link |
| 400 | Invitation/consent services | Invalid state transition (e.g. revoking an already-revoked consent, accepting an expired invitation) |
| 422 | Global `ValidationPipe` | Request body/query fails DTO validation |

Child-scoped endpoints (`children/:childId/...`) return 403, not 404, for
both "child not linked" and "child does not exist" to avoid leaking which
child IDs are valid.

---

## 12. Out of scope

This contract intentionally omits a parent profile API and pagination —
neither has been implemented as of P12-039. The notification-sending logic
referenced in section 10 belongs to Phase 13 and is explicitly out of scope
here.
