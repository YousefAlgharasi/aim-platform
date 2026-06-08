# Phase 0 Duplicate Content Audit

## Purpose

This document identifies duplicate files, overlapping document purposes, near-identical content, legacy files from the previous repository structure, and content that should be consolidated before Phase 1 begins. It does not delete any files.

## Scope

All `.md` files under `docs/` in `YousefAlgharasi/aim-platform` at the time of this audit. No source code files are inspected. No files are modified or deleted by this task.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-001 | `docs/quality/phase-0-required-files-inventory.md` | Checked and present. |

## Audit Method

1. Inventory all docs files by path, purpose, and line count.
2. Group files by topic domain.
3. Identify overlap within each group.
4. Classify each finding by severity.
5. Recommend action: Keep As-Is, Merge, Move, Mark Legacy, or Delete (after explicit team decision).

## File Inventory

| File | Lines | Domain | Phase 0 Task |
|---|---|---|---|
| `docs/AIM_023_PILOT_READINESS.md` | 46 | Legacy — Pilot Ops | Pre-Phase 0 (old repo) |
| `docs/AIM_024_PILOT_OPERATIONS.md` | 36 | Legacy — Pilot Ops | Pre-Phase 0 (old repo) |
| `docs/AIM_025_PILOT_ANALYSIS.md` | 37 | Legacy — Pilot Ops | Pre-Phase 0 (old repo) |
| `docs/AIM_026_PRODUCTION_HARDENING.md` | 33 | Legacy — Infra | Pre-Phase 0 (old repo) |
| `docs/AIM_027_CLOUD_DEPLOYMENT.md` | 55 | Legacy — Infra | Pre-Phase 0 (old repo) |
| `docs/AIM_ALGORITHM_TEST_PLAN.md` | 290 | Legacy — Testing | Pre-Phase 0 (old repo) |
| `docs/AIM_VISUAL_DEMO.md` | 85 | Legacy — Dev Tool | Pre-Phase 0 (old repo) |
| `docs/admin/admin-dashboard-sitemap.md` | 364 | Admin UX | P0-019 |
| `docs/ai-teacher/behavior-rules.md` | 229 | AI Teacher | P0-013 |
| `docs/aim-engine/boundary-and-io-contract.md` | 270 | AIM Engine | P0-014 |
| `docs/analytics/reports-scope.md` | 337 | Analytics | P0-021 |
| `docs/api/api-planning-baseline.md` | 659 | API | P0-017 |
| `docs/content/lesson-content-structure.md` | 291 | Content | P0-011 |
| `docs/content/question-bank-standards.md` | 235 | Content | P0-012 |
| `docs/data/initial-data-model.md` | 609 | Data | P0-016 |
| `docs/data/session-data-capture.md` | 263 | Data | P0-015 |
| `docs/journeys/admin-journey.md` | 190 | Admin UX | P0-007 |
| `docs/journeys/content-manager-journey.md` | 196 | Admin UX | P0-007 |
| `docs/journeys/human-reviewer-journey.md` | 169 | Reviewer UX | P0-008 |
| `docs/journeys/parent-journey.md` | 250 | Parent UX | P0-006 |
| `docs/journeys/student-journey.md` | 272 | Student UX | P0-005 |
| `docs/learning/english-skill-tree.md` | 362 | Learning | P0-009 |
| `docs/learning/placement-test-strategy.md` | 244 | Learning | P0-010 |
| `docs/mobile/mobile-sitemap.md` | 310 | Mobile UX | P0-018 |
| `docs/product/mvp-scope.md` | 202 | Product | P0-004 |
| `docs/product/non-negotiables.md` | 145 | Product | P0-001 |
| `docs/product/notification-scope.md` | 312 | Product | P0-020 |
| `docs/product/open-decisions.md` | 117 | Product | P0-023 |
| `docs/product/out-of-scope.md` | 131 | Product | P0-004 |
| `docs/product/phase-0-readiness-checklist.md` | 142 | Product | P0-002 |
| `docs/product/risk-register.md` | 91 | Product | P0-023 |
| `docs/product/roles-and-permissions.md` | 252 | Product | P0-003 |
| `docs/product/vision.md` | 100 | Product | P0-001 |
| `docs/security/ai-safety-privacy-rules.md` | 289 | Security | P0-022 |
| `docs/tasks/phase_0_task_prompts.md` | 2253 | Meta | — |

---

## Findings

### Finding 1 — Legacy AIM_0xx Files in Docs Root

**Severity: Medium**

**Files involved:**
- `docs/AIM_023_PILOT_READINESS.md`
- `docs/AIM_024_PILOT_OPERATIONS.md`
- `docs/AIM_025_PILOT_ANALYSIS.md`
- `docs/AIM_026_PRODUCTION_HARDENING.md`
- `docs/AIM_027_CLOUD_DEPLOYMENT.md`
- `docs/AIM_ALGORITHM_TEST_PLAN.md`
- `docs/AIM_VISUAL_DEMO.md`

**Overlap with Phase 0 docs:**

| Legacy File | Overlapping Phase 0 File | Overlap Type |
|---|---|---|
| `AIM_023_PILOT_READINESS.md` | `product/phase-0-readiness-checklist.md` | Both address pilot readiness; different level of detail. |
| `AIM_024_PILOT_OPERATIONS.md` | `journeys/student-journey.md`, `admin/admin-dashboard-sitemap.md` | Both describe pilot operational flow; legacy is a brief runbook. |
| `AIM_025_PILOT_ANALYSIS.md` | `analytics/reports-scope.md` | Both address post-pilot analysis; legacy is a brief closeout plan. |
| `AIM_026_PRODUCTION_HARDENING.md` | `product/phase-0-readiness-checklist.md` | Both mention release-readiness checks; no direct field conflict. |
| `AIM_027_CLOUD_DEPLOYMENT.md` | `api/api-planning-baseline.md` | Both mention deployment configuration; legacy is pre-Phase 0 intent. |
| `AIM_ALGORITHM_TEST_PLAN.md` | `aim-engine/boundary-and-io-contract.md` | Test plan references endpoints also described in IO contract. |
| `AIM_VISUAL_DEMO.md` | — | No direct Phase 0 duplicate; standalone dev tool doc. |

**Problem:** These seven files use the `AIM_0xx` naming convention from the previous repository. They are not part of the Phase 0 task output structure. Their placement in `docs/` root creates navigation confusion alongside the structured Phase 0 subdirectory layout.

**Recommendation:** Move to `docs/archive/` and add a note at the top of each: `This document is from a prior planning iteration and is preserved for reference.` Do not delete. Do not merge content into Phase 0 docs unless a specific gap is identified by P0-QA-003.

---

### Finding 2 — Session Data Fields Split Across Two Documents

**Severity: Medium**

**Files involved:**
- `docs/data/session-data-capture.md` (263 lines, 63 field definitions)
- `docs/data/initial-data-model.md` (609 lines, 238 field definitions)

**Overlap:** `initial-data-model.md` defines the `LearningSession`, `QuestionAttempt`, and `SessionBehavioralSignal` entities with full field tables. `session-data-capture.md` independently defines overlapping field sets for the same concepts. Both documents reference each other as dependencies.

**Specific overlapping areas:**
- Session lifecycle fields (`started_at`, `ended_at`, `duration_seconds`) appear in both.
- Attempt-level fields (`question_id`, `student_answer`, `is_correct`, `time_taken_ms`) appear in both.
- Behavioral signal fields (`avg_time_per_question`, `error_cluster`) appear in both.

**Problem:** Phase 1 engineers building the backend will have two authoritative-looking sources for the same field definitions. If one is updated without the other, they diverge.

**Recommendation:** Keep both documents but add a cross-reference note to each: `session-data-capture.md` is the canonical reference for event capture requirements; `initial-data-model.md` is the canonical reference for entity schema. Add an explicit note in both files that the other document is the authority for its domain. Merge is not recommended until Phase 1 engineering decides the single source of truth for database schema.

---

### Finding 3 — Admin Journey Split With Admin Dashboard Sitemap

**Severity: Low**

**Files involved:**
- `docs/journeys/admin-journey.md` (190 lines, P0-007)
- `docs/admin/admin-dashboard-sitemap.md` (364 lines, P0-019)

**Overlap:** Admin journey defines what the admin does and needs. Admin dashboard sitemap defines the screens and modules that deliver those needs. They reference each other and are intentionally connected.

**Problem:** Minor redundancy in section headings (both describe Admin capabilities). No conflicting content found.

**Recommendation:** Keep As-Is. The separation of journey from sitemap is correct architecture for Phase 0. No merge needed.

---

### Finding 4 — Open Decisions and Risk Register Are Complementary but Could Confuse

**Severity: Low**

**Files involved:**
- `docs/product/open-decisions.md` (117 lines, P0-023)
- `docs/product/risk-register.md` (91 lines, P0-023)

**Overlap:** Both come from P0-023. Both describe unresolved concerns for Phase 1. Open decisions focus on product/technical choices not yet made. Risk register focuses on risks and mitigations.

**Problem:** A Phase 1 engineer reading only one file may miss items from the other. Some open decisions are also risks (e.g., data residency decision = regulatory risk).

**Recommendation:** Keep separate. Add a cross-reference line in each pointing to the other. Consider merging into a single `docs/product/risk-and-decisions.md` in Phase 1 if both documents stay small and are always read together.

---

### Finding 5 — Content Manager Journey Could Be Merged Into Admin Journey

**Severity: Low**

**Files involved:**
- `docs/journeys/admin-journey.md` (190 lines)
- `docs/journeys/content-manager-journey.md` (196 lines)

**Overlap:** Both came from P0-007. Both describe internal platform users (not students or parents). Admin and Content Manager roles are defined separately in `roles-and-permissions.md` and they have different permissions.

**Problem:** Minor — two separate files for internal user journeys with similar structure. The split is intentional given distinct roles.

**Recommendation:** Keep separate. The roles are distinct and the separation is correct. No merge.

---

### Finding 6 — No Exact Duplicate Files Found

**Severity: None**

No two files have identical content or identical purpose. Every file reviewed serves a distinct planning scope. There are no byte-for-byte duplicates.

---

## Summary Table

| Finding | Severity | Files Affected | Recommendation |
|---|---|---|---|
| Legacy AIM_0xx files in docs root | Medium | 7 files | Move to `docs/archive/` |
| Session data fields split across two docs | Medium | 2 files | Keep separate, add cross-references |
| Admin journey vs admin dashboard sitemap | Low | 2 files | Keep As-Is |
| Open decisions vs risk register | Low | 2 files | Keep separate, add cross-references |
| Content manager vs admin journey | Low | 2 files | Keep As-Is |
| Exact duplicate files | None | — | None found |

---

## Immediate Action Required Before Phase 1

1. **Move** the 7 legacy `AIM_0xx` files to `docs/archive/` and add a legacy notice to each. This unblocks Phase 1 engineers from navigating a clean docs structure.
2. **Add cross-references** between `session-data-capture.md` and `initial-data-model.md` clarifying which is authoritative for which concern.
3. **Add cross-references** between `open-decisions.md` and `risk-register.md`.

All other findings are Low severity and do not block Phase 1 start.

---

## Non-Goals

- This document does not modify any existing file.
- This document does not delete any file.
- This document does not evaluate content quality or completeness (that is P0-QA-003).
- This document does not implement backend code, Student Web App, or Flutter AIM logic.

## Assumptions

- File content was read at the point of audit commit. Any changes after this commit are not reflected here.
- The seven `AIM_0xx` files are confirmed as legacy imports from `YousefAlgharasi/AimAlgorthim` and are not Phase 0 task deliverables.
- Severity is assessed from a Phase 1 engineering confusion risk perspective, not a content quality perspective.

## Open Questions

| Question | Current Handling |
|---|---|
| Should `docs/archive/` be created and the legacy files moved in this task or in a separate cleanup task? | Recommend a separate cleanup task to avoid scope creep. This task is read-only. |
| Should `session-data-capture.md` and `initial-data-model.md` be merged before Phase 1 backend sprint starts? | Defer to Phase 1 lead. Flag as open decision in risk register. |

## Related Documents

- `docs/quality/phase-0-required-files-inventory.md` (P0-QA-001)
- `docs/product/risk-register.md`
- `docs/product/open-decisions.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependency checked: P0-QA-001 output present and verified.
- This document has a title, purpose, scope, full file inventory, six numbered findings with severity and recommendations, a summary table, immediate action list, non-goals, assumptions, and open questions.
- No files were modified or deleted during this task.
- No runtime source code, Student Web App, Flutter AIM logic, or backend implementation was added.
