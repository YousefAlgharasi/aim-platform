# Phase 6 — Student Mobile Data Flow Document

**Phase:** 6  
**Task:** P6-006  
**Status:** Active  
**Branch:** `phase6/P6-006-student-mobile-data-flow`  
**Dependency:** P6-003  
**Output:** `docs/phase-6/student-mobile-data-flow.md`

---

## 1. Purpose

This document maps every data flow in the Student Mobile App MVP: what data moves, in which direction, between which layers, and which backend endpoint owns each exchange. It is the authoritative reference for Flutter developers implementing network calls, state management, and UI rendering.

**Rule:** Flutter is a display layer. All data originates from the backend. Flutter never computes, infers, or derives learning values.

---

## 2. Architecture Layers

```
┌─────────────────────────────────────────┐
│            Flutter App                  │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │  Screen  │  │ Notifier │  │  Repo │  │
│  │   (UI)   │◄─│ /Cubit   │◄─│       │  │
│  └──────────┘  └──────────┘  └───┬───┘  │
│                                   │      │
│              core/network          │      │
│         (Dio + Auth Interceptor)  │      │
└───────────────────────────────────┼──────┘
                                    │ HTTPS / JWT
                          ┌─────────▼──────────┐
                          │   NestJS Backend    │
                          │   (source of truth) │
                          └─────────┬───────────┘
                                    │
                          ┌─────────▼──────────┐
                          │  AIM Engine + DB    │
                          │  (Supabase/Postgres)│
                          └────────────────────┘
```

---

## 3. Data Flow: Authentication

### 3.1 Login

```
Flutter Login Screen
  │── [user enters email + password] ──►
  │
  ▼
Auth Repository
  │── POST /auth/login (Supabase Auth via backend)
  │◄── { access_token, refresh_token, expires_in }
  │
  ▼
Secure Storage (flutter_secure_storage)
  │── store: access_token, refresh_token
  │
  ▼
Auth Gate / Router
  │── redirect to Home Screen
```

**What Flutter stores:** JWT access token + refresh token (secure storage only).  
**What Flutter never stores:** user scores, computed roles, permissions.  
**Security invariant:** `student_id` is always extracted server-side from the JWT. Flutter never sends `student_id` as a body parameter.

---

### 3.2 Auth Gate Check (App Launch)

```
App Launch
  │── read access_token from secure storage
  │
  ├─► [token present + valid] ──► GET /auth/me
  │       ◄── { id, email, name, role }
  │       ──► Home Screen
  │
  └─► [token absent or expired] ──► Login Screen
```

---

### 3.3 Token Refresh

```
Any API call (401 Unauthorized)
  │
  ▼
Auth Interceptor (core/network)
  │── POST /auth/refresh  { refresh_token }
  │◄── { access_token, expires_in }
  │── update stored access_token
  │── retry original request
  │
  └─► [refresh fails] ──► clear storage ──► Login Screen
```

---

## 4. Data Flow: Placement Test

### 4.1 Check Eligibility & Start Attempt

```
Placement Section Screen
  │── GET /placement/active
  │◄── { isActive, retakeAllowed, existingAttemptId? }
  │
  ├─► [retake not allowed] ──► show backend message ──► Home
  │
  └─► [eligible] ──► POST /placement/attempts
          ◄── { attemptId, sections[] }
          ──► Section List Screen
```

---

### 4.2 Fetch Sections & Questions

```
Section Screen
  │── GET /placement/sections
  │◄── { sections: [{ id, name, order, questionCount }] }
  │
  ▼
Question Screen (per section)
  │── GET /placement/questions?sectionId=:id&attemptId=:id
  │◄── { questions: [{ id, type, prompt, options[] }] }
  │
  │  NOTE: options[] never contains is_correct or correct_answer.
  │  Flutter renders what the backend sends — nothing more.
```

---

### 4.3 Submit Answers (Per Question)

```
Question Screen — user selects answer
  │── POST /placement/attempts/:attemptId/answers
  │     body: { questionId, selectedOptionId | textAnswer }
  │◄── { accepted: true }   (no correctness feedback during test)
  │
  ▼
Next question / next section
```

---

### 4.4 Complete Attempt & Poll for Result

```
Final Question Submitted
  │── POST /placement/attempts/:attemptId/complete
  │◄── { status: "scoring" | "complete" }
  │
  ├─► [status: "scoring"] ──► poll GET /placement/attempts/:attemptId/result
  │       ◄── { status: "scoring" }  ──► wait + retry
  │
  └─► [status: "complete"]
          GET /placement/attempts/:attemptId/result
          ◄── {
                overallBand,          // CEFR label from backend
                sectionResults: [{ sectionName, band }],
                strengths: [...],
                weaknesses: [...],
                recommendedPath: { ... }
              }
          ──► Placement Result Screen (display only)
```

**Flutter never calculates:** CEFR band, section scores, strengths/weaknesses, or recommended path.  
**Flutter never persists:** `overallBand` or scoring data as durable Flutter state.

---

## 5. Data Flow: Home Screen

```
Home Screen (on mount)
  │── GET /auth/me
  │◄── { id, name, email }
  │
  │── GET /aim/students/:studentId/skill-states
  │◄── { skills: [{ topic, band, masteryLevel }] }
  │
  │── GET /aim/students/:studentId/weakness-records
  │◄── { weaknesses: [{ topic, severity, lastUpdated }] }
  │
  │── GET /aim/students/:studentId/review-schedules
  │◄── { upcoming: [{ topic, dueAt, priority }] }
  │
  ▼
Render:
  - Student name (from /auth/me)
  - Skill state summary cards (from backend)
  - Weakness highlight strip (from backend)
  - Upcoming review reminders (from backend)
```

**Flutter never computes:** mastery level, weakness severity, or review priority.  
**All labels and values are rendered as returned by the backend.**

---

## 6. Data Flow: Learning Plan Screen

```
Learning Plan Screen (on mount)
  │── GET /aim/students/:studentId/skill-states
  │◄── { skills: [{ topic, band, masteryLevel, coveragePercent }] }
  │
  │── GET /aim/students/:studentId/weakness-records
  │◄── { weaknesses: [{ topic, severity, recommendedFocus }] }
  │
  ▼
Render:
  - Full topic list with backend-provided band and coverage %
  - Weakness details with backend-provided labels
  - Recommended focus areas from backend
```

---

## 7. Data Flow: Course / Session Flow

### 7.1 Course List

```
Course List Screen (on mount)
  │── GET /sessions (or equivalent course endpoint)
  │◄── { courses: [{ id, title, topic, level, sessionCount }] }
  │
  ▼
Render course cards — display only
```

---

### 7.2 Start Session

```
Session Entry Screen — user taps "Start"
  │── POST /sessions/start
  │     body: { courseId }
  │◄── { sessionId, firstQuestion: { id, type, prompt, options[] } }
  │
  ▼
Question Screen
```

---

### 7.3 Answer Submission & Feedback

```
Question Screen — user selects answer
  │── POST /sessions/:sessionId/attempt
  │     body: { questionId, selectedOptionId | textAnswer }
  │◄── {
  │       isLastQuestion,
  │       feedback: {
  │         isCorrect,          // shown to user AFTER submission
  │         explanation,
  │         correctOption       // revealed post-submission
  │       },
  │       nextQuestion?: { id, type, prompt, options[] }
  │     }
  │
  ▼
Feedback Container (display backend values)
  │── show isCorrect indicator
  │── show explanation text
  │── show correct option highlight
  │── [if not last] ──► next question
  │── [if last] ──► session complete flow
```

**Note:** `isCorrect` here is backend-returned post-submission feedback for display. Flutter never calculates it. The backend owns correctness determination.

---

### 7.4 Session Summary

```
Session Complete
  │── Backend returns session summary in final attempt response
  │   (or GET /aim/students/:studentId/sessions/:sessionId/state)
  │◄── {
  │       sessionId,
  │       questionsAttempted,
  │       correctCount,          // backend-computed
  │       bandAchieved,          // backend-computed
  │       aimsUpdated: [...],    // AIM pipeline output
  │       recommendations: [...] // AIM pipeline output
  │     }
  │
  ▼
Session Summary Screen (display only)
  - Score from backend
  - Band from backend
  - AIM recommendations from backend
```

---

## 8. Data Flow: AIM Output Display

AIM outputs (skill states, weaknesses, recommendations, review schedules) follow a single read pattern:

```
Flutter Screen (on mount or refresh)
  │── GET /aim/students/:studentId/<resource>
  │◄── backend-computed AIM data
  │
  ▼
Render as-is — no transformation, no re-computation
```

**Resources:**

| Resource | Endpoint |
|---|---|
| Skill states | `GET /aim/students/:studentId/skill-states` |
| Weakness records | `GET /aim/students/:studentId/weakness-records` |
| Review schedules | `GET /aim/students/:studentId/review-schedules` |
| Session state | `GET /aim/students/:studentId/sessions/:sessionId/state` |

---

## 9. Error & Loading State Flows

All network calls follow this state lifecycle managed by the repository/notifier layer:

```
Repository triggers request
  │
  ├─► Loading state ──► UI shows AIM loading widget
  │
  ├─► Success ──► UI renders data
  │
  ├─► 401 Unauthorized ──► Auth interceptor refreshes token or redirects to login
  │
  ├─► 403 Forbidden ──► UI shows permission error (e.g. retake not allowed)
  │
  ├─► 404 Not Found ──► UI shows empty state widget
  │
  └─► 5xx / Network Error ──► UI shows error widget with retry action
```

Error and loading widgets come from the AIM Mobile Design System — never improvised inline.

---

## 10. Data Invariants

| Invariant | Rule |
|---|---|
| `student_id` | Never sent by Flutter as a body param; always derived server-side from JWT |
| `is_correct` (during test) | Never returned to Flutter during placement; only revealed post-submission in sessions |
| `correct_answer` | Never stored or cached by Flutter |
| `overallScore` | Never persisted; display only from backend response |
| AIM outputs | Always fetched from backend; never computed or cached in Flutter |
| Scoring | Always backend-only — `placement-scoring.service.ts` owns this |
| CEFR band | Always backend-only — AIM Engine output |
| Mastery / weakness labels | Always backend-only — AIM pipeline output |

---

## 11. Flutter State Management Summary

| Screen | Data fetched | Provider pattern |
|---|---|---|
| Login | None (user input only) | `StateNotifierProvider.autoDispose` |
| Home | `/auth/me`, skill-states, weaknesses, review-schedules | `StateNotifierProvider.autoDispose` |
| Placement Sections | `/placement/sections`, `/placement/active` | `StateNotifierProvider.autoDispose` |
| Placement Questions | `/placement/questions` | `StateNotifierProvider.autoDispose` |
| Placement Result | `/placement/attempts/:id/result` (poll) | `StateNotifierProvider.autoDispose` |
| Learning Plan | skill-states, weakness-records | `StateNotifierProvider.autoDispose` |
| Course List | `/sessions` or course endpoint | `StateNotifierProvider.autoDispose` |
| Session Questions | `/sessions/:id/attempt` | `StateNotifierProvider.autoDispose` |
| Session Summary | AIM session state | `StateNotifierProvider.autoDispose` |

All providers use `autoDispose`. Loading/success/error is represented via sealed state classes. Data loading is triggered via `addPostFrameCallback` in `ConsumerStatefulWidget`.

---

## 12. References

- MVP Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- Scope Boundaries: `docs/phase-6/mobile-mvp-scope-boundaries.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md`
- No Client AIM/AI Rule: `docs/phase-6/no-client-aim-ai-rule.md`
- Placement Controller: `services/backend-api/src/features/placement/placement.controller.ts`
- Sessions Controller: `services/backend-api/src/features/sessions/sessions.controller.ts`
- AIM Result Controller: `services/backend-api/src/features/aim/result/aim-result.controller.ts`
- Auth Controller: `services/backend-api/src/auth/auth.controller.ts`

---

*Data flow document created: P6-006 | Branch: phase6/P6-006-student-mobile-data-flow*
