// Phase 8 — P8-085
// ai_teacher_chat_page_test.dart — widget tests for AiTeacherChatPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Empty history renders the empty state.
//   4. Populated history renders student/AI message text.
//   5. RTL layout renders without error.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_provider.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_chat_page.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

// ── Helpers ─────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) =>
    ProviderScope(
      overrides: [
        authFlowProvider.overrideWith(
          (ref) => _SignedInAuthFlowNotifier(),
        ),
        ...overrides,
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _history = AiChatHistoryModel(
  sessionId: 'session-1',
  messages: [
    AiChatMessageModel(
      id: 'm1',
      role: 'student',
      text: 'What is the past tense of go?',
      createdAt: '2025-01-01T00:00:00Z',
    ),
    AiChatMessageModel(
      id: 'm2',
      role: 'ai_teacher',
      text: 'The past tense of "go" is "went".',
      createdAt: '2025-01-01T00:00:01Z',
    ),
  ],
);

// ── Tests ───────────────────────────────────────────────────────────────────

void main() {
  group('AiTeacherChatPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherChatPage(contextRef: 'lesson-1'),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(AiTeacherChatPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherChatPage(contextRef: 'lesson-1'),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.failure(message: 'Load failed'),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('shows empty state when history has no messages',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherChatPage(contextRef: 'lesson-1'),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.success(AiTeacherChatState()),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Ask AI Teacher anything'), findsOneWidget);
    });

    testWidgets('shows student and AI Teacher messages when populated',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherChatPage(contextRef: 'lesson-1', sessionId: 'session-1'),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.success(
                AiTeacherChatState(history: _history),
              ),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('What is the past tense of go?'), findsOneWidget);
      expect(find.text('The past tense of "go" is "went".'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherChatPage(contextRef: 'lesson-1', sessionId: 'session-1'),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.success(
                AiTeacherChatState(history: _history),
              ),
            ),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(AiTeacherChatPage), findsOneWidget);
      expect(find.text('What is the past tense of go?'), findsOneWidget);
    });
  });
}

// ── Fakes ─────────────────────────────────────────────────────────────────

class _SignedInAuthFlowNotifier extends AuthFlowNotifier {
  _SignedInAuthFlowNotifier()
      : super() {
    state = const AuthFlowState.signedIn(
      email: 'student@example.com',
      accessToken: 'test-token',
    );
  }
}

class _FakeAiTeacherChatNotifier extends AiTeacherChatNotifier {
  _FakeAiTeacherChatNotifier(AppAsyncState<AiTeacherChatState> initialState)
      : super(repository: _FakeAiTeacherChatRepository()) {
    state = initialState;
  }

  @override
  Future<void> loadSessions({required String bearerToken}) async {}
  @override
  Future<void> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {}
  @override
  Future<void> loadHistory({
    required String bearerToken,
    required String sessionId,
  }) async {}
  @override
  Future<void> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {}
}

class _FakeAiTeacherChatRepository implements AiTeacherChatRepository {
  @override
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  }) async =>
      const [];

  @override
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) async =>
      const AiChatSessionModel(
        sessionId: 'session-1',
        studentId: 'student-1',
        contextRef: 'lesson-1',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
      );

  @override
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  }) async =>
      _history;

  @override
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async =>
      const AiTeacherReplyModel(
        text: 'reply',
        isFallback: false,
        provider: 'test',
        model: 'test',
        latencyMs: 1,
      );

  @override
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) async =>
      const AiTeacherFeedbackModel(
        feedbackId: 'f1',
        messageId: messageId,
        rating: rating,
        createdAt: '2025-01-01T00:00:00Z',
      );
}
