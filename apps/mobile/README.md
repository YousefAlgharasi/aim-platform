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

## Backend API Client Foundation

P1-042 adds a Backend API client foundation under:

```text
lib/core/networking
```

It supports:

- Backend API base URL config through `AppConfig`
- shared response-envelope parsing
- shared error-envelope parsing
- safe `GET` and `POST` helpers
- typed response decoding

It does not add feature-specific API workflows.

Flutter Mobile must call the Backend API only. It must not call AIM Engine or AI providers directly.

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
