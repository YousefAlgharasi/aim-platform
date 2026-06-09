AIM Phase 0 Duplicate Content Audit

Purpose

This document audits the AIM "docs/" folder for duplicate files, repeated document purposes, old versus new versions, overlapping content, and documentation areas that should be consolidated before Phase 1 implementation planning proceeds.

Scope

This is a Phase 0 QA document for task P0-QA-002. It reviews planning documents only and recommends keep, merge, rename, archive, or classification actions. It does not delete files, rewrite runtime code, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter Mobile, React Web, or any other client.

The current product direction is:

- The completed MVP pilot used React Web as the learner interface, FastAPI as the backend API, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth.
- Post-MVP Phase 1 uses Flutter Mobile as the learner client, NestJS + TypeScript as the Backend API, Python AIM Engine as a backend service/module, and Supabase PostgreSQL/Auth unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

Dependency Check

Dependency| Required Output| Status
P0-QA-001| "docs/quality/phase-0-required-files-inventory.md"| Present and marked Done in Notion before this audit started.

Audit Method

1. Inventory active Markdown docs by path, purpose, and topic domain.
2. Group files by planning area.
3. Identify duplicate, overlapping, legacy, or conflicting documentation.
4. Classify each finding by severity.
5. Recommend action: keep, cross-reference, move, archive, mark legacy, or update stale wording after explicit team decision.

Executive Summary

Finding Type| Count| Highest Severity
Likely duplicate or overlapping document groups| 8| High
Required Phase 0 files that should be kept| 28| None
Non-required root-level documents needing classification| 8| High
Files recommended for immediate deletion| 0| None
Unresolved merge conflict markers| 0 after this cleanup| None

No file should be deleted by this task. The safest cleanup path is to keep the required Phase 0 files as canonical, classify root-level non-required docs as post-Phase-0 or legacy, and update stale wording so all active docs align with "docs/product/vision.md".

Duplicate and Overlap Groups

Group| Files Involved| Severity| Recommendation| Rationale
D-001 Phase 0 lock and readiness review| "docs/product/phase-0-readiness-checklist.md"; "docs/product/phase-0-final-review.md"; "docs/quality/phase-0-required-files-inventory.md"| Medium| Keep all. Add clear cross-links in a cleanup task if needed.| These files have related but distinct purposes: readiness criteria, final go/no-go review, and required-file inventory. Some checklist and inventory tables overlap by design.
D-002 Product scope boundaries| "docs/product/vision.md"; "docs/product/mvp-scope.md"; "docs/product/out-of-scope.md"; "docs/product/non-negotiables.md"; "docs/product/open-decisions.md"| Medium| Keep all as canonical Phase 0 product set. Avoid merging.| The documents repeat core rules: completed MVP pilot context, post-MVP Phase 1 target direction, no separate Student Web App, no AIM logic in clients, and no provider keys in clients. This overlap is intentional but must stay consistent.
D-003 Admin and content operations| "docs/journeys/admin-journey.md"; "docs/journeys/content-manager-journey.md"; "docs/admin/admin-dashboard-sitemap.md"| Medium| Keep all. Treat journey docs as workflow sources and sitemap as interface/module scope.| Admin/content manager responsibilities overlap with dashboard modules, but they are different planning layers. Consolidation should be limited to cross-references, not file removal.
D-004 AI safety and AI teacher behavior| "docs/product/non-negotiables.md"; "docs/ai-teacher/behavior-rules.md"; "docs/security/ai-safety-privacy-rules.md"; "docs/data/session-data-capture.md"; "docs/analytics/reports-scope.md"| High| Keep all, but run a consistency fix task before affected implementation.| These files intentionally repeat educational-only safety rules. Canonical rule: speed, response time, average response time, and speed score must not affect mastery, student level, or direct difficulty increase.
D-005 AIM Engine, data, and API boundary| "docs/aim-engine/boundary-and-io-contract.md"; "docs/data/session-data-capture.md"; "docs/data/initial-data-model.md"; "docs/api/api-planning-baseline.md"| Medium| Keep all. Use the AIM Engine contract as canonical for adaptive IO and the API baseline as route planning.| These documents naturally repeat session fields, adaptive output names, and backend-owned AIM boundaries. The overlap is useful, but wording must preserve Python/backend AIM ownership.
D-006 Completed React Web pilot and post-MVP Flutter Mobile direction| "docs/product/vision.md"; "docs/product/mvp-scope.md"; "docs/mobile/mobile-sitemap.md"; "docs/product/open-decisions.md"; "docs/product/phase-0-final-review.md"; "docs/api/api-planning-baseline.md"; "docs/aim-engine/boundary-and-io-contract.md"; "docs/analytics/reports-scope.md"| High| Keep all, but align wording with "docs/product/vision.md".| The completed MVP pilot used React Web and FastAPI. Post-MVP Phase 1 uses Flutter Mobile and NestJS + TypeScript. Old wording that says Flutter is merely undecided/future should be updated.
D-007 Root-level pilot lifecycle docs| "docs/AIM_023_PILOT_READINESS.md"; "docs/AIM_024_PILOT_OPERATIONS.md"; "docs/AIM_025_PILOT_ANALYSIS.md"; "docs/AIM_026_PRODUCTION_HARDENING.md"; "docs/AIM_027_CLOUD_DEPLOYMENT.md"| High| Do not delete now. Classify as post-Phase-0 / later-phase docs or move under a future "docs/pilot/" or "docs/deployment/" structure in a consolidation task.| These files overlap with Phase 0 product, API, analytics, operations, deployment, and readiness concepts but are not required Phase 0 outputs. Their numbering may be confused with P0-023/P0-024 and should be clarified.
D-008 Demo and algorithm validation docs| "docs/AIM_VISUAL_DEMO.md"; "docs/AIM_ALGORITHM_TEST_PLAN.md"; "docs/aim-engine/boundary-and-io-contract.md"; "docs/api/api-planning-baseline.md"| Medium| Keep as algorithm/demo support docs, but label them outside Phase 0 required outputs.| These files support algorithm testing and demo flows. They overlap with API/AIM Engine boundary topics but are not duplicates of Phase 0 planning docs.
D-009 Word architecture document| "docs/AIM Complete Architecture EN.docx"; Phase 0 canonical Markdown docs| Medium| Manual review required. If it contains old architecture decisions, archive or convert relevant current content to Markdown.| The ".docx" content was not compared deeply in this Markdown audit. Its root-level placement and broad architecture title create potential old-versus-new duplication risk.

Canonical Keep List

The following required Phase 0 documents should remain canonical and should not be deleted or merged without explicit team approval:

Area| Canonical Files
Product| "docs/product/vision.md"; "docs/product/non-negotiables.md"; "docs/product/mvp-scope.md"; "docs/product/out-of-scope.md"; "docs/product/phase-0-readiness-checklist.md"; "docs/product/notification-scope.md"; "docs/product/risk-register.md"; "docs/product/open-decisions.md"; "docs/product/phase-0-final-review.md"
Roles and journeys| "docs/product/roles-and-permissions.md"; "docs/journeys/student-journey.md"; "docs/journeys/parent-journey.md"; "docs/journeys/admin-journey.md"; "docs/journeys/content-manager-journey.md"; "docs/journeys/human-reviewer-journey.md"
Learning/content| "docs/learning/english-skill-tree.md"; "docs/learning/placement-test-strategy.md"; "docs/content/lesson-content-structure.md"; "docs/content/question-bank-standards.md"
AI/AIM/data/API| "docs/ai-teacher/behavior-rules.md"; "docs/aim-engine/boundary-and-io-contract.md"; "docs/data/session-data-capture.md"; "docs/data/initial-data-model.md"; "docs/api/api-planning-baseline.md"; "docs/security/ai-safety-privacy-rules.md"
Interfaces/reporting| "docs/mobile/mobile-sitemap.md"; "docs/admin/admin-dashboard-sitemap.md"; "docs/analytics/reports-scope.md"
QA outputs| "docs/quality/phase-0-required-files-inventory.md"; "docs/quality/phase-0-duplicate-content-audit.md"; "docs/quality/phase-0-content-completeness-audit.md"; "docs/quality/phase-0-cross-document-consistency-audit.md"; "docs/quality/phase-1-readiness-gap-analysis.md"; "docs/quality/phase-0-consolidation-fix-plan.md"; "docs/quality/phase-0-final-quality-gate.md"

Files Recommended for Later Classification

File| Recommended Classification| Reason
"docs/AIM_023_PILOT_READINESS.md"| Post-Phase-0 pilot planning| Overlaps with readiness and pilot scope, but appears later-phase.
"docs/AIM_024_PILOT_OPERATIONS.md"| Post-Phase-0 pilot operations| Operational runbook, not Phase 0 required output.
"docs/AIM_025_PILOT_ANALYSIS.md"| Post-Phase-0 pilot analysis| Analysis closeout plan, not Phase 0 required output.
"docs/AIM_026_PRODUCTION_HARDENING.md"| Later production hardening| Overlaps with deployment/security scope, but belongs after pilot validation.
"docs/AIM_027_CLOUD_DEPLOYMENT.md"| Later deployment package| Contains implementation/deployment assets and should not be confused with Phase 0 planning.
"docs/AIM_ALGORITHM_TEST_PLAN.md"| Algorithm validation support| Useful, but outside Phase 0 required-output list.
"docs/AIM_VISUAL_DEMO.md"| Demo support| Useful, but outside Phase 0 required-output list.
"docs/AIM Complete Architecture EN.docx"| Architecture archive/manual review| Potential old architecture duplicate; needs human review or conversion decision.

Boilerplate Overlap

Many Phase 0 docs repeat these rules:

- Phase 0 remains planning/documentation only.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- AIM Engine logic remains Python/backend-owned.
- Clients must not run or duplicate AIM Engine logic.
- Clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Speed may only be used as educational behavior evidence.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.

This repetition is intentional and should not be treated as duplicate content requiring deletion. It is useful guardrail text as long as the wording stays consistent.

Recommended Cleanup Plan

Priority| Action| Owner
P0| Remove unresolved merge conflict markers from QA Markdown docs.| Documentation Owner
P0| Align stale MVP/post-MVP wording with "docs/product/vision.md".| Product Owner / Documentation Owner
P0| Preserve completed MVP pilot wording: React Web learner interface, FastAPI backend API, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth.| Product Owner
P0| Preserve post-MVP Phase 1 wording: Flutter Mobile learner client, NestJS + TypeScript Backend API, Python AIM Engine backend service/module, and Supabase PostgreSQL/Auth unless changed by a later documented decision.| Product Owner / Engineering Lead
P0| Preserve no-speed mastery rules in all AIM, data, analytics, and safety docs.| Product / AIM Lead
P1| Classify root-level "AIM_023" through "AIM_027" docs as active later-phase docs or legacy artifacts.| Project Lead
P1| Add cross-reference links between overlapping canonical docs instead of duplicating long explanatory sections.| Documentation Owner
P1| Move or relabel non-required root-level docs so they are not mistaken for Phase 0 required outputs.| Documentation Owner
P2| Manually review "docs/AIM Complete Architecture EN.docx" for stale decisions and decide whether to archive or convert.| Project Lead

Done Verification

Check| Result
Audit cleaned at "docs/quality/phase-0-duplicate-content-audit.md"| Pass
Merge conflict markers removed| Pass
Duplicate groups listed| Pass
Files involved, severity, recommendation, and rationale included| Pass
Current product direction from "docs/product/vision.md" reflected| Pass
Completed MVP pilot stack and post-MVP Phase 1 target stack separated| Pass
No files deleted| Pass
No app/backend runtime code implemented| Pass
No separate Student Web App introduced| Pass
No AIM Engine logic moved into Flutter Mobile, React Web, or any other client| Pass

Recommendation

P0-QA-002 remains valid as a duplicate-content audit after conflict cleanup. Continue with the second known conflict-marker file, "docs/quality/phase-0-content-completeness-audit.md", before editing the rest of the planning documents.

