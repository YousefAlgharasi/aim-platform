# Phase 6 — Mobile MVP Scope & Out-of-Scope Boundaries

**Phase:** 6  
**Task:** P6-003  
**Status:** Active  
**Branch:** `phase6/P6-003-mobile-mvp-scope-boundaries`  
**Dependency:** P6-001  
**Output:** `docs/phase-6/mobile-mvp-scope-boundaries.md`

---

## 1. Purpose

This document defines the precise in-scope and out-of-scope boundary for the Phase 6 Student Mobile App MVP. It is the authoritative reference for deciding whether a feature, behavior, or piece of logic belongs in Phase 6 or is deferred.

Every agent, contributor, and reviewer must consult this document when evaluating scope. If a feature is not explicitly listed as in-scope, it is out-of-scope by default.

---

## 2. Governing Principles

The following principles drive every scope decision in Phase 6:

1. **Backend authority is non-negotiable.** Flutter displays data. It does not compute, infer, or derive learning intelligence. See `docs/phase-6/student-mobile-mvp-charter.md §3.1`.
2. **AIM Mobile Design System is mandatory.** All UI components come from shared theme tokens and the shared widget library. No inline styles, no hard-coded values.
3. **RTL/Arabic is non-negotiable.** Every screen must be RTL-verified before it is considered done.
4. **MVP means end-to-end, not feature-complete.** The goal is a working student journey, not a polished production release.
5. **No secrets in Flutter.** API keys, tokens, and service credentials are never committed to client code.

---

## 3. In-Scope Features

### 3.1 Authentication

| Feature | In Scope | Notes |
|---|---|---|
| Email/password login screen | ✅ | Uses AIM design system inputs and buttons |
| Session persistence (JWT storage) | ✅ | Secure storage only; no plaintext |
| Logout | ✅ | Clears local session, returns to login |
| Auth gate (redirect unauthenticated users) | ✅ | GoRouter guard or equivalent |
| Token refresh (if backend supports it) | ✅ | Transparent to the user |
| Registration / sign-up screen | ❌ | Out-of-scope — deferred to post-MVP |
| Password reset flow | ❌ | Out-of-scope — deferred to post-MVP |
| Social / OAuth login | ❌ | Out-of-scope — deferred to post-MVP |

---

### 3.2 Placement Test

| Feature | In Scope | Notes |
|---|---|---|
| Fetch placement test questions from backend | ✅ | Read-only display |
| Display question screen (MC, T/F, fill-in) | ✅ | Uses shared answer option widgets |
| Answer selection and local state | ✅ | Only tracks user's selection per question |
| Submit answers to backend | ✅ | POST payload only; no client-side scoring |
| Display backend placement result | ✅ | Read-only display of backend response |
| Retake policy enforcement display | ✅ | Show backend-returned retake eligibility |
| Calculate correctness or score in Flutter | ❌ | Backend authority — never in Flutter |
| Determine CEFR level in Flutter | ❌ | Backend authority — never in Flutter |
| Derive section weights in Flutter | ❌ | Backend authority — never in Flutter |

---

### 3.3 Home Screen

| Feature | In Scope | Notes |
|---|---|---|
| Home screen shell with bottom navigation | ✅ | Uses AIM nav component |
| Display AIM learning plan summary from backend | ✅ | Read-only; data fetched from backend |
| Display weakness areas from backend | ✅ | Read-only; labels returned by backend |
| Display recommendation cards from backend | ✅ | Read-only; content returned by backend |
| Compute or rank weaknesses in Flutter | ❌ | Backend authority |
| Generate recommendations in Flutter | ❌ | Backend authority |
| Personalised greeting / name display | ✅ | Student name from JWT/profile endpoint |

---

### 3.4 Learning Plan

| Feature | In Scope | Notes |
|---|---|---|
| Display full backend-returned learning plan | ✅ | Read-only list/card view |
| Display topic coverage percentages from backend | ✅ | Render backend value; do not compute |
| Display difficulty labels from backend | ✅ | Render backend label; do not derive |
| Compute mastery or coverage in Flutter | ❌ | Backend authority |
| Adjust spaced-repetition schedule in Flutter | ❌ | Backend authority |

---

### 3.5 Course / Session Flow

| Feature | In Scope | Notes |
|---|---|---|
| Course list screen | ✅ | Fetch and display from backend |
| Session entry screen | ✅ | Confirm session start |
| Question answering during session | ✅ | Display, select, submit to backend |
| Display backend feedback per answer | ✅ | Read-only; never inferred client-side |
| Display session summary from backend | ✅ | Read-only result screen |
| Calculate session score in Flutter | ❌ | Backend authority |
| Determine answer correctness in Flutter | ❌ | Backend authority — `is_correct` never exposed to Flutter |

---

### 3.6 Navigation & Routing

| Feature | In Scope | Notes |
|---|---|---|
| Bottom navigation bar | ✅ | Shared nav component |
| Named route setup (GoRouter) | ✅ | |
| Deep link stubs (routes declared, not wired) | ✅ | Stubs only; no handler logic required |
| Push notification routing | ❌ | Out-of-scope |

---

### 3.7 AIM Mobile Design System

| Feature | In Scope | Notes |
|---|---|---|
| Theme token adoption (colors, typography, spacing) | ✅ | No hard-coded values in feature code |
| Shared button, card, input widgets | ✅ | |
| Loading, empty, and error state widgets | ✅ | |
| Progress indicator widgets | ✅ | |
| Answer option and feedback container widgets | ✅ | |
| RTL-aware layout foundation | ✅ | `Directionality`, leading/trailing alignment |
| Adding missing components to design system layer | ✅ | Extend rather than improvise inline |
| Custom per-screen ad-hoc styles | ❌ | Must go through design system |

---

### 3.8 Quality & Verification

| Feature | In Scope | Notes |
|---|---|---|
| `flutter analyze` passes with no errors | ✅ | Required for every task |
| RTL/Arabic layout verification per screen | ✅ | Document pass/fail per screen |
| No secrets committed | ✅ | Checked before every push |
| Backend authority rules respected | ✅ | Verified per task done test |

---

## 4. Out-of-Scope for Phase 6 MVP

The following are **explicitly excluded**. Any task or code that touches these areas must be stopped and deferred.

### 4.1 Deferred Features

| Area | Reason |
|---|---|
| Offline mode / local AIM data caching | Deferred; requires significant architecture work |
| Push notifications | Deferred; no backend notification service in Phase 6 |
| Student profile editing | Deferred; read-only profile sufficient for MVP |
| Payments / subscription management | Deferred; no payment backend in Phase 6 |
| Admin or teacher-facing views | Out-of-scope; different user type |
| Social features (leaderboards, peer comparison) | Deferred; requires social graph backend |
| App Store / Play Store submission | Deferred; MVP targets device/emulator only |
| Production deployment pipeline | Deferred; CI/CD for stores is post-MVP |

### 4.2 Forbidden in Flutter (All Phases)

| Behaviour | Reason |
|---|---|
| Placement score calculation | Backend authority — `scoring.service.ts` owns this |
| Answer correctness determination | Backend authority — never exposed via API |
| CEFR level derivation | Backend authority — AIM Engine output |
| Weakness / mastery computation | Backend authority — AIM Engine output |
| Difficulty rating derivation | Backend authority — AIM Engine output |
| Recommendation generation | Backend authority — AIM Engine output |
| Review schedule / spaced-repetition logic | Backend authority — AIM Engine output |
| Direct AIM Engine API calls | Forbidden — Flutter never calls AIM Engine |
| Direct AI provider calls (OpenAI, Anthropic, etc.) | Forbidden — Flutter never calls AI providers |
| Storing `is_correct` or `correct_answer` from API | Forbidden — never returned by backend |
| Storing `overallScore` as persistent Flutter state | Forbidden — backend-computed, display only |

---

## 5. Scope Decision Table

Use this table to resolve ambiguous scope questions quickly.

| Question | Answer |
|---|---|
| Should Flutter compute this? | No. Ask: does the backend return it? If yes, display it. If no, raise it as a missing API. |
| Should this use a custom style? | No. Use design system tokens. If the component is missing, extend the design system. |
| Does this screen need RTL verification? | Yes. Every screen, no exceptions. |
| Is this feature needed for the student journey? | Auth → placement → home → session → feedback. If it's not on this path, it's out-of-scope. |
| Can Flutter cache AIM output locally? | No. Offline mode is out-of-scope. |
| Should this call an AI provider? | No. Never from Flutter. |

---

## 6. Student Journey — The MVP Path

The MVP delivers exactly this end-to-end flow:

```
Launch App
  └─► Auth Gate
        ├─► [Not authenticated] → Login Screen → Authenticate → Auth Gate
        └─► [Authenticated]
              └─► Home Screen (AIM plan summary)
                    ├─► Placement Test Flow
                    │     ├─► Placement Section Screen
                    │     ├─► Question Screen (per section)
                    │     ├─► Submit → Backend scores → Result Screen
                    │     └─► Return to Home
                    ├─► Learning Plan Screen (backend data)
                    └─► Course / Session Flow
                          ├─► Course List Screen
                          ├─► Session Entry Screen
                          ├─► Question Answering (submit → backend feedback)
                          └─► Session Summary Screen (backend result)
```

Everything outside this path is out-of-scope for Phase 6 MVP.

---

## 7. How to Use This Document

- **Before starting a task:** confirm the output belongs to the in-scope features table.
- **During implementation:** if you find yourself computing a value that the backend should own, stop and raise it.
- **Before committing:** verify the done test against this document.
- **When in doubt:** default to out-of-scope. It is always better to defer than to violate backend authority or the design system rules.

---

## 8. References

- MVP Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md` (P6-004)
- No Client AIM/AI Rule: `docs/phase-6/no-client-aim-ai-rule.md` (P6-005)
- Phase 6 Prompts: `docs/tasks/phase6_prompts.md`
- Notion Database: https://app.notion.com/p/17276463d164480fa204dc5b524bb012

---

*Scope boundaries defined: P6-003 | Branch: phase6/P6-003-mobile-mvp-scope-boundaries*
