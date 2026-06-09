# AIM Phase 0 Risk Register

## Purpose

This document records the key product, technical, AI, data, security, cost, workflow, and delivery risks identified during Phase 0 planning for AIM. It gives Phase 1 implementation a clear risk baseline, mitigation direction, and owner/follow-up path.

## Scope

This is Phase 0 planning documentation only. It does not implement backend code, Flutter code, admin dashboard code, database migrations, API runtime code, AIM Engine code, or a Student Web App.

The register covers risks discovered from Phase 0 documents P0-001 through P0-022, including product scope, user journeys, skill tree, placement, lesson/question standards, AI teacher rules, AIM Engine boundaries, data model, API planning, mobile/admin sitemap, notification scope, analytics/reporting scope, and privacy/safety rules.

## Current Product Direction

| Area | Confirmed Direction |
|---|---|
| Completed MVP pilot learner interface | React Web |
| Completed MVP pilot backend API | FastAPI |
| Completed MVP pilot AIM Engine | Python backend AIM Engine |
| Completed MVP pilot database | Supabase PostgreSQL |
| Completed MVP pilot auth | Supabase Auth |
| Post-MVP Phase 1 learner client | Flutter Mobile |
| Post-MVP Phase 1 Backend API | NestJS + TypeScript |
| Post-MVP Phase 1 AIM Engine | Python AIM Engine as a backend service/module |
| Post-MVP Phase 1 database/auth | Supabase PostgreSQL/Auth unless changed by a later documented decision |
| Post-MVP Student Web App | No separate Student Web App is planned unless a later documented product decision changes this |

## Dependency Check

| Dependency Range | Expected Outputs | Status |
|---|---|---|
| P0-001 to P0-004 | Product vision, readiness, roles, MVP/out-of-scope | Checked as Phase 0 baseline inputs. |
| P0-005 to P0-008 | Student, parent, admin/content manager, reviewer journeys | Checked as journey and workflow inputs. |
| P0-009 to P0-012 | Skill tree, placement strategy, lesson structure, question standards | Checked as learning-content inputs. |
| P0-013 to P0-015 | AI teacher, AIM Engine IO boundary, session data capture | Checked as AI/backend boundary inputs. |
| P0-016 to P0-017 | Initial data model and API planning baseline | Checked as data/API planning inputs. |
| P0-018 to P0-020 | Mobile sitemap, admin sitemap, notification scope | Checked as interface and notification inputs. |
| P0-021 to P0-022 | Analytics/reporting scope and AI safety/privacy/data rules | Checked as reporting and safety inputs. |

## Risk Scoring

| Value | Likelihood | Impact |
|---|---|---|
| Low | Unlikely during Phase 1 if controls are followed. | Limited delay or small rework. |
| Medium | Plausible during Phase 1 delivery. | Meaningful rework, user impact, or security/privacy review. |
| High | Likely without active mitigation. | Blocks release, creates unsafe behavior, or breaks core product promise. |

## Risk Register

| ID | Category | Risk | Likelihood | Impact | Mitigation / Control | Phase 1 Owner |
|---|---|---|---|---|---|---|
| R-001 | Product Scope | Phase 1 scope expands into a full institute/platform before the learning loop is stable. | Medium | High | Keep Phase 1 focused on the learner flow, lesson/practice, AIM result, progress, and minimal internal support. Track extras in open decisions. | Product Owner |
| R-002 | Product Scope | A separate post-MVP Student Web App is accidentally introduced despite current product direction. | Low | High | Preserve rule: no separate Student Web App is planned for post-MVP unless a later documented product decision changes this. React Web remains completed MVP pilot context. | Product Owner / Engineering Lead |
| R-003 | Product Direction | Completed MVP pilot stack and post-MVP Phase 1 stack are mixed together in implementation tasks. | Medium | High | Keep React Web + FastAPI as completed MVP pilot context only. Use Flutter Mobile + NestJS + TypeScript for post-MVP Phase 1. | Product Owner / Engineering Lead |
| R-004 | Backend Architecture | Backend becomes over-layered too early, slowing delivery. | Medium | Medium | Use simplified feature-based backend architecture unless complexity requires deeper layering. | Backend Lead |
| R-005 | Flutter Architecture | Flutter Mobile places AIM Engine/adaptive logic on-device. | Low | High | Enforce rule: Flutter Mobile only consumes backend AIM outputs; no mastery, student level, weakness, difficulty, retention, or recommendation calculation in Flutter. | Mobile Lead |
| R-006 | AIM Engine Boundary | AIM Engine IO contract is bypassed by ad-hoc endpoint behavior. | Medium | High | All adaptive outputs should follow the documented backend-owned IO contract and be validated before client display. | Backend / AIM Engine Lead |
| R-007 | AI Safety | AI teacher output uses clinical, medical, diagnostic, shame-based, or unsafe language. | Medium | High | Use AI teacher behavior rules, safe templates, human review for disputes, and explicit educational/non-diagnostic wording. | AI / Product Lead |
| R-008 | Data Privacy | Parent sees raw attempts, internal scores, or another learner's data. | Medium | High | Enforce verified parent-child linking, server-side ownership checks, and summary-only parent reports. | Backend Lead |
| R-009 | Data Model | User identity mismatches between Supabase Auth UID and app user records. | Medium | High | Enforce canonical identity mapping and backend ownership checks from the start. | Backend Lead |
| R-010 | Security | AI provider keys leak into Flutter Mobile, React Web, frontend config, logs, notification payloads, or admin tools. | Low | High | Keep AI provider keys backend-only; scan config/log outputs; never send provider secrets to clients. | Security / Backend Lead |
| R-011 | Notifications | Notifications disclose sensitive learner evidence on lock screen. | Medium | Medium | Use safe generic notification text and route details into authenticated screens only. | Mobile / Backend Lead |
| R-012 | Analytics | Analytics dashboards expose raw AIM internals or misleading progress conclusions. | Medium | Medium | Show learner-safe summaries; restrict admin/reviewer access by role; avoid clinical, medical, or diagnostic interpretation. | Product / Data Lead |
| R-013 | Placement | Placement result overstates learner level from limited evidence. | Medium | High | Use conservative placement rules and communicate results as starting guidance, not definitive ability. | Learning Design / AIM Lead |
| R-014 | Content Quality | A1 English content does not align with the documented skill tree and question standards. | Medium | High | Require skill/concept mapping for lessons/questions and review content against P0-009 to P0-012. | Content Lead |
| R-015 | Question Bank | Questions are ambiguous, culturally inappropriate, or not beginner-safe. | Medium | Medium | Apply question bank standards, reviewer checks, and item metadata requirements. | Content / Reviewer Lead |
| R-016 | Session Evidence | Required attempt/session events are not captured, weakening AIM recommendations. | Medium | High | Implement session capture fields from P0-015 before adaptive decisions are trusted. | Backend / AIM Lead |
| R-017 | Human Review | Disputed grading/review flow is unclear, causing user trust issues. | Medium | Medium | Keep reviewer journey and admin review queues in scope for disputed grades or flagged feedback. | Admin / Reviewer Lead |
| R-018 | API Planning | API endpoints are built without role, ownership, and safe-output contracts. | Medium | High | Use API planning baseline; define auth, ownership, response shape, and error behavior for each feature. | Backend Lead |
| R-019 | Cost | AI/voice or analytics usage becomes too expensive for Phase 1 constraints. | Medium | Medium | Start with limited usage, quotas, logs, model/provider selection, and cost monitoring. | Product / Backend Lead |
| R-020 | Delivery | Phase 0 documents diverge from implementation tasks and become stale. | Medium | Medium | Reference current docs in Phase 1 tasks; update open decisions when product choices change. | Project Lead |
| R-021 | Admin Scope | Admin dashboard attempts to include all future institute operations in Phase 1 foundation work. | Medium | Medium | Keep admin Phase 1 scope focused on pilot operations, learner/content visibility, review support, and basic reporting. | Product / Admin Lead |
| R-022 | Accessibility / UX | Learners with low confidence or low English level feel overwhelmed. | Medium | High | Use short sessions, simple language, safe feedback, clear next actions, and avoid raw score exposure. | Product / UX Lead |
| R-023 | Logging | Logs capture sensitive personal data, raw prompts, or provider secrets. | Medium | High | Define log redaction, limited retention, and role-restricted access before production. | Backend / Security Lead |
| R-024 | Compliance | Privacy and child/parent consent expectations are not resolved before parent features. | Medium | High | Keep parent features conditional until consent, linking, and data visibility rules are approved. | Product / Legal/Policy Owner |
| R-025 | Integration | Supabase/auth/API deployment assumptions fail late in implementation. | Medium | Medium | Validate environment, auth, database, and deployment path early in Phase 1 before feature buildout. | Backend / DevOps Lead |
| R-026 | Backend API Stack | Phase 1 tasks accidentally continue treating FastAPI as the post-MVP Backend API. | Medium | High | Preserve FastAPI only as completed MVP pilot backend API context. Use NestJS + TypeScript as the post-MVP Phase 1 Backend API unless a later documented decision changes this. | Backend Lead |
| R-027 | Speed Fairness | Speed, response time, average response time, or speed score is accidentally used as a direct mastery, student level, or difficulty signal. | Medium | High | Preserve no-speed mastery rule in AIM Engine, data, analytics, API, and safety tasks. Speed may only be educational behavior evidence. | AIM Engine Lead |
| R-028 | AI Teacher Boundary | Client apps call AI Teacher Gateway or AI providers directly. | Low | High | Keep AI Teacher Gateway backend-only. Clients call backend APIs only and never hold provider credentials. | Backend / AI Lead |

| R-029 | Phase 1 Stack Confusion | Phase 1 tasks mix completed MVP pilot stack (FastAPI, React Web) with Phase 1 target stack (NestJS, Flutter), creating incompatible implementations. | Medium | High | Reference `docs/phase-1/system-foundation-charter.md` Section 2. Reject any Phase 1 task that uses FastAPI as the Backend API or React Web as the learner client. | Engineering Lead |
| R-030 | Student Web App Introduction | A Phase 1 task accidentally creates `apps/student-web` or an equivalent React/Next.js learner app. | Low | High | Student Web App is deferred/optional Phase 7. Phase 1 tasks must fail if they introduce a Student Web App. See charter Section 3. | Product Owner / Engineering Lead |
| R-031 | Client-Side AIM Logic in Flutter | A Phase 1 Flutter task calculates or approximates mastery, weakness, difficulty, retention, or recommendations locally. | Low | High | Flutter must only render backend-approved outputs. Phase 1 tasks must fail if they introduce client-side AIM logic. See charter Section 6. | Mobile Lead |
| R-032 | Speed-as-Mastery Logic | A Phase 1 AIM Engine or backend task uses response_time, avg_response_time, or speed_score as a direct mastery, level, or difficulty input. | Medium | High | Preserve no-speed mastery rules from `docs/product/non-negotiables.md`. Speed is behavioral evidence only. See charter Section 10. | AIM Engine Lead |
| R-033 | AI Provider Key Leakage | A Phase 1 task places AI provider API keys in a Flutter build artifact, client-visible `.env`, or CI output accessible to clients. | Low | High | Provider keys must remain backend/server-only. Scan all client config before any release. See charter Section 10. | Security / Backend Lead |
| R-034 | Parent Privacy Leakage | Parent access features are implemented in Phase 1 without consent, verified parent-child linking, and summary-only visibility approved. | Medium | High | Parent access is conditional. Do not implement parent features until the project owner explicitly approves them with privacy controls resolved. See charter Section 5 (row 7). | Product / Backend Lead |

| Priority | Risk IDs | Required Action |
|---|---|---|
| Critical | R-005, R-006, R-007, R-010, R-027, R-028 | Enforce AIM Engine/backend-only boundary, provider-key isolation, no-speed mastery rule, and safe AI wording. |
| High | R-001, R-002, R-003, R-009, R-013, R-016, R-018, R-026 | Lock product direction, identity model, placement conservatism, session evidence, API contracts, and stack separation. |
| Medium | R-008, R-011, R-012, R-014, R-019, R-020, R-021, R-025 | Keep privacy, notification, reporting, content, cost, documentation, admin, and deployment controls visible in Phase 1 tasks. |

## Stack-Specific Controls

| Stack Area | Required Control |
|---|---|
| Completed MVP pilot | Preserve React Web + FastAPI + Python AIM Engine + Supabase PostgreSQL/Auth as historical completed pilot context. |
| Post-MVP Phase 1 learner client | Use Flutter Mobile as the approved learner client. |
| Post-MVP Phase 1 Backend API | Use NestJS + TypeScript unless a later documented decision changes this. |
| AIM Engine | Keep Python/backend-owned. |
| Database/Auth | Use Supabase PostgreSQL/Auth unless a later documented decision changes this. |
| Student Web App | Do not introduce a separate post-MVP Student Web App unless a later documented product decision changes this. |

## Assumptions

- AIM remains an educational AI tutoring platform, not a clinical, diagnostic, or medical system.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- The AIM Engine runs in backend/Python infrastructure only.
- Flutter Mobile, completed React Web pilot surfaces, admin tools, and any future clients consume backend-approved outputs only.
- Parent access remains conditional unless explicitly approved.
- Phase 1 implementation tasks will reference Phase 0 documents rather than redefining scope from scratch.

## Non-Goals

- No runtime implementation is added by this document.
- No database schema, API endpoint, Flutter widget, admin page, or AIM Engine module is created here.
- This document does not resolve open product decisions; it records risk and mitigation direction.
- This document does not create a separate Student Web App.
- This document does not move AIM Engine logic to Flutter Mobile, React Web, or any other client.

## Open Follow-Ups

- Convert critical risks into Phase 1 acceptance criteria.
- Confirm Phase 1 implementation tasks use Flutter Mobile for the learner client.
- Confirm Phase 1 implementation tasks use NestJS + TypeScript for the Backend API.
- Preserve FastAPI references only as completed MVP pilot context.
- Decide whether parent access is in Phase 1.
- Add security/privacy review gates before production release.
- Add cost monitoring requirements before enabling AI-heavy flows.
- Verify no Markdown docs contain unresolved merge conflict markers.

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/open-decisions.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`

## Acceptance Notes

- This document has a title, purpose, scope, current product direction, risk register, priority risks, controls, assumptions, non-goals, and open follow-ups.
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
