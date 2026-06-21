# Phase 8 — Verify No Direct AI Provider Calls in Flutter

**Task:** P8-094
**Branch:** `phase8/P8-094-flutter-no-direct-ai-provider-check`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-082 .. P8-092 — all Done

---

## Scope

Regression check confirming that the Flutter mobile app (`apps/mobile/`) —
in particular the AI Teacher feature (`apps/mobile/lib/features/ai_teacher/`)
delivered across P8-080 .. P8-092 — never calls an AI provider directly, and
that all AI Teacher network access remains behind the backend NestJS
gateway. This preserves the backend-only AI provider boundary
(`docs/phase-8/no-aim-replacement-rule.md`) and confirms no provider
secrets are committed.

## Method

Repository-wide `grep` across `apps/mobile/lib` and `apps/mobile/pubspec.yaml`
for:

- Known AI provider names/domains/SDK identifiers: `openai`, `anthropic`,
  `claude`, `gemini`, `gpt-`, `generativelanguage`, `x.ai`, `cohere.ai`,
  `huggingface`.
- Direct HTTP usage (`http.`, `dio.`, `Dio(`, `HttpClient`) inside the
  `ai_teacher` feature directory.
- Hard-coded API keys/secrets (`api_key`, `apikey`, `sk-`, `service_role`)
  inside the `ai_teacher` feature directory.
- Manual read of every datasource/repository file in
  `apps/mobile/lib/features/ai_teacher/data/` to confirm all network calls
  target the backend API client only.

## Findings

### 1. No AI provider SDK or endpoint references

`grep -i 'openai|anthropic|claude|gemini|gpt-|...' apps/mobile/lib` matched
exactly one file:
`apps/mobile/lib/features/ai_teacher/ui/pages/ai_teacher_placeholder_page.dart`,
line 9 — a **shell-rule comment**:

```
// - No AI provider imports (OpenAI, Anthropic, Gemini, etc.).
```

This is documentation of the constraint, not a violation. No other file in
`apps/mobile/lib` references any AI provider name, SDK, or domain.

### 2. All AI Teacher network calls route through the backend API client

`apps/mobile/lib/features/ai_teacher/data/datasources/ai_teacher_remote_datasource_impl.dart`
implements every AI Teacher network operation (`startSession`,
`listSessions`, `sendMessage`, `getHistory`, `submitFeedback`) exclusively
via `BackendApiClient.get`/`BackendApiClient.post` against
`BackendApiPaths.aiTeacherSessions` / `aiTeacherSessionMessages` /
`aiTeacherMessageFeedback` — relative backend routes resolved by the shared
`BackendApiClient`, never an absolute provider URL. The file's own header
comment states: "Every call below targets the backend NestJS API only. No
AI provider SDK, key, or endpoint is referenced anywhere in this file." —
confirmed correct by this audit.

No `http.`/`dio.`/`Dio(`/`HttpClient` usage exists anywhere under
`apps/mobile/lib/features/ai_teacher/` outside of this shared client.

### 3. No AI provider secrets or keys

`grep -i 'api_key|apikey|sk-|service_role' apps/mobile/lib/features/ai_teacher`
returned no matches. No provider key, Supabase service-role key, database
credential, or production token is present anywhere in the AI Teacher
feature code.

### 4. No AI provider SDK dependency

`apps/mobile/pubspec.yaml` was checked for `openai`, `anthropic`,
`google_generative`, `cohere`, `huggingface` package dependencies — none
found. The Flutter app does not declare any AI provider SDK as a
dependency.

### 5. AIM Engine / learning-authority boundary

Cross-checked alongside the provider boundary: the AI Teacher chat layer
(`AiTeacherChatNotifier`, `AiTeacherChatRepository`,
`AiTeacherRemoteDatasourceImpl`) only forwards `contextRef`/`message`/
`rating` to the backend and only renders backend-returned `text`/`role`/
`status` values. No mastery, level, weakness, difficulty, recommendation,
or review-schedule value is computed, derived, or overridden anywhere in
Flutter.

## Result

No regressions found. The backend-only AI provider boundary established in
Phase 8 Group H (backend AI Teacher API) remains fully intact across all of
Group I (Flutter AI Teacher Chat UI, P8-080 .. P8-092). No remediation was
required.

## Limitations

No Flutter/Dart SDK or `flutter analyze` is available in this environment;
this check is a static `grep`-based audit plus manual source review, not an
automated lint/test run.
