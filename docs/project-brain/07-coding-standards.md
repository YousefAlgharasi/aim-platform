# 07 — Coding Standards

> Last verified: 2026-07-04, by direct observation across `services/backend-api`, `services/aim-engine`, and `apps/mobile` during this session's reads, plus `git log` for commit conventions. These are observed conventions, not a prescriptive style guide.

## backend-api (NestJS/TypeScript)

- **Module organization**: feature-first, `src/features/<domain>/<subdomain>/`,
  one service class per concern (single-responsibility naming — 214
  `*.service.ts` files observed, each doing one job, e.g.
  `aim-adapter-timeout-policy.service.ts`, `aim-adapter-error-handler.service.ts`
  as two distinct files rather than one combined adapter service).
  Sub-concerns commonly further split into `repositories/`, `guards/`,
  `interfaces/`, `tests/` folders within a feature.
- **Test placement**: `.spec.ts` files colocated, frequently under a
  `tests/` subfolder within the feature (e.g.
  `features/aim/adapter/aim-engine-contract.spec.ts`), rather than a
  top-level mirrored test tree. Confirmed 298 suites this way, all passing.
- **Comment density/style**: favors explaining *why*, with dated
  task-number references (`P5-076`, `P20-005`, `P21-021b`) directly in
  code comments and even in test-suite headers explaining what defect a
  test originally caught and how it was fixed — comments read as a design
  changelog, not restating what the code does.
- **Fire-and-forget conventions**: explicitly commented at the call site
  when a call is intentionally not awaited (e.g.
  `placement-audit.service.ts`: "audit logging failures must never block
  the [attempt] flow") — the pattern is documented inline every time it's
  used, not left implicit.
- **Guard/permission naming**: `@RequireRoles(...)`, `@RequirePermissions(...)`
  decorators applied per-controller-method; guard classes named for their
  domain (`StudentOwnershipGuard`, `ParentChildAccessGuard`,
  `AnalyticsAccessGuard`) rather than one generic guard.

## aim-engine (Python/FastAPI)

- pydantic v2 with a custom `AimCamelCaseModel` base
  (`alias_generator=to_camel`) so internal attribute names stay snake_case
  while the wire format is camelCase — a deliberate, documented convention
  bridging TS/Python naming styles across the contract boundary.
- `ruff check` + `ruff format --check` both enforced in CI (not just lint,
  format too) — confirmed by reading `aim-engine.yml`.
- Docstrings on domain-service ports explicitly cite which
  `services/api/src/aim/domain/services/*.py` file they were ported from,
  by filename, in the code comment itself (e.g.
  `aim_analysis_pipeline.py:614` citing `mastery_calculator.py`).

## apps/mobile (Flutter/Dart)

- **State management**: `flutter_riverpod`, `StateNotifier` +
  `StateNotifierProvider` pairs named `<feature>_notifier.dart` /
  `<feature>_provider.dart`, wrapping a shared `AppAsyncState<T>`
  (loading/success/error) type defined once in `core/state/`. Confirmed
  repo-wide — no Bloc, no plain `ChangeNotifier`/`Provider` package usage
  found in this session's mobile catalog pass.
- **Test placement**: `test/features/<feature>/...` mirrors
  `lib/features/<feature>/...` exactly.
- **Routing**: single `AppRouter.buildRouter` route table
  (`lib/core/routing/app_router.dart`) with path constants in a separate
  `app_route_paths.dart`, and a centralized `_protectedRoutes` set +
  `resolveRouteName` auth gate rather than per-page auth checks.
- **Header comments as design-boundary documentation**: several page files
  carry a multi-line header comment stating exactly what backend endpoints
  they call and what they must never do (e.g. `voice_teacher_page.dart`:
  "This screen never calls an STT/TTS/AI provider directly and never
  computes mastery/level/weakness/difficulty/recommendation/review-schedule
  values") — this pattern was observed consistently enough across `home`,
  `voice_teacher`, and `progress` pages to call it a real convention, not a
  one-off.

## Commit message conventions (from direct `git log` read this session)

- Merge commits follow GitHub's default `Merge pull request #NNNN from
  <branch-name>` format.
- Feature/fix commit subjects are imperative, sometimes prefixed with the
  phase-task ID inline (e.g. "P21-021: document historical/read-only status
  of voice_sessions, voice_messages, voice_transcripts", "Fix Voice Teacher:
  greeting audio was never surfaced (P21-017 was never wired up)").
- Branch naming: `phase-<N>/<task-id>-<short-description>`,
  `fix/<short-description>`, `feature/<short-description>`,
  `chore/<short-description>`, `docs/<short-description>`.

## What is Unknown

- Whether a linting config (eslint rules, ruff rule set specifics) enforces
  any of the above conventions automatically, or whether they're purely
  human/agent-maintained discipline — CI runs `eslint` on backend-api but
  with `|| true` (non-blocking), so it does not enforce style at the CI
  gate level; confirmed by reading `backend-api.yml`.
