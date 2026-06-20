# Phase 10 — Assessment Domain Map

## Purpose

This document defines the assessment domain entities for Phase 10 — Quizzes, Exams, and Deadlines. It establishes the entity model before any database, backend, or mobile implementation begins, so that later Phase 10 tasks build against a single shared vocabulary.

All entities defined here are backend-owned. Flutter consumes backend-approved representations of these entities only; it does not own, derive, or recalculate any of them.

---

## Entity Overview

| Entity | Meaning | Owned By |
| --- | --- | --- |
| Assessment | A quiz or exam definition | Backend assessment service |
| Assessment Section | A grouped subset of questions within an assessment | Backend assessment service |
| Assessment Question Link | The association between an assessment/section and a question bank question | Backend assessment service |
| Assessment Settings | Per-assessment configuration (attempt limits, time limit, pass threshold, late policy) | Backend assessment service |
| Assessment Deadline | The open/close window for an assessment | Backend deadline service |
| Deadline Event | A recorded state transition for a deadline (opened, closed, extended, expired) | Backend deadline service |
| Attempt | A single learner's instance of taking an assessment | Backend attempt service |
| Answer | A learner's submitted response to one question within an attempt | Backend answer submission service |
| Grading Outcome | The backend's correctness determination for a single answer | Backend grading service |
| Result | The backend-persisted outcome of a completed attempt | Backend grading service |
| Result Breakdown | Per-section or per-question detail belonging to a result | Backend grading service |
| Audit Log | A safe record of an assessment-related event | Backend audit logging |

---

## 1. Assessment

### Definition

An Assessment is a quiz or exam definition: a named, backend-owned object that groups sections and questions under shared settings.

### Key Attributes

- id
- type (`quiz` | `exam`)
- title
- description
- status (`draft` | `published` | `archived`)
- createdBy
- createdAt / updatedAt

### What It Is Not

- It is not an attempt — an Assessment can have many Attempts.
- It is not configured or created by Flutter.
- It does not contain grading logic itself; grading logic lives in the backend grading service.

### Flutter Display Rule

Flutter may display assessment id, type, title, and description as returned by the backend. Flutter must not alter assessment status or definition.

---

## 2. Assessment Section

### Definition

A Section is a named grouping of questions within an Assessment (e.g. "Listening", "Grammar"), used to organize question delivery and result breakdowns.

### Key Attributes

- id
- assessmentId
- title
- order
- weight (used only by backend score policy)

### What It Is Not

- It is not visible to Flutter as a scoring unit — section weight is internal backend configuration.
- It is not created or reordered by Flutter.

### Flutter Display Rule

Flutter may display section title and order for navigation. Flutter must not display or use section weight.

---

## 3. Assessment Question Link

### Definition

An Assessment Question Link associates a question bank question with an Assessment and, optionally, a Section, including its order and point value within that assessment.

### Key Attributes

- id
- assessmentId
- sectionId (nullable)
- questionId
- order
- points

### What It Is Not

- It is not the question content itself — question content remains owned by the curriculum/question bank domain.
- It does not carry the correct answer to Flutter before grading is allowed to reveal it.

### Flutter Display Rule

Flutter may display question content and order for attempt-taking. Flutter must never receive the correct answer before backend-approved post-result feedback.

---

## 4. Assessment Settings

### Definition

Assessment Settings hold the backend-owned configuration that governs how an Assessment behaves: attempt limits, time limit, pass threshold, and late submission policy.

### Key Attributes

- assessmentId
- maxAttempts
- timeLimitSeconds (nullable)
- passThreshold
- latePolicy (`none` | `penalty` | `block`)
- latePenaltyPercent (nullable)

### What It Is Not

- It is not enforced or interpreted by Flutter — Flutter only displays settings that explain UI affordances (e.g. a visible timer), not authoritative limits.
- It is not editable from Flutter.

### Flutter Display Rule

Flutter may display time limit and max attempts for informational UI (e.g. "Attempt 2 of 3"). The backend remains the sole authority on whether an attempt is actually allowed.

---

## 5. Assessment Deadline

### Definition

An Assessment Deadline defines the open and close window during which an Assessment may be attempted or submitted.

### Key Attributes

- id
- assessmentId
- studentId (nullable; null means it applies to all eligible students)
- opensAt
- closesAt
- extendedClosesAt (nullable)
- status (`upcoming` | `open` | `closed` | `expired`) — backend-derived, not stored as raw truth without recomputation

### What It Is Not

- It is not calculated client-side — "open", "closed", "missed", "late" are backend-derived states, not raw timestamps interpreted by Flutter.
- It is not editable from Flutter.

### Flutter Display Rule

Flutter displays the backend-provided deadline status label and the raw `opensAt`/`closesAt`/`extendedClosesAt` timestamps for countdown UI only. Flutter must not derive final deadline status (open/closed/missed/late/expired) from these timestamps itself — it must use the status field returned by the backend.

---

## 6. Deadline Event

### Definition

A Deadline Event is an immutable record of a state transition for an Assessment Deadline (e.g. extended, expired, closed).

### Key Attributes

- id
- deadlineId
- eventType (`opened` | `closed` | `extended` | `expired`)
- occurredAt
- metadata (safe, non-sensitive)

### What It Is Not

- It is not generated or interpreted by Flutter.
- It does not contain secrets or privileged configuration.

### Flutter Display Rule

Flutter does not directly consume Deadline Events. They feed backend audit and deadline-status computation only.

---

## 7. Attempt

### Definition

An Attempt is a single instance of a learner taking an Assessment, with backend-owned lifecycle state.

### Key Attributes

- id
- assessmentId
- studentId
- attemptNumber
- status (`started` | `in_progress` | `submitted` | `graded` | `expired` | `abandoned`)
- startedAt
- submittedAt (nullable)
- expiresAt (nullable, derived from time limit)

### What It Is Not

- It is not started, resumed, or marked complete by Flutter logic — Flutter calls backend APIs that return the resulting state.
- It is not eligible-by-default — eligibility (max attempts, deadline window) is backend-checked at start time.

### Flutter Display Rule

Flutter displays attempt status and remaining time as returned by the backend. Flutter must not locally decide that an attempt has expired or is eligible to submit.

---

## 8. Answer

### Definition

An Answer is a learner's submitted response to one Assessment Question Link within the context of an Attempt.

### Key Attributes

- id
- attemptId
- assessmentQuestionLinkId
- responseValue (format depends on question type)
- submittedAt

### What It Is Not

- It is not authoritative for correctness or score — Answer never carries a client-submitted correctness or score field that the backend trusts.
- It is not graded at submission time by the client.

### Flutter Display Rule

Flutter collects and submits responseValue only. Flutter may keep an unsynced local draft before submission, but the draft is never authoritative once the backend has accepted a submission.

---

## 9. Grading Outcome

### Definition

A Grading Outcome is the backend grading service's determination of correctness and points awarded for a single Answer.

### Key Attributes

- id
- answerId
- isCorrect
- pointsAwarded
- gradedAt
- gradingMethod (`auto` | `manual`, manual reserved for future phases)

### What It Is Not

- It is not computed, estimated, or overridden by Flutter.
- It is not exposed to Flutter before the backend allows post-result feedback.

### Flutter Display Rule

Flutter does not directly read Grading Outcomes. It only receives correctness/feedback fields through the backend-approved Result and Result Breakdown APIs, after grading completes and feedback is allowed.

---

## 10. Result

### Definition

A Result is the backend-persisted outcome of a completed (graded) Attempt: total score, pass/fail, and completion metadata.

### Key Attributes

- id
- attemptId
- assessmentId
- studentId
- score
- maxScore
- passed (boolean)
- latePenaltyApplied (boolean)
- gradedAt

### What It Is Not

- It is not calculated, estimated, or recomputed by Flutter.
- It is not mutable from Flutter once persisted.

### Flutter Display Rule

Flutter displays score, maxScore, passed, and gradedAt as returned by the backend Result API. Flutter must not recompute pass/fail locally even if score and threshold appear to be present in the payload.

---

## 11. Result Breakdown

### Definition

A Result Breakdown is the per-section or per-question detail belonging to a Result, used for review/feedback display.

### Key Attributes

- id
- resultId
- sectionId (nullable)
- assessmentQuestionLinkId (nullable)
- isCorrect (nullable, only present when feedback is backend-approved)
- pointsAwarded
- pointsPossible

### What It Is Not

- It is not generated by Flutter.
- It does not expose correct answers unless the backend has explicitly approved post-result feedback for that assessment.

### Flutter Display Rule

Flutter may render Result Breakdown rows as backend-approved feedback. Flutter must not infer missing breakdown fields locally.

---

## 12. Audit Log

### Definition

An Audit Log entry is a safe, backend-written record of an assessment-related event (attempt started, submitted, graded; deadline extended; etc.) for traceability.

### Key Attributes

- id
- entityType (`assessment` | `attempt` | `deadline` | `result`)
- entityId
- eventType
- actorId (nullable)
- occurredAt
- metadata (safe fields only — no secrets, no full answer payloads unless explicitly required and documented)

### What It Is Not

- It is not readable by students for other students' entities.
- It does not log secrets, service-role keys, database credentials, or AI provider keys.

### Flutter Display Rule

Flutter does not consume Audit Logs directly in Phase 10. They exist for backend/reviewer use only.

---

## Entity Relationship Summary

```
Assessment 1---* AssessmentSection
Assessment 1---* AssessmentQuestionLink (sectionId optional FK to AssessmentSection)
Assessment 1---1 AssessmentSettings
Assessment 1---* AssessmentDeadline
AssessmentDeadline 1---* DeadlineEvent
Assessment 1---* Attempt
Attempt 1---* Answer
Answer 1---1 GradingOutcome
Attempt 1---1 Result
Result 1---* ResultBreakdown
(Assessment | Attempt | AssessmentDeadline | Result) 1---* AuditLog
```

---

## What Flutter May Display

| Entity | Allowed Display Fields |
| --- | --- |
| Assessment | id, type, title, description |
| Assessment Section | title, order |
| Assessment Question Link | question content, order (no correct answer pre-grading) |
| Assessment Settings | maxAttempts, timeLimitSeconds (informational only) |
| Assessment Deadline | opensAt, closesAt, extendedClosesAt, backend-derived status label |
| Attempt | status, startedAt, expiresAt |
| Result | score, maxScore, passed, gradedAt |
| Result Breakdown | isCorrect (only when backend-approved), pointsAwarded, pointsPossible |

## What Flutter Must Never Display, Store, or Calculate

| Forbidden | Reason |
| --- | --- |
| Correct answers before backend-approved feedback | Grading authority leak |
| Raw section/question weights | Internal backend scoring configuration |
| Locally computed deadline status | Backend deadline authority only |
| Locally computed score/pass-fail | Backend grading authority only |
| Locally computed attempt eligibility | Backend attempt lifecycle authority only |
| Audit log contents | Reviewer/backend use only |

---

## References

- docs/phase-10/quizzes-exams-deadlines-charter.md
- P10-001 — Create Phase 10 Charter

---

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P10-002 |
| Branch | phase10/P10-002-assessment-domain-map |
| Priority | P0 |
| Dependency | P10-001 |
| Output | docs/phase-10/assessment-domain-map.md |
