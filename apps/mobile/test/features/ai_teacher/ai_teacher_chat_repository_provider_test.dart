// Phase 8 — P8-083
// Unit tests for AI Teacher chat repository/provider state wiring.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/ai_teacher/data/datasources/ai_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/data/repository/repo_impl/ai_teacher_chat_repository_impl.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_provider.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';

class _FakeAiTeacherDatasource implements AiTeacherRemoteDatasource {
  const _FakeAiTeacherDatasource({this.shouldFail = false});

  final bool shouldFail;

  static const session = AiChatSessionModel(
    sessionId: 'session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    status: 'active',
    createdAt: '2026-06-19T00:00:00.000Z',
  );

  static const sessions = [
    AiChatSessionSummaryModel(
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      status: 'active',
      createdAt: '2026-06-19T00:00:00.000Z',
      updatedAt: '2026-06-19T01:00:00.000Z',
    ),
  ];

  static const history = AiChatHistoryModel(
    sessionId: 'session-1',
    messages: [
      AiChatMessageModel(
        id: 'message-1',
        role: 'student',
        text: 'Explain this.',
        createdAt: '2026-06-19T00:00:00.000Z',
      ),
    ],
  );

  static const reply = AiTeacherReplyModel(
    text: 'Here is a backend-generated explanation.',
    isFallback: false,
    provider: 'backend-gateway',
    model: 'backend-selected',
    latencyMs: 120,
  );

  static const feedback = AiTeacherFeedbackModel(
    feedbackId: 'feedback-1',
    messageId: 'message-2',
    rating: 'helpful',
    createdAt: '2026-06-19T00:00:00.000Z',
  );

  void _throwIfNeeded() {
    if (shouldFail) {
      throw const ApiClientException(
        code: 'AI_TEACHER_BACKEND_ERROR',
        message: 'Backend failed',
        statusCode: 500,
      );
    }
  }

  @override
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    _throwIfNeeded();
    return session;
  }

  @override
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  }) async {
    _throwIfNeeded();
    return sessions;
  }

  @override
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    _throwIfNeeded();
    return reply;
  }

  @override
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    _throwIfNeeded();
    return history;
  }

  @override
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) async {
    _throwIfNeeded();
    return feedback;
  }

  @override
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async* {
    _throwIfNeeded();
    yield const AiTeacherStreamChunk('Here is a backend-generated ');
    yield const AiTeacherStreamChunk('explanation.');
    yield const AiTeacherStreamDone(
      isFallback: false,
      provider: 'backend-gateway',
      model: 'backend-selected',
    );
  }

  @override
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) async {
    _throwIfNeeded();
    return const AiTeacherSafetyStatusModel(
      sessionId: 'session-1',
      status: 'clear',
      lastCheckedAt: '2026-06-19T00:00:00.000Z',
    );
  }
}

class _FakeAiTeacherRepository implements AiTeacherChatRepository {
  const _FakeAiTeacherRepository({this.shouldFail = false});

  final bool shouldFail;

  void _throwIfNeeded() {
    if (shouldFail) {
      throw const AppException(
        code: 'AI_TEACHER_REPOSITORY_ERROR',
        message: 'Repository failed',
      );
    }
  }

  @override
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    _throwIfNeeded();
    return _FakeAiTeacherDatasource.session;
  }

  @override
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  }) async {
    _throwIfNeeded();
    return _FakeAiTeacherDatasource.sessions;
  }

  @override
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    _throwIfNeeded();
    return _FakeAiTeacherDatasource.reply;
  }

  @override
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    _throwIfNeeded();
    return _FakeAiTeacherDatasource.history;
  }

  @override
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) async {
    _throwIfNeeded();
    return _FakeAiTeacherDatasource.feedback;
  }

  @override
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async* {
    _throwIfNeeded();
    yield const AiTeacherStreamChunk('Here is a backend-generated ');
    yield const AiTeacherStreamChunk('explanation.');
    yield const AiTeacherStreamDone(
      isFallback: false,
      provider: 'backend-gateway',
      model: 'backend-selected',
    );
  }

  @override
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) async {
    _throwIfNeeded();
    return const AiTeacherSafetyStatusModel(
      sessionId: 'session-1',
      status: 'clear',
      lastCheckedAt: '2026-06-19T00:00:00.000Z',
    );
  }
}

ProviderContainer _container({bool shouldFail = false}) {
  return ProviderContainer(
    overrides: [
      aiTeacherChatRepositoryProvider.overrideWithValue(
        _FakeAiTeacherRepository(shouldFail: shouldFail),
      ),
    ],
  );
}

void main() {
  group('AiTeacherChatRepositoryImpl', () {
    test('passes backend chat data through verbatim', () async {
      const repo = AiTeacherChatRepositoryImpl(
        datasource: _FakeAiTeacherDatasource(),
      );

      final session = await repo.startSession(
        bearerToken: 'token',
        contextRef: 'lesson:fractions',
      );
      final sessions = await repo.listSessions(bearerToken: 'token');
      final history = await repo.getHistory(
        bearerToken: 'token',
        sessionId: 'session-1',
      );
      final reply = await repo.sendMessage(
        bearerToken: 'token',
        sessionId: 'session-1',
        message: 'Explain this.',
      );
      final feedback = await repo.submitFeedback(
        bearerToken: 'token',
        messageId: 'message-2',
        rating: 'helpful',
      );

      expect(session.sessionId, 'session-1');
      expect(sessions.single.contextRef, 'lesson:fractions');
      expect(history.messages.single.text, 'Explain this.');
      expect(reply.text, 'Here is a backend-generated explanation.');
      expect(feedback.rating, 'helpful');
    });

    test('maps ApiClientException to AppException', () {
      const repo = AiTeacherChatRepositoryImpl(
        datasource: _FakeAiTeacherDatasource(shouldFail: true),
      );

      expect(
        () => repo.listSessions(bearerToken: 'token'),
        throwsA(
          isA<AppException>()
              .having((e) => e.code, 'code', 'AI_TEACHER_BACKEND_ERROR')
              .having((e) => e.message, 'message', 'Backend failed'),
        ),
      );
    });
  });

  group('AiTeacherChatNotifier', () {
    test('starts in idle state', () {
      final c = _container();
      addTearDown(c.dispose);

      expect(
        c.read(aiTeacherChatProvider),
        isA<AppAsyncIdle<AiTeacherChatState>>(),
      );
    });

    test('loadSessions exposes backend session summaries', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).loadSessions(
            bearerToken: 'token',
          );

      final state = c.read(aiTeacherChatProvider);
      expect(state, isA<AppAsyncSuccess<AiTeacherChatState>>());
      final data = (state as AppAsyncSuccess<AiTeacherChatState>).data;
      expect(data.sessions.single.sessionId, 'session-1');
    });

    test('startSession stores active backend session', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).startSession(
            bearerToken: 'token',
            contextRef: 'lesson:fractions',
          );

      final data =
          (c.read(aiTeacherChatProvider) as AppAsyncSuccess<AiTeacherChatState>)
              .data;
      expect(data.activeSession!.sessionId, 'session-1');
      expect(data.hasActiveSession, isTrue);
    });

    test('loadHistory stores backend-persisted messages', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).loadHistory(
            bearerToken: 'token',
            sessionId: 'session-1',
          );

      final data =
          (c.read(aiTeacherChatProvider) as AppAsyncSuccess<AiTeacherChatState>)
              .data;
      expect(data.history!.messages.single.role, 'student');
      expect(data.history!.messages.single.text, 'Explain this.');
    });

    test('sendMessage stores backend reply without local AI calls', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).sendMessage(
            bearerToken: 'token',
            sessionId: 'session-1',
            message: 'Explain this.',
          );

      final data =
          (c.read(aiTeacherChatProvider) as AppAsyncSuccess<AiTeacherChatState>)
              .data;
      expect(data.isSending, isFalse);
      expect(data.lastReply!.provider, 'backend-gateway');
      expect(data.lastReply!.model, 'backend-selected');
    });

    test('submitFeedback stores backend feedback result', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).submitFeedback(
            bearerToken: 'token',
            messageId: 'message-2',
            rating: 'helpful',
          );

      final data =
          (c.read(aiTeacherChatProvider) as AppAsyncSuccess<AiTeacherChatState>)
              .data;
      expect(data.lastFeedback!.feedbackId, 'feedback-1');
      expect(data.lastFeedback!.rating, 'helpful');
    });

    test('repository failure becomes AppAsyncFailure', () async {
      final c = _container(shouldFail: true);
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).loadSessions(
            bearerToken: 'token',
          );

      final state = c.read(aiTeacherChatProvider);
      expect(state, isA<AppAsyncFailure<AiTeacherChatState>>());
      expect(
        (state as AppAsyncFailure<AiTeacherChatState>).code,
        'AI_TEACHER_REPOSITORY_ERROR',
      );
    });

    test('clear resets to idle', () async {
      final c = _container();
      addTearDown(c.dispose);

      await c.read(aiTeacherChatProvider.notifier).loadSessions(
            bearerToken: 'token',
          );
      c.read(aiTeacherChatProvider.notifier).clear();

      expect(c.read(aiTeacherChatProvider), isA<AppAsyncIdle>());
    });
  });
}
