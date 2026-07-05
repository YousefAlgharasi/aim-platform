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
  }) {
    return PracticeSessionState(
      status: status ?? this.status,
      sessionId: sessionId ?? this.sessionId,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class PracticeSessionNotifier extends StateNotifier<PracticeSessionState> {
  PracticeSessionNotifier({required QuestionAnswerRepository repository})
      : _repository = repository,
        super(const PracticeSessionState());

  final QuestionAnswerRepository _repository;

  /// Start a lesson_practice learning session and load the lesson's
  /// delivered questions. Reuses the already-started session on retry after
  /// a delivery failure.
  Future<void> start({
    required String bearerToken,
    required String lessonId,
  }) async {
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
  void advance() {
    if (state.status != PracticeSessionStatus.active) return;
    if (state.hasNext) {
      state = state.copyWith(currentIndex: state.currentIndex + 1);
    } else {
      state = state.copyWith(status: PracticeSessionStatus.finished);
    }
  }

  /// The backend expresses P20-010 course gating as a 403 FORBIDDEN. The
  /// verdict is backend-owned; this only recognises it for display.
  bool _isLocked(AppException e) => e.code.toUpperCase().contains('FORBIDDEN');
}
