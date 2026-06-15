# Phase 4 — Placement Data Flow

## Purpose

This document describes the Phase 4 placement data flow from Flutter Mobile to the Backend API and database, then back to Flutter as a backend-generated result.

It is limited to the Placement Test foundation. It does not define AIM Engine runtime integration, AI Teacher behavior, lesson delivery, practice sessions, recommendations, progress dashboards, or retention workflows.

## Source Documents

This flow follows the scope boundaries in:

```text
docs/phase-4/placement-test-charter.md
docs/phase-4/placement-scope-boundaries.md
```

## Flow Summary

| Step | Actor | Data Movement | Authority |
| --- | --- | --- | --- |
| 1 | Flutter Mobile | Requests active placement test | Backend |
| 2 | Backend API | Reads active placement structure from database | Backend |
| 3 | Flutter Mobile | Requests attempt start | Backend |
| 4 | Backend API | Creates placement attempt record | Backend |
| 5 | Flutter Mobile | Displays learner-safe sections and questions | Backend-provided data |
| 6 | Flutter Mobile | Submits learner answers | Backend |
| 7 | Backend API | Validates and stores answers | Backend |
| 8 | Flutter Mobile | Requests completion | Backend |
| 9 | Backend API | Scores attempt and generates result | Backend |
| 10 | Backend API | Persists result and audit events | Backend |
| 11 | Flutter Mobile | Displays backend-generated result | Backend-provided data |

## Data Flow Diagram

```text
Flutter Mobile
  |
  | 1. GET active placement test
  v
Backend API
  |
  | 2. Read active test, sections, questions, safe fields
  v
Database
  |
  | 3. Return learner-safe placement structure
  v
Backend API
  |
  | 4. Return structure to Flutter
  v
Flutter Mobile
  |
  | 5. POST start attempt
  v
Backend API
  |
  | 6. Validate learner, active test, retake policy
  | 7. Create placement_attempt
  v
Database
  |
  | 8. Return attempt session metadata
  v
Flutter Mobile
  |
  | 9. POST answers
  v
Backend API
  |
  | 10. Validate attempt ownership and answer shape
  | 11. Store placement_answers
  v
Database
  |
  | 12. POST complete attempt
  v
Backend API
  |
  | 13. Validate completion
  | 14. Calculate placement score, level, skill signals,
  |     weakness indicators, and initial path output
  | 15. Persist placement_result and audit events
  v
Database
  |
  | 16. Return backend-generated result
  v
Flutter Mobile
```

## Placement Read Flow

### Request

Flutter Mobile requests the active placement test.

```text
Flutter Mobile -> Backend API
GET /placement/tests/active
```

### Backend Work

The backend:

1. Authenticates the learner.
2. Locates the active placement test.
3. Reads active sections in backend-defined order.
4. Reads eligible learner-safe questions.
5. Removes answer keys, scoring metadata, admin notes, and privileged fields.
6. Returns only fields needed for display and answer collection.

### Database Reads

Expected database reads may include:

- placement tests;
- placement sections;
- placement questions;
- placement question-skill mappings when required for backend validation;
- learner attempt state when needed to prevent duplicate active attempts.

### Response

Flutter receives learner-safe placement structure only.

Flutter must not receive:

- answer keys;
- scoring weights;
- internal scoring formulas;
- admin notes;
- privileged audit data;
- database-only fields;
- service credentials.

## Attempt Start Flow

### Request

Flutter requests a new placement attempt.

```text
Flutter Mobile -> Backend API
POST /placement/attempts
```

### Backend Work

The backend:

1. Authenticates the learner.
2. Validates active placement test availability.
3. Applies retake policy.
4. Checks that no conflicting active attempt exists.
5. Creates the placement attempt.
6. Writes an audit event.
7. Returns attempt metadata.

### Database Writes

Expected writes may include:

- placement attempt row;
- attempt status;
- started timestamp;
- learner ownership;
- placement test reference;
- audit log row.

### Response

Flutter receives:

- attempt ID;
- active status;
- placement test ID;
- allowed next action;
- learner-safe timestamps or progress metadata.

Flutter must not create, edit, or infer attempt status outside backend responses.

## Answer Submission Flow

### Request

Flutter submits each learner answer or a batch of answers according to the active contract.

```text
Flutter Mobile -> Backend API
POST /placement/attempts/{attemptId}/answers
```

### Backend Work

The backend:

1. Authenticates the learner.
2. Confirms attempt ownership.
3. Confirms the attempt can accept answers.
4. Validates question eligibility.
5. Validates answer shape for the question type.
6. Stores the answer.
7. Updates answer progress if needed.
8. Writes audit data when required.

### Database Writes

Expected writes may include:

- placement answer row;
- answer revision metadata if resubmission is allowed;
- answer submitted timestamp;
- attempt progress summary;
- audit log row.

### Response

Flutter receives:

- accepted or rejected status;
- backend validation errors when rejected;
- safe progress metadata;
- allowed next action.

Flutter must not receive correctness, answer keys, skill scoring, or result fields before backend completion.

## Completion and Result Flow

### Request

Flutter asks the backend to complete the attempt.

```text
Flutter Mobile -> Backend API
POST /placement/attempts/{attemptId}/complete
```

### Backend Work

The backend:

1. Authenticates the learner.
2. Confirms attempt ownership.
3. Confirms the attempt is completable.
4. Loads submitted answers.
5. Loads backend-only scoring inputs.
6. Calculates placement score.
7. Calculates section score where applicable.
8. Produces estimated level output.
9. Produces skill signal output.
10. Produces weakness indicator output.
11. Produces initial learning path output.
12. Stores the placement result.
13. Marks the attempt completed.
14. Writes audit events.
15. Returns a learner-safe result response.

### Database Reads

Expected reads may include:

- placement attempt;
- placement answers;
- placement questions;
- placement sections;
- placement question-skill mappings;
- backend scoring rules;
- level or curriculum references required for output labels.

### Database Writes

Expected writes may include:

- completed attempt status;
- completed timestamp;
- placement result row;
- result section summaries;
- result skill summaries;
- initial path output row or serialized result field;
- audit log rows.

### Response

Flutter receives backend-generated placement output, such as:

- placement result ID;
- overall placement status;
- estimated starting level;
- section summaries;
- skill signals;
- review area labels;
- initial path summary;
- learner-safe explanation text.

Flutter must display these values as backend output. It must not recalculate or reinterpret them as authoritative client-side decisions.

## Result Read Flow

### Request

Flutter may request the persisted result after completion.

```text
Flutter Mobile -> Backend API
GET /placement/results/{resultId}
```

### Backend Work

The backend:

1. Authenticates the learner.
2. Confirms ownership or authorized access.
3. Loads the persisted result.
4. Filters fields for learner-safe display.
5. Returns the result.

### Response

The response must not expose:

- raw answer keys;
- internal scoring formulas;
- admin-only review data;
- privileged audit details;
- database internals;
- future AIM Engine runtime instructions.

## Admin Configuration Flow

Admin Dashboard placement configuration uses separate protected backend APIs.

```text
Admin Dashboard -> Backend API -> Database
```

Admin flows may create or update:

- placement tests;
- placement sections;
- placement questions;
- placement question-skill links;
- placement configuration status;
- admin-only validation summaries.

The Admin Dashboard must not write directly to the database, implement scoring rules in the browser, or bypass backend permission checks.

## Backend Authority Rules

The backend owns all final placement decisions.

| Data or Decision | Backend Responsibility |
| --- | --- |
| Active placement test | Select and validate |
| Section order | Select and validate |
| Question eligibility | Select and validate |
| Attempt lifecycle | Create, transition, complete |
| Answer acceptance | Validate and persist |
| Placement score | Calculate |
| Section score | Calculate |
| Estimated level | Calculate |
| Skill signals | Calculate |
| Weakness indicators | Calculate |
| Initial learning path output | Generate |
| Retake policy | Enforce |
| Audit events | Write |
| Safe field exposure | Filter |

Flutter and Admin Dashboard may render backend-approved state, but they must not become the authority for any item in this table.

## Forbidden Data Flow

The following flows are forbidden in Phase 4:

```text
Flutter Mobile -> AIM Engine runtime
Admin Dashboard -> AIM Engine runtime
Backend API -> AIM Engine runtime
Flutter Mobile -> direct database write
Admin Dashboard -> direct database write
Flutter Mobile -> placement scoring
Flutter Mobile -> level estimation
Flutter Mobile -> mastery calculation
Flutter Mobile -> weakness mapping
Flutter Mobile -> initial path calculation
Admin Dashboard -> placement scoring
```

Phase 4 may persist backend-generated placement outputs for future phases, but it must not call or simulate AIM Engine runtime integration.

## Security Boundaries

Every placement flow must preserve:

- authenticated learner identity for learner APIs;
- role or permission checks for admin APIs;
- attempt ownership checks;
- safe response field filtering;
- backend-only answer keys and scoring rules;
- server-side secret handling;
- audit records for sensitive state changes.

No flow may expose:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- privileged backend credentials;
- raw access or refresh tokens.

## Completion Checklist

Before a placement data-flow implementation task is considered complete, confirm:

- Flutter only sends requests and renders backend responses;
- backend owns attempt lifecycle, scoring, result generation, and field filtering;
- database writes happen only through backend-authorized paths;
- Admin Dashboard uses protected backend APIs only;
- no AIM Engine runtime call is introduced;
- no AI Teacher, lesson delivery, practice session, recommendation, or progress dashboard flow is introduced;
- no client calculates placement score, estimated level, mastery, weakness, or initial path;
- no secrets or privileged fields are exposed.
