# AIM Out-of-Scope Boundary

## Purpose

This document defines what was outside the completed AIM MVP pilot and clarifies which items remain out of scope for post-MVP Phase 1 unless a later documented product decision changes them.

## Historical Baseline Note

The MVP pilot described in this document is completed.

The completed MVP pilot used:

- React Web learner interface.
- FastAPI backend API.
- Python backend AIM Engine.
- Supabase PostgreSQL.
- Supabase Auth.

Post-MVP Phase 1 direction is different:

- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains a backend service/module.
- Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

Do not read this document as prohibiting Flutter Mobile in post-MVP Phase 1. The Flutter exclusion below applied only to the completed MVP pilot.

## Scope

This boundary applies to:

- Completed MVP pilot scope.
- Phase 0 planning.
- Phase 1 task creation.
- Product-scope protection before implementation.

This document is planning documentation only. It does not implement backend code, frontend code, Flutter code, database migrations, admin dashboard runtime code, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as the product direction source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked and used for technical and safety boundaries. |

## Out-of-Scope Summary

The completed MVP pilot was not a full commercial learning platform. It was a focused web/cloud pilot to validate AIM adaptive learning behavior with a small A1 cohort.

Anything that did not support pilot validation was deferred unless the project owner explicitly documented a change.

Post-MVP Phase 1 may add Flutter Mobile and NestJS + TypeScript according to `docs/product/vision.md`, but it still must preserve all AIM Engine, safety, privacy, and client-boundary rules.

## Excluded Product Areas From Completed MVP Pilot

| Area | Out of Completed MVP Pilot | Current Post-MVP Phase 1 Position | Reason |
|---|---|---|---|
| Flutter learner app | Excluded from completed MVP pilot | In scope as the approved post-MVP Phase 1 learner client | The completed MVP pilot used React Web for faster algorithm validation. |
| Native mobile release | Excluded from completed MVP pilot | Phase 1 mobile planning applies through Flutter Mobile | App store, device, and release work would have distracted from MVP algorithm validation. |
| Separate Student Web App | Not included | Not planned for post-MVP unless a later documented product decision changes this | React Web was the completed MVP pilot learner interface, not the future post-MVP student client. |
| Full public marketing site | Excluded | Still not required for Phase 1 learning foundation unless separately approved | Not needed for a five-learner pilot or core learning validation. |
| Payment or subscriptions | Excluded | Deferred | Pilot was not a paid commercial launch. |
| Teacher classroom product | Excluded | Future expansion | MVP focused on individual pilot learning, not institution management. |
| School or organization admin | Excluded | Future expansion | Adds tenant and reporting complexity not needed for pilot validation. |
| Production-grade admin suite | Excluded | Deferred beyond pilot/internal support | MVP needed internal pilot support only. |
| Social, chat, or community features | Excluded | Deferred | Not needed to validate AIM adaptation. |
| Gamification economy | Excluded | Future product idea | Points, badges, coins, leaderboards, and stores are not required for AIM validation. |
| Multi-language learner markets | Excluded | Future expansion | Pilot focused on Arabic-speaking A1 English learners. |
| Advanced CEFR levels | Excluded | Future expansion | MVP focused on A1 content and beginner evidence. |

## Excluded Technical Work

| Area | Out of Scope | Reason |
|---|---|---|
| Moving AIM Engine into Flutter Mobile | Forbidden | AIM algorithm logic must remain Python/backend-owned. |
| Moving AIM Engine into React Web or any client | Forbidden | Clients must not run or duplicate AIM Engine logic. |
| Client-side mastery calculation | Forbidden | Backend AIM Engine is the source of truth. |
| Client-side student level calculation | Forbidden | Student level decisions require backend-owned evidence and rules. |
| Client-side weakness calculation | Forbidden | Weakness detection belongs to the AIM Engine. |
| Client-side difficulty calculation | Forbidden | Difficulty adaptation belongs to the AIM Engine. |
| Client-side retention calculation | Forbidden | Retention scheduling belongs to the AIM Engine. |
| Client-side recommendation generation | Forbidden | Recommendation authority belongs to the backend decision pipeline. |
| AI Teacher Gateway in clients | Forbidden | AI Teacher Gateway remains backend-only. |
| AI provider keys in clients | Forbidden | Credentials must remain backend/server-only. |
| Privileged backend credentials in clients | Forbidden | Clients must not hold service-role or privileged secrets. |
| Large architecture rewrite | Excluded | Current direction should be extended safely through documented Phase 1 decisions. |
| Production-scale multi-tenant architecture | Excluded | Pilot cohort does not require it. |
| Complex billing infrastructure | Excluded | No paid product in MVP. |
| Offline-first learning mode | Excluded from completed MVP pilot | Offline support can be reconsidered later, but must not compromise AIM evidence integrity. |
| Advanced analytics warehouse | Excluded | Pilot reporting can be focused and lightweight. |
| Fully automated content generation pipeline | Excluded | Content should be curated and reviewed. |

## Excluded AIM Behavior

The product must not include:

- Speed-based mastery increase or decrease.
- Speed-based student level changes.
- Direct difficulty increase based on fast answers.
- Clinical, medical, or diagnostic learner labels.
- Automated psychological claims about students.
- Recommendation actions that contradict the backend decision conflict resolver.
- Client-side overrides of backend AIM decisions.
- Client-side duplication or approximation of AIM Engine logic.

Speed, response time, average response time, and speed score may only be used as educational behavior evidence, such as hesitation, rushing, possible guessing, fatigue/distraction, low confidence, or session behavior analysis.

## Deferred Features

These may be valuable later, but were not required for the completed MVP pilot:

| Deferred Feature | Current Handling |
|---|---|
| Flutter Mobile app | Approved as the post-MVP Phase 1 learner client. |
| Parent or guardian portal | Conditional until privacy, consent, linking, and product scope are approved. |
| Teacher dashboard | Future expansion after individual learner validation. |
| Production content management system | Deferred until content model and review workflow stabilize. |
| Advanced learner reports | Deferred until pilot analysis identifies which reports matter. |
| Notifications and reminders | Conditional based on notification scope and privacy rules. |
| AI-generated lessons | Deferred until curated A1 content and safety review standards are mature. |
| Multi-level curriculum | Deferred until A1 pilot results are understood. |
| Organization accounts | Deferred until single-cohort pilot operations succeed. |
| Payment flows | Deferred until product value is validated. |

## Scope Change Rule

A deferred or excluded feature may enter scope only if all of the following are true:

1. The project owner documents the scope change.
2. The change supports the approved product direction.
3. Dependencies and risks are visible in Notion or the active planning docs.
4. Safety, privacy, and credential boundaries remain intact.
5. The change does not move AIM Engine logic to any client.
6. The change does not allow clients to calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
7. The change does not expose AI provider keys or privileged backend credentials to clients.
8. The change does not introduce clinical, medical, or diagnostic learner labels.
9. The change does not introduce a separate post-MVP Student Web App unless a later documented product decision explicitly approves it.

## Non-Goals

- This document does not create a Student Web App.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create Flutter code.
- This document does not create React Web code.
- This document does not move AIM Engine logic into any client.
- This document does not expose AI provider keys or privileged credentials to clients.
- This document does not define the full future product roadmap.

## Assumptions

- MVP success depended on validating AIM adaptation, not breadth of platform features.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default for Phase 1 unless changed by a later documented decision.
- Internal pilot operators can tolerate lightweight tools if the adaptive learning loop is measurable.
- Some Phase 0 planning docs may mention future features, but mentioning a future feature does not automatically make it in scope.
- Deferral is acceptable when it protects learner safety, algorithm validation, or delivery focus.

## Open Questions

| Question | Current Handling |
|---|---|
| Should parent visibility be excluded or included in Phase 1? | Keep conditional until parent journey, consent, linking, and privacy decisions converge. |
| Should notifications be included in Phase 1? | Keep conditional until notification scope defines value and risk. |
| How much admin functionality is enough for Phase 1 operations? | Keep internal and minimal until admin journey/sitemap define required views. |
| Are any future web surfaces needed after the completed React Web MVP pilot? | No separate Student Web App is planned unless a later documented product decision changes this. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/roles-and-permissions.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, excluded areas, deferred features, scope change rules, assumptions, non-goals, and open questions.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- No clinical, medical, or diagnostic learner labels were introduced.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
