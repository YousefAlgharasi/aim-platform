# Phase 4 — Placement API Map

## Purpose

This document maps all required placement endpoints, their HTTP methods, request payloads, and response shapes for Phase 4.

It guides backend implementation (NestJS) and Flutter integration. All endpoints are backend-authoritative. Flutter must not calculate score, level, skill mastery, weakness map, or initial learning path locally.

This document covers Placement Test endpoints only. It does not include AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, recommendations, or progress dashboard endpoints.

---

## Base Path

All placement endpoints are prefixed with:

/api/v1/placement

---

## Endpoint Index

| # | Method | Path | Purpose | Auth |
|---|---|---|---|---|
| 1 | GET | /placement/active | Get active placement test metadata | Student |
| 2 | GET | /placement/sections | List sections of the active test | Student |
| 3 | GET | /placement/questions | Deliver questions for a section | Student |
| 4 | POST | /placement/attempts | Start a placement attempt | Student |
| 5 | POST | /placement/attempts/:id/answers | Submit an answer | Student |
| 6 | POST | /placement/attempts/:id/complete | Complete placement attempt | Student |
| 7 | GET | /placement/attempts/:id/result | Fetch placement result | Student |
| 8 | GET | /placement/admin/tests | List all placement tests | Admin |
| 9 | POST | /placement/admin/tests | Create placement test | Admin |
| 10 | PATCH | /placement/admin/tests/:id/status | Update test status | Admin |
| 11 | GET | /placement/admin/sections | List sections for a test | Admin |
| 12 | POST | /placement/admin/sections | Create placement section | Admin |
| 13 | GET | /placement/admin/questions | List questions for a section | Admin |
| 14 | POST | /placement/admin/questions | Create placement question | Admin |
| 15 | POST | /placement/admin/questions/:id/skills | Link question to skills | Admin |
| 16 | GET | /placement/admin/results | View all placement results | Admin |

---

## Student Endpoints

### 1. GET /placement/active

Returns the currently active placement test metadata.

Request: No body required.

Response:
{
  "id": "uuid",
  "title": "AIM Placement Test",
  "status": "published",
  "totalSections": 3,
  "estimatedMinutes": 20
}

Errors:
- 404 PLACEMENT_TEST_NOT_FOUND

---

### 2. GET /placement/sections

Returns the list of sections for the active placement test.

Request: No body required.

Response:
{
  "sections": [
    { "id": "uuid", "title": "Grammar", "order": 1, "questionCount": 10 },
    { "id": "uuid", "title": "Vocabulary", "order": 2, "questionCount": 10 },
    { "id": "uuid", "title": "Reading", "order": 3, "questionCount": 10 }
  ]
}

---

### 3. GET /placement/questions

Delivers questions for a specific section. Flutter receives learner-safe fields only.

Query Parameters:
- sectionId (required)
- attemptId (required)

Response:
{
  "questions": [
    {
      "id": "uuid",
      "sectionId": "uuid",
      "order": 1,
      "type": "multiple_choice",
      "prompt": "Choose the correct word.",
      "options": [
        { "id": "uuid", "label": "A", "text": "run" },
        { "id": "uuid", "label": "B", "text": "runs" },
        { "id": "uuid", "label": "C", "text": "ran" },
        { "id": "uuid", "label": "D", "text": "running" }
      ]
    }
  ]
}

Fields never returned to Flutter:
- correctOptionId
- skillId
- weight
- difficultyScore

Errors:
- 400 INVALID_ATTEMPT
- 404 SECTION_NOT_FOUND

---

### 4. POST /placement/attempts

Starts a new placement attempt. Backend validates retake policy before creating.

Request: {}

Response:
{
  "attemptId": "uuid",
  "testId": "uuid",
  "startedAt": "2026-06-16T10:00:00Z",
  "status": "in_progress"
}

Errors:
- 409 PLACEMENT_RETAKE_NOT_ALLOWED
- 404 PLACEMENT_TEST_NOT_FOUND

---

### 5. POST /placement/attempts/:id/answers

Submits a single answer.

Request:
{
  "questionId": "uuid",
  "selectedOptionId": "uuid"
}

Response:
{
  "answerId": "uuid",
  "questionId": "uuid",
  "submittedAt": "2026-06-16T10:05:00Z"
}

Fields never returned:
- isCorrect
- score

Errors:
- 400 INVALID_ATTEMPT
- 400 QUESTION_NOT_IN_ATTEMPT
- 409 ANSWER_ALREADY_SUBMITTED

---

### 6. POST /placement/attempts/:id/complete

Marks the attempt as complete. Backend runs scoring and result generation.

Request: {}

Response:
{
  "attemptId": "uuid",
  "status": "completed",
  "completedAt": "2026-06-16T10:25:00Z",
  "resultId": "uuid"
}

Errors:
- 400 ATTEMPT_ALREADY_COMPLETED
- 400 INVALID_ATTEMPT

---

### 7. GET /placement/attempts/:id/result

Returns the backend-generated placement result.

Response:
{
  "resultId": "uuid",
  "attemptId": "uuid",
  "estimatedLevel": "A2",
  "skillSummary": [
    { "skillId": "uuid", "skillName": "Grammar", "signal": "developing" },
    { "skillId": "uuid", "skillName": "Vocabulary", "signal": "developing" },
    { "skillId": "uuid", "skillName": "Reading", "signal": "emerging" }
  ],
  "initialPathReady": true,
  "completedAt": "2026-06-16T10:25:00Z"
}

Flutter display rules:
- Show estimatedLevel as the learner starting level
- Show skillSummary as a safe summary only
- Do not calculate or modify any values locally

Errors:
- 404 RESULT_NOT_FOUND
- 400 INVALID_ATTEMPT

---

## Admin Endpoints

### 8. GET /placement/admin/tests

Lists all placement tests.

Response:
{
  "tests": [
    { "id": "uuid", "title": "AIM Placement Test", "status": "published", "createdAt": "2026-06-01T00:00:00Z" }
  ]
}

---

### 9. POST /placement/admin/tests

Creates a new placement test in draft status.

Request:
{
  "title": "AIM Placement Test",
  "estimatedMinutes": 20
}

Response:
{
  "id": "uuid",
  "title": "AIM Placement Test",
  "status": "draft",
  "createdAt": "2026-06-16T00:00:00Z"
}

---

### 10. PATCH /placement/admin/tests/:id/status

Publishes or unpublishes a placement test.

Request:
{
  "status": "published"
}

Valid values: draft, published

Errors:
- 409 ACTIVE_TEST_EXISTS

---

### 11. GET /placement/admin/sections

Lists sections for a given test.

Query Parameters:
- testId (required)

Response:
{
  "sections": [
    { "id": "uuid", "title": "Grammar", "order": 1, "weight": 0.4, "questionCount": 10 }
  ]
}

---

### 12. POST /placement/admin/sections

Creates a section under a test.

Request:
{
  "testId": "uuid",
  "title": "Grammar",
  "order": 1,
  "weight": 0.4
}

---

### 13. GET /placement/admin/questions

Lists questions for a section. isCorrect is visible to admin only, never to students.

Query Parameters:
- sectionId (required)

---

### 14. POST /placement/admin/questions

Creates a placement question.

Request:
{
  "sectionId": "uuid",
  "order": 1,
  "type": "multiple_choice",
  "prompt": "Choose the correct word.",
  "options": [
    { "label": "A", "text": "run", "isCorrect": true },
    { "label": "B", "text": "runs", "isCorrect": false },
    { "label": "C", "text": "ran", "isCorrect": false },
    { "label": "D", "text": "running", "isCorrect": false }
  ]
}

---

### 15. POST /placement/admin/questions/:id/skills

Links a question to one or more skills for skill map generation.

Request:
{
  "skillIds": ["uuid", "uuid"]
}

---

### 16. GET /placement/admin/results

Returns placement results for admin review.

Query Parameters:
- testId (optional)
- page (optional, default 1)
- limit (optional, default 20)

---

## Security Rules

- All student endpoints require authenticated learner session.
- All admin endpoints require admin role guard.
- Student endpoints never return isCorrect, weight, difficultyScore, or skillId.
- Backend validates attempt ownership on every answer and completion request.
- Score, level, skill map, and weakness map are computed by the backend only.

---

## Out of Scope

The following must not be added in Phase 4:
- AIM Engine runtime endpoints
- Lesson delivery endpoints
- Practice session endpoints
- AI Teacher endpoints
- Progress dashboard endpoints
- Recommendations endpoints

---

## References

- docs/phase-4/placement-data-flow.md
- docs/phase-4/placement-test-charter.md
- docs/phase-4/no-aim-runtime-rule.md

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-006 |
| Branch | phase4/P4-006-placement-api-map |
| Priority | P0 |
| Dependency | P4-005 |
| Output | docs/phase-4/placement-api-map.md |