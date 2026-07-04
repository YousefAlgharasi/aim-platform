# 05 — API Contracts

> Last verified: 2026-07-04, by grepping every `@Controller`/`@Get`/`@Post`/`@Patch`/`@Put`/`@Delete` decorator in `services/backend-api/src/features/**` and `src/auth/**`, plus reading `services/aim-engine/app/api/*.py` directly. Spot-checked (not exhaustively line-diffed) against `docs/mobile-app-api-endpoints.md`.

## backend-api REST surface (~70 controllers)

Full controller-by-controller path + guard listing (path prefix as declared
in `@Controller(...)`, verbatim):

- `auth` — POST login, POST refresh, POST register (all public), POST logout
  [guard], GET me [guard], POST bootstrap [guard]
- `auth/test-login` — POST / (non-prod only, per `TestLoginService`)
- `student/achievements` [STUDENT] — GET /
- `admin` (multiple controllers share this prefix) [ADMIN] — assessments,
  deadlines, assessment-results, placement/results, session-summaries,
  audit-logs, activity-logs, reports/{enrollments,assessments,active-users},
  parents/{stats,links,invitations,consents}, roles (GET/GET:key), stats,
  users (GET/GET:id/PATCH:id/status), students/:id/{progress,lessons}
- `admin/ai/{audit,model-configs,prompts,safety,usage}` [ADMIN] — full
  CRUD/read set per sub-path (enumerated fully in the full-inventory pass)
- `ai-teacher` (7 controllers share this prefix) [STUDENT] — sessions
  (start/list), sessions/:id/messages (submit/history/stream via SSE),
  messages/:messageId/feedback, sessions/:id/safety-status
- `aim` [STUDENT + StudentOwnershipGuard] — students/:studentId/{skill-states,
  review-schedules,weakness-records,recommendations,difficulty-decisions},
  sessions/:sessionId/state
- `admin/analytics/dashboard`, `admin/analytics/reports/{assessment,
  curriculum,learning,revenue,users}`, `analytics/exports` (note: **missing
  the `/admin` prefix** its siblings use — confirmed real inconsistency, not
  assumed), `parent/analytics/reports`, `student/analytics/summary`
  [AnalyticsAccessGuard]
- `student/assessments` [STUDENT + AssessmentPermissionGuard] — full
  list/detail/history/attempt lifecycle
- `admin/billing` [ADMIN], `admin/billing/manage` [SUPER_ADMIN only],
  `billing/{checkout,invoices,refunds,subscriptions}` [guard],
  `billing/pricing` [**no guard — public**], `billing/webhooks`
  [**no guard** — signature-verified internally, not JWT-gated]
- `curriculum/{chapters,courses,lessons,lesson-assets,objectives,skills,
  questions,levels,workflow,audit-logs}` [PermissionGuard, per-route
  `@RequirePermissions`]
- `student/engagement` [STUDENT] — GET summary, GET stats, PUT goal
- `lessons` [STUDENT] — POST :id/progress, GET continue, GET quick-start,
  GET recommended-course, POST :id/complete
- `api/v1/notifications` (4 controllers: device-token, inbox, preferences,
  reminders) [NotificationOwnershipGuard] — **hardcodes its own `api/v1`
  prefix**, unlike almost every other controller
- `admin/notifications` [ADMIN] — full broadcast/template/queue/schedule/
  preference/audit-log management
- `admin/{feature-flags,feedback,incidents,maintenance-windows,operations,
  release-notes,support-tickets}` [OperationsAdminGuard]; user-facing
  `feature-requests`, `feedback`, `maintenance-windows`, `operational-status`,
  `release-notes`, `support-tickets` [OperationsOwnershipGuard or bare guard]
- `api/v1/parent` [guard, some +ParentChildAccessGuard] — **also hardcodes
  `api/v1`**, matching the notifications prefix pattern
- `admin/placement` [ADMIN], `placement` [STUDENT + PlacementPermissionGuard]
  — note: the placement-test-status endpoint is
  `/placement/admin/tests/:id/status` (**reversed prefix** vs. every sibling
  `/admin/placement/...` route — confirmed real inconsistency)
- `profile` [ProfileOwnershipGuard] — GET/PATCH me
- `sessions` [StudentOwnershipGuard + STUDENT] — POST start, POST :sessionId/attempt
- `student/{chapters,courses,lessons}` [STUDENT] — GET / each
- `voice-teacher/{audio,sessions,messages}` [ResolveInternalUserIdGuard, +
  VoiceSessionOwnershipGuard on audio submission] — full session/audio/
  feedback/history surface

**Prefix inconsistency summary** (all independently confirmed this session,
not assumed from docs): no global prefix is set anywhere (`main.ts` never
calls `setGlobalPrefix`); most controllers are bare paths; `notifications`
and `parents` controllers hardcode `api/v1/...` in their own decorators;
`analytics/exports` omits the `/admin` prefix its sibling analytics routes
use; the placement-test-status route has a reversed `/placement/admin/...`
prefix instead of `/admin/placement/...`.

## Drift vs. `docs/mobile-app-api-endpoints.md`

Spot-checked, not exhaustively diffed: the doc's 6 documented voice-teacher
endpoints (`POST /voice-teacher/sessions`, `GET /voice-teacher/sessions`,
`GET /voice-teacher/sessions/:id/messages`, `POST /voice-teacher/sessions/:id/audio`,
`GET /voice-teacher/audio/:audioRef`, `POST /voice-teacher/sessions/:id/feedback`)
matched actual controllers exactly. A full line-by-line diff across all ~70
controllers against this doc was **not** performed — treat the rest of the
doc as unverified drift risk, not confirmed either way.

## backend ↔ aim-engine contract

- **TS side**: `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts`
  — asserts exact camelCase field names for the request envelope
  (`backendRequestId`, `session`, `attempts`, `skillMasteryContext`) and
  nested types (`AimSkillMasteryContext` fields: `previousMasteryScore`,
  `recentAttempts`, `category`, `lastEvaluatedAt`, `retentionHistory`).
- **Python side**: `services/aim-engine/app/schemas/aim_analysis_request.py`
  / `aim_analysis_response.py`, using `AimCamelCaseModel`
  (`alias_generator=to_camel`, `populate_by_name=True`) so Python keeps
  snake_case attribute names while accepting/emitting camelCase on the wire.
- **Sync status**: confirmed in sync by both test suites passing in this
  session (backend jest 298/298, engine pytest 176/176) — this is a
  same-session-verified fact, not a doc claim.
- History (from the contract spec's own comments): originally caught a real
  contract defect (backend emitted camelCase, engine required snake_case
  with no alias) — fixed by adding the alias generator to the engine side;
  zero backend changes were needed.

## aim-engine's own HTTP surface

Exactly 3 endpoints (confirmed by reading `services/aim-engine/app/api/*.py`
directly, not inferred): `GET /health` (200/503 based on `app.state._ready`,
which is never set false anywhere found — effectively always 200 once the
process is up), `GET /version`, `POST /aim/v1/analysis` (bearer
service-token guarded via constant-time compare). Plus conditional
`/docs`/`/redoc`/`/openapi.json` outside production.

## What is Unknown

- Whether any endpoint documented in `docs/mobile-app-api-endpoints.md`
  beyond the voice-teacher 6 has actually drifted from the current
  controller set — not exhaustively checked.
- The real deployed `REACT_APP_API_BASE_URL` value for student-web, which
  determines whether the notifications/parents `api/v1` prefix mismatch
  (noted above and in `02-system-architecture.md`) is a live bug or a
  non-issue in production.
