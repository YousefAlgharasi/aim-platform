# Phase 16 CI Artifact and Retention Configuration

**Task:** P16-015
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document the current CI artifact and retention configuration across all
GitHub Actions workflows, and recommend improvements for production
readiness.

## Current State

### Artifact Uploads

**No artifacts are currently uploaded in any CI workflow.**

All five workflows (backend-api, mobile, admin-dashboard, aim-engine, docs)
run their steps and discard all outputs. This means:
- Test results are only visible in the GitHub Actions log
- Coverage reports are not persisted
- Build artifacts are not retained
- Failed test outputs cannot be downloaded for local debugging

### Retention Defaults

GitHub Actions default artifact retention is 90 days. Since no artifacts
are uploaded, this default is not relevant to the current configuration.

### Cache Configuration

| Workflow | Cache Type | Cache Key |
|----------|-----------|-----------|
| Backend API | npm | `services/backend-api/package-lock.json` |
| Mobile | Flutter SDK | Built-in `subosito/flutter-action` cache |
| Admin Dashboard | npm | `apps/admin-dashboard/package-lock.json` |
| AIM Engine | pip | `services/aim-engine/pyproject.toml` |
| Docs | None | N/A |

Caching is correctly configured for dependency installation but does not
cover build artifacts or test outputs.

## Recommended Artifact Configuration

### 1. Backend API Artifacts

```yaml
# After test step
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: backend-test-results
    path: |
      services/backend-api/coverage/
      services/backend-api/test-results/
    retention-days: 14

# After build step
- name: Upload Build Output
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: backend-build
    path: services/backend-api/dist/
    retention-days: 7
```

**Jest configuration needed:** Add `--json --outputFile=test-results/results.json`
to the test command for structured test results.

### 2. Flutter Mobile Artifacts

```yaml
# After test step
- name: Upload Coverage
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: flutter-coverage
    path: apps/mobile/coverage/
    retention-days: 14

# After debug build step (if added per P16-013)
- name: Upload Debug APK
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: flutter-debug-apk
    path: apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
    retention-days: 7
```

### 3. Admin Dashboard Artifacts

```yaml
# After test step (if added per P16-014)
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: admin-test-results
    path: apps/admin-dashboard/coverage/
    retention-days: 14

# After build step
- name: Upload Build Output
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: admin-build
    path: apps/admin-dashboard/.next/
    retention-days: 7
```

### 4. AIM Engine Artifacts

```yaml
# After pytest step
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: aim-engine-test-results
    path: |
      services/aim-engine/htmlcov/
      services/aim-engine/.coverage
    retention-days: 14
```

**pytest configuration needed:** Add `--cov --cov-report=html` to the
pytest command.

## Retention Policy

### Recommended Retention Periods

| Artifact Type | Retention | Rationale |
|---------------|-----------|-----------|
| Test coverage reports | 14 days | Sufficient for PR review and comparison |
| Structured test results | 14 days | Debugging window for recent failures |
| Build outputs (dist, .next) | 7 days | Only needed for immediate deployment verification |
| Debug APK | 7 days | Manual testing window |
| Release APK/IPA | 90 days | Matches release lifecycle |
| Security audit results | 30 days | Compliance audit trail |

### Storage Considerations

GitHub Actions provides:
- 500 MB free artifact storage (free tier)
- 2 GB artifact storage (Team/Enterprise)

Estimated per-run artifact sizes:

| Artifact | Estimated Size |
|----------|---------------|
| Backend coverage | 2-5 MB |
| Backend dist | 10-20 MB |
| Flutter coverage | 1-3 MB |
| Flutter debug APK | 30-50 MB |
| Admin build | 20-40 MB |
| AIM Engine coverage | 1-2 MB |
| **Total per full run** | **65-120 MB** |

With 14-day retention and ~2 builds/day, storage usage would be approximately
1.8-3.4 GB. This exceeds the free tier. Recommend:
- Keep coverage artifacts (small) at 14 days
- Keep build artifacts at 7 days or on-demand only
- Skip debug APK upload in regular CI; only on release branches

## Recommended GitHub Actions Configuration

### Repository-Level Settings

In GitHub repository Settings > Actions > General:

| Setting | Recommended Value |
|---------|-------------------|
| Artifact and log retention | 14 days (default override) |
| Fork pull request workflows | Require approval for first-time contributors |
| Workflow permissions | Read repository contents |

### Workflow-Level Timeout Defaults

All jobs should specify `timeout-minutes` to prevent stuck builds from
consuming minutes:

| Workflow | Recommended Timeout |
|----------|-------------------|
| Backend API | 15 minutes |
| Mobile | 20 minutes |
| Admin Dashboard | 15 minutes |
| AIM Engine | 10 minutes |
| Docs | 5 minutes |

## Summary

### Current State
- No artifacts uploaded in any workflow
- Dependency caching is properly configured
- No retention policies set (irrelevant since no artifacts exist)

### Recommended Actions
1. **P1:** Add test coverage upload to all code workflows
2. **P1:** Add timeout to all jobs
3. **P2:** Add build artifact upload for deployment verification
4. **P2:** Configure repository-level retention defaults
5. **P2:** Add structured test result output (JSON) for better CI reporting
6. **P3:** Consider GitHub Actions caching for Prisma engines and Flutter build cache
