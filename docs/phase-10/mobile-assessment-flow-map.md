# Mobile Assessment Flow Map

> Phase 10 — P10-005
> Scope: Student-facing quiz and exam screens in the Flutter mobile app.

---

## 1. Purpose

This document maps every student-facing screen, navigation transition, and backend API call involved in the Phase 10 quiz/exam experience on Flutter mobile.

It is a **guide for Flutter implementation only**. It does not introduce local authority. Every assessment state shown on screen — deadline status, attempt eligibility, score, pass/fail, result breakdown — must originate from a backend API response. Flutter must not compute, derive, or cache any of these values locally.

See `docs/phase-10/assessment-authority-rules.md` for the binding rule set and `docs/phase-10/assessment-api-contract-map.md` for full endpoint specifications.

---

## 2. Screen Inventory

| Screen ID | Screen Name | Purpose |
|-----------|-------------|---------|
| S-01 | Assessment List | Show available quizzes/exams with deadline status |
| S-02 | Assessment Detail | Show sections, settings summary, attempt history |
| S-03 | Deadline Status | Show backend-derived deadline label and countdown |
| S-04 | Attempt Gate | Backend decides eligibility; Flutter shows result |
| S-05 | Quiz/Exam Session | Deliver questions, collect draft answers |
| S-06 | Answer Review | Allow student to review draft answers before submit |
| S-07 | Submission Confirmation | Confirm intent to submit attempt |
| S-08 | Grading Pending | Show loading state while backend grades |
| S-09 | Result Summary | Display backend-returned score, pass/fail, feedback |
| S-10 | Result Breakdown | Display per-question feedback (when backend allows) |
| S-11 | Assessment History | List past attempt results for the student |
| S-12 | Error / Blocked State | Surface backend error codes (max attempts, deadline closed, etc.) |

---

## 3. Flow Diagrams

### 3.1 Assessment Discovery and Entry

```
App Home / Dashboard
        │
        ▼
[S-01] Assessment List
  API: GET /assessments
  Displays: id, type, title, description, deadlineStatus
  Flutter must not: compute deadlineStatus from timestamps
        │
        ├─► [S-02] Assessment Detail (tap an assessment)
        │     API: GET /assessments/:id
        │     Displays: sections, maxAttempts, timeLimitSeconds
        │     Flutter must not: compute eligibility from maxAttempts
        │           │
        │           ├─► [S-03] Deadline Status (tap deadline info)
        │           │     API: GET /assessments/:id/deadline
        │           │     Displays: opensAt, closesAt, status label
        │           │     Flutter renders countdown from timestamps;
        │           │     must display `status` field as-is (never recompute)
        │           │     └─► Back to [S-02]
        │           │
        │           └─► [S-04] Attempt Gate (tap "Start" or "Continue")
        │                 (See §3.2)
        │
        └─► [S-11] Assessment History (tap "My Results")
              API: GET /assessments/results
              (See §3.5)
```

---

### 3.2 Attempt Gate (Eligibility Check)

Flutter calls the backend and renders whatever state is returned. It must never decide eligibility locally.

```
[S-04] Attempt Gate
  Flutter action: POST /assessments/:id/attempts
                  OR POST /assessments/:id/attempts/:attemptId/resume
        │
        ├─► 201 Created (new attempt started)
        │     → Navigate to [S-05] Quiz/Exam Session
        │
        ├─► 200 OK (attempt resumed)
        │     → Navigate to [S-05] Quiz/Exam Session
        │
        ├─► 409 MAX_ATTEMPTS_REACHED
        │     → Navigate to [S-12] Error / Blocked State
        │           Message: "You have reached the maximum number of attempts."
        │           Flutter must not compute this from attempt history
        │
        ├─► 409 DEADLINE_CLOSED
        │     → Navigate to [S-12] Error / Blocked State
        │           Message: "This assessment is no longer accepting submissions."
        │           Flutter must not compute this from timestamp comparison
        │
        └─► 404 ASSESSMENT_NOT_FOUND
              → Navigate to [S-12] Error / Blocked State
```

---

### 3.3 Quiz/Exam Session

```
[S-05] Quiz/Exam Session
  API on enter: GET /assessments/:id/questions?attemptId=:attemptId
  Displays: question prompt, type, options
  Flutter must not: receive or store correctOptionId, points, sectionWeight

  Per-question interaction:
    Student selects an option
    → Flutter stores draft selection in local state only (not persisted as correct)
    → Student taps "Submit Answer"
         API: POST /attempts/:attemptId/answers
              body: { assessmentQuestionLinkId, responseValue }
         Response: answerId, submittedAt (no isCorrect, no points)
         Flutter must not: infer correctness from response latency, response shape,
                           or any other signal

  Navigation within session:
    ├─► Next Question   → stay on [S-05], advance question index
    ├─► Previous Question → stay on [S-05], go back (draft state preserved)
    ├─► "Review Answers" → Navigate to [S-06] Answer Review
    └─► Timer expires   → Backend enforces; Flutter may show countdown from
                          expiresAt returned at attempt start (display only)
```

---

### 3.4 Review, Submission, and Grading

```
[S-06] Answer Review
  Displays: list of questions with student's draft selections
  Flutter must not: show any correctness indicators here
  (No API call — renders from local draft state)
        │
        ▼
[S-07] Submission Confirmation
  Displays: "Submit your attempt?" confirmation dialog
  Flutter action on confirm: POST /attempts/:attemptId/submit
        │
        ├─► 200 OK { attemptId, status: "submitted", submittedAt, resultId }
        │     → Navigate to [S-08] Grading Pending
        │
        ├─► 409 ATTEMPT_ALREADY_SUBMITTED
        │     → Navigate to [S-12] Error / Blocked State
        │
        └─► 409 DEADLINE_BLOCKS_SUBMISSION
              → Navigate to [S-12] Error / Blocked State
                    Message: "Submission blocked — deadline has passed."

[S-08] Grading Pending
  Displays: loading indicator ("Grading in progress…")
  Flutter action: GET /attempts/:attemptId/result (poll or await)
        │
        ├─► 200 OK (result ready)
        │     → Navigate to [S-09] Result Summary
        │
        └─► 404 / still pending
              → Continue polling (with back-off); timeout → show retry UI
```

---

### 3.5 Result and History

```
[S-09] Result Summary
  API: GET /attempts/:attemptId/result
  Displays: score, maxScore, passed, latePenaltyApplied, gradedAt
  Flutter must not: recompute passed from score/maxScore
  Flutter must not: apply or display a late penalty it computed locally

        ├─► [S-10] Result Breakdown (tap "See Breakdown")
        │     API: GET /attempts/:attemptId/result/breakdown
        │     Displays: per-section/per-question feedback
        │     isCorrect field present only when backend approved feedback policy
        │     Flutter must not: show correctness if isCorrect is absent in response
        │     └─► Back to [S-09]
        │
        └─► [S-11] Assessment History (tap "All My Results")
              API: GET /assessments/results
              Query params: assessmentId (optional), page, limit
              Displays: resultId, assessmentTitle, score, maxScore, passed, gradedAt
              Flutter must not: filter or recompute results client-side
```

---

## 4. Screen-to-API Mapping (Summary)

| Screen | API Call(s) | Method | Notes |
|--------|-------------|--------|-------|
| S-01 Assessment List | `/assessments` | GET | Shows deadlineStatus from backend |
| S-02 Assessment Detail | `/assessments/:id` | GET | Shows sections, maxAttempts |
| S-03 Deadline Status | `/assessments/:id/deadline` | GET | Display status as-is; countdown from timestamps |
| S-04 Attempt Gate | `/assessments/:id/attempts` | POST | Or resume — backend decides eligibility |
| S-04 Attempt Resume | `/assessments/:id/attempts/:id/resume` | POST | Backend returns resumable state |
| S-05 Quiz Session (load) | `/assessments/:id/questions` | GET | Requires attemptId param |
| S-05 Quiz Session (answer) | `/attempts/:attemptId/answers` | POST | Draft selection only until POST |
| S-07 Submit Confirmation | `/attempts/:attemptId/submit` | POST | Backend enforces deadline/late policy |
| S-08 Grading Pending | `/attempts/:attemptId/result` | GET | Poll until result ready |
| S-09 Result Summary | `/attempts/:attemptId/result` | GET | Display exactly as returned |
| S-10 Result Breakdown | `/attempts/:attemptId/result/breakdown` | GET | isCorrect present only if backend allows |
| S-11 Assessment History | `/assessments/results` | GET | Scoped to authenticated student |

---

## 5. Local State Rules

Flutter is permitted to hold the following in local (in-memory) state during an active session:

| Local State | Allowed | Notes |
|-------------|---------|-------|
| Current draft answer selection | ✅ Yes | Held until POST /answers succeeds |
| Current question index | ✅ Yes | UI navigation only |
| `expiresAt` for countdown display | ✅ Yes | Display only; backend enforces expiry |
| Attempt ID returned by backend | ✅ Yes | Required for subsequent API calls |

Flutter must **not** hold the following in local state:

| Forbidden Local State | Reason |
|----------------------|--------|
| Computed correctness for any answer | Backend grading authority |
| Running score or partial score | Backend grading authority |
| Pass/fail derived from local score | Backend grading authority |
| Computed deadline status from timestamps | Backend deadline authority |
| Attempt eligibility derived from history count | Backend attempt lifecycle authority |

---

## 6. Error Handling Rules

All error states originate from backend responses. Flutter must not generate its own error state based on local computation.

| Backend Error Code | Screen to Show | Display Message |
|-------------------|---------------|-----------------|
| `MAX_ATTEMPTS_REACHED` | S-12 | "You have used all available attempts." |
| `DEADLINE_CLOSED` | S-12 | "This assessment is closed." |
| `DEADLINE_BLOCKS_SUBMISSION` | S-12 | "Submission window has closed." |
| `ATTEMPT_NOT_OWNED` | S-12 | "You do not have access to this attempt." |
| `ATTEMPT_ALREADY_SUBMITTED` | S-12 | "This attempt has already been submitted." |
| `ATTEMPT_NOT_RESUMABLE` | S-12 | "This attempt cannot be resumed." |
| `FEEDBACK_NOT_ALLOWED` | S-10 | Hide breakdown section entirely |
| `RESULT_NOT_FOUND` | S-08 | Show retry / contact support prompt |
| `401 UNAUTHENTICATED` | Auth flow | Redirect to login |

---

## 7. Navigation Architecture Notes

- **No deep link bypasses the Attempt Gate.** Every path into S-05 must pass through S-04 (backend POST/resume call).
- **Back navigation during an active session** does not submit or cancel the attempt — Flutter preserves draft state, attempt remains in-progress on the backend.
- **Session timer** is a display-only countdown. The backend enforces the actual time limit based on `expiresAt`; Flutter must not auto-submit on timer expiry (the backend will handle late/expired logic on the next answer or submit call).
- **Result polling** (S-08) uses exponential back-off. Flutter must not show a locally-computed result while polling.

---

## 8. Out of Scope

The following must not be implemented under this flow map:

- Admin screens for creating or managing quizzes/exams (Phase 11)
- Deadline notification or push alert flows (Phase 13 unless a task explicitly states otherwise)
- AI Teacher, payments, parent dashboard, or voice AI flows
- Any Flutter screen that writes mastery, weakness, review schedule, or AIM outputs directly

---

## 9. References

- `docs/phase-10/quizzes-exams-deadlines-charter.md` — Phase 10 scope and exclusions
- `docs/phase-10/assessment-domain-map.md` — Domain entities and relationships
- `docs/phase-10/assessment-authority-rules.md` — Binding authority rule set
- `docs/phase-10/assessment-api-contract-map.md` — Full endpoint specifications

---

## Metadata

| Field | Value |
|-------|-------|
| Task ID | P10-005 |
| Branch | phase10/P10-005-mobile-flow-map |
| Priority | P1 |
| Dependency | P10-004 |
| Output | docs/phase-10/mobile-assessment-flow-map.md |
