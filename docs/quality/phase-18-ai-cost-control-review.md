# Phase 18 — AI Cost Control Review

**Task:** P18-084
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Validate AI Teacher/Voice Tutor cost-control readiness: quota
enforcement, budgets, cost event recording, provider usage tracking,
model tiering, and fail-safe shutoff behavior.

## Review Scope

1. `AiCostQuotaService` (`governance/ai-cost-quota.service.ts`)
2. `AiUsageCostEventRepository` (cost event persistence)
3. Model tiering (`AiModelConfigRow.tier`)
4. Admin usage/cost visibility (`admin-usage-cost.controller.ts`, `AdminAiUsageCost.js`)

## Findings

### 1. Quota Enforcement Ordering

| Check | Status |
|---|---|
| `checkQuota(studentId, quotaPeriod, estimatedCost)` is documented and implemented to run **before** any provider call; `recordUsage(...)` is only called after the provider call completes (or fails), per the file-level comment in `ai-cost-quota.service.ts:1-5` | PASS |
| Quota state (`periodSpend`) is always recomputed server-side from `ai_usage_cost_events` via `sumCostSince`, never trusted from client input | PASS |
| Both `daily` (`DAILY_BUDGET_USD = 2.0`) and `monthly` (`MONTHLY_BUDGET_USD = 30.0`) budgets are enforced independently — a request must pass both checks | PASS |

### 2. Cost Event Recording

| Check | Status |
|---|---|
| `recordUsage` persists `eventType`, `modelConfigId`, `requestId`, `tokensUsed`, `durationSeconds`, `costEstimate`, `quotaPeriod` — sufficient detail for per-student cost attribution without storing message content | PASS |
| Admin usage/cost API/UI (`/admin/ai/usage`, `/admin/ai/usage/student/:id`, `/admin/ai/usage/student/:id/limit-status`, `AdminAiUsageCost.js`) is strictly read-only over these recorded events — no endpoint allows writing or backdating a usage row | PASS |
| The admin UI never computes `cost_estimate` client-side; it renders the backend-provided value as-is (verified by `admin-ai-usage-cost-ui.test.js` forbidden-pattern checks for `computeCost`/`estimateCost`) | PASS |

### 3. Model Tiering

| Check | Status |
|---|---|
| `AiModelConfigRow.tier` (`economy`/`standard`/`premium`) lets the backend route requests to a tier-appropriate provider/model independent of any client choice | PASS |
| Admin model config UI exposes tier and status as backend-managed fields only — no client-side tier selection logic that could route around cost controls | PASS |

### 4. Fail-Safe Shutoff

| Check | Status |
|---|---|
| `checkQuota` returns `allowed: false` once `periodSpend + estimatedCost > budget`, which the chat/voice pipeline is expected to treat as a hard stop before calling the provider | PASS |
| Because quota state is always recomputed from persisted cost events rather than cached in memory, a budget breach is enforced consistently across concurrent requests/instances | PASS |
| Admin usage/cost UI's per-student "limit status" lookup gives administrators visibility into daily/monthly used-vs-limit state without needing direct database access | PASS |

## Summary

Cost/quota enforcement is structured so the budget check always happens
before a provider call and the cost event is only recorded afterward,
with quota state always derived server-side from persisted usage rows.
Model tiering and admin visibility are both backend-authoritative; the
admin usage/cost UI is a pure read-only display surface with no local
cost computation. No bypass path was found that would let a client skip
the quota check or supply its own cost/quota outcome.

**Overall verdict: Pass.**
