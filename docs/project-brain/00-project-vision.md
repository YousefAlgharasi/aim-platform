# 00 — Project Vision

> Last verified: 2026-07-04, by direct code/product-surface review during this session's repo audit + full inventory + Flutter toolchain verification.

## What AIM Platform actually is

AIM Platform is an English-language learning product built around an adaptive
"AIM Engine" (Adaptive... — the expansion of the acronym is **Unknown**, not
stated anywhere in the repo) that gates curriculum progress by measured skill
mastery rather than simple lesson-completion. Verified product surfaces, by
what a user can actually do today:

- **`apps/mobile` (Flutter)** — the primary, most complete student-facing
  surface: course/chapter/lesson browsing, placement testing, assessments,
  AI Teacher text chat, Voice Teacher (real microphone capture wired), a
  progress/review dashboard driven by AIM Engine outputs, billing/checkout,
  notifications, support.
- **`apps/admin-dashboard` (Next.js)** — the primary admin surface: curriculum
  authoring/publishing workflow, placement test authoring, user/role
  management, billing management, operations (support tickets, incidents,
  feature flags, maintenance windows, release notes), analytics/reporting.
- **`apps/student-web` (React/CRA)** — a thinner web counterpart to the mobile
  app; several of its features (progress, settings, practice) are explicit
  "not available yet" stub pages as of this verification pass, not full
  parity with mobile.
- **`apps/web` (React/CRA)** — hosts a fully-built Parent Dashboard (child
  progress/assessment/AI-usage summaries, billing, notifications) plus a
  second, overlapping set of admin AI/analytics/notifications screens that
  duplicate `admin-dashboard`'s equivalents. Confirmed present on `main`
  (restored via merged PR #1307 after a brief deletion, PR #1306).

## Target audience — evidenced, not assumed

The AI Teacher's system prompt constant
(`services/backend-api/src/features/ai-teacher/prompt-builder/prompt-builder.constants.ts:9`)
literally reads:

> "You are the AIM Platform AI Teacher, a text-based tutor for Arabic-speaking..."

This is direct code evidence that the product targets **Arabic-speaking
learners of English**. The mobile app also has RTL-aware UI components
(`AIMTopAppBar` RTL back-arrow support, `AIMSwitch` RTL thumb positioning —
confirmed by passing widget tests), consistent with this audience.

## What is Unknown

- Business goals, monetization strategy beyond what the billing feature's
  code implements (products/prices/plans/subscriptions/coupons — the
  mechanics exist; company pricing/strategy is not evidenced in the repo).
- Target scale (user counts, growth targets, deployment region).
- Whether the product is in production with real users today, or still in
  a pilot phase. `docs/AIM_023_PILOT_READINESS.md` and sibling
  `AIM_02x` docs describe a pilot readiness/operations/analysis/hardening
  arc, but their status (executed vs. still-planned) was not independently
  re-verified in this pass — treat as **stated intent**, not proof of
  current deployment state.
- Company/organization identity behind the product beyond the GitHub repo
  owner (`YousefAlgharasi/aim-platform`).
