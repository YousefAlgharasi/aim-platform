# AIM Mobile

Flutter Mobile learner client shell for AIM Phase 1.

## Scope

This app is the Phase 1 learner client shell. It establishes the approved Flutter Mobile project boundary under `apps/mobile`.

## Phase 1 Rules

Flutter Mobile may:

- render learner-facing UI
- call the Backend API
- display backend-approved lesson, progress, feedback, and recommendation data
- cache safe display data in future tasks when explicitly approved

Flutter Mobile must not:

- calculate mastery
- calculate learner level
- detect weakness
- adapt difficulty
- schedule retention
- generate recommendations
- call AIM Engine directly
- call AI Teacher provider or gateway directly
- store provider keys, Supabase service-role keys, or privileged backend credentials
- implement Student Web App behavior

## Current Shell

The current shell contains:

```text
lib/main.dart
lib/app/aim_mobile_app.dart
lib/core/
lib/features/
test/widget_test.dart
```

## Core Architecture

```text
lib/core/config
lib/core/networking
lib/core/errors
lib/core/routing
lib/core/theme
lib/core/localization
```

## Feature-First Architecture

```text
lib/features/auth
lib/features/onboarding
lib/features/placement
lib/features/home
lib/features/lessons
lib/features/practice
lib/features/ai_teacher
lib/features/reviews
lib/features/progress
lib/features/notifications
lib/features/profile
```

Each feature contains:

```text
data/datasources
data/models
data/repository/repo_impl
logic/entity
logic/provider
logic/repository
ui/pages
ui/widgets
```

P1-040 creates folder skeletons only. It does not implement feature workflows, API calls, local calculations, state management, or navigation.

## Local Checks

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
```

## Platform Runners

This patch intentionally keeps generated platform runner files out of scope. If a local environment needs Android/iOS runner folders, generate them from inside `apps/mobile`:

```bash
flutter create . --platforms=android,ios --org com.yousefapps --project-name aim_mobile
```

Do not enable Flutter web in Phase 1 unless a later approved task explicitly asks for it.
