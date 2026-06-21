# Phase 16 CI Admin Dashboard Hardening

**Task:** P16-014
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Review the existing Admin Dashboard CI workflow and document hardening
recommendations for production readiness.

## Current Workflow

**File:** `.github/workflows/admin-dashboard.yml`
**Name:** Admin Dashboard CI
**Trigger:** Push/PR to `main` on `apps/admin-dashboard/**`

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
      cache-dependency-path: apps/admin-dashboard/package-lock.json

  - name: Install dependencies
    run: npm ci

  - name: Typecheck
    run: npm run typecheck

  - name: Build
    run: npm run build
```

### Phase 1 Boundary Guard Comments

The workflow includes comments documenting:
- No AIM Engine logic allowed in admin dashboard (client-side)
- No AI provider keys or Supabase service-role keys in source
- No Student Web App routes

## Admin Dashboard Structure

### Application Layout

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Root page |
| `app/layout.tsx` | Root layout |
| `app/globals.css` | Global styles |
| `app/admin/` | Main admin area |
| `app/admin-auth-required/` | Auth required redirect |
| `app/admin-auth-unavailable/` | Auth unavailable page |
| `app/admin-unauthorized/` | Unauthorized access page |

### Components

| Component | File |
|-----------|------|
| Admin Shell Layout | `components/admin-shell-layout.tsx` |
| Admin Navigation | `components/admin-navigation.tsx` |
| Admin Placeholder Page | `components/admin-placeholder-page.tsx` |
| Admin Curriculum Placeholder | `components/admin-curriculum-placeholder-page.tsx` |
| Content Status Workflow | `components/content-status-workflow.tsx` |
| Billing Components | `components/billing/` |
| Common Components | `components/common/` |
| Layout Components | `components/layout/` |
| Error Handling | `components/error-handling/` |

### Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `jest.config.ts` | Jest test configuration |
| `jest.setup.ts` | Jest test setup |
| `package.json` | Dependencies and scripts |
| `lib/api/admin-api-config.ts` | API client configuration |

### Test Infrastructure

The admin dashboard has test infrastructure in place:
- `jest.config.ts` — Jest configuration exists
- `jest.setup.ts` — Test setup exists
- `__tests__/` — Test directory exists

However, `npm test` is **not run** in the CI workflow.

## Critical Gap: Tests Not Run in CI

The admin dashboard has Jest configured and a test directory, but the CI
workflow only runs `typecheck` and `build`. This means:

- Component rendering tests are not validated on push/PR
- Interaction tests are not validated
- Regression tests do not run automatically

**This is the most significant gap in the admin dashboard CI.**

## Hardening Recommendations

### 1. Add Test Step (P0)

```yaml
- name: Test
  run: npm test -- --ci --passWithNoTests
  env:
    NODE_ENV: test
```

`--passWithNoTests` ensures CI does not fail if the test suite is empty
initially, allowing incremental test addition.

**Priority:** P0 — Tests exist but are not being run.

### 2. Add Lint Step (P1)

If ESLint is configured in the project:

```yaml
- name: Lint
  run: npm run lint
```

Next.js projects typically include `next lint` which checks for common
issues.

**Priority:** P1

### 3. Add Secret Check (P0)

```yaml
- name: Check no backend secrets in source
  run: |
    if grep -rn "SERVICE_ROLE_KEY\|JWT_SECRET\|AI_PROVIDER_API_KEY\|STT_PROVIDER_API_KEY\|DATABASE_URL" \
      apps/admin-dashboard/ --include="*.ts" --include="*.tsx" --include="*.js" \
      | grep -v "node_modules\|__tests__\|\.d\.ts"; then
      echo "ERROR: Backend secret reference found in admin dashboard source"
      exit 1
    fi
    echo "OK: No backend secrets in admin dashboard source"
  working-directory: .
```

**Priority:** P0 — The admin dashboard uses `NEXT_PUBLIC_` prefixed
variables which are client-bundled. Any non-public variable reference would
leak to the browser.

### 4. Add Coverage Reporting (P1)

```yaml
- name: Test with Coverage
  run: npm test -- --ci --coverage --passWithNoTests
  env:
    NODE_ENV: test

- name: Upload Coverage
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: admin-coverage
    path: apps/admin-dashboard/coverage/
    retention-days: 14
```

### 5. Add Timeout (P1)

```yaml
jobs:
  lint-build-test:
    timeout-minutes: 15
```

### 6. Add Concurrency Control (P2)

```yaml
concurrency:
  group: admin-dashboard-${{ github.ref }}
  cancel-in-progress: true
```

### 7. Add Bundle Size Check (P2)

Monitor that the Next.js bundle does not grow unexpectedly:

```yaml
- name: Check bundle size
  run: |
    BUILD_DIR=".next"
    if [ -d "$BUILD_DIR" ]; then
      du -sh $BUILD_DIR
      echo "Check bundle size for regressions"
    fi
```

### 8. Add Accessibility Check (P2)

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    configPath: apps/admin-dashboard/.lighthouserc.json
```

This requires a `.lighthouserc.json` configuration file.

## Recommended Full Workflow

```yaml
name: Admin Dashboard CI

on:
  push:
    branches: [main]
    paths:
      - 'apps/admin-dashboard/**'
      - '.github/workflows/admin-dashboard.yml'
  pull_request:
    branches: [main]
    paths:
      - 'apps/admin-dashboard/**'
      - '.github/workflows/admin-dashboard.yml'

concurrency:
  group: admin-dashboard-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-build-test:
    name: Typecheck, Build, and Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    defaults:
      run:
        working-directory: apps/admin-dashboard

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: apps/admin-dashboard/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Check no backend secrets in source
        run: |
          if grep -rn "SERVICE_ROLE_KEY\|JWT_SECRET\|AI_PROVIDER_API_KEY\|STT_PROVIDER_API_KEY\|DATABASE_URL" \
            . --include="*.ts" --include="*.tsx" --include="*.js" \
            | grep -v "node_modules\|__tests__\|\.d\.ts"; then
            echo "ERROR: Backend secret reference found"
            exit 1
          fi
          echo "OK: No backend secrets found"

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Test
        run: npm test -- --ci --coverage --passWithNoTests
        env:
          NODE_ENV: test

      - name: Upload Coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: admin-coverage
          path: apps/admin-dashboard/coverage/
          retention-days: 14
```

## Missing: Web App (Parent Dashboard) CI

There is no CI workflow for `apps/web/` (the React parent dashboard). A
new workflow should be created:

**Recommended file:** `.github/workflows/web-app.yml`

Minimum steps:
1. Checkout
2. Node.js setup
3. `npm ci`
4. Secret check (no backend secrets in `REACT_APP_` code)
5. `npm test`
6. `npm run build`

## Summary

The admin dashboard CI is the weakest of the four code workflows because
it does not run tests despite having Jest configured. Adding the test step
is the single highest-impact improvement. The secret check is equally
critical because `NEXT_PUBLIC_` variables are inherently client-bundled,
making any accidental secret reference a production security issue.
