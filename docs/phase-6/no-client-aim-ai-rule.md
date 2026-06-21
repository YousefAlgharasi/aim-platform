# Phase 6 — No Client AIM/AI Rule

**Phase:** 6  
**Task:** P6-005  
**Branch:** `phase6/P6-005-no-client-aim-ai-rule`  
**Dependency:** P6-004 (No Client Authority Rule — Done)  
**Output:** `docs/phase-6/no-client-aim-ai-rule.md`

---

## 1. Purpose

This document establishes the **No Client AIM/AI Rule** for Phase 6. Flutter must never call the AIM Engine or any AI provider directly. All AIM and AI access is backend-only. This rule is a hard architectural constraint for every Phase 6 task.

---

## 2. The Rule

> **Flutter must not call the AIM Engine or any AI provider (OpenAI, Anthropic, Google Gemini, etc.) directly — ever.**

All requests that require AI inference or AIM processing flow through the backend API. Flutter calls the backend. The backend calls AIM/AI. The backend returns a structured response. Flutter displays it.

---

## 3. Why This Rule Exists

| Risk | Consequence if Flutter Calls AIM/AI Directly |
|---|---|
| Secret exposure | API keys for AIM Engine or AI providers would be embedded in the mobile app binary — extractable by anyone |
| Prompt injection | Malicious users could craft inputs that manipulate AI behavior without backend validation |
| Consistency | Two clients (backend + Flutter) calling AI independently would produce divergent results for the same student |
| Cost control | Unmetered AI calls from mobile clients would bypass backend rate limiting and cost guardrails |
| Audit trail | Backend-mediated AI calls are logged and auditable; direct Flutter calls are not |
| Business logic bypass | Backend applies validation, permissions, and AIM pipeline rules before calling AI; Flutter cannot replicate this correctly |

---

## 4. Banned Patterns

### 4.1 Direct AIM Engine Call

```dart
// ❌ BANNED
final response = await http.post(
  Uri.parse('https://aim-engine.internal/v1/analyze'),
  headers: {'Authorization': 'Bearer $aimToken'},
  body: jsonEncode({'studentId': id, 'answers': answers}),
);
```

### 4.2 Direct OpenAI Call

```dart
// ❌ BANNED
final response = await http.post(
  Uri.parse('https://api.openai.com/v1/chat/completions'),
  headers: {'Authorization': 'Bearer $openAiKey'},
  body: jsonEncode({'model': 'gpt-4', 'messages': [...]}),
);
```

### 4.3 Direct Anthropic Call

```dart
// ❌ BANNED
final response = await http.post(
  Uri.parse('https://api.anthropic.com/v1/messages'),
  headers: {'x-api-key': anthropicKey},
  body: jsonEncode({'model': 'claude-3-5-sonnet', 'messages': [...]}),
);
```

### 4.4 AI SDK Usage in Flutter

```dart
// ❌ BANNED — no AI SDK packages in Flutter pubspec.yaml
// openai_dart, anthropic_sdk_dart, google_generative_ai, langchain_dart, etc.
```

### 4.5 Storing AIM/AI Credentials in Flutter

```dart
// ❌ BANNED — no AIM or AI keys anywhere in Flutter source
const aimEngineToken = 'aim_prod_...';
const openAiKey = 'sk-...';
```

---

## 5. Correct Pattern — All AIM/AI via Backend API

```dart
// ✅ CORRECT — Flutter calls backend; backend handles AIM/AI
class PlacementRepository {
  final ApiClient _api;

  Future<PlacementResult> submitPlacement(PlacementSubmission submission) async {
    // Flutter calls the backend endpoint only
    final response = await _api.post(
      '/api/v1/placement/submit',
      body: submission.toJson(),
    );
    // Backend has already called AIM Engine and returned the result
    return PlacementResult.fromJson(response.data);
  }
}
```

The backend owns the AIM Engine call, the prompt construction, the result parsing, and the business logic. Flutter receives a clean, typed response.

---

## 6. Dependency on Phase 5 AIM APIs

Flutter consumes Phase 5 AIM outputs as **read-only data sources** via backend endpoints:

- `GET /api/v1/aim/plan` — student's AIM-generated learning plan
- `GET /api/v1/aim/weaknesses` — AIM-identified weak areas
- `GET /api/v1/aim/recommendations` — AIM-generated next steps
- `POST /api/v1/placement/submit` — triggers AIM placement analysis (backend handles AIM call)
- `POST /api/v1/sessions/:id/answers` — triggers AIM answer evaluation (backend handles AIM call)

Flutter never calls the AIM Engine URLs directly. It only calls the backend REST API.

---

## 7. pubspec.yaml Compliance

The Flutter `pubspec.yaml` must not include any of the following package categories:

- AI SDK packages (`openai_dart`, `anthropic_sdk_dart`, `google_generative_ai`, `langchain_dart`, `ollama_dart`, etc.)
- AIM Engine client packages
- Any package whose primary purpose is AI inference

Code review must scan `pubspec.yaml` for AI-related dependencies.

---

## 8. Enforcement

- Every Flutter task Done Test includes: *"Flutter does not call AIM Engine or any AI provider directly."*
- `pubspec.yaml` changes are reviewed for AI SDK additions.
- Any network call in Flutter to a non-backend URL is a stop condition.
- Secrets scan must confirm no AIM or AI API keys are present in Flutter source.

---

## 9. References

- Phase 6 Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md`
- Task Execution Rules: `docs/phase-6/task-execution-rules.md`
- Phase 6 Prompts: `docs/tasks/phase6_prompts.md`

---

*No Client AIM/AI Rule created: P6-005 | Branch: phase6/P6-005-no-client-aim-ai-rule*
