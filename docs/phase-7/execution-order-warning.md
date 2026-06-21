# Phase 7 — Execution Order Warning

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Critical Warning

**Phase 7 must NOT begin until all Phase 1–18 final reviews are complete.**

This is not a suggestion — it is a hard prerequisite. Phase 7 builds a browser client that depends on stable backend APIs, AIM Engine, authentication, billing, notifications, analytics, and operations infrastructure delivered by Phases 1–18.

## Why Phase 7 Is Deferred

Despite being numbered Phase 7, this phase is intentionally scheduled to execute after Phase 18. The numbering reflects the domain (Student Web App) not the execution order.

### Dependency Chain

| Phase | Provides | Required By Phase 7 |
|-------|----------|---------------------|
| 1 | Project foundation, auth, user model | Auth pages, profile, API client |
| 2 | Content model, curriculum structure | Curriculum browser, lesson viewer |
| 3 | Learning engine, mastery tracking | Progress display, skill state |
| 4 | Placement system | Placement flow UI |
| 5 | Assessment engine | Assessment flow UI |
| 6 | AIM Engine, recommendations | Dashboard recommendations, progress |
| 8 | Admin dashboard | Shared patterns, design validation |
| 9 | Parent portal | Shared auth patterns |
| 10 | AI Teacher backend | AI Teacher chat UI |
| 11 | Notification system | Notification list, preferences |
| 12 | Billing/subscription | Billing display, plan status |
| 13 | Reporting engine | Progress reports |
| 14 | Analytics pipeline | Activity summaries |
| 15 | Performance optimization | API contracts finalized |
| 16 | Security hardening | Security model, token handling |
| 17 | Operations infrastructure | Status page, feature flags |
| 18 | Final integration, review | All APIs stable and reviewed |

## Prerequisite Checks

Before starting any Phase 7 task, confirm:

1. `docs/phase-18/final-review.md` exists in the repository
2. P18-091 output exists in the repository
3. All Phase 1–18 final review documents are present
4. Phase 7 has been explicitly approved to run

## What Happens If You Start Early

- Backend APIs may not exist or may change
- AIM Engine contracts may not be finalized
- Authentication flow may not be stable
- Design system may not be complete
- Security model may not be hardened
- Test infrastructure may not be ready

Starting Phase 7 before Phase 18 completion risks building on unstable foundations that will require rework.

## Stop Conditions

Stop immediately if:

- Any Phase 1–18 final review is missing
- P18-091 output does not exist
- `docs/phase-18/final-review.md` does not exist
- Phase 7 has not been explicitly approved

Mark the task as **blocked** and document which prerequisite is missing.
