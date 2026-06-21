# Phase 8 — Add Flutter AI Chat Tests

**Task:** P8-095
**Branch:** `phase8/P8-095-flutter-ai-chat-tests`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-080 .. P8-094 — all Done

---

## Scope

Add the remaining Flutter test coverage for the AI Teacher chat UI
(`apps/mobile/lib/features/ai_teacher/`) so every widget delivered in Group I
(P8-080 .. P8-092) has a corresponding test, and confirm the existing test
suite already covers state, backend datasource, RTL/Arabic, and the
no-direct-provider-call boundary.

## Method

Inventory of existing tests under `apps/mobile/test/features/ai_teacher/`
versus the widget/provider/datasource files under
`apps/mobile/lib/features/ai_teacher/`, followed by manual source reads of
each widget/file before writing or confirming tests.

## Findings

### 1. Pre-existing coverage (confirmed already present on `main`)

- `ai_teacher_chat_repository_provider_test.dart` — 10 tests covering
  `AiTeacherChatNotifier`/repository/provider wiring: `loadSessions`,
  `startSession`, `loadHistory`, `sendMessage`, `submitFeedback`, success and
  `AppException`/generic-failure paths. This already supplies the
  notifier/state-layer coverage this task would otherwise need to add.
- `ai_teacher_remote_datasource_impl_test.dart` — backend datasource tests
  confirming every AI Teacher network call targets `BackendApiClient`/the
  backend API paths.
- `ai_teacher_chat_page_test.dart` — page-level integration tests.
- `ai_chat_error_state_test.dart`, `ai_chat_input_bar_test.dart`,
  `ai_chat_message_bubble_test.dart`, `ai_lesson_context_header_test.dart`,
  `ai_teacher_entry_card_test.dart`, `ai_typing_indicator_test.dart` — widget
  tests for the remaining Group I widgets.
- `docs/quality/phase-8-ai-chat-rtl-arabic-check.md` — dedicated RTL/Arabic
  audit (P8-093, already Done).
- `docs/quality/phase-8-no-direct-ai-provider-check.md` — no-direct-provider
  audit (P8-094, already Done).

### 2. Coverage gap found and closed

Two Group I widgets had no widget test file:

- `AiSuggestedPromptsRow` (P8-091) — added
  `apps/mobile/test/features/ai_teacher/ui/widgets/ai_suggested_prompts_row_test.dart`
  covering: rendering every prompt as a chip and invoking `onSelect` with the
  tapped prompt's text; `disabled` preventing selection; render without error
  under RTL directionality.
- `AiReplyFeedbackActions` (P8-092) — added
  `apps/mobile/test/features/ai_teacher/ui/widgets/ai_reply_feedback_actions_test.dart`
  covering: tapping "helpful" invokes `onRate` with wire value `"helpful"`;
  tapping "not helpful" invokes `onRate` with wire value `"not_helpful"`; a
  failed `onRate` reverts the optimistic selection (outlined icon shown
  again, filled icon not shown); render without error under RTL
  directionality.

Both new test files use the existing local `pumpAimWidget` extension
convention (`MaterialApp` + `Directionality` + `Scaffold`) used by all other
AI Teacher widget tests, and locate interactive targets via
`find.bySemanticsLabel(...)`, matching the `Semantics`-based tap target used
by the underlying `AIMIconButton`/`AIMChip` design-system widgets (neither
uses `Tooltip`).

### 3. No notifier-specific test file added

`AiTeacherChatNotifier` state-transition coverage (success/failure for
`loadSessions`/`startSession`/`loadHistory`/`sendMessage`/`submitFeedback`)
already exists in full inside `ai_teacher_chat_repository_provider_test.dart`
(10 tests). Adding a second, separate notifier test file would duplicate
this coverage, so none was added.

## Result

Flutter AI Teacher chat UI test coverage is now complete: every Group I
widget, the chat page, the backend datasource, the chat notifier/provider,
RTL/Arabic behavior, and the no-direct-provider-call boundary each have a
dedicated automated check. Two widget test files were added to close the
only remaining gap (`AiSuggestedPromptsRow`, `AiReplyFeedbackActions`).

## Limitations

No Flutter/Dart SDK is available in this environment; the new test files
were validated by manual source review against the exact widget
implementations (constructor parameters, semantics labels, icon assets) and
the test files were not executed via `flutter test`. The other test files
referenced above were already present and unmodified by this task — their
results are inherited from prior tasks (P8-091, P8-092, P8-093, P8-094) and
were not re-run here.
