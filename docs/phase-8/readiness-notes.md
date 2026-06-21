# Phase 8 Readiness Notes

**Produced by:** Phase 6 — P6-109  
**Branch:** `phase6/P6-109-phase-8-readiness-notes`  
**Last updated:** 2026-06-18

---

## 1. Purpose

This document records everything Phase 6 intentionally left incomplete for the AI Teacher feature, and defines the exact work Phase 8 must pick up. It is a handoff from the MVP shell to the full interactive implementation.

Phase 6 produced a **shell only**: navigation slot, disabled placeholder UI, and a regression check proving no AI provider is called from Flutter. Phase 8 delivers the real conversational AI Teacher.

---

## 2. What Phase 6 Delivered (AI Teacher Scope)

| Task | Output | Location |
|------|--------|----------|
| P6-105 | Shell scope document | `docs/phase-6/ai-teacher-shell-scope.md` |
| P6-106 | Feature skeleton (empty sub-layers + barrel) | `apps/mobile/lib/features/ai_teacher/` |
| P6-107 | Disabled placeholder page with design-system UI | `apps/mobile/lib/features/ai_teacher/ui/pages/ai_teacher_placeholder_page.dart` |
| P6-108 | No-AI-provider regression test (15 checks) | `apps/mobile/test/regression/no_ai_provider_check_test.dart` |

The shell directory structure is fully in place. No architectural rework is needed to add the real feature — Phase 8 fills the empty sub-layers.

---

## 3. Backend Work Required Before Phase 8 Flutter Work

The AI Teacher is a **backend-proxied** feature. Flutter must never call an AI provider directly. The NestJS API must expose the following endpoints **before** Flutter implementation begins:

### 3.1 Required API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai-teacher/sessions` | Create a new AI Teacher session for a student |
| `POST` | `/ai-teacher/sessions/:sessionId/messages` | Send a student message; receive AI response |
| `GET` | `/ai-teacher/sessions/:sessionId/messages` | Load message history for an existing session |
| `DELETE` | `/ai-teacher/sessions/:sessionId` | End / close a session |

### 3.2 Expected Message Response Shape

```json
{
  "messageId": "msg-abc123",
  "sessionId": "sess-xyz456",
  "role": "assistant",
  "content": "Great question! The article 'the' is used when...",
  "createdAt": "2026-08-01T10:00:00Z",
  "contextSkillIds": ["grammar-articles"],
  "metadata": {
    "tokensUsed": 312,
    "modelVersion": "gpt-4o"
  }
}
```

All AI computation (token usage, model selection, prompt construction) is backend-owned. Flutter receives and renders the `content` string verbatim.

### 3.3 Authentication

All AI Teacher endpoints must require the student's bearer token (same pattern as existing Phase 6 APIs). The backend validates the token via Supabase Auth before forwarding to the AI provider.

---

## 4. Flutter Work for Phase 8

The feature shell at `apps/mobile/lib/features/ai_teacher/` has empty `.gitkeep` files in each sub-layer. Phase 8 replaces them with real implementation.

### 4.1 Data Layer

**Models** (`data/models/`):
- `AiTeacherSessionModel` — session ID, studentId, createdAt, status
- `AiTeacherMessageModel` — messageId, sessionId, role (student|assistant), content, createdAt, contextSkillIds

**Datasource** (`data/datasources/`):
- `AiTeacherDatasource` (abstract) + `AiTeacherDatasourceImpl`
- Methods: `createSession`, `sendMessage`, `getMessages`, `endSession`
- Uses `BackendApiClient` — no direct AI provider calls

**Repository impl** (`data/repository/repo_impl/`):
- `AiTeacherRepositoryImpl` — maps models to entities, delegates to datasource

### 4.2 Logic Layer

**Entities** (`logic/entity/`):
- `AiTeacherSession` — session entity
- `AiTeacherMessage` — message entity (role, content, timestamp)
- `AiTeacherConversation` — ordered list of messages + session metadata

**Repository interface** (`logic/repository/`):
- `AiTeacherRepository` (abstract)

**Providers** (`logic/provider/`):
- `AiTeacherNotifier extends AppStateNotifier<AiTeacherConversation>`
- Actions: `startSession`, `sendMessage`, `loadHistory`, `endSession`

### 4.3 UI Layer

**Pages** (`ui/pages/`):
- Replace `AiTeacherPlaceholderPage` with `AiTeacherPage` — the real conversational screen
- `AiTeacherPage` contains: message list, input bar, session controls

**Widgets** (`ui/widgets/`):
- `AiTeacherMessageBubble` — renders student and assistant messages, RTL-aware
- `AiTeacherInputBar` — text input + send button, disabled during API call
- `AiTeacherSessionHeader` — shows current skill context and session status
- All widgets use AIM Mobile Design System tokens; no one-off styling

### 4.4 Routing

`AiTeacherPage` is already registered in `AppRouter` via the shell barrel export. Phase 8 only needs to swap the placeholder with the real page — the route path does not change.

---

## 5. Design Constraints Inherited from Phase 6

These constraints are non-negotiable and must be preserved in Phase 8:

| Constraint | Source | Notes |
|-----------|--------|-------|
| No direct AI provider calls from Flutter | P6-005, P6-108 | All AI traffic goes through NestJS |
| AIM Mobile Design System only | Phase 6 master instruction | No one-off styling, no hard-coded colours/spacing |
| RTL/Arabic compliant | Phase 6 master instruction | `EdgeInsetsDirectional`, no forced LTR |
| Backend authority over all AI output | P6-003, P6-004 | Flutter renders content verbatim — no local post-processing |
| Regression check must pass | P6-108 | `flutter test test/regression/no_ai_provider_check_test.dart` |

---

## 6. Regression Check to Update in Phase 8

`apps/mobile/test/regression/no_ai_provider_check_test.dart` (P6-108) currently verifies no AI provider calls exist. In Phase 8, **do not remove these tests**. They remain valid — Flutter still must not call AI providers directly even when the real feature is active.

---

## 7. Out of Scope for Phase 8

The following are explicitly deferred beyond Phase 8:

- Voice input / speech-to-text (separate phase)
- Offline message caching
- Push notifications for AI Teacher responses
- AI Teacher analytics / usage reporting
- Multi-language AI Teacher support (Arabic responses from AI)

---

## 8. Entry Point Checklist for Phase 8

Before starting Phase 8 Flutter implementation, verify:

- [ ] Backend AI Teacher endpoints live on staging (`/ai-teacher/*`)
- [ ] OpenAPI schema updated with AI Teacher endpoint definitions
- [ ] Phase 8 task database created in Notion
- [ ] `no_ai_provider_check_test.dart` still passes on main (no regressions from earlier phases)
- [ ] `AiTeacherPlaceholderPage` is the only file needing replacement (all sub-layers still empty)
- [ ] AIM Mobile Design System has all required widgets (or extend before building AI Teacher UI)

---

## References

- `docs/phase-6/ai-teacher-shell-scope.md` — Phase 6 AI Teacher shell scope
- `docs/phase-6/no-client-aim-ai-rule.md` — No client AIM/AI rule
- `docs/phase-6/no-client-authority-rule.md` — Backend authority rule
- `apps/mobile/lib/features/ai_teacher/` — Feature shell directory
- `apps/mobile/test/regression/no_ai_provider_check_test.dart` — Regression check
