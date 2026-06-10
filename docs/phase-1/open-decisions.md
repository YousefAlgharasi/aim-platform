# Phase 1 Open Decisions Register

## Purpose

This document tracks unresolved or partially resolved decisions for AIM Platform Phase 1 — System Foundation.

The goal is to prevent open decisions from being hidden inside implementation work. Every unresolved choice must have a status, owner, impact, current default handling, and follow-up trigger.

This register is used by agents, reviewers, and project owners before starting tasks that may depend on unsettled architecture, product, deployment, or operational decisions.

## Scope

This document applies to Phase 1 only.

Phase 1 is System Foundation work. It focuses on project structure, contracts, backend foundations, AIM Engine foundations, Flutter Mobile foundations, Admin Dashboard foundations, local development, CI, and readiness for Phase 2.

This document does not implement:

- Runtime source code.
- Database migrations.
- Flutter Mobile features.
- Admin Dashboard features.
- NestJS API behavior.
- AIM Engine behavior.
- AI Teacher runtime behavior.
- Deployment automation.
- A separate Student Web App.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P1-001 | `docs/phase-1/system-foundation-charter.md` | Checked and used as source of truth. |
| P1-004 | `docs/quality/phase-1-entry-review.md` | Checked as Phase 1 entry/QA reference. |

## Current Locked Direction

| Area | Current Phase 1 Direction |
|---|---|
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| AIM Engine | Python backend service/module |
| Database | Supabase PostgreSQL unless changed by documented decision |
| Auth | Supabase Auth unless changed by documented decision |
| Admin surface | Internal Admin Dashboard foundation only |
| AI Teacher | Backend-only gateway foundation |
| Student Web App | Deferred / out of Phase 1 unless a later documented decision changes this |

## Register Rules

Each decision must include:

- Decision ID.
- Decision title.
- Status.
- Owner.
- Impact.
- Current default handling.
- Trigger for final decision.
- Related tasks or documents.

Valid statuses:

| Status | Meaning |
|---|---|
| `Open` | Decision is unresolved and must not be treated as final. |
| `Defaulted` | A safe default exists for Phase 1, but final decision may change later. |
| `Blocked` | Decision cannot move until external information exists. |
| `Resolved` | Decision is finalized and should be moved to an architecture decision record or owning document. |

## Open Decisions Summary

| ID | Decision | Status | Owner | Current Default Handling |
|---|---|---|---|---|
| OD-001 | ORM and migration strategy | Open | Backend/API owner | Defer final choice to P1-032. |
| OD-002 | Deployment provider | Open | Project owner / DevOps owner | Local development and CI only in Phase 1 until provider is selected. |
| OD-003 | Parent access model | Defaulted | Product owner / Backend owner | Parent access remains optional and backend-authorized. |
| OD-004 | Notification delivery method | Open | Backend owner / Product owner | Define contracts only; no runtime delivery implementation in Phase 1 unless explicitly tasked. |
| OD-005 | Admin dashboard scope | Defaulted | Product owner / Admin owner | Foundation-only internal admin shell; no full operational system in Phase 1. |
| OD-006 | AI Teacher provider/runtime strategy | Open | AI owner / Backend owner | Backend-only gateway contract and safety boundary; provider not locked here. |
| OD-007 | Supabase Auth customization depth | Defaulted | Backend owner | Use Supabase Auth default assumptions until backend auth guard tasks refine behavior. |
| OD-008 | Observability and logging depth | Open | Backend owner / DevOps owner | Request ID and safe logging foundation only. |
| OD-009 | Environment hosting model | Open | DevOps owner | Use `.env.example` style documentation and local env separation only. |
| OD-010 | Phase 2 readiness threshold | Open | Project owner / Reviewer | To be finalized by P1-067 and P1-068. |

---

## OD-001 — ORM and Migration Strategy

| Field | Value |
|---|---|
| Status | Open |
| Owner | Backend/API owner |
| Impact | Backend data access, migrations, schema evolution, local dev, CI, and Supabase integration. |
| Current Default Handling | Do not lock ORM in unrelated tasks. Keep database work documented and avoid framework-specific assumptions until P1-032. |
| Trigger for Final Decision | P1-032 — Decide ORM and Migration Strategy. |
| Related Tasks | P1-032, P1-033, P1-034, P1-035, P1-036, P1-037 |

### Notes

The project direction confirms Supabase PostgreSQL as the default database/auth foundation, but the ORM/migration tooling remains a Phase 1 decision.

Until resolved:

- Do not introduce ORM-specific runtime code.
- Do not add migrations outside the migration strategy task.
- Do not assume Prisma, TypeORM, Drizzle, raw SQL, or Supabase-only data access as final.
- Documentation may reference the need for a migration strategy but must not silently lock a tool.

### Current Default

Use documentation-only planning and neutral database language until P1-032 finalizes the choice.

---

## OD-002 — Deployment Provider Decision

| Field | Value |
|---|---|
| Status | Open |
| Owner | Project owner / DevOps owner |
| Impact | Backend hosting, AIM Engine hosting, Admin Dashboard hosting, Flutter API base URLs, CI/CD, secrets, monitoring, and cost. |
| Current Default Handling | Phase 1 focuses on local development, Docker Compose foundation, env strategy, and CI. No production provider is locked here. |
| Trigger for Final Decision | Before production deployment planning or any task that requires hosted environments. |
| Related Tasks | P1-009, P1-057, P1-058, P1-059, P1-060, P1-061, P1-062, P1-063 |

### Candidate Areas

The final provider decision may need to cover:

- Backend API hosting.
- AIM Engine hosting.
- Admin Dashboard hosting.
- Database/auth environment usage.
- Build/deploy workflow.
- Runtime logs.
- Secret management.
- Cost controls.
- Region/latency requirements.

### Current Default

Use local development and CI-safe assumptions only. Do not hard-code a deployment provider in Phase 1 foundation docs unless a later task explicitly decides it.

---

## OD-003 — Parent Access Model

| Field | Value |
|---|---|
| Status | Defaulted |
| Owner | Product owner / Backend owner |
| Impact | Auth, roles, user relationships, ownership checks, dashboards, privacy, learner data exposure, and notifications. |
| Current Default Handling | Parent access is optional and backend-authorized. Phase 1 should define boundaries, not implement full parent workflows. |
| Trigger for Final Decision | Before implementing parent-facing features or parent dashboard behavior. |
| Related Tasks | P1-015, P1-021, P1-022, P1-035, P1-046 |

### Current Default

Parent access is treated as optional and scoped.

A parent must not receive unrestricted learner data. Any parent access must be authorized by backend ownership/relationship rules.

### Boundary Rules

- Flutter Mobile must not calculate or expose AIM internals locally.
- Parent-facing output must be learner-safe.
- Backend remains authoritative for parent-child relationships.
- Parent access must not expose hidden mastery, weakness, difficulty, retention, or recommendation internals unless a later safe-field contract explicitly permits it.

---

## OD-004 — Notification Delivery Method

| Field | Value |
|---|---|
| Status | Open |
| Owner | Backend owner / Product owner |
| Impact | Reminders, review scheduling, learner engagement, mobile push, email, in-app alerts, backend jobs, and privacy controls. |
| Current Default Handling | Phase 1 may define contracts or boundaries, but does not implement full notification delivery unless explicitly tasked. |
| Trigger for Final Decision | Before implementing notifications, reminders, or scheduled review delivery. |
| Related Tasks | P1-012, P1-013, P1-014, P1-038, P1-042, P1-057 |

### Options to Decide Later

Notification delivery may involve:

- In-app notifications.
- Mobile push notifications.
- Email notifications.
- Scheduled backend jobs.
- Third-party notification services.
- Supabase-related notification support.
- Manual admin-triggered notifications.

### Current Default

Treat notifications as a future implementation concern. Do not lock provider, queue, scheduler, or delivery channel during unrelated Phase 1 foundation tasks.

---

## OD-005 — Admin Dashboard Scope

| Field | Value |
|---|---|
| Status | Defaulted |
| Owner | Product owner / Admin owner |
| Impact | Admin routes, admin API client, permissions, menus, dashboards, review tooling, content management, and operational workflows. |
| Current Default Handling | Phase 1 creates Admin Dashboard foundation only. Full operational admin features are not part of Phase 1 unless explicitly tasked. |
| Trigger for Final Decision | Before implementing real admin modules beyond shell/placeholders. |
| Related Tasks | P1-047, P1-048, P1-049, P1-050, P1-051, P1-052 |

### Current Default

Admin Dashboard Phase 1 scope includes:

- Project shell.
- Layout.
- Routing foundation.
- API client foundation.
- Role-based menu placeholder.
- Module placeholders.
- Scope limit documentation.

Admin Dashboard Phase 1 does not include:

- Full learner management.
- Full content publishing system.
- Full review queue implementation.
- Full reporting system.
- Runtime AI Teacher controls.
- Runtime AIM Engine control panel.

---

## OD-006 — AI Teacher Provider and Runtime Strategy

| Field | Value |
|---|---|
| Status | Open |
| Owner | AI owner / Backend owner |
| Impact | AI Teacher gateway, provider selection, prompt handling, safety validation, fallback behavior, logging, cost, and response latency. |
| Current Default Handling | AI Teacher remains backend-only. Phase 1 defines gateway boundaries, request/response contracts, safety validator stub, and fallback strategy. |
| Trigger for Final Decision | Before production AI Teacher implementation or provider integration. |
| Related Tasks | P1-053, P1-054, P1-055, P1-056 |

### Current Default

No client directly calls AI provider services.

Flutter Mobile and Admin Dashboard communicate with Backend API only. Backend API owns the AI Teacher gateway boundary.

### Boundary Rules

- No provider credentials in clients.
- No raw provider traces in client responses.
- No AI Teacher runtime implementation outside its approved backend boundary.
- No hidden AIM calculations in AI Teacher client code.

---

## OD-007 — Supabase Auth Customization Depth

| Field | Value |
|---|---|
| Status | Defaulted |
| Owner | Backend owner |
| Impact | JWT validation, user identity mapping, ownership guards, role handling, local dev, and test setup. |
| Current Default Handling | Use Supabase Auth as default auth direction; backend guard foundations define server-side validation boundaries. |
| Trigger for Final Decision | During auth guard and identity mapping foundation work. |
| Related Tasks | P1-021, P1-022, P1-035 |

### Current Default

Supabase Auth remains the default unless a later documented decision changes it.

Backend API must validate auth server-side. Clients must not be trusted as authorization boundaries.

---

## OD-008 — Observability and Logging Depth

| Field | Value |
|---|---|
| Status | Open |
| Owner | Backend owner / DevOps owner |
| Impact | Debugging, security review, request tracing, incident response, CI, and production readiness. |
| Current Default Handling | Add request ID and safe logging foundation only. Avoid advanced observability vendor lock-in. |
| Trigger for Final Decision | Before deployment readiness or production monitoring planning. |
| Related Tasks | P1-020, P1-057, P1-059, P1-063 |

### Current Default

Phase 1 should support:

- Request ID propagation.
- Safe backend logs.
- No secrets in logs.
- No learner-sensitive raw logs in client-visible responses.
- No vendor-specific observability lock unless separately decided.

---

## OD-009 — Environment Hosting Model

| Field | Value |
|---|---|
| Status | Open |
| Owner | DevOps owner / Backend owner |
| Impact | Local dev, CI, staging, production, secrets, API base URLs, database configuration, and deployment. |
| Current Default Handling | Use environment file strategy and local development conventions. Do not commit real secrets. |
| Trigger for Final Decision | Before hosted staging or production environment creation. |
| Related Tasks | P1-009, P1-057, P1-058, P1-063 |

### Current Default

Use `.env.example` style documentation and separate local environment files.

Do not commit:

- Real credentials.
- Private keys.
- Provider secrets.
- Production connection strings.
- Service-role credentials.

---

## OD-010 — Phase 2 Readiness Threshold

| Field | Value |
|---|---|
| Status | Open |
| Owner | Project owner / Reviewer |
| Impact | Determines when the project can move from foundation work to feature implementation. |
| Current Default Handling | Use Phase 1 smoke test, compliance review, and readiness checklist tasks to decide. |
| Trigger for Final Decision | P1-065, P1-066, P1-067, and P1-068. |
| Related Tasks | P1-065, P1-066, P1-067, P1-068 |

### Current Default

Phase 2 should not start until:

- System foundation smoke test is complete.
- Architecture compliance review is complete.
- Phase 2 readiness checklist is complete.
- Final Phase 1 lock and handoff is complete.

---

## Decision Update Workflow

When a decision changes:

1. Update this register.
2. Add or update the owning architecture or planning document.
3. Link the affected task IDs.
4. Record the status change.
5. Ensure downstream tasks use the new decision.
6. Avoid silent changes inside implementation files.

## Downstream Agent Rules

Agents must:

- Read this register before tasks touching unresolved areas.
- Use current default handling where a decision is not final.
- Avoid locking open decisions in unrelated tasks.
- Escalate if an implementation task requires an unresolved decision.
- Keep client boundaries strict.
- Keep AIM Engine logic backend-owned.
- Keep AI Teacher provider access backend-only.
- Keep Student Web App out of Phase 1 unless a later documented decision changes scope.

## Acceptance Notes

- ORM/migration choice is included.
- Deployment provider decision is included.
- Parent access decision is included.
- Notification delivery method decision is included.
- Admin scope decision is included.
- Each decision includes status, owner, impact, and current default handling.
- Dependencies P1-001 and P1-004 were checked.
- This is documentation only.
- No runtime code was added.
- No database migration was added.
- No client AIM logic was added.
- No Student Web App work was added.

## Related Documents

- `docs/phase-1/system-foundation-charter.md`
- `docs/quality/phase-1-entry-review.md`
- `docs/tasks/phase_1_task_prompts.md`
