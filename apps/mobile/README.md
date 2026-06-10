# AIM Mobile

Flutter Mobile learner client shell for AIM Phase 1.

## Guard Documentation

P1-046 adds explicit Flutter boundary documentation:

```text
docs/no-aim-logic.md
```

## Phase 1 Rules

Flutter Mobile may:

- render learner-facing UI
- call the Backend API
- collect learner evidence
- display backend-approved outputs

Flutter Mobile must not:

- calculate mastery
- calculate learner level
- detect weakness
- adapt difficulty
- schedule retention
- generate recommendations
- call AIM Engine directly
- call AI Teacher provider APIs directly
- expose secrets or privileged credentials
- implement Student Web App behavior

## Current Foundation

The current mobile foundation includes:

- Flutter project shell
- core architecture folders
- feature-first skeletons
- Riverpod StateNotifier foundation
- Backend API client foundation
- routing shell
- main shell placeholder screens
- auth placeholder flow

All feature logic remains placeholder-only until later approved tasks.

## Local Checks

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
```
