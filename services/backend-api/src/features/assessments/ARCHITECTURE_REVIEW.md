# Assessment Feature — Architecture Review

**Ticket**: P10-072
**Date**: 2026-06-20
**Scope**: Backend (`services/backend-api/src/features/assessments/`) and Flutter (`apps/mobile/lib/features/assessments/`)

---

## 1. Backend Architecture (NestJS)

### Module structure (`assessments.module.ts`)

| Layer | Files |
|-------|-------|
| **Module** | `assessments.module.ts` — imports only `DatabaseModule`, `AuthModule` (infrastructure) |
| **Controller** | `assessment.controller.ts` — 8 endpoints under `student/assessments`, all JWT-guarded |
| **Services** | `assessment.service.ts`, `assessment-attempt.service.ts`, `assessment-grading.service.ts`, `assessment-deadline.service.ts`, `assessment-submission-flow.service.ts`, `assessment-progress-integration.service.ts`, `assessment-score-policy.service.ts`, `assessment-result.service.ts`, `assessment-feedback.service.ts`, `question-delivery.service.ts`, `answer-submission.service.ts` |
| **Repository** | `assessment.repository.ts` — raw SQL via `DatabaseService` |
| **Guards** | `guards/assessment-permission.guard.ts`, `guards/assessment-attempt-ownership.guard.ts`, `guards/assessment-result-ownership.guard.ts` |
| **Types** | `assessment.types.ts`, `assessment-grading.types.ts`, `api-contracts.ts`, `assessment-errors.ts` |
| **Helpers** | `assessment-validation.helpers.ts` |

### Separation of concerns: PASS

Each service has a single responsibility:

- **AssessmentService** — list/detail with deadline enrichment
- **AttemptLifecycleService** — start/resume/expire attempts
- **AssessmentDeadlineService** — deadline status computation
- **AssessmentGradingService** — correctness, scoring, late penalty, pass/fail
- **AssessmentScorePolicyService** — section weights, pass threshold
- **AssessmentSubmissionFlowService** — orchestrates submit → grade → persist pipeline
- **AssessmentResultService** — persist results, result history queries
- **AssessmentFeedbackService** — feedback gated by `feedback_policy`
- **AssessmentProgressIntegrationService** — fire-and-forget progress recording (stub)
- **QuestionDeliveryService** — deliver questions stripped of grading metadata
- **AnswerSubmissionService** — answer persistence

Controller delegates to services; no business logic in the controller.

### Finding: `assessment-errors.ts` unused by services

`assessment-errors.ts` defines `AssessmentErrorCode` enum and factory functions producing `AppError`, but services throw NestJS built-in exceptions (`ConflictException`, `NotFoundException`, `ForbiddenException`) directly. The error factories are tested in `assessment-errors.spec.ts` but not consumed by the actual services. This is a minor inconsistency — not a bug, since the NestJS exception layer handles both.

---

## 2. Flutter Architecture

### Layer structure

```
logic/entity/       → Pure domain entities (no deps on data layer)
data/models/         → JSON-serializable models with fromJson/toJson
data/datasources/    → Remote datasource interface + impl (HTTP calls)
data/repository/     → AssessmentRepositoryImpl (implements abstract repo)
logic/repository/    → AssessmentRepository (abstract interface)
logic/provider/      → Riverpod providers and StateNotifiers
ui/pages/            → Full-screen page widgets
ui/widgets/          → Reusable widget components
```

### Layer discipline: PASS

- **Entities** (`logic/entity/`) — pure Dart classes, no imports from `data/`.
- **Models** (`data/models/`) — `fromJson`/`toJson` factories, import entities for mapping.
- **Datasource** (`data/datasources/`) — abstract `AssessmentRemoteDatasource` + `AssessmentRemoteDatasourceImpl` using `ApiClient`.
- **Repository interface** (`logic/repository/assessment_repository.dart`) — abstract class importing only entities.
- **Repository impl** (`data/repository/assessment_data_repository.dart`) — implements abstract repo, depends on datasource.
- **Providers** (`logic/provider/`) — `assessment_provider.dart` wires datasource → repository → notifiers. Notifiers depend only on the abstract repository.
- **UI** (`ui/pages/`, `ui/widgets/`) — pages consume providers via `ref.watch`/`ref.listen`. No direct datasource or model imports from UI.

No layer violations detected. Each layer talks only to its adjacent layer.

### Riverpod state management: PASS

| Provider | Scope | Notes |
|----------|-------|-------|
| `assessmentRemoteDatasourceProvider` | singleton | Infrastructure, lives for app lifetime |
| `assessmentRepositoryProvider` | singleton | Infrastructure |
| `assessmentListProvider` | singleton | List persists across navigation |
| `assessmentDetailProvider` | **autoDispose** | Freed when detail page unmounts |
| `startAttemptProvider` | **autoDispose** | Freed after navigation away |
| `resumeAttemptProvider` | **autoDispose** | Freed after navigation away |
| `submitAttemptProvider` | **autoDispose** | Freed after submission flow |
| `attemptResultProvider` | **autoDispose** | Freed when result page unmounts |
| `resultHistoryProvider` | **autoDispose** | Freed when history page unmounts |
| `deadlinesProvider` | singleton | Deadline list persists |
| `answerDraftProvider` | **autoDispose.family** | Keyed by `attemptId`, freed on unmount |

Scoping is appropriate: transient operation providers use `autoDispose`, long-lived list/deadline data uses singleton, and per-attempt draft state uses `autoDispose.family`.

---

## 3. API Contract Boundary: PASS

### Endpoint-to-contract mapping

| Controller Endpoint | HTTP | Contract Type | Match? |
|---------------------|------|---------------|--------|
| `listAssessments` | `GET /student/assessments` | `AssessmentListItemContract[]` | Yes |
| `listDeadlines` | `GET /student/assessments/deadlines` | `StudentDeadlinesContract` | Yes |
| `getAssessmentDetail` | `GET /student/assessments/:id` | `AssessmentDetailContract` | Yes |
| `getResultHistory` | `GET /student/assessments/:id/history` | `ResultHistoryContract` | Yes |
| `startAttempt` | `POST /student/assessments/:id/attempts` | `StartAttemptContract` | Yes |
| `resumeAttempt` | `GET /student/assessments/attempts/:attemptId/resume` | `ResumeAttemptContract` | Yes |
| `submitAttempt` | `POST /student/assessments/attempts/:attemptId/submit` | `SubmitAttemptContract` | Yes |
| `getAttemptResult` | `GET /student/assessments/attempts/:attemptId/result` | `AttemptResultContract` | Yes |

### Flutter model alignment

Flutter models in `data/models/` map JSON fields matching the contract types. Key fields verified:

- `AssessmentListItemModel`: `id`, `type`, `title`, `description`, `deadlineStatus` — matches `AssessmentListItemContract`
- `AssessmentDetailModel`: `id`, `type`, `title`, `description`, `sections`, `maxAttempts`, `timeLimitSeconds`, `deadline` — matches `AssessmentDetailContract`
- `AttemptResultModel`: `resultId`, `attemptId`, `score`, `maxScore`, `passed`, `latePenaltyApplied`, `gradedAt`, `feedbackAllowed`, `breakdown` — matches `AttemptResultContract`
- `ResultHistoryModel`: `assessmentId`, `totalAttempts`, `results` — matches `ResultHistoryContract`
- `StudentDeadlineModel`: `assessmentId`, `assessmentTitle`, `deadlineId`, `opensAt`, `closesAt`, `extendedClosesAt`, `status` — matches `StudentDeadlineItemContract`

No field mismatches found.

---

## 4. Phase Boundaries: PASS

### Cross-feature dependency scan

**Backend**: `grep -rn "from.*features/" --include="*.ts" | grep -v "assessments/"` returned **zero results**. The assessments module imports only from:
- `../../auth/` (infrastructure — JWT guards, decorators)
- `../../database/` (infrastructure — database service)
- `../../common/` (shared `AppError` base class)

No imports from `lessons/`, `curriculum/`, `placement/`, `sessions/`, `students/`, `reports/`, or any other feature module.

**Flutter**: `grep -rn "features/" --include="*.dart" | grep -v "assessments"` returned **zero results** (excluding `auth` provider for the API client token, which is infrastructure). No imports from `lessons/`, `learning_path/`, `progress/`, `practice/`, or any other feature.

**Progress integration**: `AssessmentProgressIntegrationService` is a fire-and-forget stub that does not import from the `progress` feature. It is designed as the single integration point and currently logs rather than calling external services.

No circular dependencies. Phase boundaries fully respected.

---

## 5. Error Handling: PASS (with finding)

### Backend error flow

Services throw NestJS exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`) → controller does **not** catch (no try/catch) → NestJS exception filter converts to HTTP response with appropriate status code.

Ownership guards return `404 NOT_FOUND` (not `403 FORBIDDEN`) to prevent existence leaking — correct security pattern.

`AssessmentProgressIntegrationService` swallows errors internally (fire-and-forget) — correct for a non-critical integration point.

### Flutter error flow

`ApiClient` throws `ApiClientException` → datasource propagates → repository propagates → notifiers catch and map to `AppAsyncState.failure` (uses `AppAsyncFailure`) → UI reads state and displays error.

### Finding: typed error codes underutilized

`assessment-errors.ts` defines 15 error codes (`ASSESSMENT_NOT_FOUND`, `MAX_ATTEMPTS_REACHED`, `DEADLINE_CLOSED`, etc.) with factory functions, but services use generic NestJS exceptions instead. The Flutter side cannot currently distinguish error codes for differentiated UI handling (e.g., showing "max attempts reached" vs "deadline closed"). Not a correctness bug, but limits client-side error UX.

---

## 6. State Management: PASS

See the Riverpod provider table in Section 2. Key observations:

- **autoDispose** used correctly for all transient/page-scoped providers (detail, attempt operations, results).
- **Singleton** used correctly for long-lived data (assessment list, deadlines).
- **family** used for `answerDraftProvider` keyed by `attemptId` — correctly isolates draft state per attempt.
- All notifiers extend `StateNotifier<AppAsyncState<T>>`, providing consistent loading/success/failure states.
- No provider depends on another provider's notifier directly (only through `ref.watch` of the repository provider).

---

## 7. Test Coverage

### Backend test files (25 spec files)

| Test File | Coverage Area |
|-----------|---------------|
| `assessment.controller.spec.ts` | Controller endpoint routing and guard wiring |
| `assessment.service.spec.ts` | List/detail service logic |
| `assessment.repository.spec.ts` | Repository SQL queries |
| `assessment-attempt.service.spec.ts` | Attempt lifecycle (start/resume/expire) |
| `assessment-grading.service.spec.ts` | Grading correctness and scoring |
| `assessment-grading.integration.spec.ts` | End-to-end grading pipeline |
| `assessment-deadline.service.spec.ts` | Deadline status computation |
| `assessment-submission-flow.service.spec.ts` | Submit → grade → persist pipeline |
| `assessment-progress-integration.service.spec.ts` | Progress integration service |
| `assessment-progress-integration.spec.ts` | Progress integration (additional scenarios) |
| `assessment-score-policy.service.spec.ts` | Section weights and pass threshold |
| `assessment-result.service.spec.ts` | Result persistence and history |
| `assessment-feedback.service.spec.ts` | Feedback policy gating |
| `assessment-errors.spec.ts` | Error code factories |
| `assessment-validation.helpers.spec.ts` | Input validation helpers |
| `assessment-permission.spec.ts` | Permission guard logic |
| `api-contracts.spec.ts` | Contract type shape validation |
| `question-delivery.service.spec.ts` | Question delivery (stripped metadata) |
| `answer-submission.service.spec.ts` | Answer submission |
| `attempt-lifecycle.spec.ts` | Attempt lifecycle edge cases |
| `deadline-enforcement.spec.ts` | Deadline enforcement scenarios |
| `no-client-authority-api.spec.ts` | Verifies no client-authority fields in API |
| `guards/assessment-permission.guard.spec.ts` | Permission guard unit tests |
| `guards/assessment-attempt-ownership.guard.spec.ts` | Attempt ownership guard |
| `guards/assessment-result-ownership.guard.spec.ts` | Result ownership guard |

### Flutter test files

No Flutter test files found under `apps/mobile/lib/features/assessments/`. Flutter tests would typically live under `apps/mobile/test/features/assessments/` — this directory was not found.

---

## Summary of Findings

| Area | Status | Notes |
|------|--------|-------|
| Backend module structure | **PASS** | Clean single-responsibility services, proper guard layering |
| Flutter layer discipline | **PASS** | Entity → Model → Datasource → Repository → Provider → UI respected |
| API contract alignment | **PASS** | All 8 endpoints match contracts; Flutter models match field-for-field |
| Phase boundaries | **PASS** | Zero cross-feature imports; progress integration is a stub |
| Error handling | **PASS** | Correct flow, but typed error codes in `assessment-errors.ts` are unused by services |
| State management | **PASS** | autoDispose/singleton/family scoping is appropriate |
| Test coverage | **PARTIAL** | Backend: 25 spec files covering all layers. Flutter: no test files found |

### Actionable items (non-blocking)

1. **Wire up `assessment-errors.ts`** — services should use the typed error factories instead of generic NestJS exceptions, enabling Flutter to show differentiated error messages.
2. **Add Flutter tests** — no test files exist for the Flutter assessments feature.
