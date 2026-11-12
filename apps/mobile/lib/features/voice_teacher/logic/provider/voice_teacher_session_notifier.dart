// P18-065 / P18-066 — VoiceTeacherSessionNotifier
//
// Coordinates VoiceTeacherRepository calls for the active Voice Tutor
// session (start session, fetch history, submit a recorded turn, submit
// feedback). Audio capture/playback state machines remain in
// VoiceRecordSubmitNotifier / VoicePlaybackNotifier; this notifier owns
// only the backend-returned session/turn/history data.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../entity/voice_teacher_session_state.dart';
import '../repository/voice_teacher_repository.dart';

class VoiceTeacherSessionNotifier
    extends AppStateNotifier<VoiceTeacherSessionState> {
  VoiceTeacherSessionNotifier({required VoiceTeacherRepository repository})
      : _repository = repository;

  final VoiceTeacherRepository _repository;

  Future<void> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    setLoading();
    try {
      final sessionId = await _repository.startSession(
        bearerToken: bearerToken,
        contextRef: contextRef,
      );
      setSuccess(VoiceTeacherSessionState(sessionId: sessionId));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to start Voice Tutor session',
        code: 'VOICE_TEACHER_SESSION_START_FAILED',
      );
    }
  }

  Future<void> loadHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final previous = _currentDataOrEmpty();
    try {
      final history = await _repository.getSessionHistory(
        bearerToken: bearerToken,
        sessionId: sessionId,
      );
      setSuccess(previous.copyWith(sessionId: sessionId, history: history));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to load Voice Tutor history',
        code: 'VOICE_TEACHER_HISTORY_LOAD_FAILED',
      );
    }
  }

  Future<void> submitTurn({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async {
    final previous = _currentDataOrEmpty();
    try {
      final turn = await _repository.submitAudio(
        bearerToken: bearerToken,
        sessionId: sessionId,
        audioBytes: audioBytes,
        mimeType: mimeType,
      );
      setSuccess(previous.copyWith(lastTurn: turn));
      await loadHistory(bearerToken: bearerToken, sessionId: sessionId);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to submit voice turn',
        code: 'VOICE_TEACHER_TURN_SUBMIT_FAILED',
      );
    }
  }

  /// A typed turn: same conversation as the voice turns. Sets [VoiceTeacherSessionState.lastTurn] to the teacher's
  /// reply (no audioRef: the screen fetches the spoken version of the newest teacher message from the history).
  ///
  /// Returns false when the message could not be sent. Unlike a failed voice turn, this leaves the session as it is
  /// (the screen shows a short message and keeps the text), because a typed message is easy to resend.
  Future<bool> submitTextTurn({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    final previous = _currentDataOrEmpty();
    try {
      final turn = await _repository.submitText(
        bearerToken: bearerToken,
        sessionId: sessionId,
        message: message,
      );
      setSuccess(previous.copyWith(lastTurn: turn));
      await loadHistory(bearerToken: bearerToken, sessionId: sessionId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async {
    final previous = _currentDataOrEmpty();
    try {
      final feedback = await _repository.submitFeedback(
        bearerToken: bearerToken,
        sessionId: sessionId,
        messageId: messageId,
        rating: rating,
        comment: comment,
      );
      setSuccess(previous.copyWith(lastFeedback: feedback));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (_) {
      setFailure(
        message: 'Failed to submit voice feedback',
        code: 'VOICE_TEACHER_FEEDBACK_FAILED',
      );
    }
  }

  VoiceTeacherSessionState _currentDataOrEmpty() {
    final current = state;
    if (current is AppAsyncSuccess<VoiceTeacherSessionState>) {
      return current.data;
    }
    return const VoiceTeacherSessionState();
  }

  @override
  void setLoading() => state = const AppAsyncState.loading();

  @override
  void setSuccess(VoiceTeacherSessionState data) {
    if (mounted) state = AppAsyncState.success(data);
  }

  @override
  void setFailure({required String message, String? code}) {
    if (mounted) {
      state = AppAsyncState.failure(message: message, code: code);
    }
  }
}
