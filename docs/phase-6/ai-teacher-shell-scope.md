# AI Teacher Shell Scope — Phase 6

**Task:** P6-105  
**Phase:** 6  
**Branch:** `phase6/P6-105-ai-teacher-shell-scope-doc`  
**Dependency:** P6-003 (Mobile MVP Scope), P6-005 (No Client AIM/AI Rule)  
**Output:** `docs/phase-6/ai-teacher-shell-scope.md`

---

## 1. Purpose

This document defines the **exact scope of AI Teacher work permitted in Phase 6**.

Phase 6 is the Student Mobile App MVP. The AI Teacher is a future interactive feature (text mode, conversational tutoring, real-time hints). It is **not part of the MVP**. However, Phase 6 must lay the structural groundwork so Phase 8 can add the real feature without architectural rework.

The permitted scope is: **shell only** — feature directory, barrel exports, and a disabled placeholder UI. Nothing more.

---

## 2. What "Shell Only" Means

| Permitted in Phase 6 | Forbidden in Phase 6 |
|---|---|
| `features/ai_tutor/` directory with empty sub-layers | Real AI Teacher text mode UI |
| Barrel exports (`ai_tutor.dart`) | Any call to an AI provider (OpenAI, Anthropic, Gemini, etc.) |
| Disabled placeholder page with "Coming Soon" state | Any call to the AIM Engine directly from Flutter |
| Navigation entry point (disabled / greyed out) | Conversation state management |
| Design-system-compliant placeholder using `AIMCard`, `AIMAlertBanner` | Chat input widgets wired to a backend AI endpoint |
| Phase 8 readiness notes | Session/message history storage |
| | API key or provider credential in any form |
| | Any `http.post` / `Dio.post` to an AI endpoint from Flutter |

---

## 3. Architectural Boundary

The No Client AIM/AI Rule (P6-005) applies unconditionally:

> **Flutter must never call the AIM Engine or any AI provider directly.**

Even in the shell, Flutter must not import or reference:
- `openai_dart`, `dart_openai`, or any OpenAI SDK
- `anthropic_dart` or any Anthropic SDK
- `google_generative_ai` or Gemini SDK
- Any HTTP client pointed at `api.openai.com`, `api.anthropic.com`, or similar AI provider URLs
- The AIM Engine service URL

If the AI Teacher feature eventually needs backend-mediated AI, the backend exposes a `/ai-teacher/message` endpoint. Flutter calls that endpoint only — it never calls the AI provider.

---

## 4. Phase 6 Deliverables for AI Teacher

| Task | Output | Notes |
|---|---|---|
| P6-105 | This document | Shell scope defined |
| P6-106 | `features/ai_tutor/` shell | Empty sub-layers + barrel |
| P6-107 | Disabled placeholder page | Design-system UI, no real functionality |
| P6-108 | No-AI-provider regression check | Static scan of entire `apps/mobile/lib/` |

---

## 5. What Phase 8 Will Add

Phase 8 is the AI Teacher text mode implementation. It will:

1. Add a backend endpoint (`POST /ai-teacher/message`) that proxies to the AI provider.
2. Add Flutter datasource / repository / notifier for the AI Teacher message flow.
3. Build the conversation UI (message list, input bar, scroll behaviour).
4. Integrate with the session context (current lesson, student profile).

Phase 6 must not anticipate or pre-implement any of this. The shell provides a clean insertion point.

---

## 6. Forbidden Patterns (Phase 6 AI Teacher Shell)

The following patterns must never appear in `features/ai_tutor/` during Phase 6:

```
// FORBIDDEN — AI provider import
import 'package:openai_dart/openai_dart.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

// FORBIDDEN — direct AI provider HTTP call
await http.post(Uri.parse('https://api.openai.com/v1/chat/completions'), ...);
await dio.post('https://api.anthropic.com/v1/messages', ...);

// FORBIDDEN — AIM Engine direct call
await http.post(Uri.parse('$aimEngineBaseUrl/infer'), ...);

// FORBIDDEN — API key in Flutter code
const openAiKey = 'sk-...';
const anthropicKey = 'sk-ant-...';
```

---

## 7. Compliance with Existing Rules

| Rule | Document | AI Teacher Shell Status |
|---|---|---|
| No Client Authority | P6-004 / no-client-authority-rule.md | Compliant — shell has no authority logic |
| No Client AIM/AI | P6-005 / no-client-aim-ai-rule.md | Compliant — shell makes no AI/AIM calls |
| No One-Off Styling | no-one-off-styling-rule.md | Compliant — placeholder uses design system only |
| RTL/Arabic | Phase 6 master instruction | Compliant — placeholder respects ambient directionality |
| Backend Authority | Phase 6 master instruction | Compliant — no backend-owned values computed in Flutter |

---

## 8. Regression Check

P6-108 adds `apps/mobile/scripts/no_ai_provider_check.dart` — a static scanner that verifies no direct AI provider imports or HTTP calls exist anywhere in `apps/mobile/lib/`. It must pass before Phase 6 is closed.

Run from repo root:

```bash
dart apps/mobile/scripts/no_ai_provider_check.dart
```

Exit 0 = PASS.

---

## References

- P6-003 — Define Mobile MVP Scope & Out-of-Scope
- P6-005 — Document No Client AIM/AI Rule
- P6-106 — Create AI Teacher Feature Shell
- P6-107 — Build Disabled AI Teacher Placeholder
- P6-108 — Add No AI Provider Regression Check
