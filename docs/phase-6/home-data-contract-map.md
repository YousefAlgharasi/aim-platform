# Phase 6 — Home Screen Data Contract Map

**Phase:** 6
**Task:** P6-058
**Status:** Active
**Branch:** `phase6/P6-058-flutter-home-contract-map`
**Dependency:** P5-071, P5-072
**Output:** `docs/phase-6/home-data-contract-map.md`

---

## 1. Purpose

This document is the definitive data contract reference for the Flutter **Home Screen** feature module (`features/home`). It specifies:

- Every backend endpoint the Home Screen consumes.
- The exact request shape, response shape, and field-level contract for each endpoint.
- Which fields are rendered and how Flutter must treat them.
- What Flutter is forbidden from computing, caching, or deriving.

**Authoritative rule:** The Home Screen is a display layer. All data originates from the backend. Flutter renders values as returned — no transformation, no inference, no local computation.

---

## 2. Home Screen Data Requirements

The Home Screen requires five data loads on mount:

| # | Data Need | Source Endpoint | Notes |
|---|---|---|---|
| 1 | Student identity (name) | `GET /auth/me` | Reuse cached value from auth gate if available |
| 2 | Student profile (avatar, display name) | `GET /profile/me` | Optional avatar display |
| 3 | Skill state summary | `GET /aim/students/:studentId/skill-states` | Backend-computed; display only |
| 4 | Weakness records | `GET /aim/students/:studentId/weakness-records` | Backend-computed; display only |
| 5 | Review schedule | `GET /aim/students/:studentId/review-schedules` | Backend-computed; display only |
| 6 | Recommendations | `GET /aim/students/:studentId/recommendations` | Backend-computed; display only |

All six loads are initiated in parallel after the auth gate confirms a valid session.

---

## 3. Endpoint Contracts

### 3.1 `GET /auth/me`

**Purpose:** Confirm valid session and fetch student identity.

**Request:**
```
GET /auth/me
Authorization: Bearer <access_token>
```

**Response contract:**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "role": "STUDENT"
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `id` | Resolve `studentId` for AIM endpoints | Store in HomeState; never sent as body param |
| `name` | Greeting header display | Render as-is |
| `role` | Guard check (confirm STUDENT) | Do not derive permissions from this in Flutter |

**Fields Flutter must ignore:**
- `email` — not displayed on home in MVP.

---

### 3.2 `GET /profile/me`

**Purpose:** Fetch richer profile data for home header.

**Request:**
```
GET /profile/me
Authorization: Bearer <access_token>
```

**Response contract:**
```json
{
  "id": "uuid",
  "displayName": "string",
  "avatarUrl": "string | null",
  "email": "string"
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `displayName` | Greeting display (preferred over `name` from `/auth/me`) | Render as-is |
| `avatarUrl` | Avatar widget in header | Render as-is; show placeholder if null |

**Flutter rule:** Profile editing (`PATCH /profile/me`) is out-of-scope for MVP. The Home Screen only reads profile data.

---

### 3.3 `GET /aim/students/:studentId/skill-states`

**Purpose:** Fetch backend-computed skill state summary for display cards.

**Request:**
```
GET /aim/students/:studentId/skill-states
Authorization: Bearer <access_token>
```

**Path parameter:**
- `:studentId` — taken from stored profile (resolved from JWT server-side). Never accepted from user input.

**Response contract:**
```json
{
  "skills": [
    {
      "topic": "string",
      "band": "string",
      "masteryLevel": "string",
      "coveragePercent": "number"
    }
  ]
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `topic` | Skill card label | Render as-is |
| `band` | CEFR band display (e.g. "B1") | Render as-is; never compute or map locally |
| `masteryLevel` | Mastery label (e.g. "Developing") | Render as-is; never derive from `band` |
| `coveragePercent` | Progress indicator | Render as-is; never compute locally |

**Flutter invariants:**
- Never compute `band` or `masteryLevel` from other fields.
- Never rank or sort skills in Flutter — display in order returned by backend.
- Home Screen shows a summary subset (e.g. top 3 skills); use the first N items returned. Do not filter by score.

---

### 3.4 `GET /aim/students/:studentId/weakness-records`

**Purpose:** Fetch backend-computed weakness records for the weakness highlight strip.

**Request:**
```
GET /aim/students/:studentId/weakness-records
Authorization: Bearer <access_token>
```

**Response contract:**
```json
{
  "weaknesses": [
    {
      "topic": "string",
      "severity": "string",
      "lastUpdated": "ISO8601 datetime string",
      "recommendedFocus": "string"
    }
  ]
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `topic` | Weakness strip label | Render as-is |
| `severity` | Severity badge display | Render as-is; never reclassify |
| `lastUpdated` | Freshness indicator | Format for display; never recompute severity from date |
| `recommendedFocus` | Focus label | Render as-is |

**Flutter invariants:**
- Never compute `severity` from `lastUpdated` or any other field.
- Never sort weaknesses by severity in Flutter — use backend order.
- Home Screen shows a strip of top weaknesses; display first N items returned.

---

### 3.5 `GET /aim/students/:studentId/review-schedules`

**Purpose:** Fetch backend-computed upcoming review reminders.

**Request:**
```
GET /aim/students/:studentId/review-schedules
Authorization: Bearer <access_token>
```

**Response contract:**
```json
{
  "upcoming": [
    {
      "topic": "string",
      "dueAt": "ISO8601 datetime string",
      "priority": "string"
    }
  ]
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `topic` | Review reminder label | Render as-is |
| `dueAt` | Due date/time display | Format for display (e.g. "Due today", "Due in 2 days"); never compute priority from date |
| `priority` | Priority badge | Render as-is; never reclassify |

**Flutter invariants:**
- Never compute whether an item is "overdue" or "urgent" from `dueAt` — only format the date string for display.
- Never sort review schedules in Flutter — use backend order.
- Home Screen shows upcoming reviews; display items returned by backend.

---

### 3.6 `GET /aim/students/:studentId/recommendations`

**Purpose:** Fetch backend-computed recommendations.

**Request:**
```
GET /aim/students/:studentId/recommendations
Authorization: Bearer <access_token>
```

**Response contract:**
```json
{
  "recommendations": [
    {
      "topic": "string",
      "action": "string",
      "reason": "string"
    }
  ]
}
```

**Fields used by Home Screen:**

| Field | Used for | Flutter rule |
|---|---|---|
| `topic` | Recommendation card label | Render as-is |
| `action` | Call-to-action text | Render as-is |
| `reason` | Explanation label | Render as-is |

**Flutter invariants:**
- Never generate, reorder, or filter recommendations in Flutter.
- Display first N items returned.

---

## 4. Load Sequence and State Model

### 4.1 Load Sequence

```
Home Screen mount
  │
  ├── [if auth cache valid] reuse cached { id, name } from auth gate
  │
  ├── parallel fetches:
  │     ├── GET /profile/me
  │     ├── GET /aim/students/:studentId/skill-states
  │     ├── GET /aim/students/:studentId/weakness-records
  │     ├── GET /aim/students/:studentId/review-schedules
  │     └── GET /aim/students/:studentId/recommendations
  │
  └── when all resolve → render Home layout
```

### 4.2 HomeState Fields

```dart
// Conceptual state model — implementation in P6-059 (models)
class HomeState {
  final AsyncValue<ProfileData> profile;
  final AsyncValue<List<SkillState>> skillStates;
  final AsyncValue<List<WeaknessRecord>> weaknesses;
  final AsyncValue<List<ReviewScheduleItem>> reviewSchedules;
  final AsyncValue<List<Recommendation>> recommendations;
}
```

Each field is an `AsyncValue` (or equivalent sealed state) that independently tracks loading / data / error. The Home Screen renders each section independently — a failure in one section does not block others.

---

## 5. Flutter Authority Boundary

The following are **backend responsibilities**. Flutter must never compute, infer, or derive these values:

| Value | Owner | Flutter rule |
|---|---|---|
| `masteryLevel` | AIM Engine → Backend | Display as returned |
| `band` (CEFR) | AIM Engine → Backend | Display as returned |
| `severity` (weakness) | AIM Engine → Backend | Display as returned |
| `priority` (review) | AIM Engine → Backend | Display as returned |
| `coveragePercent` | AIM Engine → Backend | Display as returned |
| Recommendation generation | AIM Engine → Backend | Display as returned |
| Review schedule generation | AIM Engine → Backend | Display as returned |
| `studentId` resolution | Backend (JWT) | Read from stored profile; never from user input |

---

## 6. Forbidden Actions

| Action | Why forbidden |
|---|---|
| Compute skill band from question history | Backend authority |
| Compute mastery level from coverage percent | Backend authority |
| Reclassify weakness severity | Backend authority |
| Reorder AIM outputs | Backend authority |
| Cache AIM outputs as durable Flutter state across sessions | AIM data is session-volatile; always refetch on mount |
| Call AIM Engine URL directly | Flutter must only call the NestJS backend |
| Call any AI provider directly | Forbidden per no-client-aim-ai-rule.md |
| Hard-code `studentId` | Always resolve from JWT-decoded profile |

---

## 7. Error and Loading Behavior

| State | Home Screen behavior |
|---|---|
| Loading (any section) | Show AIM loading widget in that section; other sections render independently |
| 401 Unauthorized | Auth interceptor handles token refresh; redirect to login if refresh fails |
| 403 Forbidden | Show permission error widget (unlikely for read endpoints) |
| 404 Not Found | Show empty state widget for that section |
| 5xx / Network error | Show error widget with retry action for that section |

All loading, empty, and error widgets come from the AIM Mobile Design System. No inline improvised states.

---

## 8. RTL / Arabic Layout Notes

The Home Screen must support RTL layout. Contract-specific notes:

| Field | RTL rule |
|---|---|
| `topic` labels | Text direction follows locale (Arabic: RTL) |
| `band` value | Render in LTR inline context (CEFR labels are Latin) |
| `dueAt` formatted string | Follow locale date format; Arabic uses Eastern Arabic numerals if locale is `ar` |
| `severity` badge | Icon mirrors for RTL if directional icons are used |
| Card layout | Leading/trailing swap in RTL — use `start`/`end` semantics, never `left`/`right` |
| Skill progress bar | Fills from trailing edge in RTL |

---

## 9. Sequence Diagram

```
Flutter Home Feature
        │
        ├─── GET /profile/me ──────────────────────────► Backend
        │                                        ◄──── { displayName, avatarUrl }
        │
        ├─── GET /aim/.../skill-states ────────────────► Backend
        │                                        ◄──── { skills: [...] }
        │
        ├─── GET /aim/.../weakness-records ────────────► Backend
        │                                        ◄──── { weaknesses: [...] }
        │
        ├─── GET /aim/.../review-schedules ────────────► Backend
        │                                        ◄──── { upcoming: [...] }
        │
        └─── GET /aim/.../recommendations ────────────► Backend
                                                 ◄──── { recommendations: [...] }

All responses → HomeState (AsyncValue per section) → Home Page widgets
```

---

## 10. References

- Data Flow Document: `docs/phase-6/student-mobile-data-flow.md`
- API Consumption Map: `docs/phase-6/mobile-api-consumption-map.md`
- Scope Boundaries: `docs/phase-6/mobile-mvp-scope-boundaries.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md`
- No Client AIM/AI Rule: `docs/phase-6/no-client-aim-ai-rule.md`
- Theme Token Map: `docs/phase-6/theme-token-map.md`
- P5-071 (Recommendation Read API): `services/backend-api/src/features/aim/result/recommendation-read.service.ts`
- P5-072 (Review Schedule Read API): `services/backend-api/src/features/aim/result/review-schedule-read.service.ts`
- AIM Result Controller: `services/backend-api/src/features/aim/result/aim-result.controller.ts`

---

*Home data contract map created: P6-058 | Branch: phase6/P6-058-flutter-home-contract-map*
