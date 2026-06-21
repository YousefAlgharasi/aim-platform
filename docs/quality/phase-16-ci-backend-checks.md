# Phase 16 CI Backend Hardening

**Task:** P16-012
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Review the existing Backend API CI workflow and document hardening
recommendations for production readiness.

## Current Workflow

**File:** `.github/workflows/backend-api.yml`
**Name:** Backend API CI
**Trigger:** Push/PR to `main` on `services/backend-api/**`

### Current Steps

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Set up Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '24'
      cache: 'npm'
      cache-dependency-path: services/backend-api/package-lock.json

  - name: Install dependencies
    run: npm ci

  - name: Build
    run: npm run build

  - name: Test
    run: npm run test
    env:
      NODE_ENV: test
```

### Phase 1 Boundary Guard Comments

The workflow includes comments documenting:
- No AIM Engine logic in Backend API tests
- No exposed AI provider keys or Supabase service-role keys
- No Student Web App routes

These are documentation-only; no automated checks enforce them.

## Hardening Recommendations

### 1. Add Lint Step

The `package.json` does not currently include a lint script. If ESLint or
a similar linter is added, include it in CI:

```yaml
- name: Lint
  run: npm run lint
```

**Priority:** P1 — Prevents style drift and catches common errors.

### 2. Add Prisma Schema Validation

Verify that the Prisma schema is valid and migrations are in sync:

```yaml
- name: Validate Prisma Schema
  run: npx prisma validate
```

**Priority:** P0 — Catches schema errors before they reach staging.

### 3. Add Test Coverage Reporting

```yaml
- name: Test with Coverage
  run: npm run test:cov
  env:
    NODE_ENV: test

- name: Upload Coverage
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage
    path: services/backend-api/coverage/
    retention-days: 14
```

The `package.json` already defines `test:cov` as
`jest --config ./jest.config.js --coverage`.

**Priority:** P1 — Enables coverage tracking over time.

### 4. Add Dependency Security Audit

```yaml
- name: Security Audit
  run: npm audit --audit-level=high
  continue-on-error: true  # Start as warning, then make blocking
```

**Priority:** P1 — Catches known vulnerabilities in dependencies.

### 5. Add Secret Safety Check

```yaml
- name: Secret Safety Check
  run: bash scripts/check-env-safety.sh
  working-directory: .  # Run from repo root
```

**Priority:** P0 — Enforces the existing safety script in CI.

### 6. Add Timeout

```yaml
jobs:
  build-and-test:
    timeout-minutes: 15
```

**Priority:** P1 — Prevents stuck builds from consuming runner time.

### 7. Add Concurrency Control

```yaml
concurrency:
  group: backend-api-${{ github.ref }}
  cancel-in-progress: true
```

**Priority:** P2 — Cancels redundant runs on rapid pushes.

### 8. Add Backend Authority Guard Check

Automate the Phase 1 boundary guard comments:

```yaml
- name: Check no client-authority patterns
  run: |
    # Ensure no controller accepts client-computed mastery/grades
    if grep -rn "body.*mastery\|body.*grade\|body.*score.*computed\|body.*difficulty.*override" \
      services/backend-api/src/ --include="*.controller.ts" \
      | grep -v "spec\|test\|mock"; then
      echo "ERROR: Controller accepts client-computed values"
      exit 1
    fi
    echo "OK: No client-authority violations found"
```

**Priority:** P1 — Enforces a core architectural rule.

## Recommended Full Workflow

```yaml
name: Backend API CI

on:
  push:
    branches: [main]
    paths:
      - 'services/backend-api/**'
      - '.github/workflows/backend-api.yml'
  pull_request:
    branches: [main]
    paths:
      - 'services/backend-api/**'
      - '.github/workflows/backend-api.yml'

concurrency:
  group: backend-api-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    defaults:
      run:
        working-directory: services/backend-api

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: services/backend-api/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Validate Prisma Schema
        run: npx prisma validate

      - name: Build
        run: npm run build

      - name: Test with Coverage
        run: npm run test:cov
        env:
          NODE_ENV: test

      - name: Upload Coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: services/backend-api/coverage/
          retention-days: 14

      - name: Security Audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Secret Safety Check
        run: bash ../../scripts/check-env-safety.sh
        working-directory: .
```

## Test Infrastructure Review

### Jest Configuration

**Config file:** `jest.config.js` (referenced in `package.json`)
**Test pattern:** `*.spec.ts` files (256 files)
**Test environment:** `NODE_ENV=test` set in CI

### Test Categories Found

| Category | Count (approx.) | Location |
|----------|-----------------|----------|
| Auth guards/services | 12 | `src/auth/` |
| Admin management | 7 | `src/features/admin/` |
| AI Teacher | 8+ | `src/features/ai-teacher/` |
| AIM integration | 2 | `src/features/aim/` |
| Analytics | 11+ | `src/features/analytics/` |
| Assessments | 20+ | `src/features/assessments/` |
| Billing | 9+ | `src/features/billing/` |
| Curriculum | 1 | `src/features/curriculum/` |
| Notifications | 6+ | `src/features/notifications/` |
| Parents | 14+ | `src/features/parents/` |
| Placement | 4+ | `src/features/placement/` |
| Config | 1 | `src/config/` |

### E2E Test Support

An E2E test setup exists at `services/backend-api/test/`:
- `health.e2e-spec.ts` — Health endpoint E2E test
- `setup-test-env.ts` — Test environment setup

The E2E tests use test environment variables and do not require a running
database (mocked via test setup).

## Summary

The current backend CI workflow is functional but minimal. Adding Prisma
validation, coverage reporting, security auditing, and the secret safety
check would significantly improve production readiness. The recommended
full workflow above addresses all gaps identified in the P16-011 CI
pipeline audit.
