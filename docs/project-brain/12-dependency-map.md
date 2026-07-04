# 12 — Dependency Map

> Last verified: 2026-07-04, by direct constructor-injection reads and repo-wide grep for cross-service references during this session's full inventory.

## Real service-to-service dependency edges (backend-api)

- `VoiceOrchestratorService` → depends on `AiTeacherOrchestratorService`
  (hard) and `AiChatMessageRepository` (hard) — confirmed by constructor
  injection read; this is *the* concrete Phase-21 unification edge.
- `AuthProfileBootstrapService` → depends on `DatabaseService`,
  `UsersService`, `AuthLoggingService`, `AnalyticsEventIngestionService`,
  `BillingRepository`, `SubscriptionService` (all hard — bootstrap fails if
  any is unavailable, since it upserts users/profiles/roles/free-plan in
  one flow).
- `review-schedule-output.service.ts` (in `features/aim/persistence/`) →
  calls `LearningReminderIntegration.createReviewReminder` at 3 call
  sites — a real cross-feature edge from the AIM persistence layer into
  Notifications.
- `NotificationReminderScheduler` (the only real cron job runner) →
  depends on `ReminderScheduleService`, `LearningReminderIntegration`,
  `ParentSummaryReminderIntegration`, `AdminBroadcastService.processDue()`.
- `PlacementAnswerSubmitService`, `PlacementAttemptService`,
  `PlacementAttemptCompleteService`, `PlacementResultService` → each fires
  `void this.analytics.record*(...)` and `void this.audit.log*(...)` calls
  (soft — fire-and-forget, documented as never allowed to block the
  critical path).
- `sessions.controller.ts` → depends on `AimPipelineOrchestratorService`
  (hard, blocking `await` — see `02-system-architecture.md`).
- Nearly every feature module → depends on `DatabaseService` (hard,
  universal).

## Cross-app dependency (frontend → backend)

- `apps/mobile` → depends on essentially the full backend REST surface
  (achievements, ai-teacher, aim, assessments, billing, curriculum,
  engagement, lessons, notifications, placement, profile, sessions,
  student-*, voice-teacher) — confirmed by the mobile catalog pass this
  session; **no mobile caller exists** for `lessons/:id/progress` or
  `.../complete` from the `lessons` feature specifically (the endpoints
  exist on the backend and are called from elsewhere in mobile, but not
  from a lesson-content-viewing flow, since no such flow exists in mobile
  either — see `10-known-problems.md`/full inventory notes).
- `apps/admin-dashboard` → depends on ~90 admin/curriculum/placement/
  billing/operations/analytics endpoints, via two different client
  mechanisms (`adminApiClient` typed wrapper vs. `backendFetch` untyped
  helper) — both hard dependencies on the same backend, just inconsistent
  client-side plumbing.
- `apps/student-web` → depends on a narrower slice (auth, curriculum,
  lessons, assessments read paths, placement, profile, billing,
  notifications, ai-teacher, support) — several features (progress,
  settings, practice) have **no live backend dependency at all**, since
  they're static "not available yet" stubs.
- `apps/web` → depends on its own parent-dashboard/admin-ai/admin-analytics/
  admin-notifications endpoint set, overlapping heavily with
  `admin-dashboard`'s.

## Package dependency versions (major mismatches flagged)

- **backend-api** (`package.json`, not fully enumerated this session beyond
  the Prisma mismatch already noted in `03-tech-stack.md`): `@prisma/client@7.8.0`
  vs. `prisma@6.19.3` CLI — confirmed mismatch, doesn't block the running
  app (raw `pg`).
- **aim-engine** (`pyproject.toml`): packages `services/api/src` via
  `[tool.setuptools.packages.find] where = ["services/api/src"]` — this is
  the actual mechanism (combined with the runtime `sys.path` hack) that
  makes `services/api`'s domain services importable; not a version
  mismatch, but a real, load-bearing packaging dependency worth flagging
  since it's easy to mistake `services/api` for genuinely unused.
- **apps/mobile** (`pubspec.yaml`, confirmed via `flutter pub get` this
  session): 22 packages have newer versions than the pinned constraints
  allow (e.g. `go_router` 14.8.1 pinned vs. 17.3.0 available, `riverpod`
  2.6.1 pinned vs. 3.3.2 available) — pinned-but-outdated, not broken (all
  838 tests pass at pinned versions).

## External dependency edges (hard vs. soft)

| Integration | Hard/soft | Notes |
|---|---|---|
| Supabase Postgres | Hard | Every feature depends on `DatabaseService` |
| Supabase Auth (JWT verification only, no SDK) | Hard | `SupabaseJwtVerifierService` gates nearly every endpoint |
| AI provider (OpenAI-compatible chat) | Hard for AI Teacher chat | Real `fetch()` calls, no fallback provider coded |
| STT provider (Groq, default) | Hard for Voice Teacher | Real calls; safe-failure service exists for graceful degradation of the *response*, but the call itself is not optional |
| TTS provider (tts.ai) | Hard for Voice Teacher | Same pattern as STT |
| Payment provider | **None bound** | Adapter is a literal `{}` — this is not a soft/optional dependency gracefully degrading, it's an absent implementation that would throw if invoked |
| Push/email notification providers | **None real (no-op stubs)** | Soft in the sense that nothing crashes, but no real delivery occurs |
| `services/api` (domain services) | Hard for aim-engine's pipeline | Not optional — the 6 ported domain services are the actual mastery/retention/weakness/difficulty/recommendation/emotional-state logic |

## What is Unknown

- Full `package.json` dependency list for `apps/admin-dashboard`,
  `apps/student-web`, `apps/web` — not individually enumerated this
  session beyond stack identification in `03-tech-stack.md`.
- Whether any dependency-injection edge exists from aim-engine back into
  backend-api beyond the documented HTTP contract (not expected, not
  found, but not exhaustively proven absent).
