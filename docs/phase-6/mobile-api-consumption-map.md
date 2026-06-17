# Phase 6 — Mobile API Consumption Map

**Phase:** 6  
**Task:** P6-007  
**Status:** Active  
**Branch:** `phase6/P6-007-mobile-api-consumption-map`  
**Dependency:** P6-006  
**Output:** `docs/phase-6/mobile-api-consumption-map.md`

---

## 1. Purpose

This document maps every Flutter screen and feature in the Student Mobile App MVP to the exact backend API endpoints it consumes. It is the authoritative reference for:

- Which endpoints each Flutter feature module must call.
- The HTTP method, path, request shape, and response shape for each call.
- Which endpoints are explicitly forbidden from Flutter.
- Which curriculum/admin endpoints are out-of-scope for Flutter entirely.

Flutter must never call an endpoint not listed in this map. If a required data need is not covered, raise it as a missing API before implementing client-side logic.

---

## 2. API Base URL

All endpoints are relative to the backend base URL, configured in `core/network` via environment variable. No URL is hard-coded in feature code.

```
Base: https://<backend-host>/api/v1
```

---

## 3. Endpoint Master Table

### 3.1 Auth

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| App launch / Auth Gate | `GET` | `/auth/me` | — (JWT header) | `{ id, email, name, role }` | Validates session; redirects if 401 |
| Post-login bootstrap | `POST` | `/auth/bootstrap` | — (JWT header) | `{ studentId, profileCreated }` | Call once after first login |
| Token refresh (interceptor) | `POST` | `/auth/refresh` | `{ refresh_token }` | `{ access_token, expires_in }` | Handled by core interceptor, not feature code |

> **Login / logout** are handled by Supabase Auth client SDK (not a backend REST call). The JWT returned by Supabase is attached to all backend calls via the auth interceptor.

---

### 3.2 Profile

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Home / nav header | `GET` | `/profile/me` | — (JWT header) | `{ id, displayName, avatarUrl, email }` | Read-only in MVP; profile editing is out-of-scope |

> `PATCH /profile/me` is **out-of-scope for Phase 6 MVP**. Do not call it from Flutter.

---

### 3.3 Placement Test

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Placement entry | `GET` | `/placement/active` | — | `{ isActive, retakeAllowed, existingAttemptId? }` | Check eligibility before showing start button |
| Start attempt | `POST` | `/placement/attempts` | — | `{ attemptId, sections[] }` | Creates attempt server-side |
| Fetch sections | `GET` | `/placement/sections` | `?attemptId=:id` | `{ sections: [{ id, name, order, questionCount }] }` | — |
| Fetch questions | `GET` | `/placement/questions` | `?sectionId=:id&attemptId=:id` | `{ questions: [{ id, type, prompt, options[] }] }` | `options[]` never contains `is_correct` or `correct_answer` |
| Submit answer | `POST` | `/placement/attempts/:attemptId/answers` | `{ questionId, selectedOptionId \| textAnswer }` | `{ accepted: true }` | No correctness feedback during test |
| Complete attempt | `POST` | `/placement/attempts/:attemptId/complete` | — | `{ status: "scoring" \| "complete" }` | Triggers backend scoring pipeline |
| Poll / fetch result | `GET` | `/placement/attempts/:attemptId/result` | — | `{ overallBand, sectionResults[], strengths[], weaknesses[], recommendedPath }` | Poll until `status: "complete"` |

---

### 3.4 Home Screen

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Student identity | `GET` | `/auth/me` | — | `{ id, name }` | Shared with auth gate; can reuse cached value |
| Skill state summary | `GET` | `/aim/students/:studentId/skill-states` | — | `{ skills: [{ topic, band, masteryLevel }] }` | `studentId` from JWT server-side; pass from stored profile |
| Weakness strip | `GET` | `/aim/students/:studentId/weakness-records` | — | `{ weaknesses: [{ topic, severity, lastUpdated }] }` | — |
| Review reminders | `GET` | `/aim/students/:studentId/review-schedules` | — | `{ upcoming: [{ topic, dueAt, priority }] }` | — |
| Recommendations | `GET` | `/aim/students/:studentId/recommendations` | — | `{ recommendations: [{ topic, action, reason }] }` | — |

---

### 3.5 Learning Plan Screen

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Full skill state list | `GET` | `/aim/students/:studentId/skill-states` | — | `{ skills: [{ topic, band, masteryLevel, coveragePercent }] }` | Same endpoint as home; full payload |
| Weakness details | `GET` | `/aim/students/:studentId/weakness-records` | — | `{ weaknesses: [{ topic, severity, recommendedFocus }] }` | — |
| Recommendations | `GET` | `/aim/students/:studentId/recommendations` | — | `{ recommendations: [{ topic, action, reason }] }` | — |

---

### 3.6 Course List Screen

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Course list | `GET` | `/curriculum/courses` | `?status=published&page=1&limit=20` | `{ data: [{ id, title, topic, level }], total, page }` | Student-facing; filter by `status=published` only |

> Only read `GET /curriculum/courses` and `GET /curriculum/courses/:id`. All write/admin curriculum endpoints (`POST`, `PATCH`) are **out-of-scope and forbidden** in Flutter.

---

### 3.7 Session Flow

| Screen / Feature | Method | Path | Request | Response (key fields) | Notes |
|---|---|---|---|---|---|
| Start session | `POST` | `/sessions/start` | `{ courseId \| lessonId }` | `{ sessionId, firstQuestion: { id, type, prompt, options[] } }` | — |
| Submit answer | `POST` | `/sessions/:sessionId/attempt` | `{ questionId, selectedOptionId \| textAnswer }` | `{ isLastQuestion, feedback: { isCorrect, explanation, correctOption }, nextQuestion? }` | `isCorrect` revealed post-submission for display only |
| Session state / summary | `GET` | `/aim/students/:studentId/sessions/:sessionId/state` | — | `{ questionsAttempted, correctCount, bandAchieved, aimsUpdated[], recommendations[] }` | Backend-computed; display only |

---

### 3.8 AIM Output Reads (Shared Pattern)

All AIM reads follow the same pattern: fetch on mount, display as-is, never transform or cache as durable state.

| Endpoint | Used by |
|---|---|
| `GET /aim/students/:studentId/skill-states` | Home, Learning Plan |
| `GET /aim/students/:studentId/weakness-records` | Home, Learning Plan |
| `GET /aim/students/:studentId/review-schedules` | Home |
| `GET /aim/students/:studentId/recommendations` | Home, Learning Plan |
| `GET /aim/students/:studentId/sessions/:sessionId/state` | Session Summary |

---

## 4. Forbidden Endpoints

The following endpoints exist in the backend but **must never be called from Flutter**:

| Endpoint | Reason |
|---|---|
| `POST /curriculum/*` | Admin/content management — not student-facing |
| `PATCH /curriculum/*` | Admin/content management — not student-facing |
| `DELETE /curriculum/*` | Admin/content management — not student-facing |
| `GET /curriculum/audit-logs` | Admin only |
| `GET /admin/*` | Admin only |
| `POST /admin/*` | Admin only |
| `PATCH /profile/me` | Profile editing is out-of-scope for MVP |
| AIM Engine direct calls | AIM Engine is backend-internal; no public URL exposed to Flutter |
| Any AI provider (OpenAI, Anthropic, etc.) | Forbidden from Flutter — backend-only |

---

## 5. Request / Response Invariants

| Invariant | Rule |
|---|---|
| `student_id` in path | Read from stored JWT-decoded profile; never accepted as user input |
| Authentication | Every request carries `Authorization: Bearer <access_token>` header, set by core interceptor |
| `is_correct` during placement | Never returned — backend withholds during active test |
| `correct_answer` | Never returned in any endpoint response to Flutter |
| `overallScore` raw value | Not persisted in Flutter state; displayed from response then discarded |
| Pagination | Use `page` and `limit` query params as provided; never compute offsets in Flutter |
| Error handling | 401 → token refresh → retry; 403 → show permission error; 404 → empty state; 5xx → error widget + retry |

---

## 6. Flutter Feature → Endpoint Mapping Summary

| Flutter Feature Module | Endpoints Consumed |
|---|---|
| `features/auth` | `GET /auth/me`, `POST /auth/bootstrap` |
| `features/placement` | `GET /placement/active`, `POST /placement/attempts`, `GET /placement/sections`, `GET /placement/questions`, `POST /placement/attempts/:id/answers`, `POST /placement/attempts/:id/complete`, `GET /placement/attempts/:id/result` |
| `features/home` | `GET /auth/me`, `GET /aim/students/:id/skill-states`, `GET /aim/students/:id/weakness-records`, `GET /aim/students/:id/review-schedules`, `GET /aim/students/:id/recommendations` |
| `features/learning_plan` | `GET /aim/students/:id/skill-states`, `GET /aim/students/:id/weakness-records`, `GET /aim/students/:id/recommendations` |
| `features/courses` | `GET /curriculum/courses`, `GET /curriculum/courses/:id` |
| `features/sessions` | `POST /sessions/start`, `POST /sessions/:id/attempt`, `GET /aim/students/:id/sessions/:id/state` |
| `core/network` | Token refresh: `POST /auth/refresh` (interceptor only) |

---

## 7. What Flutter Must Not Implement

- No REST client outside of `core/network`.
- No endpoint URL strings in feature code — all paths defined in a central API constants file.
- No response transformation that derives or computes learning values.
- No direct HTTP calls to AIM Engine service URL.
- No API keys or secrets in Flutter source.

---

## 8. References

- Data Flow Document: `docs/phase-6/student-mobile-data-flow.md`
- Scope Boundaries: `docs/phase-6/mobile-mvp-scope-boundaries.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md`
- No Client AIM/AI Rule: `docs/phase-6/no-client-aim-ai-rule.md`
- Placement Controller: `services/backend-api/src/features/placement/placement.controller.ts`
- Sessions Controller: `services/backend-api/src/features/sessions/sessions.controller.ts`
- AIM Result Controller: `services/backend-api/src/features/aim/result/aim-result.controller.ts`
- Auth Controller: `services/backend-api/src/auth/auth.controller.ts`
- Profile Controller: `services/backend-api/src/features/profile/profile.controller.ts`
- Courses Controller: `services/backend-api/src/features/curriculum/courses/courses.controller.ts`

---

*API consumption map created: P6-007 | Branch: phase6/P6-007-mobile-api-consumption-map*
