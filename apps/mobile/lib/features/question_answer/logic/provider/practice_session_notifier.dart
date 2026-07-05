// AIM pipeline live wiring.
// PracticeSessionNotifier — drives the lesson practice flow:
//   1. POST /sessions/start (backend issues the learning session id).
//   2. GET /sessions/:id/questions?lessonId= (backend delivers questions).
//   3. Step through the delivered questions one at a time; each answer is
//      submitted by the existing QuestionAnswerNotifier/AnswerSubmitFlow via
//      POST /sessions/:id/attempt — the call that triggers the AIM pipeline.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes correctness, mastery, difficulty, or any AIM value.
// - sessionId is backend-issued; lessonId is backend-supplied by the lessons
//   feature; neither is ever user input.
// - A 403 from session-start/question-delivery is the backend's P20-010
//   course gating verdict — surfaced verbatim as a locked state, never
//   re-derived or overridden locally.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

/// Lifecycle of the practice session flow.
enum PracticeSessionStatus {
  /// Nothing started yet.
  idle,

  /// Session start / question delivery in flight.
  loading,

  /// Backend refused with 403 — the lesson's course is locked (P20-010).
  locked,

  /// Session start or question delivery failed.
  failed,

  /// The lesson has no published questions to practice.
  empty,

  /// A question is available at [PracticeSessionState.currentIndex].
  active,

  /// All delivered questions have been answered.
  finished,
}

class PracticeSessionState {
  const PracticeSessionState({
    this.status = PracticeSessionStatus.idle,
    this.sessionId,
    this.questions = const [],
    this.currentIndex = 0,
    this.errorMessage,
    this.completionSaved = false,
  });

  final PracticeSessionStatus status;

  /// Backend-issued learning session UUID from POST /sessions/start.
  final String? sessionId;

  /// Backend-delivered questions (no correctness data by contract).
  final List<QuestionModel> questions;

  /// Index of the question currently presented.
  final int currentIndex;

  /// Error message from a failed start/delivery call.
  final String? errorMessage;

  /// True once POST /lessons/:id/progress + /complete both succeeded for
  /// this run. Only meaningful once [status] is [PracticeSessionStatus.finished] —
  /// false there means the lesson looked finished locally but the backend
  /// never actually recorded it (so the next lesson/course stays locked).
  final bool completionSaved;

  QuestionModel? get currentQuestion =>
      status == PracticeSessionStatus.active && currentIndex < questions.length
          ? questions[currentIndex]
          : null;

  bool get hasNext => currentIndex + 1 < questions.length;

  PracticeSessionState copyWith({
    PracticeSessionStatus? status,
    String? sessionId,
    List<QuestionModel>? questions,
    int? currentIndex,
    String? errorMessage,
    bool? completionSaved,
  }) {
    return PracticeSessionState(
      status: status ?? this.status,
      sessionId: sessionId ?? this.sessionId,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      errorMessage: errorMessage ?? this.errorMessage,
      completionSaved: completionSaved ?? this.completionSaved,
    );
  }
}

class PracticeSessionNotifier extends StateNotifier<PracticeSessionState> {
  PracticeSessionNotifier({required QuestionAnswerRepository repository})
      : _repository = repository,
        super(const PracticeSessionState());

  final QuestionAnswerRepository _repository;

  // Needed only to persist lesson progress/completion once the run
  // finishes (start()'s own params aren't otherwise retained).
  String? _bearerToken;
  String? _lessonId;

  /// Start a lesson_practice learning session and load the lesson's
  /// delivered questions. Reuses the already-started session on retry after
  /// a delivery failure.
  Future<void> start({
    required String bearerToken,
    required String lessonId,
  }) async {
    _bearerToken = bearerToken;
    _lessonId = lessonId;
    state = state.copyWith(
      status: PracticeSessionStatus.loading,
      errorMessage: null,
    );
    try {
      var sessionId = state.sessionId;
      if (sessionId == null) {
        final session = await _repository.startSession(
          bearerToken: bearerToken,
          sessionType: 'lesson_practice',
        );
        sessionId = session.id;
        // Persist immediately so a delivery failure + retry reuses this
        // backend-issued session instead of starting another one.
        state = state.copyWith(sessionId: sessionId);
      }
      final questions = await _repository.getLessonQuestions(
        bearerToken: bearerToken,
        sessionId: sessionId,
        lessonId: lessonId,
      );
      state = PracticeSessionState(
        status: questions.isEmpty
            ? PracticeSessionStatus.empty
            : PracticeSessionStatus.active,
        sessionId: sessionId,
        questions: questions,
      );
    } on AppException catch (e) {
      state = state.copyWith(
        status: _isLocked(e)
            ? PracticeSessionStatus.locked
            : PracticeSessionStatus.failed,
        errorMessage: e.message,
      );
    } catch (_) {
      state = state.copyWith(
        status: PracticeSessionStatus.failed,
        errorMessage: 'Failed to start practice session',
      );
    }
  }

  /// Advance to the next delivered question, or finish the run.
  ///
  /// Bugfix: finishing used to only flip a local flag — nothing was ever
  /// sent to the backend, so the lesson's progress percent never updated
  /// and lesson_progress.completed (the only gate for unlocking the next
  /// lesson/course — P20-011/P20-012) was never set. Finishing now records
  /// 100% progress and marks the lesson complete; [PracticeSessionState.completionSaved]
  /// reports whether that actually succeeded.
  Future<void> advance() async {
    if (state.status != PracticeSessionStatus.active) return;
    if (state.hasNext) {
      state = state.copyWith(currentIndex: state.currentIndex + 1);
      return;
    }

    state = state.copyWith(status: PracticeSessionStatus.finished);
    await _persistCompletion();
  }

  Future<void> _persistCompletion() async {
    final bearerToken = _bearerToken;
    final lessonId = _lessonId;
    if (bearerToken == null || lessonId == null) return;

    try {
      await _repository.recordLessonProgress(
        bearerToken: bearerToken,
        lessonId: lessonId,
        percent: 100,
      );
      await _repository.markLessonComplete(
        bearerToken: bearerToken,
        lessonId: lessonId,
      );
      if (mounted) {
        state = state.copyWith(completionSaved: true);
      }
    } catch (_) {
      // completionSaved stays false — the UI surfaces this so the student
      // knows the next lesson/course may still be locked and can retry.
    }
  }

  /// Retry persisting completion after a failure (e.g. lost connection).
  Future<void> retryPersistCompletion() => _persistCompletion();

  /// The backend expresses P20-010 course gating as a 403 FORBIDDEN. The
  /// verdict is backend-owned; this only recognises it for display.
  bool _isLocked(AppException e) => e.code.toUpperCase().contains('FORBIDDEN');
}
