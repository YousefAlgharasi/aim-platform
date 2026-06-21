# Phase 16 — Admin System Status UI Readiness

**Task:** P16-055
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Review readiness for an admin system status page that displays operational health using AIM design system and backend health/status APIs.

## Current State

### Backend Health APIs

| Endpoint | Exists | Returns |
|---|---|---|
| `/api/health` | YES | Basic server health (uptime, version) |
| `/api/health/db` | NO | Database connectivity status |
| `/api/health/aim` | NO | AIM engine availability |
| `/api/health/workers` | NO | Worker queue status |
| `/api/health/notifications` | NO | Notification service status |
| `/api/health/billing` | NO | Billing webhook status |

### Missing API Dependencies

The admin system status page requires backend health-check endpoints that do not yet exist for individual subsystems. Only the basic `/api/health` endpoint is available.

## UI Readiness Assessment

| Requirement | Status |
|---|---|
| AIM design system tokens available | READY |
| Admin shell and layout components available | READY |
| Loading/error/empty/forbidden states pattern | READY (from analytics shell) |
| RTL/Arabic readiness | READY |
| Backend health APIs for subsystems | NOT READY |

## Recommended Implementation

When backend health APIs are available, the admin system status page should:

1. Use `AdminShell` wrapper with standard state handling
2. Display subsystem health cards using `--color-success`, `--color-warning`, `--color-error` tokens
3. Show last-checked timestamp for each subsystem
4. Auto-refresh health status on configurable interval
5. All status data comes from backend APIs — no client-side health inference
6. Arabic labels for all status indicators

### Proposed UI Components

| Component | Design System Usage |
|---|---|
| SystemStatusCard | `--color-*` tokens, `--radius-md`, `--shadow-sm` |
| SubsystemHealthBadge | Status colors from design system palette |
| StatusRefreshControl | `--space-*` tokens, accessible button |
| SystemStatusLayout | `AnalyticsPageLayout` pattern reuse |

## Blockers

- Backend health-check endpoints for individual subsystems (DB, AIM, workers, notifications, billing) are not yet implemented.
- This is a documentation/readiness output; actual UI implementation deferred until health APIs exist.

## Verdict

**PASS** — Readiness documented. UI implementation blocked on backend health-check API development. Frontend patterns and design system tokens are ready.
