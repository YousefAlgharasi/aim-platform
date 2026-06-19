// Phase 8 — P8-083
// AiTeacherChatNotifier — state controller for backend AI Teacher chat.
//
// The notifier only coordinates repository calls and stores backend responses.
// It does not call AI providers, build prompts, or compute AIM-owned learning
// values.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';

class AiTeacherChatNotifier extends AppStateNotifier<AiTeacherChatState> {
  AiTeacherChatNotifier({
    required AiTeacherChatRepository repository,
  }) : _repository = repository;

  final AiTeacherChatRepository _repository;

  Future<void> loadSessions({required String bearerToken}) async {
    setLoading();
    try {
      final sessions = await _repository.listSessions(bearerToken: bearerToken);
      setSuccess(AiTeacherChatState(sessions: sessions));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to load AI Teacher sessions',
        code: 'AI_TEACHER_SESSIONS_LOAD_FAILED',
      );
    }
  }

  Future<void> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    setLoading();
    try {
      final session = await _repository.startSession(
        bearerToken: bearerToken,
        contextRef: contextRef,
      );
      setSuccess(AiTeacherChatState(activeSession: session));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to start AI Teacher chat',
        code: 'AI_TEACHER_SESSION_START_FAILED',
      );
    }
  }

  Future<void> loadHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final previous = _currentDataOrEmpty();
    state = const AppAsyncState.loading();
    try {
      final history = await _repository.getHistory(
        bearerToken: bearerToken,
        sessionId: sessionId,
      );
      setSuccess(previous.copyWith(history: history));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to load AI Teacher chat history',
        code: 'AI_TEACHER_HISTORY_LOAD_FAILED',
      );
    }
  }

  Future<void> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    final previous = _currentDataOrEmpty();
    setSuccess(previous.copyWith(
      isSending: true,
      clearLastReply: true,
    ));

    try {
      final reply = await _repository.sendMessage(
        bearerToken: bearerToken,
        sessionId: sessionId,
        message: message,
      );
      setSuccess(previous.copyWith(
        lastReply: reply,
        isSending: false,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to send AI Teacher message',
        code: 'AI_TEACHER_MESSAGE_SEND_FAILED',
      );
    }
  }

  Future<void> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) async {
    final previous = _currentDataOrEmpty();
    try {
      final feedback = await _repository.submitFeedback(
        bearerToken: bearerToken,
        messageId: messageId,
        rating: rating,
      );
      setSuccess(previous.copyWith(lastFeedback: feedback));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to submit AI Teacher feedback',
        code: 'AI_TEACHER_FEEDBACK_FAILED',
      );
    }
  }

  void clear() => reset();

  AiTeacherChatState _currentDataOrEmpty() {
    final current = state;
    if (current is AppAsyncSuccess<AiTeacherChatState>) {
      return current.data;
    }
    return const AiTeacherChatState();
  }

  @override
  void setLoading() => state = const AppAsyncState.loading();

  @override
  void setSuccess(AiTeacherChatState data) {
    if (mounted) state = AppAsyncState.success(data);
  }

  @override
  void setFailure({required String message, String? code}) {
    if (mounted) {
      state = AppAsyncState.failure(message: message, code: code);
    }
  }
}
