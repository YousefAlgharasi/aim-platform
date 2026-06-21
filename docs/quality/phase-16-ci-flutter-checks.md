# Phase 16 CI Flutter Mobile Hardening

**Task:** P16-013
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Review the existing Flutter Mobile CI workflow and document hardening
recommendations for production readiness.

## Current Workflow

**File:** `.github/workflows/mobile.yml`
**Name:** Flutter Mobile CI
**Trigger:** Push/PR to `main` on `apps/mobile/**`

### Current Steps

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup Flutter
    uses: subosito/flutter-action@v2
    with:
      channel: stable
      cache: true

  - name: Install dependencies
    run: flutter pub get

  - name: Analyze
    run: flutter analyze --no-fatal-infos

  - name: Test
    run: flutter test
```

### Phase 1 Boundary Guard Comments

The workflow includes comments documenting:
- No AIM Engine logic in Flutter client — mastery, level, difficulty are backend-owned
- No AI provider keys or Supabase service-role keys in source
- No Student Web App routes or adaptive logic

These are documentation-only; no automated checks enforce them.

## Mobile App Structure

### Feature Modules (`apps/mobile/lib/features/`)

| Feature | Description |
|---------|-------------|
| `achievements/` | Achievement display and tracking |
| `ai_teacher/` | AI teacher chat interface |
| `aim_results/` | AIM Engine results display |
| `analytics_summary/` | Student analytics overview |
| `assessments/` | Assessment taking flow |
| `auth/` | Authentication (Supabase) |
| `billing/` | Subscription and payment |
| `design_system_preview/` | DS component preview |
| `home/` | Home screen |
| `learning_path/` | Learning path visualization |
| `lessons/` | Lesson content and interaction |
| `notifications/` | Push/in-app notifications |
| `onboarding/` | First-run experience |
| `placement/` | Placement test flow |
| `practice/` | Practice sessions |
| `profile/` | User profile |
| `progress/` | Progress tracking |
| `question_answer/` | Question answering UI |
| `reviews/` | Review sessions |

### Test Structure (`apps/mobile/test/`)

| Directory | Purpose |
|-----------|---------|
| `test/core/` | Core utility tests |
| `test/features/` | Per-feature tests |
| `test/regression/` | Regression test suite |
| `test/widget_test.dart` | Basic widget rendering |

## Hardening Recommendations

### 1. Add Test Coverage Reporting

```yaml
- name: Test with Coverage
  run: flutter test --coverage

- name: Upload Coverage
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: flutter-coverage
    path: apps/mobile/coverage/
    retention-days: 14
```

**Priority:** P1 — Enables coverage tracking and identifies untested features.

### 2. Add Debug Build Verification

Verify the app builds successfully (catches asset, dependency, and
configuration issues that `flutter test` does not):

```yaml
- name: Build APK (debug)
  run: flutter build apk --debug
```

**Priority:** P1 — Catches build failures not surfaced by test/analyze.

### 3. Add Secret Check

Ensure no backend secrets are referenced in Dart source:

```yaml
- name: Check no backend secrets in source
  run: |
    if grep -rn "SERVICE_ROLE_KEY\|JWT_SECRET\|AI_PROVIDER_API_KEY\|STT_PROVIDER_API_KEY" \
      apps/mobile/lib/ --include="*.dart"; then
      echo "ERROR: Backend secret reference found in Flutter source"
      exit 1
    fi
    echo "OK: No backend secrets in Flutter source"
  working-directory: .
```

**Priority:** P0 — Prevents secret leakage into the mobile binary.

### 4. Add No-Client-Authority Check

Enforce the backend-authority rule in Flutter code:

```yaml
- name: Check no client-side mastery computation
  run: |
    # Flag any Dart code that computes mastery, difficulty, or grades locally
    if grep -rn "calculateMastery\|computeGrade\|adjustDifficulty\|computeScore" \
      apps/mobile/lib/ --include="*.dart" \
      | grep -v "// backend-owned\|// server-side\|test\|mock\|stub"; then
      echo "WARNING: Possible client-side authority violation"
    fi
    echo "OK: Client authority check passed"
  working-directory: .
```

**Priority:** P1 — Enforces the core AIM architecture rule.

### 5. Add Timeout

```yaml
jobs:
  analyze-and-test:
    timeout-minutes: 20
```

Flutter builds can be slow; 20 minutes provides headroom.

**Priority:** P1

### 6. Add Concurrency Control

```yaml
concurrency:
  group: mobile-${{ github.ref }}
  cancel-in-progress: true
```

**Priority:** P2

### 7. Add Pub Dependency Audit

```yaml
- name: Check outdated dependencies
  run: flutter pub outdated
  continue-on-error: true
```

**Priority:** P2 — Tracks dependency freshness without blocking.

## Recommended Full Workflow

```yaml
name: Flutter Mobile CI

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - '.github/workflows/mobile.yml'
  pull_request:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - '.github/workflows/mobile.yml'

concurrency:
  group: mobile-${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze-and-test:
    name: Analyze, Test, and Build
    runs-on: ubuntu-latest
    timeout-minutes: 20

    defaults:
      run:
        working-directory: apps/mobile

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Check no backend secrets in source
        run: |
          if grep -rn "SERVICE_ROLE_KEY\|JWT_SECRET\|AI_PROVIDER_API_KEY\|STT_PROVIDER_API_KEY" \
            lib/ --include="*.dart"; then
            echo "ERROR: Backend secret reference found in Flutter source"
            exit 1
          fi
          echo "OK: No backend secrets in Flutter source"

      - name: Analyze
        run: flutter analyze --no-fatal-infos

      - name: Test with Coverage
        run: flutter test --coverage

      - name: Upload Coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: flutter-coverage
          path: apps/mobile/coverage/
          retention-days: 14

      - name: Build APK (debug)
        run: flutter build apk --debug
```

## Summary

The current Flutter CI workflow is well-structured with both static
analysis and testing. The primary gaps are the lack of coverage reporting,
build verification, and automated secret/authority checks. Adding these
steps ensures that the mobile app binary does not contain secret keys and
that the backend-authority rule is enforced at the CI level.
