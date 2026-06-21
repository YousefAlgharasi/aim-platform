# Phase 16 CI Pipeline Audit

**Task:** P16-011
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Review all GitHub Actions CI workflows in `.github/workflows/` for
completeness, correctness, and production readiness.

## Workflow Inventory

| # | Workflow | File | Trigger | Jobs |
|---|----------|------|---------|------|
| 1 | Backend API CI | `backend-api.yml` | Push/PR to `main` on `services/backend-api/**` | `build-and-test` |
| 2 | Flutter Mobile CI | `mobile.yml` | Push/PR to `main` on `apps/mobile/**` | `analyze-and-test` |
| 3 | Admin Dashboard CI | `admin-dashboard.yml` | Push/PR to `main` on `apps/admin-dashboard/**` | `lint-build-test` |
| 4 | AIM Engine CI | `aim-engine.yml` | Push/PR to `main` on `services/aim-engine/**` | `lint-and-test` |
| 5 | Docs Consistency CI | `docs.yml` | Push/PR to `main` on `docs/**` | `docs-consistency` |

**Missing workflows:** No CI for `apps/web/` (React parent dashboard).

## Per-Workflow Audit

### 1. Backend API CI (`backend-api.yml`)

**Steps:**
1. Checkout (`actions/checkout@v4`)
2. Set up Node.js 24 (`actions/setup-node@v4`) with npm cache
3. `npm ci`
4. `npm run build`
5. `npm run test` (with `NODE_ENV=test`)

**Strengths:**
- Path-scoped trigger avoids unnecessary runs
- Uses `npm ci` for deterministic installs
- Caches npm dependencies via `cache-dependency-path`
- Runs both build and test

**Gaps:**
- No lint step (ESLint/Prettier not run)
- No coverage reporting
- No Prisma schema validation step
- No security scanning (npm audit)
- No artifact upload (test results, coverage)
- No timeout configured
- Comments reference "Phase 1 boundary guards" but no automated enforcement of those boundaries in CI

**Recommendation:** Add `npm run lint`, `npx prisma validate`, coverage
reporting, and `npm audit --audit-level=high`.

### 2. Flutter Mobile CI (`mobile.yml`)

**Steps:**
1. Checkout (`actions/checkout@v4`)
2. Setup Flutter (`subosito/flutter-action@v2`, stable channel, cached)
3. `flutter pub get`
4. `flutter analyze --no-fatal-infos`
5. `flutter test`

**Strengths:**
- Path-scoped trigger
- Flutter SDK cached
- Static analysis run before tests
- `--no-fatal-infos` allows info-level diagnostics without blocking

**Gaps:**
- No test coverage reporting
- No build step (APK/IPA not generated in CI)
- No artifact upload
- No timeout configured
- No golden image testing

**Recommendation:** Add `flutter test --coverage`, upload coverage artifact,
consider adding `flutter build apk --debug` to verify build succeeds.

### 3. Admin Dashboard CI (`admin-dashboard.yml`)

**Steps:**
1. Checkout (`actions/checkout@v4`)
2. Set up Node.js 24 (`actions/setup-node@v4`) with npm cache
3. `npm ci`
4. `npm run typecheck`
5. `npm run build`

**Strengths:**
- Path-scoped trigger
- TypeScript type checking before build
- Uses `npm ci` for deterministic installs

**Gaps:**
- No test step (`jest.config.ts` and `jest.setup.ts` exist, `__tests__/` directory exists, but `npm test` is not run)
- No lint step
- No coverage reporting
- No accessibility audit
- No artifact upload
- No timeout configured

**Recommendation:** Add `npm test` step, `npm run lint` if configured,
and Lighthouse CI for accessibility.

### 4. AIM Engine CI (`aim-engine.yml`)

**Steps:**
1. Checkout (`actions/checkout@v4`)
2. Set up Python 3.11 (`actions/setup-python@v5`) with pip cache
3. `pip install -e ".[dev]"`
4. `ruff check .`
5. `ruff format --check .`
6. `pytest`

**Strengths:**
- Path-scoped trigger
- Linting with ruff (both check and format)
- Dev dependencies installed for testing
- pip caching enabled

**Gaps:**
- No coverage reporting (`pytest --cov`)
- No type checking (mypy/pyright)
- No security scanning (pip audit, safety)
- No artifact upload
- No timeout configured

**Recommendation:** Add `pytest --cov`, `pip-audit` for dependency
vulnerability scanning.

### 5. Docs Consistency CI (`docs.yml`)

**Steps:**
1. Checkout (`actions/checkout@v4`)
2. Check for unresolved merge conflict markers in `docs/`
3. Check FastAPI is not referenced as Phase 1 Backend API
4. Check no Student Web App is introduced
5. Check speed is not used as direct mastery signal (warning only)
6. Check required Phase 0 quality files exist

**Strengths:**
- Enforces architectural decisions (no FastAPI in Phase 1, no Student Web App)
- Catches merge conflict markers
- Verifies required files exist
- Speed-as-mastery check is warning-only (appropriate for docs)

**Gaps:**
- Only checks Phase 0 required files; does not verify files from later phases
- No markdown lint (markdownlint)
- No broken link detection
- Does not run `scripts/check-env-safety.sh`

**Recommendation:** Add `scripts/check-env-safety.sh` as a step, add
markdownlint, extend required files check to later phases.

## Cross-Cutting Gaps

### Missing Workflows

| Component | Gap | Impact |
|-----------|-----|--------|
| `apps/web/` (React parent dashboard) | No CI workflow | Code changes to parent dashboard are not automatically validated |
| Secret scanning | No workflow | Relies on manual checks and `check-env-safety.sh` (not in CI) |
| Integration tests | No workflow | Service-to-service contracts not validated in CI |
| Design system adherence | No workflow | UI compliance not checked automatically |

### Missing CI Features

| Feature | Status | Recommendation |
|---------|--------|----------------|
| Test coverage reporting | Not configured in any workflow | Add coverage to all test steps; upload as artifact or to Codecov |
| Artifact retention | Not configured | Add `actions/upload-artifact@v4` for test results, coverage, build outputs |
| Timeout configuration | Not set in any workflow | Add `timeout-minutes` to all jobs (recommend 15 for build+test) |
| Concurrency control | Not configured | Add `concurrency` to prevent duplicate runs on rapid pushes |
| Branch protection | Not configured | Require CI status checks before merge |
| Caching improvements | npm/pip/Flutter cached | Consider caching Prisma engines, Flutter build artifacts |
| Matrix testing | Not used | Consider testing against multiple Node.js versions |
| Dependency security | Not run | Add `npm audit` / `pip-audit` steps |

## Workflow Configuration Quality

| Aspect | Score | Notes |
|--------|-------|-------|
| Trigger configuration | Good | Path-scoped, push+PR on main |
| Action versions | Good | All use `@v4` or `@v2` (latest major) |
| Caching | Good | npm, pip, Flutter SDK cached |
| Deterministic installs | Good | `npm ci` used (not `npm install`) |
| Test execution | Partial | Tests run for 3/4 code workflows; admin dashboard skips tests |
| Static analysis | Partial | Flutter analyze and ruff lint run; no ESLint for Node.js projects |
| Security scanning | Missing | No dependency audit in any workflow |
| Coverage reporting | Missing | No coverage in any workflow |
| Artifact management | Missing | No artifacts uploaded |
| Documentation | Good | Phase 1 boundary guard comments in all code workflows |

## Priority Actions

1. **P0:** Add `npm test` to admin dashboard CI
2. **P0:** Create CI workflow for `apps/web/` (React)
3. **P1:** Add `scripts/check-env-safety.sh` to docs CI or a dedicated security workflow
4. **P1:** Add test coverage reporting to all workflows
5. **P1:** Add `timeout-minutes: 15` to all jobs
6. **P2:** Add dependency security scanning (`npm audit`, `pip-audit`)
7. **P2:** Add artifact upload for test results and coverage
8. **P2:** Add concurrency control to prevent duplicate runs
