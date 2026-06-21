# Phase 10 — Assessment API Contract Map

## Purpose

This document maps the backend endpoints required by Flutter Mobile to participate in quizzes and exams: discovery, deadlines, attempt lifecycle, answer submission, results, and result history.

It guides backend implementation (NestJS) and Flutter integration. All endpoints are backend-authoritative. Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs locally. See `docs/phase-10/assessment-authority-rules.md` for the full authority rule set.

This document covers student-facing assessment endpoints only. It does not include admin quiz/exam management endpoints (deferred to Phase 11) or deadline notification endpoints (deferred to Phase 13).

---

## Base Path

All assessment endpoints are prefixed with:

/api/v1/assessments

---

## Endpoint Index

| # | Method | Path | Purpose | Auth |
| --- | --- | --- | --- | --- |
| 1 | GET | /assessments | List assessments available to the student | Student |
| 2 | GET | /assessments/:id | Get assessment detail (sections, settings summary) | Student |
| 3 | GET | /assessments/:id/questions | Deliver questions for an assessment/section within an attempt | Student |
| 4 | GET | /assessments/:id/deadline | Get backend-derived deadline status for the student | Student |
| 5 | POST | /assessments/:id/attempts | Start a new attempt | Student |
| 6 | POST | /assessments/:id/attempts/:attemptId/resume | Resume an in-progress attempt | Student |
| 7 | POST | /attempts/:attemptId/answers | Submit a single answer | Student |
| 8 | POST | /attempts/:attemptId/submit | Submit the attempt for grading | Student |
| 9 | GET | /attempts/:attemptId/result | Fetch the backend-generated result | Student |
| 10 | GET | /attempts/:attemptId/result/breakdown | Fetch backend-approved result breakdown/feedback | Student |
| 11 | GET | /assessments/results | List the student's own assessment result history | Student |

---

## Student Endpoints

### 1. GET /assessments

Lists assessments (quizzes/exams) available to the authenticated student.

Request: No body required.

Response:
```
{
  "assessments": [
    {
      "id": "uuid",
      "type": "quiz",
      "title": "Unit 3 Grammar Quiz",
      "description": "Short grammar check for Unit 3.",
      "deadlineStatus": "open"
    }
  ]
}
```

Fields never returned to Flutter:
- sectionWeight
- passThreshold (informational max attempts/time limit may be returned per §5, but pass threshold stays internal)

Errors:
- 401 UNAUTHENTICATED

---

### 2. GET /assessments/:id

Returns assessment detail: sections and informational settings.

Response:
```
{
  "id": "uuid",
  "type": "exam",
  "title": "Midterm Exam",
  "description": "Covers Units 1-5.",
  "sections": [
    { "id": "uuid", "title": "Listening", "order": 1, "questionCount": 10 },
    { "id": "uuid", "title": "Grammar", "order": 2, "questionCount": 15 }
  ],
  "maxAttempts": 2,
  "timeLimitSeconds": 1800
}
```

Fields never returned to Flutter:
- sectionWeight
- passThreshold
- latePolicy / latePenaltyPercent

Errors:
- 404 ASSESSMENT_NOT_FOUND
- 401 UNAUTHENTICATED

---

### 3. GET /assessments/:id/questions

Delivers questions for the assessment, scoped to an active attempt. Flutter receives learner-safe fields only.

Query Parameters:
- attemptId (required)
- sectionId (optional)

Response:
```
{
  "questions": [
    {
      "id": "uuid",
      "assessmentQuestionLinkId": "uuid",
      "sectionId": "uuid",
      "order": 1,
      "type": "multiple_choice",
      "prompt": "Choose the correct word.",
      "options": [
        { "id": "uuid", "label": "A", "text": "run" },
        { "id": "uuid", "label": "B", "text": "runs" }
      ]
    }
  ]
}
```

Fields never returned to Flutter:
- correctOptionId
- points
- sectionWeight

Errors:
- 400 INVALID_ATTEMPT
- 404 ASSESSMENT_NOT_FOUND

---

### 4. GET /assessments/:id/deadline

Returns the backend-derived deadline status for the authenticated student.

Response:
```
{
  "deadlineId": "uuid",
  "opensAt": "2026-06-20T00:00:00Z",
  "closesAt": "2026-06-27T23:59:00Z",
  "extendedClosesAt": null,
  "status": "open"
}
```

`status` is one of: `upcoming`, `open`, `closed`, `missed`, `late`, `extended`, `expired`. This value is backend-computed; Flutter must display it as-is and must not recompute it from the timestamps.

Errors:
- 404 DEADLINE_NOT_FOUND

---

### 5. POST /assessments/:id/attempts

Starts a new attempt. Backend validates eligibility (max attempts, deadline window) before creating.

Request: `{}`

Response:
```
{
  "attemptId": "uuid",
  "assessmentId": "uuid",
  "attemptNumber": 1,
  "status": "started",
  "startedAt": "2026-06-20T10:00:00Z",
  "expiresAt": "2026-06-20T10:30:00Z"
}
```

Errors:
- 409 MAX_ATTEMPTS_REACHED
- 409 DEADLINE_CLOSED
- 404 ASSESSMENT_NOT_FOUND

---

### 6. POST /assessments/:id/attempts/:attemptId/resume

Resumes an in-progress attempt owned by the authenticated student.

Request: `{}`

Response:
```
{
  "attemptId": "uuid",
  "status": "in_progress",
  "expiresAt": "2026-06-20T10:30:00Z"
}
```

Errors:
- 403 ATTEMPT_NOT_OWNED
- 409 ATTEMPT_NOT_RESUMABLE

---

### 7. POST /attempts/:attemptId/answers

Submits a single answer. The request body must not contain a correctness or score field; if present, the backend ignores or rejects it.

Request:
```
{
  "assessmentQuestionLinkId": "uuid",
  "responseValue": "uuid"
}
```

Response:
```
{
  "answerId": "uuid",
  "assessmentQuestionLinkId": "uuid",
  "submittedAt": "2026-06-20T10:05:00Z"
}
```

Fields never returned:
- isCorrect
- pointsAwarded

Errors:
- 400 INVALID_ATTEMPT
- 400 QUESTION_NOT_IN_ASSESSMENT
- 409 ANSWER_ALREADY_SUBMITTED
- 409 ATTEMPT_NOT_IN_PROGRESS

---

### 8. POST /attempts/:attemptId/submit

Submits the attempt for grading. Backend enforces deadline/late policy, runs grading, and persists the Result.

Request: `{}`

Response:
```
{
  "attemptId": "uuid",
  "status": "submitted",
  "submittedAt": "2026-06-20T10:25:00Z",
  "resultId": "uuid"
}
```

Errors:
- 409 ATTEMPT_ALREADY_SUBMITTED
- 409 DEADLINE_BLOCKS_SUBMISSION
- 400 INVALID_ATTEMPT

---

### 9. GET /attempts/:attemptId/result

Returns the backend-generated result for an attempt owned by the authenticated student.

Response:
```
{
  "resultId": "uuid",
  "attemptId": "uuid",
  "score": 82,
  "maxScore": 100,
  "passed": true,
  "latePenaltyApplied": false,
  "gradedAt": "2026-06-20T10:26:00Z"
}
```

Flutter display rules:
- Show score, maxScore, passed, gradedAt exactly as returned.
- Do not calculate or modify pass/fail locally.

Errors:
- 404 RESULT_NOT_FOUND
- 403 RESULT_NOT_OWNED

---

### 10. GET /attempts/:attemptId/result/breakdown

Returns backend-approved per-section/per-question feedback, only when the assessment's feedback policy allows it.

Response:
```
{
  "resultId": "uuid",
  "breakdown": [
    {
      "sectionId": "uuid",
      "assessmentQuestionLinkId": "uuid",
      "isCorrect": true,
      "pointsAwarded": 5,
      "pointsPossible": 5
    }
  ]
}
```

`isCorrect` is present only when the backend has approved post-result feedback for this assessment; otherwise the field is omitted.

Errors:
- 403 FEEDBACK_NOT_ALLOWED
- 404 RESULT_NOT_FOUND

---

### 11. GET /assessments/results

Lists the authenticated student's own assessment result history.

Query Parameters:
- assessmentId (optional)
- page (optional, default 1)
- limit (optional, default 20)

Response:
```
{
  "results": [
    {
      "resultId": "uuid",
      "assessmentId": "uuid",
      "assessmentTitle": "Unit 3 Grammar Quiz",
      "score": 82,
      "maxScore": 100,
      "passed": true,
      "gradedAt": "2026-06-20T10:26:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 4
}
```

Errors:
- 401 UNAUTHENTICATED

---

## Security Rules

- All endpoints require an authenticated student session.
- Answer-submission and attempt-submission DTOs never accept score, correctness, or deadline-state fields as authoritative input; any such field present must be rejected or ignored.
- Backend validates attempt ownership on every answer, resume, submission, and result request.
- Students may only read their own attempts, answers, results, and result history — never another student's.
- Question delivery never returns `correctOptionId`/correctness fields, `points`, or `sectionWeight`.
- Score, pass/fail, deadline status, and result breakdown correctness are computed by the backend only.
- Result breakdown correctness fields are omitted entirely unless the backend's feedback policy explicitly allows them.

---

## Out of Scope

The following must not be added in Phase 10 under this contract map:

- Admin quiz/exam management endpoints (deferred to Phase 11)
- Deadline notification/push endpoints (deferred to Phase 13 unless a task explicitly states otherwise)
- AI Teacher, payments, or parent dashboard endpoints
- Direct AIM Engine or progress-mutation endpoints reachable from Flutter

---

## References

- docs/phase-10/quizzes-exams-deadlines-charter.md
- docs/phase-10/assessment-domain-map.md
- docs/phase-10/assessment-authority-rules.md

---

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P10-004 |
| Branch | phase10/P10-004-api-contract-map |
| Priority | P0 |
| Dependency | P10-002 |
| Output | docs/phase-10/assessment-api-contract-map.md |
