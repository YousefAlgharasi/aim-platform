# Phase 9 — Voice Mobile Navigation Map

**Task:** P9-008
**Branch:** `phase9/P9-008-voice-mobile-navigation-map`
**Dependency:** P9-006 (Voice Data Flow — Done)
**Output:** `docs/phase-9/voice-mobile-navigation-map.md`

---

## 1. Purpose

This document defines how AI Teacher Voice Mode is reached and navigated
within the existing Student Mobile App routing structure established in
`docs/phase-6/mobile-navigation-map.md`. It does not replace that
document — it extends it with the voice-specific routes, entry points,
and transitions needed for Group G (Flutter AI Teacher Voice UI). Voice
mode reuses the Phase 8 AI Teacher chat routing wherever possible and
adds only the screens/states needed for recording, transcribing, and
playback.

This is a routing/navigation specification only. It does not implement
`AppRouter`, route widgets, or screens — those belong to Group G
implementation tasks.

---

## 2. Navigation Architecture (Unchanged)

Voice mode uses the same `AppRouter.onGenerateRoute` /
`resolveRouteName` auth-guard architecture defined in Phase 6. No new
routing mechanism, no new guard mechanism, and no bypass of the
existing auth guard is introduced for voice routes.

```
AppRouter.onGenerateRoute(settings, authState, authContextState)
  └─► resolveRouteName()       ← same auth guard as Phase 6/8
        └─► switch(routeName)  ← adds AI Teacher Voice routes
```

---

## 3. Route Inventory — Voice Additions

All voice routes are **protected routes** (auth required) and follow the
same redirect-to-`/auth/sign-in` rule as every other protected route in
`docs/phase-6/mobile-navigation-map.md` §3.2.

| Proposed Constant | Proposed Path | Screen | Widget | Notes |
|---|---|---|---|---|
| `AppRoutePaths.aiTeacherVoiceEntry` | `/ai-teacher/voice` | AI Teacher Voice Entry | `AiTeacherVoiceEntryPage` | Reached from the existing AI Teacher chat screen (Phase 8) via a "Voice Mode" toggle/button; not a separate bottom-nav tab. |
| `AppRoutePaths.aiTeacherVoiceSession` | `/ai-teacher/voice/session` | Voice Session | `AiTeacherVoiceSessionPage` | The active recording/transcribing/replying/speaking screen; created by calling `POST /ai-teacher/voice/sessions` (per `docs/phase-9/voice-api-map.md`). |
| `AppRoutePaths.aiTeacherVoiceHistory` | `/ai-teacher/voice/history` | Voice Turn History | `AiTeacherVoiceHistoryPage` | Optional list view of past voice turns for the session, backed by `GET /ai-teacher/voice/sessions/:sessionId/turns`. |

No new bottom-navigation tab is added. Voice mode is reached only
through the existing Phase 8 AI Teacher chat surface, not as a sibling
of Home/Learn/Review/Progress/Profile.

---

## 4. Entry Points

| Entry Point | From | Action |
|---|---|---|
| AI Teacher chat screen (Phase 8) | `/ai-teacher/session` (or equivalent Phase 8 route) | Tap "Voice Mode" control → push `/ai-teacher/voice` |
| Resume in-progress voice session | App relaunch while a voice session is active | Resolve directly to `/ai-teacher/voice/session` if a `sessionId` is held in local session state; otherwise return to `/ai-teacher/voice` entry |

There is no deep link, push notification, or external entry point into
voice mode in Phase 9 scope. Voice mode is only reachable from inside
an authenticated AI Teacher chat flow.

---

## 5. Auth Guard Logic (Extension)

Voice routes are added to the existing protected route set; no new guard
branch is introduced.

```
isChecking          → /             (unchanged)
isSignedOut
  + voice route      → /auth/sign-in (redirect, same as any protected route)
isSignedIn
  + voice route      → pass through to requested voice route
```

**Protected route set addition** (extends
`AppRouter._protectedRoutes` from Phase 6):

```
/ai-teacher/voice, /ai-teacher/voice/session, /ai-teacher/voice/history
```

---

## 6. Full Navigation Flow Diagram

```
AI Teacher Chat (/ai-teacher/session)   [Phase 8, protected]
  └─► [tap "Voice Mode"] ──► Voice Entry (/ai-teacher/voice)
        └─► [tap Start Voice Session]
              └─► POST /ai-teacher/voice/sessions ──► Voice Session (/ai-teacher/voice/session)
                    │
                    ├─► [tap record] ──► state: recording
                    │       └─► [stop] ──► state: transcribing
                    │             └─► POST .../turns (upload audio)
                    │                   └─► state: replying ──► state: speaking (TTS playback)
                    │                         └─► [reply finishes] ──► state: idle (ready to record again)
                    │
                    ├─► [tap History] ──► Voice Turn History (/ai-teacher/voice/history)
                    │       └─► [back] ──► Voice Session (/ai-teacher/voice/session)
                    │
                    └─► [tap Exit / back] ──► AI Teacher Chat (/ai-teacher/session)
```

---

## 7. Voice Session State Machine (Navigation-Relevant Only)

This mirrors the state names from `docs/phase-9/voice-scope-boundaries.md`
§"Flutter (Mobile)" — recording/transcribing/replying/speaking — as they
affect what is rendered on `/ai-teacher/voice/session`, not as a backend
state machine.

| State | Screen Affordance | Triggers Navigation? |
|---|---|---|
| `idle` | Record button enabled | No |
| `recording` | Record button shows stop/cancel | No |
| `transcribing` | Loading indicator; record disabled | No |
| `replying` | Loading indicator; transcript + reply text rendered as it resolves | No |
| `speaking` | Playback indicator while TTS audio plays via endpoint 3 of `docs/phase-9/voice-api-map.md` | No |
| `error` | Inline error state on the same screen | No (no separate error route; same screen, error UI per `docs/phase-8/ai-teacher-error-policy.md` pattern) |

No state transition above causes a route change. All state lives within
`AiTeacherVoiceSessionPage`; only entering/exiting the voice flow or
opening history changes the route.

---

## 8. Transition Behaviour

| Transition | Type | RTL behaviour |
|---|---|---|
| AI Teacher Chat → Voice Entry | `MaterialPageRoute` (slide from right) | RTL: slides from **left** |
| Voice Entry → Voice Session | `MaterialPageRoute` (slide from right) | RTL: slides from **left** |
| Voice Session → Voice History | `MaterialPageRoute` (slide from right) | RTL: slides from **left** |
| Pop / back at any voice screen | Reverse slide | RTL: slides to **left** |

Consistent with `docs/phase-6/mobile-navigation-map.md` §7: RTL slide
direction is handled automatically by Flutter's `MaterialPageRoute` when
`Directionality` is `TextDirection.rtl`. No manual transition code is
required for voice routes.

---

## 9. RTL / Arabic Navigation Rules

| Rule | Implementation |
|---|---|
| Back chevron on voice screens | Same auto-mirroring `BackButton`/`Icons.arrow_back_ios` pattern as Phase 6 |
| Record/stop button placement | Centered control; not direction-dependent, no mirroring needed |
| Playback control row (play/pause/seek) | Use `Row` with `MainAxisAlignment` and `EdgeInsetsDirectional`, not fixed left/right, so control order reads correctly in RTL |
| Transcript/reply chat bubbles | Reuse Phase 8 chat bubble RTL handling (tail mirroring, text alignment) — no separate voice-only bubble styling |
| Voice waveform/level indicator | Direction-agnostic visual; no mirroring required |
| `AppBar` on voice screens | Use `leading`/`actions`, not `left`/`right`, consistent with Phase 6 rule |

All voice navigation chrome (app bars, back buttons, bottom controls)
must come from the AIM Mobile Design System, reusing the same
`AIMTopAppBar` and shared button/card/input widgets used by Phase 8 chat
and Phase 6 navigation — no one-off styling for voice screens.

---

## 10. Navigation Rules & Invariants

| Rule | Detail |
|---|---|
| No new bottom-nav tab for voice | Voice mode is an extension of AI Teacher chat, not a sibling top-level feature |
| No navigation logic inside voice widgets | Routing decisions stay in `AppRouter.resolveRouteName`, same as Phase 6 |
| No hard-coded path strings | Always use `AppRoutePaths.*` constants for the three voice routes above |
| Voice routes must be added to `_protectedRoutes` | Before any voice screen is implemented, per §5 |
| No deep link into voice mode in Phase 9 | Voice mode is reachable only from an authenticated AI Teacher chat session |
| State changes never trigger route changes | Per §7 — recording/transcribing/replying/speaking/error are in-screen states only |
| No client-side computation drives navigation | E.g. no Flutter-computed mastery/level value ever determines a voice route; navigation is driven by user action and backend responses only, consistent with `docs/phase-9/no-aim-authority-change-rule.md` |

---

## 11. References

- Phase 6 Navigation Map (base architecture): `docs/phase-6/mobile-navigation-map.md`
- Phase 9 Voice Scope Boundaries: `docs/phase-9/voice-scope-boundaries.md`
- Phase 9 Voice Data Flow: `docs/phase-9/voice-data-flow.md`
- Phase 9 Voice API Map: `docs/phase-9/voice-api-map.md`
- Phase 8 Error Policy (reused error-state pattern): `docs/phase-8/ai-teacher-error-policy.md`
- Route Paths (to extend): `apps/mobile/lib/core/routing/app_route_paths.dart`
- Router (to extend): `apps/mobile/lib/core/routing/app_router.dart`

---

## Validation

- Voice navigation extends Phase 6's existing routing architecture; no
  new routing mechanism is introduced.
- No new bottom-navigation tab is added for voice mode.
- All voice routes are protected (auth-guarded) like every other
  in-app route.
- No route or screen lets Flutter call an STT, TTS, or AI provider, or
  the AIM Engine, directly.
- No navigation decision is derived from a client-computed
  mastery/level/weakness/difficulty/recommendation/review-schedule
  value.
- RTL/Arabic behaviour is specified for every voice screen and control.
- All voice navigation chrome reuses AIM Mobile Design System widgets.
- No secrets or generated private audio files are referenced or
  committed in this document.

---

*Navigation map created: P9-008 | Branch: phase9/P9-008-voice-mobile-navigation-map*
