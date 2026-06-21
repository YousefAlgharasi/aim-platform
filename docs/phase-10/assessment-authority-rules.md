# Assessment Authority Rules

> Phase 10 — P10-003
> Scope: Quizzes, Exams, and Deadlines (Assessment) system only.

---

## 1. Purpose

This document establishes the binding rule that **Flutter and all other clients must never compute, derive, estimate, override, or persist correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, exam completion state, mastery, weakness, recommendations, review schedule, or AIM outputs**.

All assessment grading, scoring, pass/fail determination, deadline status, attempt lifecycle state, and result persistence are backend-authoritative operations. The backend is the sole source of truth for every assessment output defined in `docs/phase-10/assessment-domain-map.md`.

This rule applies to every Phase 10 task, every Flutter developer, every backend developer, and every agent executing Phase 10 work. It may not be overridden by task descriptions, implementation convenience, or product pressure.

---

## 2. The Rule

> **Flutter must not grade, score, or decide assessment outcomes locally. The backend is the final authority for all assessment decisions.**

This means Flutter must never:

- Compute correctness for a submitted answer.
- Compute a score, total score, or section score.
- Compute pass/fail.
- Compute deadline validity (open/upcoming/closed/missed/late/extended/expired) from raw timestamps.
- Compute a late penalty.
- Compute attempt eligibility (max attempts, retake policy, deadline window).
- Decide that an exam/attempt is complete.
- Compute mastery, level, weakness, difficulty, recommendations, review schedule, or any AIM output derived from an assessment result.
- Store grading rules, score thresholds, section weights, or deadline-evaluation logic in Flutter code.
- Display a derived score, pass/fail, or deadline status before the backend API responds with that field.
- Cache a computed (non-backend) score or deadline status and serve it from local storage as if authoritative.
- Write assessment results, progress, skill states, weaknesses, recommendations, or review schedules directly to any datastore.
- Call the AIM Engine or Python services directly.

This means the backend must never:

- Trust a client-submitted score, correctness, or deadline-state field on any write endpoint.
- Allow a client to override a grading outcome.
- Expose correct answers to Flutter before grading completes, unless the assessment explicitly allows post-result feedback and the backend has approved it.
- Persist a Result from anything other than the backend grading service.

---

## 3. What Flutter Is Allowed to Do

Flutter's role in the assessment flow is strictly limited to:

| Allowed Action | Description |
| --- | --- |
| Display assessment list/detail | Render assessment id, type, title, description from the backend |
| Display questions | Render question content, type, and options received from the backend |
| Record answer selections | Hold the student's selected answer locally (draft state) until submission |
| Submit answers | Send each answer to the backend answer-submission API |
| Start/resume attempts | Call backend attempt-start/resume APIs and render the returned attempt state |
| Submit attempts | Call the backend attempt-submission API |
| Display deadline status | Show the backend-derived deadline status label and raw timestamps for countdown UI |
| Fetch and display results | Call the result API and render score, maxScore, passed, gradedAt exactly as returned |
| Display result breakdown | Show backend-approved per-section/per-question feedback |
| Display assessment history | Show backend-approved past attempt/result records, scoped to the authenticated student |
| Navigate based on backend state | Move between screens once the backend has responded with the relevant state |

Flutter must not perform any computation on the data it receives beyond rendering, draft-state holding, and navigation.

---

## 4. What Flutter Must Never Contain

The following must not appear anywhere in Flutter code — not in models, services, utilities, providers, BLoC/state-notifier logic, or comments:

| Forbidden Item | Why Forbidden |
| --- | --- |
| Correctness-checking logic (e.g. `isCorrect(answer, key)`) | Backend grading authority only |
| Score/total-score computation | Backend grading authority only |
| Pass-threshold constants or pass/fail comparisons | Backend score policy only |
| Deadline-status computation from raw timestamps (e.g. `isOpen(now, opensAt, closesAt)`) | Backend deadline authority only |
| Late-penalty computation | Backend score policy only |
| Attempt-eligibility computation (max attempts, retake checks) | Backend attempt lifecycle authority only |
| Local "attempt complete" flag not sourced from backend response | Backend attempt lifecycle authority only |
| Mastery/weakness/recommendation/review-schedule derivation from assessment data | Backend AIM authority only (Phase 5 rules) |
| Cached score or pass/fail value treated as authoritative | Score must not persist locally as truth |
| Direct database, AIM Engine, or Python service calls | Architecture boundary violation |

If a reviewer finds any of these in Flutter code, the code must be rejected and rewritten to remove the forbidden logic. The backend response must be the only source of these values.

---

## 5. Backend Authority Map

Every assessment domain entity from `docs/phase-10/assessment-domain-map.md` has exactly one authority owner. Clients may read backend-approved projections of these entities; they never write authoritative values.

| Decision | Backend-Owned Service | Client Role |
| --- | --- | --- |
| Assessment/section/question-link definition | Assessment service | Read-only display |
| Attempt eligibility (max attempts, retake) | Attempt service | Calls start API; displays result |
| Attempt lifecycle state | Attempt service | Displays returned status |
| Deadline status (open/closed/missed/late/expired) | Deadline service | Displays returned status/timestamps |
| Late penalty application | Score policy service | Displays final score only |
| Answer correctness | Grading service | Submits answer; displays feedback only when approved |
| Score / pass-fail | Grading service / score policy service | Displays returned score/passed |
| Result persistence | Grading service | Reads via Result API |
| Result breakdown / feedback | Grading service | Displays only backend-approved fields |
| Assessment-progress / AIM integration | Backend progress integration service (Phase 5 authority rules apply) | No direct read or write of progress/AIM state |
| Audit logging | Backend audit logging | No access in Phase 10 |

---

## 6. Why This Rule Exists

### 6.1 Correctness

Grading, score policy, and deadline rules are deliberate backend design decisions (max attempts, late policy, pass thresholds). A Flutter-side reimplementation would need to be kept in sync with backend changes, creating a synchronization risk and potential divergence between what Flutter shows and what the backend persisted.

### 6.2 Security

Assessment results determine pass/fail and downstream progress/AIM signals. A client that computes its own score or deadline status could be modified to falsify results, bypass deadlines, or expose grading internals to reverse engineering. Keeping grading, scoring, and deadline evaluation on the backend prevents result manipulation and protects assessment integrity.

### 6.3 Evolvability

Score policy, late-penalty rules, and deadline-evaluation rules will evolve. Backend-only authority means rule changes require only a backend deployment — no Flutter release is needed.

### 6.4 AIM and Progress Boundary

Phase 10 must remain consistent with the Phase 5 AIM authority rules (`docs/phase-5/no-client-aim-rule.md`). Allowing Flutter to derive mastery, weakness, or recommendations from assessment data would reproduce AIM Engine behavior inside the client, which violates that existing boundary.

---

## 7. Enforcement

### 7.1 Code Review

Every Flutter or backend PR that touches assessment code must be reviewed against this rule. Reviewers must reject any PR that contains grading logic, score/deadline computation, or client-trusted authority fields on a write endpoint.

### 7.2 Agent Execution

Any agent executing a Phase 10 task must:

- Read this document before writing assessment code.
- Refuse to add grading, scoring, deadline-evaluation, or AIM-derivation logic to Flutter code.
- Refuse to make a backend endpoint trust a client-submitted score/correctness/deadline-state field.
- Mark the task Blocked if the task description would require violating this rule.

### 7.3 Backend Validation

Backend DTOs for answer submission and attempt submission must not accept score, correctness, or deadline-state fields from the client as authoritative input. Any such field present in a request body must be rejected or ignored, never persisted as truth.

---

## 8. Affected Assessment Outputs

| Output | Backend-Authoritative | Flutter Role |
| --- | --- | --- |
| Answer correctness | ✅ Backend grading service only | Display only when backend-approved feedback is returned |
| Score / max score | ✅ Backend grading/score policy only | Display as returned by Result API |
| Pass/fail | ✅ Backend score policy only | Display as returned by Result API |
| Deadline status | ✅ Backend deadline service only | Display label/timestamps as returned |
| Late penalty applied | ✅ Backend score policy only | Display final score/result only |
| Attempt eligibility | ✅ Backend attempt service only | Calls start/resume API; never assumes eligibility |
| Attempt completion state | ✅ Backend attempt service only | Display returned status |
| Result breakdown / feedback | ✅ Backend grading service only | Display only backend-approved fields |
| Mastery / weakness / recommendations / review schedule | ✅ Backend AIM integration only (Phase 5 rules) | No access in Phase 10 |

---

## 9. Relationship to Other Rules

| Document | Relationship |
| --- | --- |
| `docs/phase-10/quizzes-exams-deadlines-charter.md` (P10-001) | Defines Phase 10 scope and high-level non-negotiable rules — this document expands the authority detail |
| `docs/phase-10/assessment-domain-map.md` (P10-002) | Defines the entities this authority map applies to |
| `docs/phase-5/no-client-aim-rule.md` | Prohibits client-side AIM computation — this rule extends that boundary to assessment-derived AIM inputs |
| `docs/phase-4/no-client-side-placement-scoring.md` | Prior-phase precedent for backend-only scoring authority |

---

## 10. Out of Scope

The following are not addressed by this rule (they are handled by other Phase 10 scope documents):

- Answer submission request/response shapes (handled by P10-004 API contract map and the answer-submission service tasks).
- Specific deadline-state transition rules (handled by the deadline service task).
- Admin quiz/exam management UI (deferred to Phase 11).
- Deadline notifications (deferred to Phase 13 unless a task explicitly states otherwise).

---

## 11. Metadata

| Field | Value |
| --- | --- |
| Task ID | P10-003 |
| Branch | phase10/P10-003-assessment-authority-rules |
| Priority | P0 |
| Dependency | P10-001 |
| Output | docs/phase-10/assessment-authority-rules.md |
