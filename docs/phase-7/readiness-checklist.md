# Phase 7 Readiness Checklist

**Produced by:** P6-129 (Create Phase 7 Readiness Checklist)
**Date:** 2026-06-18
**Source:** Phase 6 output completeness review (P6-128)

---

## Purpose

This checklist defines the conditions that must be true before Phase 7 work
begins. It is a handoff gate, not a Phase 7 task list.

---

## Section 1: Phase 6 Invariants Must Remain True

Before Phase 7 work starts, verify that Phase 6 invariants are still intact:

- [ ] `placement_no_scoring_test.dart` suite passes with zero failures.
- [ ] `question_answer_flow_checks_test.dart` suite passes with zero failures.
- [ ] `no_aim_calculation_regression_test.dart` suite passes with zero failures.
- [ ] `no_ai_provider_regression_test.dart` suite passes with zero failures.
- [ ] `progress_recommendation_checks_test.dart` suite passes with zero failures.
- [ ] `AppRouter._protectedRoutes` includes all authenticated surfaces
      added in Phase 7.
- [ ] No AIM Engine or Python service URL appears in any Flutter file.
- [ ] No service-role key or AI provider key is committed in any file.

---

## Section 2: Open Phase 6 Gaps to Resolve First

These are Phase 6 gaps identified in P6-128 that should be resolved before
or during Phase 7:

### P0 — Must Resolve

- [ ] **Placement entry trigger (P6-046):** Implement logic that detects
      whether a student requires placement and routes them to `placementStart`
      before showing the main shell. Without this, the placement flow is only
      reachable via manual navigation.

### P1 — Should Resolve

- [ ] **Route registration for lesson / Q&A / AIM result pages:**
      Register named routes for lesson detail, chapter list, course list,
      question session, AIM result history, and progress sub-pages
      in `AppRouter.onGenerateRoute`.

- [ ] **Email confirmation deep-link:** Implement a deep-link handler for
      Supabase email-confirmation links so that students completing registration
      are returned to the app and signed in.

### P2 — Deferred Acceptable

- [ ] **Audio/video player:** Implement actual media playback for lesson
      `audio`/`video` assets. Currently shows metadata tile only.
- [ ] **HTTPS / certificate pinning:** Evaluate runtime HTTPS enforcement
      requirements for production.

---

## Section 3: Phase 7 Prerequisites

Before any Phase 7 feature work begins:

### Infrastructure

- [ ] Phase 5 AIM Engine is deployed to a stable environment reachable by
      the Flutter app's backend API tier.
- [ ] Phase 5 AIM Engine APIs (`/aim/skill-states`, `/aim/weaknesses`,
      `/aim/recommendations`, `/aim/review-schedule`, `/aim/results`) are
      returning real data for at least one test student account.
- [ ] Five pilot student accounts exist in Supabase Auth (AIM-029).
- [ ] Backend placement pipeline (complete → score → result) auto-triggers
      end-to-end without manual service invocation.

### Flutter Baseline

- [ ] `flutter analyze` runs with zero errors on `apps/mobile/`.
- [ ] `flutter test` runs with zero failures on `apps/mobile/test/`.
- [ ] `main` branch is green (all PRs merged, no merge conflicts).

### Documentation

- [ ] `docs/phase-6/final-review.md` is complete (P6-130).
- [ ] `docs/phase-7/` directory exists with this checklist.
- [ ] Phase 7 task database is created in Notion with all tasks defined.

---

## Section 4: Phase 7 Scope Boundaries (Pre-defined)

Phase 7 is expected to include (subject to final scoping):

| Area | Notes |
|---|---|
| AI Teacher real implementation | Streaming chat with backend-approved prompts |
| Voice AI | Audio I/O for language learning |
| Full analytics dashboard | Session and cohort analytics |
| Human review workflow | Teacher review of flagged responses |
| Audio/video player | In-app media playback |
| Push notifications | Lesson reminders, review due alerts |
| Deep linking | Email confirmation, lesson deep links |
| Parent dashboard | Guardian-facing progress view |
| Payment / subscription | Subscription and billing flow |
| Full E2E automated testing | Appium / integration test suite |

Phase 7 must NOT:
- Move AIM authority to Flutter.
- Add client-side scoring or mastery calculation.
- Add AI provider API calls directly from Flutter.
- Add service-role keys to Flutter.

---

## Sign-Off Gate

Phase 7 is ready to begin only when all P0 items in Section 2 are resolved,
all Section 3 prerequisites are confirmed, and this checklist is reviewed
and approved by GHOST.

**Approved by:** (to be signed when entering Phase 7)
**Date:** ___________
