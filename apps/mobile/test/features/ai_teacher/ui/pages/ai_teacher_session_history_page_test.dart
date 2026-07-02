// Phase 18 — P18-068
// ai_teacher_session_history_page_test.dart — widget tests for
// AiTeacherSessionHistoryPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders the safe error widget.
//   3. Empty session list renders the empty state.
//   4. Populated session list renders session tiles and never renders
//      mastery/level/weakness/difficulty/recommendation data (no-authority).
//   5. Tapping a session tile navigates to AiTeacherChatPage with that
//      session's id.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_chat_notifier.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_provider.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_chat_page.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_session_history_page.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) =>
    ProviderScope(
      overrides: [
        authFlowProvider.overrideWith((ref) => _SignedInAuthFlowNotifier()),
        ...overrides,
      ],
      child: MaterialApp(theme: AppTheme.light, home: child),
    );

const _sessions = [
  AiChatSessionSummaryModel(
    sessionId: 'session-1',
    contextRef: 'lesson-1',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:01:00Z',
  ),
  AiChatSessionSummaryModel(
    sessionId: 'session-2',
    contextRef: 'lesson-2',
    status: 'closed',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:02:00Z',
  ),
];

void main() {
  group('AiTeacherSessionHistoryPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSessionHistoryPage(),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(AiTeacherSessionHistoryPage), findsOneWidget);
    });

    testWidgets('shows safe error state on failure', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSessionHistoryPage(),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.failure(message: 'internal trace=xyz'),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('internal trace=xyz'), findsNothing);
    });

    testWidgets('shows empty state when there are no sessions', (
      tester,
    ) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSessionHistoryPage(),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.success(AiTeacherChatState()),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No conversations yet'), findsOneWidget);
    });

    testWidgets(
      'shows session tiles and never renders mastery/level/weakness/'
      'difficulty/recommendation labels',
      (tester) async {
        await tester.pumpWidget(_wrap(
          const AiTeacherSessionHistoryPage(),
          overrides: [
            aiTeacherChatProvider.overrideWith(
              (ref) => _FakeAiTeacherChatNotifier(
                const AppAsyncState.success(
                  AiTeacherChatState(sessions: _sessions),
                ),
              ),
            ),
          ],
        ));
        await tester.pump();

        // contextRef is prettified for display (design screen 34 shows
        // readable titles, not raw slugs).
        expect(find.text('Lesson 1'), findsOneWidget);
        expect(find.text('Lesson 2'), findsOneWidget);
        expect(find.text('Active'), findsOneWidget);
        expect(find.text('Ended'), findsOneWidget);

        for (final forbidden in [
          'mastery',
          'level',
          'weakness',
          'difficulty',
          'recommendation',
        ]) {
          expect(find.textContaining(forbidden, findRichText: true),
              findsNothing);
        }
      },
    );

    testWidgets('tapping a session opens AiTeacherChatPage for that session',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSessionHistoryPage(),
        overrides: [
          aiTeacherChatProvider.overrideWith(
            (ref) => _FakeAiTeacherChatNotifier(
              const AppAsyncState.success(
                AiTeacherChatState(sessions: _sessions),
              ),
            ),
          ),
        ],
      ));
      await tester.pump();

      await tester.tap(find.text('Lesson 1'));
      await tester.pumpAndSettle();

      expect(find.byType(AiTeacherChatPage), findsOneWidget);
    });
  });
}

class _SignedInAuthFlowNotifier extends AuthFlowNotifier {
  _SignedInAuthFlowNotifier() : super() {
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
      _sessions;

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
      const AiChatHistoryModel(sessionId: 'session-1', messages: []);

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
      AiTeacherFeedbackModel(
        feedbackId: 'f1',
        messageId: messageId,
        rating: rating,
        createdAt: '2025-01-01T00:00:00Z',
      );

  @override
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async* {
    yield const AiTeacherStreamChunk('reply');
    yield const AiTeacherStreamDone(
      isFallback: false,
      provider: 'test',
      model: 'test',
    );
  }

  @override
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) async =>
      const AiTeacherSafetyStatusModel(
        sessionId: 'session-1',
        status: 'clear',
        lastCheckedAt: '2025-01-01T00:00:00Z',
      );
}
