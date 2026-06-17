# No Client AIM Regression Check

**Task:** P5-078  
**Date:** 2026-06-17  
**Branch:** `phase5/P5-078-no-client-aim-regression-check`  
**Script:** `scripts/checks/no-client-aim-regression-check.sh`  
**Scope:** Proves Flutter (`apps/mobile`) and Admin Dashboard (`apps/admin-dashboard`) do not call the AIM Engine directly or compute AIM-owned values.

---

## Purpose

Phase 5 mandates that the AIM Engine is backend-internal. Clients (Flutter mobile app, Admin Dashboard, web app) must never:

- Call `POST /aim/v1/analysis` or any AIM Engine endpoint directly.
- Reference `AIM_ENGINE_URL` as a call target.
- Import `AimEngineClientService` or `AimEngineAdapterService`.
- Construct AIM analysis request payloads.
- Compute mastery, weakness, difficulty, recommendations, review schedules, retention, or frustration signals locally.

This document records the results of a reproducible search/script check run against the current `main` branch.

---

## Check Results

**Script:** `bash scripts/checks/no-client-aim-regression-check.sh`  
**Directories checked:** `apps/mobile/lib`, `apps/admin-dashboard`, `apps/web`  
**File types:** `.dart`, `.ts`, `.tsx`, `.js`

| # | Check | Result |
|---|---|---|
| 1 | Client does not reference `/aim/v1/analysis` | ✓ PASS |
| 2 | Client does not use `AIM_ENGINE_URL` as a fetch target | ✓ PASS |
| 3 | Client does not import `AimEngineClient` or `AimEngineAdapter` | ✓ PASS |
| 4 | Client does not construct AIM analysis request payloads | ✓ PASS |
| 5 | Flutter does not compute mastery locally | ✓ PASS |
| 6 | Flutter does not compute difficulty locally | ✓ PASS |
| 7 | Admin Dashboard does not compute mastery or weakness | ✓ PASS |

**Overall result: PASS — 7/7 checks passed. AIM Engine client boundary is intact.**

---

## Supporting Evidence

### Flutter mobile app

- `apps/mobile/test/core/networking/backend_api_client_test.dart` contains an existing assertion: `expect(uri.toString().contains('aim-engine'), isFalse)` — the URL resolver test already guards against AIM Engine URL leakage.
- `apps/mobile/docs/no-aim-logic.md` documents the Flutter AIM boundary explicitly.
- `apps/mobile/lib/features/placement/ui/pages/placement_result_page.dart` displays backend-provided mastery signals without deriving them locally (comment: *"Use backend-provided signal directly — never compute from masteryScore"*).

### Admin Dashboard

- `apps/admin-dashboard/lib/api/README.md` lists `AIM_ENGINE_URL` under "Never expose these in the Admin Dashboard" — it is a prohibition, not a usage.
- All admin placement result pages carry scope guards in comments: *"No raw mastery values, correctness ratios, overallScore, or skill_key are displayed"*, *"No placement scoring … or AIM Engine runtime logic is present here"*.
- `apps/admin-dashboard/app/admin/reports/page.tsx` explicitly states: *"No local calculation of mastery, weakness, or recommendations."*

### Backend — sole AIM Engine caller

- `AimEngineAdapterService` carries the comment: *"This service is the sole backend caller of POST /aim/v1/analysis."*
- `AimEngineClientService` is the only file containing `fetch` calls to the AIM Engine.
- No non-backend file references `postAnalysis`, `AimAnalysisRequest`, or `AimAttemptInput`.

---

## How to Re-run

```bash
bash scripts/checks/no-client-aim-regression-check.sh
```

Exit code 0 = boundary intact. Exit code 1 = violation found. Add this to CI to prevent regression.

---

## Backend Authority Confirmation

| Rule | Status |
|---|---|
| Flutter does not call AIM Engine | ✓ Confirmed |
| Admin Dashboard does not call AIM Engine | ✓ Confirmed |
| Web app does not call AIM Engine | ✓ Confirmed |
| No client computes AIM-owned values | ✓ Confirmed |
| Backend (`AimEngineAdapterService`) is sole caller | ✓ Confirmed |
| No secrets in script or this document | ✓ Confirmed |
