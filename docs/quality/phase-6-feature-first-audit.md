# Phase 6 — Flutter Feature-First Architecture Audit

**Phase:** 6  
**Task:** P6-020  
**Branch:** `phase6/P6-020-flutter-feature-first-audit`  
**Dependency:** P6-019 (Flutter Bootstrap Review — Done)  
**Source Branch Reviewed:** `aim-mobile-design-system`  
**Output:** `docs/quality/phase-6-feature-first-audit.md`

---

## 1. Purpose

This audit verifies that the Flutter app follows a consistent feature-first architecture and that Phase 6 tasks can safely add new features without structural violations.

**Verdict: Feature-first architecture is correctly established. All Phase 6 features must follow the pattern defined here.**

---

## 2. Expected Folder Pattern

Every feature lives under `apps/mobile/lib/features/<feature_name>/` with this internal structure:

```
features/<feature>/
├── data/
│   ├── datasources/       ← remote/local datasource interfaces + implementations
│   ├── models/            ← API response models (JSON ↔ entity mapping)
│   └── repository/
│       └── repo_impl/     ← repository implementation (depends on datasources)
├── logic/
│   ├── entity/            ← pure domain objects (no Flutter deps)
│   ├── provider/          ← Riverpod notifiers + providers
│   └── repository/        ← repository interface (abstract)
└── ui/
    ├── pages/             ← full-screen route destinations
    └── widgets/           ← feature-local reusable widgets
```

---

## 3. Feature Audit Results

### 3.1 `auth` — ✅ Fully Compliant

| Layer | Files | Status |
|---|---|---|
| `data/datasources` | `auth_remote_datasource.dart`, `auth_remote_datasource_impl.dart`, `supabase_auth_datasource.dart`, `supabase_auth_datasource_impl.dart`, barrel | ✅ |
| `data/models` | `auth_context_model.dart`, `auth_sync_response_model.dart`, `client_safe_*_model.dart`, `current_user_model.dart`, `session_validation_model.dart`, barrel | ✅ |
| `data/repository/repo_impl` | `auth_repository_impl.dart` | ✅ |
| `logic/entity` | `auth_flow_state.dart`, `auth_flow_status.dart` | ✅ |
| `logic/provider` | `auth_flow_notifier/provider`, `auth_context_notifier/provider`, `login_notifier/provider`, `logout_notifier/provider`, `register_notifier/provider` | ✅ |
| `logic/repository` | `auth_repository.dart` (abstract) | ✅ |
| `ui/pages` | `login_page.dart`, `register_page.dart`, `sign_in_placeholder_page.dart` | ✅ |
| `ui/widgets` | `auth_placeholder_banner.dart` | ✅ |

### 3.2 `placement` — ✅ Models/Entities Present, UI/Providers Stubbed

| Layer | Files | Status |
|---|---|---|
| `data/models` | Full model set: answer, attempt, question, result, section, test, barrel | ✅ |
| `logic/entity` | Full entity set: answer, attempt, question, result, section, skill_mastery, submit_payload, test, barrel | ✅ |
| `data/datasources` | Empty stubs (`.gitkeep`) | ⚠️ Phase 6 task required |
| `data/repository/repo_impl` | Empty stub | ⚠️ Phase 6 task required |
| `logic/provider` | Empty stub | ⚠️ Phase 6 task required |
| `logic/repository` | Empty stub | ⚠️ Phase 6 task required |
| `ui/pages` | Empty stub | ⚠️ Phase 6 task required |
| `ui/widgets` | Empty stub | ⚠️ Phase 6 task required |

### 3.3 `profile` — ✅ Substantially Complete

| Layer | Files | Status |
|---|---|---|
| `data/datasources` | Interface + implementation, barrel | ✅ |
| `data/models` | Full model set: admin, student, user profile, me response, update payloads | ✅ |
| `data/repository/repo_impl` | `profile_repository_impl.dart` | ✅ |
| `logic/entity` | Full entity set: admin, student, user, update payloads | ✅ |
| `logic/provider` | `profile_notifier.dart`, `profile_provider.dart` | ✅ |
| `logic/repository` | `profile_repository.dart` (abstract) | ✅ |
| `ui/pages` | `profile_page.dart`, `edit_profile_page.dart`, placeholder | ✅ |
| `ui/widgets` | Empty stub | ⚠️ Minor |

### 3.4 `home` — 🔲 Scaffold Only

All layers have `.gitkeep` stubs. `home_placeholder_page.dart` exists in `ui/pages`. Phase 6 tasks will implement this feature.

### 3.5 `lessons` — 🔲 Scaffold Only

All layers have `.gitkeep` stubs. `learn_placeholder_page.dart` exists. Phase 6 tasks will implement.

### 3.6 `onboarding` — 🔲 Scaffold Only

All layers stubbed. `splash_placeholder_page.dart` exists. Phase 6 bootstrap task will implement.

### 3.7 `progress` — 🔲 Scaffold Only

All layers stubbed. `progress_placeholder_page.dart` exists. Phase 6 tasks will implement.

### 3.8 `reviews` — 🔲 Scaffold Only

All layers stubbed. `review_placeholder_page.dart` exists. Phase 6 tasks will implement.

### 3.9 `notifications` — 🔲 Scaffold Only (Out of MVP Scope)

All layers stubbed. No Phase 6 implementation planned per charter.

### 3.10 `ai_teacher` — 🔲 Scaffold Only (Out of MVP Scope)

All layers stubbed. Explicitly out of Phase 6 MVP scope per charter.

### 3.11 `practice` — 🔲 Scaffold Only

All layers stubbed. Phase 6 scope TBD.

### 3.12 `shell` — ✅ Implemented

`main_shell_page.dart`, `main_shell_placeholder_card.dart`, `role_aware_placeholder_section.dart` present.

### 3.13 `design_system_preview` — ✅ Implemented (Dev Tool Only)

Full preview app implemented. Must not be shipped as production entry point.

---

## 4. Architecture Compliance Rules for Phase 6

All new feature code added in Phase 6 must follow these rules:

### 4.1 Layer Boundaries

| Rule | Detail |
|---|---|
| `data/models` → no Flutter UI imports | Models are pure Dart, JSON-serializable |
| `logic/entity` → no Flutter UI imports | Entities are pure Dart domain objects |
| `logic/provider` → imports entity + repository only | No direct datasource access |
| `logic/repository` → abstract interface only | No implementation details |
| `data/repository/repo_impl` → implements logic/repository | Depends on datasources |
| `ui/pages` → imports logic/provider only | No direct datasource or model access |
| `ui/widgets` → imports logic/provider or pure data | No datasource access |

### 4.2 Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Model | `<Name>Model` | `PlacementResultModel` |
| Entity | `<Name>` (no suffix) | `PlacementResult` |
| Datasource interface | `<Name>Datasource` | `PlacementDatasource` |
| Datasource impl | `<Name>DatasourceImpl` | `PlacementRemoteDatasourceImpl` |
| Repository interface | `<Name>Repository` | `PlacementRepository` |
| Repository impl | `<Name>RepositoryImpl` | `PlacementRepositoryImpl` |
| Notifier | `<Name>Notifier` | `PlacementResultNotifier` |
| Provider | `<name>Provider` | `placementResultProvider` |
| Page | `<Name>Page` | `PlacementResultPage` |

### 4.3 No Cross-Feature Imports

Features must not import directly from other features. Shared state crosses via Riverpod providers at the app level or through `core/`. If two features need the same data, it belongs in `core/` or flows through a provider.

### 4.4 Barrel Exports

Each layer must export via a barrel file (e.g. `placement_models.dart`, `placement_entities.dart`). Importing from individual files directly is discouraged.

---

## 5. Pre-Phase-6 Structure Verdict

| Feature | Layer Compliance | Ready for Phase 6 Tasks |
|---|---|---|
| `auth` | ✅ Full | ✅ Yes |
| `placement` | ✅ Model/entity layer complete | ✅ Yes — implementation tasks can proceed |
| `profile` | ✅ Nearly complete | ✅ Yes |
| `home` | 🔲 Scaffold | ✅ Yes — add implementation per task |
| `lessons` | 🔲 Scaffold | ✅ Yes |
| `onboarding` | 🔲 Scaffold | ✅ Yes |
| `progress` | 🔲 Scaffold | ✅ Yes |
| `reviews` | 🔲 Scaffold | ✅ Yes |
| `shell` | ✅ Placeholder | ✅ Yes |

**Structure is sound. Phase 6 feature tasks can proceed with confidence.**

---

*Flutter feature-first audit created: P6-020 | Branch: phase6/P6-020-flutter-feature-first-audit*
