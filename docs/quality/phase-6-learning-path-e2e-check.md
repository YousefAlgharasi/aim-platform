# Phase 6 — Learning Path E2E Check

**Task:** P6-121
**Branch:** `phase6/P6-121-mobile-learning-path-e2e-check`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependency:** P6-068 (Add Home/Learning Path Checks) — Done

---

## Scope

End-to-end review of the Flutter learning path and AIM-output display flow:
skill states, weakness records, and recommendations — all sourced from backend
APIs, displayed read-only in Flutter, with no local calculation.

---

## Feature Files Reviewed

```
apps/mobile/lib/features/learning_path/
  data/datasources/
    learning_path_remote_datasource.dart
    learning_path_remote_datasource_impl.dart
  data/models/
    learning_path_skill_state_model.dart
    learning_path_weakness_record_model.dart
    learning_path_recommendation_model.dart
  data/repository/repo_impl/learning_path_repository_impl.dart
  logic/entity/
    learning_path_skill_state.dart
    learning_path_weakness_record.dart
    learning_path_recommendation.dart
    learning_path_data.dart
  logic/provider/
    learning_path_notifier.dart
    learning_path_provider.dart
  ui/pages/
    learning_path_page.dart
    learning_path_placeholder_page.dart
  ui/widgets/
    learning_path_skill_state_card.dart
    learning_path_weakness_chip.dart
    learning_path_recommendation_card.dart
    learning_path_section_header.dart
apps/mobile/test/features/learning_path/ (via P6-068)
```

---

## E2E Flow Trace

### 1. Learning Path Page Mount

- `LearningPathPage` mounts → `LearningPathNotifier.loadLearningPath(token)`.
- Three parallel backend calls:
  - `GET /learning-path/skill-states` → `List<LearningPathSkillStateModel>`
  - `GET /learning-path/weaknesses` → `List<LearningPathWeaknessRecordModel>`
  - `GET /learning-path/recommendations` → `List<LearningPathRecommendationModel>`
- All three responses stored in `LearningPathData`.

**Result:** ✅ Three separate backend endpoints. No local calculation.

### 2. Skill States Display

- `LearningPathSkillStateCard` renders per `LearningPathSkillState`:
  - `skillCode`, `currentLevel`, `masterySignal` (string from backend).
  - No numeric mastery score displayed.
  - Displays `isLocked` state as returned by backend.
- Cards are read-only; no tap-to-edit or local state mutation.

**Result:** ✅ Read-only display of backend-provided skill state.

### 3. Weakness Records Display

- `LearningPathWeaknessChip` renders per `LearningPathWeaknessRecord`:
  - `skillCode`, `priorityRank`, `weaknessLabel` from backend.
  - Priority ordering is done by backend — Flutter sorts only for display stability, not for priority calculation.

**Result:** ✅ Backend-determined priority and labels. No local weakness scoring.

### 4. Recommendations Display

- `LearningPathRecommendationCard` renders per `LearningPathRecommendation`:
  - `lessonId`, `lessonTitle`, `reason`, `priority` from backend.
  - "Start" CTA navigates to lesson route — does not create or modify recommendation.

**Result:** ✅ Recommendations are read-only. Navigation only.

---

## No-Calculation Verification

Grep across `apps/mobile/lib/features/learning_path/`:

| Pattern | Found |
|---|---|
| Mastery threshold constants | Not found |
| Local weakness scoring | Not found |
| Local recommendation generation | Not found |
| AIM Engine / Python service URLs | Not found |
| `student_id` sent as request field | Not found |

---

## Test Coverage (P6-068)

- `learning_path_notifier_test.dart` — 8 unit tests covering idle→loading→success
  for all three data sets, error handling, and re-load.
- `learning_path_datasource_test.dart` — 11 unit tests for API path building,
  interface contract, and model parsing.

---

## Design System

- `LearningPathPage` uses `AIMTopAppBar`, `AIMFullScreenLoading`,
  `AIMFullScreenError`, `AIMCard`, `AIMBadge` for level/mastery signal,
  `AIMButton` for lesson navigation CTAs.
- No hard-coded colors, spacing, or typography.

---

## RTL / Arabic

- No `TextDirection.ltr` hard-coded.
- `LearningPathSectionHeader` uses ambient text direction.
- Arabic skill names can be swapped via locale system without widget changes.

---

## Gaps / Limitations

| Gap | Severity | Owner |
|---|---|---|
| Learning path page not yet registered in `AppRouter` — no named route for `/learning-path` | High | P6-069 (Add Learning Path Route) |
| Review schedule not included in learning path feature — lives in `progress` feature separately | Low | Accepted split; documented in P6-102 |

---

## Mobile Validation Checklist

- Flutter does not call AIM Engine: ✅
- Flutter does not calculate mastery: ✅
- Flutter does not calculate weakness: ✅
- Flutter does not calculate recommendations: ✅
- All data sourced from backend APIs: ✅
- Data is read-only in Flutter: ✅
- Secrets excluded: ✅

---

## Verdict

**PASS.** The learning path E2E flow correctly consumes three backend endpoints
and displays all AIM outputs read-only. No local calculation found.
One high-severity routing gap (missing named route) documented above and
owned by P6-069.
