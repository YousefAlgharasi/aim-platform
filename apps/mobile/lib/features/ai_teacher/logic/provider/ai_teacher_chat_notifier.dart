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
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';
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

  /// Streams an AI Teacher reply (P18-061), accumulating safety-filtered
  /// chunks into [AiTeacherChatState.streamingText] and refreshing history
  /// once the terminal `done` event arrives. Never calls an AI provider
  /// directly — the backend has already safety-filtered every chunk.
  Future<void> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    final previous = _currentDataOrEmpty();
    setSuccess(previous.copyWith(
      isStreaming: true,
      clearStreamingText: true,
    ));

    try {
      await for (final event in _repository.streamMessage(
        bearerToken: bearerToken,
        sessionId: sessionId,
        message: message,
      )) {
        final current = _currentDataOrEmpty();
        switch (event) {
          case AiTeacherStreamChunk(text: final text):
            setSuccess(current.copyWith(
              streamingText: (current.streamingText ?? '') + text,
              isStreaming: true,
            ));
          case AiTeacherStreamDone():
            // Stop showing the streaming indicator, but keep the streamed
            // text on screen until the history refresh below actually
            // succeeds — the reply already streamed successfully, so a
            // failure in this best-effort refresh must not make it vanish
            // or turn the whole (already-successful) conversation into a
            // full-page error.
            setSuccess(current.copyWith(isStreaming: false));
            await _refreshHistoryAfterStream(
              bearerToken: bearerToken,
              sessionId: sessionId,
            );
        }
      }
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to stream AI Teacher reply',
        code: 'AI_TEACHER_STREAM_FAILED',
      );
    }
  }

  /// Best-effort history refresh after a stream completes. Unlike
  /// [loadHistory], this never puts the notifier into a loading/failure
  /// state: the message was already sent and replied to successfully, so a
  /// transient failure here should not replace the visible conversation
  /// with a full-page error. On failure, the streamed reply simply stays
  /// on screen (as streaming text) until the next successful refresh.
  Future<void> _refreshHistoryAfterStream({
    required String bearerToken,
    required String sessionId,
  }) async {
    try {
      final history = await _repository.getHistory(
        bearerToken: bearerToken,
        sessionId: sessionId,
      );
      final current = _currentDataOrEmpty();
      setSuccess(current.copyWith(history: history, clearStreamingText: true));
    } catch (_) {
      // Swallow: the conversation already succeeded server-side. The next
      // successful history load (e.g. on the following message, or opening
      // this session again) will pick it up.
    }
  }

  /// Reads the student-safe safety status for a session (P18-064).
  ///
  /// This is supplementary metadata (drives the safety-limited banner) and
  /// is called after every send/history-load, alongside an already-visible
  /// conversation. A transient failure here must never replace that
  /// conversation with a full-page error — unlike [loadHistory] and
  /// [startSession], which are the screen's primary data load and should
  /// surface a failure, this one fails silently and simply leaves
  /// `safetyStatus` unchanged.
  Future<void> loadSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) async {
    try {
      final safetyStatus = await _repository.getSafetyStatus(
        bearerToken: bearerToken,
        sessionId: sessionId,
      );
      final current = _currentDataOrEmpty();
      setSuccess(current.copyWith(safetyStatus: safetyStatus));
    } catch (_) {
      // Swallow: safety status is advisory-only display metadata, not the
      // conversation itself. The next successful load will pick it up.
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
