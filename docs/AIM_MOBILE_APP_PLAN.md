# AIM Platform — Mobile App Plan (Flutter)

> **Status:** Stub — to be completed in a dedicated planning task.

## Platform Targets

- iOS (iPhone, iPad)
- Android (phone, tablet)

## Core Principles

- All adaptive logic lives in the AIM Engine — the app is a pure UI layer.
- No AI provider keys on-device.
- Audio playback handled natively; speech capture uploaded to backend for scoring.

## Key Screens (MVP)

1. Onboarding / Splash
2. Registration & Login
3. Placement Assessment
4. Home / Dashboard
5. Active Lesson
6. Exercise (Reading, Listening, Speaking, Writing, Vocabulary, Grammar)
7. Results / Progress Review
8. Profile & Settings

## Technology

| Concern | Approach |
|---|---|
| Framework | Flutter (Dart) |
| State Management | TBD (Riverpod / Bloc) |
| Networking | Dio HTTP client |
| Audio | `just_audio` package |
| Speech capture | `record` package → upload to backend |
| Auth | Supabase Flutter SDK |

## Sections To Complete

- [ ] Full screen list and navigation map
- [ ] State management architecture decision
- [ ] Offline support strategy
- [ ] Push notification plan
- [ ] Accessibility requirements

---
*Last updated: 2026-06-09*
