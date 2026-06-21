# Phase 11 — Placement Configuration Readiness

**Date:** 2026-06-20
**Author:** GHOST3030
**Scope:** Admin placement configuration capabilities and remaining needs

## Current Admin Placement Capabilities

The following admin placement APIs and UI are implemented in Phase 11:

### Available APIs

| API Client | Functions | Capability |
|------------|-----------|-----------|
| `admin-placement-tests-api.ts` | `fetchAdminPlacementTests` | List placement tests |
| `admin-placement-test-status-api.ts` | `updatePlacementTestStatus` | Toggle draft ↔ published |
| `admin-placement-questions-api.ts` | `fetchAdminPlacementQuestions` | List placement questions |
| `admin-placement-question-skills-api.ts` | CRUD skill links | Link/unlink skills to questions |
| `admin-placement-results-api.ts` | `fetchAdminPlacementResults`, `fetchAdminPlacementResultDetail` | Inspect results |

### Available UI

| Page | Path | Purpose |
|------|------|---------|
| Placement home | `/admin/placement` | Entry point |
| Placement tests | `/admin/placement/tests` | List/manage tests |
| Test sections | `/admin/placement/tests/:id/sections` | Section management |
| Section questions | `.../sections/:id/questions` | Question assignment |
| Question skills | `.../questions/:id/skills` | Skill linking |
| Placement results | `/admin/placement/results` | Result inspection |

## Configuration Gaps

The following placement configuration features are **not supported** in Phase 11
and should **not** be added without explicit scope approval:

### 1. Placement Test Creation/Deletion

- No admin endpoint to create new placement tests
- Tests are seed-based or backend-managed
- **Recommendation:** Keep as backend-managed; add admin creation in a future
  phase if curriculum team requires it

### 2. Placement Question Authoring

- No admin endpoint to create/edit placement questions directly
- Questions are managed through the question bank integration
- **Recommendation:** Use question bank UI (P11-032..P11-036) for question
  authoring; placement test configuration links existing questions

### 3. Scoring Configuration

- Scoring weights, section score thresholds, and CEFR level boundaries are
  **backend-only** configuration
- No admin UI should compute or modify scoring parameters
- **Recommendation:** If admin tuning is needed, add a dedicated backend
  endpoint with audit logging — never expose raw scoring weights to the client

### 4. Retake Policy Configuration

- `PlacementRetakePolicyService` enforces retake rules server-side
- No admin endpoint to modify retake limits or cooldown periods
- **Recommendation:** Add backend endpoint for retake policy management if
  admin control is required; document policy changes in audit log

### 5. Section Time Limits

- Per-section time limits (if any) are backend-managed
- No admin configuration surface exists
- **Recommendation:** If needed, add as a backend-only configuration field
  exposed through an admin endpoint

### 6. Initial Learning Path Override

- `PlacementInitialLearningPathService` auto-generates paths after placement
- No admin ability to override or regenerate paths
- **Recommendation:** Add only if curriculum team requires manual path
  correction; must be a backend mutation, not a client-side path computation

## Authority Constraints

Any future placement configuration features **must** follow these rules:

1. **No client-side scoring** — All scoring stays in `PlacementScoringService`
2. **No client-side CEFR assignment** — Level determined by `PlacementResultService`
3. **No client-side retake logic** — Enforced by `PlacementRetakePolicyService`
4. **No answer modification** — Answers are immutable once submitted
5. **Audit logging** — All admin configuration changes must be recorded

## Conclusion

Phase 11 provides sufficient placement admin capabilities for:
- Inspecting placement test structure and results
- Managing test publish status
- Linking skills to questions

Further configuration (test creation, scoring tuning, retake policies) should
be scoped as separate tasks in a future phase to avoid unsafe scope expansion.
No changes to the current Phase 11 implementation are needed.
